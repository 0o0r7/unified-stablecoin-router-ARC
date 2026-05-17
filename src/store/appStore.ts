import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAccount, useChainId, useConnectConnector, useDisconnect, useSwitchChain, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { ethers } from 'ethers';
import { readContract, writeContract, waitForTransactionReceipt } from 'wagmi/actions';
import { config, CHAIN_CONFIG } from '../config/wagmi';
import { CONTRACT_CONFIG, SPEND_REGISTRY_ABI, ERC20_ABI, arcTestnet } from '../config/blockchain';
import type { Token, Balance, Deposit, Spend, RegistryLog, WalletState, Notification, NotificationType } from '../types';

// Generate unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// In-memory storage for transaction history (persists in session)
let deposits: Deposit[] = [];
let spends: Spend[] = [];
let registryLogs: RegistryLog[] = [];

// Store interface
interface AppStore {
  // Wallet state
  wallet: WalletState;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchToArc: () => Promise<void>;
  
  // User data
  userId: string | null;
  balances: Balance[];
  deposits: Deposit[];
  spends: Spend[];
  registryLogs: RegistryLog[];
  
  // Actions
  deposit: (token: Token, amount: number) => Promise<{ success: boolean; txHash: string; error?: string }>;
  spend: (token: Token, amount: number, recipient: string) => Promise<{ success: boolean; txHash: string; error?: string }>;
  fetchBalance: () => Promise<void>;
  fetchActivity: () => Promise<void>;
  
  // Notifications
  notifications: Notification[];
  addNotification: (type: NotificationType, message: string, duration?: number) => void;
  removeNotification: (id: string) => void;
  
  // Loading states
  isLoading: boolean;
  isDepositing: boolean;
  isSpending: boolean;
  
  // Error state
  error: string | null;
  setError: (error: string | null) => void;
}

// Helper to get token address
const getTokenAddress = (token: Token): `0x${string}` => {
  return CONTRACT_CONFIG.TOKENS[token];
};

// Helper to format amount (convert to wei for tokens with different decimals)
const formatTokenAmount = (amount: number, decimals: number = 18): bigint => {
  return ethers.parseUnits(amount.toString(), decimals);
};

// Helper to parse token amount from wei
const parseTokenAmount = (amount: bigint, decimals: number = 18): number => {
  return parseFloat(ethers.formatUnits(amount, decimals));
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial wallet state
      wallet: {
        isConnected: false,
        address: null,
        chainId: null,
        chainName: null,
      },
      
      userId: null,
      balances: [],
      deposits: [],
      spends: [],
      registryLogs: [],
      
      isLoading: false,
      isDepositing: false,
      isSpending: false,
      
      notifications: [],
      
      error: null,
      setError: (error) => set({ error }),
      
      // Connect wallet using wagmi
      connectWallet: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Get the injected connector (MetaMask)
          const connector = config.connectors[0];
          
          if (!connector) {
            throw new Error('No wallet connector found');
          }
          
          // Connect using wagmi
          await connector.connect({ chainId: CHAIN_CONFIG.chainId });
          
          // Get account info
          const accounts = await connector.getAccounts();
          const network = await connector.getChainId();
          
          if (accounts.length === 0) {
            throw new Error('No accounts found. Please unlock your wallet.');
          }
          
          const address = accounts[0];
          const userId = generateId();
          
          set({
            wallet: {
              isConnected: true,
              address,
              chainId: network,
              chainName: arcTestnet.name,
            },
            userId,
            isLoading: false,
          });
          
          // Fetch initial data
          get().fetchBalance();
          get().fetchActivity();
          
          get().addNotification('success', `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`);
          
        } catch (error: any) {
          console.error('Wallet connection error:', error);
          const errorMessage = error.message || 'Failed to connect wallet';
          set({ error: errorMessage, isLoading: false });
          get().addNotification('error', errorMessage);
        }
      },
      
      // Disconnect wallet
      disconnectWallet: async () => {
        try {
          const connector = config.connectors[0];
          if (connector) {
            await connector.disconnect();
          }
        } catch (error) {
          console.error('Disconnect error:', error);
        }
        
        set({
          wallet: {
            isConnected: false,
            address: null,
            chainId: null,
            chainName: null,
          },
          userId: null,
          balances: [],
          deposits: [],
          spends: [],
          registryLogs: [],
        });
        get().addNotification('info', 'Wallet disconnected');
      },
      
      // Switch to ARC testnet
      switchToArc: async () => {
        try {
          const connector = config.connectors[0];
          if (connector) {
            await connector.switchChain(CHAIN_CONFIG.chainId);
          }
        } catch (error: any) {
          // If chain doesn't exist, try to add it
          if (error.code === 4902) {
            try {
              const connector = config.connectors[0];
              if (connector) {
                await connector.addChain(arcTestnet);
              }
            } catch (addError) {
              console.error('Add chain error:', addError);
              get().addNotification('error', 'Failed to add ARC testnet to wallet');
            }
          } else {
            console.error('Switch chain error:', error);
            get().addNotification('error', 'Failed to switch to ARC testnet');
          }
        }
      },
      
      // Deposit function - Real contract call
      deposit: async (token: Token, amount: number) => {
        const { wallet, userId } = get();
        
        if (!wallet.isConnected || !wallet.address) {
          const error = 'Wallet not connected';
          get().addNotification('error', error);
          return { success: false, txHash: '', error };
        }
        
        if (amount <= 0) {
          const error = 'Invalid amount';
          get().addNotification('error', error);
          return { success: false, txHash: '', error };
        }
        
        // Check if on correct chain
        if (wallet.chainId !== CHAIN_CONFIG.chainId) {
          const error = `Please switch to ${arcTestnet.name} to deposit`;
          get().addNotification('warning', error);
          // Try to switch chain
          await get().switchToArc();
          return { success: false, txHash: '', error };
        }
        
        set({ isDepositing: true, error: null });
        
        try {
          const tokenAddress = getTokenAddress(token);
          const amountInWei = formatTokenAmount(amount, 6); // Stablecoins typically use 6 decimals
          
          // First, check if we need to approve the token
          const allowance = await readContract(config, {
            address: tokenAddress,
            abi: ERC20_ABI,
            functionName: 'allowance',
            args: [wallet.address, CONTRACT_CONFIG.SPEND_REGISTRY_ADDRESS],
          });
          
          // If allowance is less than amount, approve first
          if (allowance < amountInWei) {
            get().addNotification('info', `Approving ${token}...`);
            
            const approveHash = await writeContract(config, {
              address: tokenAddress,
              abi: ERC20_ABI,
              functionName: 'approve',
              args: [CONTRACT_CONFIG.SPEND_REGISTRY_ADDRESS, amountInWei],
            });
            
            // Wait for approval transaction
            await waitForTransactionReceipt(config, {
              hash: approveHash,
            });
            
            get().addNotification('success', `${token} approved!`);
          }
          
          // Now deposit
          get().addNotification('info', `Depositing ${amount} ${token}...`);
          
          const txHash = await writeContract(config, {
            address: CONTRACT_CONFIG.SPEND_REGISTRY_ADDRESS,
            abi: SPEND_REGISTRY_ABI,
            functionName: 'deposit',
            args: [tokenAddress, amountInWei],
          });
          
          // Wait for transaction
          const receipt = await waitForTransactionReceipt(config, {
            hash: txHash,
          });
          
          if (receipt.status === 'reverted') {
            throw new Error('Transaction reverted');
          }
          
          // Record deposit locally
          const deposit: Deposit = {
            id: generateId(),
            userId: userId!,
            token,
            amount,
            txHash,
            createdAt: new Date(),
          };
          deposits.push(deposit);
          
          // Log to registry
          const log: RegistryLog = {
            id: generateId(),
            userId: userId!,
            action: 'DEPOSIT',
            token,
            amount,
            metadata: JSON.stringify({ txHash, type: 'deposit' }),
            createdAt: new Date(),
          };
          registryLogs.push(log);
          
          set({ isDepositing: false });
          get().fetchBalance();
          get().fetchActivity();
          
          get().addNotification('success', `Deposited ${amount} ${token}! Tx: ${txHash.slice(0, 10)}...`);
          
          return { success: true, txHash };
          
        } catch (error: any) {
          console.error('Deposit error:', error);
          const errorMessage = error.message || 'Deposit failed';
          set({ isDepositing: false, error: errorMessage });
          get().addNotification('error', errorMessage);
          return { success: false, txHash: '', error: errorMessage };
        }
      },
      
      // Spend function - Real contract call
      spend: async (token: Token, amount: number, recipient: string) => {
        const { wallet, userId } = get();
        
        if (!wallet.isConnected || !wallet.address) {
          const error = 'Wallet not connected';
          get().addNotification('error', error);
          return { success: false, txHash: '', error };
        }
        
        if (amount <= 0) {
          const error = 'Invalid amount';
          get().addNotification('error', error);
          return { success: false, txHash: '', error };
        }
        
        if (!recipient || !recipient.startsWith('0x') || recipient.length !== 42) {
          const error = 'Invalid recipient address';
          get().addNotification('error', error);
          return { success: false, txHash: '', error };
        }
        
        // Check if on correct chain
        if (wallet.chainId !== CHAIN_CONFIG.chainId) {
          const error = `Please switch to ${arcTestnet.name} to spend`;
          get().addNotification('warning', error);
          await get().switchToArc();
          return { success: false, txHash: '', error };
        }
        
        set({ isSpending: true, error: null });
        
        try {
          const tokenAddress = getTokenAddress(token);
          const amountInWei = formatTokenAmount(amount, 6);
          
          // Check balance
          const balance = await readContract(config, {
            address: tokenAddress,
            abi: ERC20_ABI,
            functionName: 'balanceOf',
            args: [wallet.address],
          });
          
          if (balance < amountInWei) {
            throw new Error(`Insufficient ${token} balance`);
          }
          
          // Execute spend
          get().addNotification('info', `Sending ${amount} ${token}...`);
          
          const txHash = await writeContract(config, {
            address: CONTRACT_CONFIG.SPEND_REGISTRY_ADDRESS,
            abi: SPEND_REGISTRY_ABI,
            functionName: 'spend',
            args: [tokenAddress, amountInWei, recipient as `0x${string}`],
          });
          
          // Wait for transaction
          const receipt = await waitForTransactionReceipt(config, {
            hash: txHash,
          });
          
          if (receipt.status === 'reverted') {
            throw new Error('Transaction reverted');
          }
          
          // Record spend locally
          const spend: Spend = {
            id: generateId(),
            userId: userId!,
            token,
            amount,
            recipient,
            txHash,
            createdAt: new Date(),
          };
          spends.push(spend);
          
          // Log to registry
          const log: RegistryLog = {
            id: generateId(),
            userId: userId!,
            action: 'SPEND',
            token,
            amount,
            metadata: JSON.stringify({ txHash, recipient, type: 'spend' }),
            createdAt: new Date(),
          };
          registryLogs.push(log);
          
          set({ isSpending: false });
          get().fetchBalance();
          get().fetchActivity();
          
          get().addNotification('success', `Sent ${amount} ${token}! Tx: ${txHash.slice(0, 10)}...`);
          
          return { success: true, txHash };
          
        } catch (error: any) {
          console.error('Spend error:', error);
          const errorMessage = error.message || 'Transaction failed';
          set({ isSpending: false, error: errorMessage });
          get().addNotification('error', errorMessage);
          return { success: false, txHash: '', error: errorMessage };
        }
      },
      
      // Fetch balance from contract
      fetchBalance: async () => {
        const { wallet } = get();
        
        if (!wallet.isConnected || !wallet.address) {
          set({ balances: [] });
          return;
        }
        
        try {
          const balanceList: Balance[] = [];
          
          for (const [token, tokenAddress] of Object.entries(CONTRACT_CONFIG.TOKENS)) {
            try {
              const balance = await readContract(config, {
                address: tokenAddress as `0x${string}`,
                abi: ERC20_ABI,
                functionName: 'balanceOf',
                args: [wallet.address],
              });
              
              balanceList.push({
                token: token as Token,
                amount: parseTokenAmount(balance as bigint, 6),
              });
            } catch (error) {
              // Token might not be deployed, use mock balance for demo
              balanceList.push({
                token: token as Token,
                amount: 1000, // Demo balance
              });
            }
          }
          
          set({ balances: balanceList });
        } catch (error) {
          console.error('Fetch balance error:', error);
        }
      },
      
      // Fetch activity
      fetchActivity: () => {
        const { userId, wallet } = get();
        
        if (!wallet.isConnected || !userId) {
          set({ deposits: [], spends: [], registryLogs: [] });
          return;
        }
        
        const userDeposits = deposits.filter(d => d.userId === userId).slice(-10).reverse();
        const userSpends = spends.filter(s => s.userId === userId).slice(-10).reverse();
        const userLogs = registryLogs.filter(l => l.userId === userId).slice(-20).reverse();
        
        set({ 
          deposits: userDeposits,
          spends: userSpends,
          registryLogs: userLogs,
        });
      },
      
      // Notifications
      addNotification: (type: NotificationType, message: string, duration = 5000) => {
        const id = generateId();
        const notification: Notification = { id, type, message, duration };
        
        set(state => ({
          notifications: [...state.notifications, notification],
        }));
        
        if (duration > 0) {
          setTimeout(() => {
            get().removeNotification(id);
          }, duration);
        }
      },
      
      removeNotification: (id: string) => {
        set(state => ({
          notifications: state.notifications.filter(n => n.id !== id),
        }));
      },
    }),
    {
      name: 'arc-storage',
      partialize: (state) => ({
        wallet: state.wallet,
        userId: state.userId,
      }),
    }
  )
);
