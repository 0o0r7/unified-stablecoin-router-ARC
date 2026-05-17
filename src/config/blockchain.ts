import { defineChain } from 'viem';

// ARC Testnet Configuration
// Note: Update CHAIN_ID and RPC_URL based on actual ARC testnet deployment
export const arcTestnet = defineChain({
  id: 123456,
  name: 'ARC Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ARC',
    symbol: 'ARC',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.arc.testnet'],
    },
  },
  blockExplorers: {
    default: {
      name: 'ARCscan',
      url: 'https://explorer.arc.testnet',
      apiUrl: 'https://explorer.arc.testnet/api',
    },
  },
});

// Contract Configuration
export const CONTRACT_CONFIG = {
  SPEND_REGISTRY_ADDRESS: '0x0000000000000000000000000000000000000001' as `0x${string}`,
  TOKENS: {
    USDT: '0x0000000000000000000000000000000000000002' as `0x${string}`,
    USDC: '0x0000000000000000000000000000000000000003' as `0x${string}`,
    DAI: '0x0000000000000000000000000000000000000004' as `0x${string}`,
  },
};

// SpendRegistry ABI
export const SPEND_REGISTRY_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'token', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
    name: 'Deposited',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'token', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
      { indexed: false, name: 'recipient', type: 'address' },
    ],
    name: 'Spent',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'action', type: 'string' },
      { indexed: false, name: 'data', type: 'bytes' },
    ],
    name: 'ActionLogged',
    type: 'event',
  },
  {
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'deposit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'recipient', type: 'address' },
    ],
    name: 'spend',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'action', type: 'string' },
      { name: 'data', type: 'bytes' },
    ],
    name: 'logAction',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getBalance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }, { name: 'token', type: 'address' }],
    name: 'getTokenBalance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// ERC20 ABI
export const ERC20_ABI = [
  {
    inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
