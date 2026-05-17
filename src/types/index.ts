// Token types
export type Token = 'USDT' | 'USDC' | 'DAI';

export interface TokenInfo {
  symbol: Token;
  name: string;
  decimals: number;
  address: string;
  logo: string;
}

export const TOKENS: TokenInfo[] = [
  { symbol: 'USDT', name: 'Tether USD', decimals: 6, address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', logo: '₮' },
  { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', logo: '$' },
  { symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18, address: '0x6B175474E89094C44Da98b954EesadCDEF9b6C0', logo: '◈' },
];

// User types
export interface User {
  id: string;
  walletAddress: string;
  createdAt: Date;
}

// Balance types
export interface Balance {
  token: Token;
  amount: number;
}

// Transaction types
export interface Deposit {
  id: string;
  userId: string;
  token: Token;
  amount: number;
  txHash: string;
  createdAt: Date;
}

export interface Spend {
  id: string;
  userId: string;
  token: Token;
  amount: number;
  recipient: string;
  txHash: string;
  createdAt: Date;
}

// Registry log types
export interface RegistryLog {
  id: string;
  userId: string;
  action: 'DEPOSIT' | 'SPEND' | 'APPROVE';
  token: Token;
  amount: number;
  metadata: string;
  createdAt: Date;
}

// Wallet state
export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  chainName: string | null;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Notification types
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}
