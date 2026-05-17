# ARC Unified Stablecoin Router - Project Review & Debug Guide

**Date:** 2026-05-17  
**Repository:** 0o0r7/unified-stablecoin-router-ARC  
**Language Composition:** TypeScript (76.6%), HTML (17.6%), CSS (4.8%), Other (1%)

---

## Executive Summary

Your project is a **React + TypeScript Web3 application** designed as a unified stablecoin router. It's a modern, well-structured frontend with Web3 integration capabilities. However, there are **critical issues** that need to be addressed for real-world production use.

### Status: ⚠️ **NOT PRODUCTION-READY** (Needs Fixes)

---

## 🔍 Critical Issues Found

### 1. **CRITICAL: RPC Endpoint Configuration Issue**
**Location:** `src/config/blockchain.ts` (Line 15)
```typescript
http: ['https://rpc.arc.testnet'],
```
**Problem:** This RPC URL is **hardcoded and non-existent**. The ARC testnet RPC endpoint doesn't exist at this address.

**Fix Required:**
```typescript
// src/config/blockchain.ts - Line 14-16
rpcUrls: {
  default: {
    http: ['https://rpc.arc.testnet'], // ⚠️ UPDATE THIS with real RPC
  },
},
```

**Action Items:**
- [ ] Get the actual ARC testnet RPC endpoint from your network documentation
- [ ] If this is a private testnet, set up your own RPC provider
- [ ] Consider adding environment variables for RPC URLs

**Suggested Implementation:**
```typescript
const ARC_RPC_URL = import.meta.env.VITE_ARC_RPC_URL || 'https://rpc.arc.testnet';

export const arcTestnet = defineChain({
  // ... other config
  rpcUrls: {
    default: {
      http: [ARC_RPC_URL],
    },
  },
  // ...
});
```

---

### 2. **CRITICAL: Contract Addresses Are Dummy Values**
**Location:** `src/config/blockchain.ts` (Lines 29-34)
```typescript
SPEND_REGISTRY_ADDRESS: '0x0000000000000000000000000000000000000001',
TOKENS: {
  USDT: '0x0000000000000000000000000000000000000002',
  USDC: '0x0000000000000000000000000000000000000003',
  DAI: '0x0000000000000000000000000000000000000004',
}
```
**Problem:** These are **placeholder addresses** that don't exist on any real blockchain.

**Fix Required:**
- [ ] Deploy actual smart contracts to ARC testnet
- [ ] Update addresses with real deployed contract addresses
- [ ] Use environment variables for contract addresses

**Suggested Implementation:**
```typescript
// .env.local
VITE_SPEND_REGISTRY_ADDRESS=0x...
VITE_USDT_ADDRESS=0x...
VITE_USDC_ADDRESS=0x...
VITE_DAI_ADDRESS=0x...

// blockchain.ts
export const CONTRACT_CONFIG = {
  SPEND_REGISTRY_ADDRESS: import.meta.env.VITE_SPEND_REGISTRY_ADDRESS as `0x${string}`,
  TOKENS: {
    USDT: import.meta.env.VITE_USDT_ADDRESS as `0x${string}`,
    USDC: import.meta.env.VITE_USDC_ADDRESS as `0x${string}`,
    DAI: import.meta.env.VITE_DAI_ADDRESS as `0x${string}`,
  },
};
```

---

### 3. **CRITICAL: Blockchain Configuration Mismatch**
**Location:** `src/config/blockchain.ts` (Line 6)
```typescript
export const arcTestnet = defineChain({
  id: 123456,
  name: 'ARC Testnet',
  // ...
});
```
**Problem:** Chain ID `123456` is arbitrary and likely doesn't match your actual ARC testnet chain ID.

**Fix Required:**
- [ ] Verify the actual ARC testnet chain ID
- [ ] Update to match your network configuration
- [ ] Document the correct chain ID

---

### 4. **ISSUE: Missing Error Handling in Wallet Connection**
**Location:** `src/store/appStore.ts` (Lines 98-146)

**Problem:** 
- Line 152: Calls `connector.switchChain()` but this method may not exist on all connectors
- No fallback for unsupported connectors (Trust Wallet, Ledger, etc.)
- No timeout handling for wallet requests

**Recommended Fix:**
```typescript
connectWallet: async () => {
  set({ isLoading: true, error: null });
  
  try {
    // Add timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Wallet connection timeout')), 30000)
    );
    
    const connector = config.connectors[0];
    
    if (!connector) {
      throw new Error('No wallet connector found. Please install MetaMask or another Web3 wallet.');
    }
    
    // Use Promise.race for timeout
    const accounts = await Promise.race([
      connector.getAccounts(),
      timeoutPromise
    ]) as string[];
    
    // ... rest of implementation
  } catch (error: any) {
    // Better error messages
    const message = error.message.includes('User rejected')
      ? 'Wallet connection rejected'
      : error.message || 'Failed to connect wallet';
    
    set({ error: message, isLoading: false });
    get().addNotification('error', message);
  }
}
```

---

### 5. **ISSUE: In-Memory Storage Lost on Refresh**
**Location:** `src/store/appStore.ts` (Lines 16-18)
```typescript
let deposits: Deposit[] = [];
let spends: Spend[] = [];
let registryLogs: RegistryLog[] = [];
```
**Problem:** These are module-level variables that reset on page refresh. Only wallet state persists to localStorage.

**Fix Recommendation:**
```typescript
// Create a persistent database layer (consider using IndexedDB)
import { openDB } from 'idb';

const dbPromise = openDB('arc-router-db', 1, {
  upgrade(db) {
    db.createObjectStore('deposits', { keyPath: 'id' });
    db.createObjectStore('spends', { keyPath: 'id' });
    db.createObjectStore('registryLogs', { keyPath: 'id' });
  },
});

export const db = {
  async getDeposits(userId: string) {
    const db = await dbPromise;
    const deposits = await db.getAll('deposits');
    return deposits.filter(d => d.userId === userId);
  },
  // ... similar for spends and registryLogs
};
```

---

### 6. **ISSUE: No Request Validation**
**Location:** `src/store/appStore.ts` (Lines 202-224, 318-346)

**Problem:**
- Amount validation is minimal (only checks `> 0`)
- No maximum amount check
- No decimals validation
- Recipient address validation is basic

**Recommended Fix:**
```typescript
// Create validation utility
export const validateDepositRequest = (token: Token, amount: number) => {
  if (!amount || amount <= 0) return 'Amount must be greater than 0';
  if (amount > 1_000_000_000) return 'Amount exceeds maximum';
  if (!Number.isFinite(amount)) return 'Invalid amount';
  
  // Check decimal places (stablecoins use 6 decimals)
  const decimalPlaces = (amount.toString().split('.')[1] || '').length;
  if (decimalPlaces > 6) return 'Too many decimal places';
  
  return null;
};

export const validateRecipientAddress = (address: string): boolean => {
  if (!address.startsWith('0x')) return false;
  if (address.length !== 42) return false;
  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) return false;
  return true;
};
```

---

### 7. **ISSUE: Missing Token Decimals Handling**
**Location:** `src/store/appStore.ts` (Lines 62-69)

**Problem:** Hardcoded `6` decimals assumption. Tokens have different decimals:
- USDT: 6
- USDC: 6
- DAI: 18

**Fix Required:**
```typescript
const TOKEN_DECIMALS: Record<Token, number> = {
  USDT: 6,
  USDC: 6,
  DAI: 18,
};

const formatTokenAmount = (amount: number, token: Token): bigint => {
  const decimals = TOKEN_DECIMALS[token];
  return ethers.parseUnits(amount.toString(), decimals);
};
```

---

### 8. **ISSUE: No Chain ID Validation**
**Location:** `src/store/appStore.ts` (Lines 217-224)

**Problem:** Compares `wallet.chainId` to `CHAIN_CONFIG.chainId`, but:
- Never actually updates `wallet.chainId` after connection
- Chain ID from `connector.getChainId()` may not match `arcTestnet.id`

**Fix:**
```typescript
const accounts = await connector.getAccounts();
const chainId = await connector.getChainId?.() ?? CHAIN_CONFIG.chainId;

// Validate chain
if (chainId !== CHAIN_CONFIG.chainId) {
  get().addNotification('warning', `Wrong network. Expected ${arcTestnet.name}`);
  await get().switchToArc();
}

set({
  wallet: {
    isConnected: true,
    address: accounts[0],
    chainId, // Now correctly set
    chainName: arcTestnet.name,
  },
  // ...
});
```

---

### 9. **ISSUE: Race Conditions in Async Operations**
**Location:** `src/store/appStore.ts` (Lines 302-303, 410-411)

**Problem:** After deposit/spend, immediately calls `fetchBalance()` and `fetchActivity()` without awaiting them.

**Fix:**
```typescript
// Wait for operations to complete
await get().fetchBalance();
await get().fetchActivity();

// Or convert fetchBalance to be async
fetchBalance: async () => {
  const { wallet } = get();
  
  if (!wallet.isConnected || !wallet.address) {
    set({ balances: [] });
    return;
  }
  
  // ... implementation
}
```

---

### 10. **ISSUE: No Error Boundary Component**
**Problem:** No error boundary to catch and handle React component errors gracefully.

**Recommended Implementation:**
```typescript
// src/components/ErrorBoundary.tsx
import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('Error caught:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-500 text-center">
            <h1>Something went wrong</h1>
            <p>{this.state.error?.message}</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 🛠️ Additional Issues & Improvements

### 11. Missing Environment Variable Setup
**Create `.env.example`:**
```env
VITE_ARC_RPC_URL=https://rpc.arc.testnet
VITE_SPEND_REGISTRY_ADDRESS=0x...
VITE_USDT_ADDRESS=0x...
VITE_USDC_ADDRESS=0x...
VITE_DAI_ADDRESS=0x...
VITE_CHAIN_ID=123456
VITE_APP_NAME=ARC Stablecoin Router
```

### 12. Missing TypeScript Strict Mode
Add to `tsconfig.app.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

### 13. Missing Input Sanitization
For recipient addresses and amounts, add sanitization:
```typescript
const sanitizeAddress = (addr: string): string => {
  return addr.trim().toLowerCase();
};

const sanitizeAmount = (amt: string | number): number => {
  const parsed = parseFloat(String(amt));
  return isNaN(parsed) ? 0 : Math.abs(parsed);
};
```

### 14. Missing Tests
Add unit tests:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

### 15. Missing Security Headers
Add to `vite.config.ts`:
```typescript
export default defineConfig({
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-XSS-Protection': '1; mode=block',
    },
  },
});
```

---

## ✅ What's Working Well

1. ✓ **Clean Architecture** - Good separation of concerns (components, pages, store, config)
2. ✓ **Modern Stack** - React 18, TypeScript, Tailwind CSS, Vite
3. ✓ **State Management** - Zustand is well-integrated with persistence
4. ✓ **Web3 Integration** - Wagmi setup is clean
5. ✓ **UI/UX** - Shadow Archive design is creative and responsive
6. ✓ **Component Structure** - Well-organized reusable components

---

## 🚀 Real-World Production Checklist

### Before Deploying to Production:

- [ ] **Replace dummy RPC URL** with actual ARC testnet RPC
- [ ] **Deploy smart contracts** and update addresses
- [ ] **Verify chain ID** matches network configuration
- [ ] **Add comprehensive error handling** for all async operations
- [ ] **Implement persistent storage** (IndexedDB) for transaction history
- [ ] **Add input validation** for all user inputs
- [ ] **Handle token decimals** correctly per token
- [ ] **Add request timeout** handling (30 seconds)
- [ ] **Create environment file** structure
- [ ] **Add error boundaries** for React components
- [ ] **Implement logging** (Sentry/LogRocket)
- [ ] **Add security headers** in HTTP responses
- [ ] **Write unit tests** for critical functions
- [ ] **Test with real wallets** (MetaMask, Rabby, etc.)
- [ ] **Test on actual testnet** not just locally
- [ ] **Audit smart contracts** if deploying new ones
- [ ] **Load test** the RPC provider
- [ ] **Set up monitoring** and alerting
- [ ] **Create comprehensive docs** for users
- [ ] **Implement rate limiting** for API calls

---

## 📋 Suggested Implementation Priority

### Phase 1 (Critical - Do First)
1. Fix RPC endpoint configuration
2. Update contract addresses
3. Verify chain ID
4. Add error handling to wallet connection

### Phase 2 (Important - Do Next)
1. Implement persistent storage
2. Add input validation
3. Fix token decimals handling
4. Add error boundaries

### Phase 3 (Enhancement - Do Later)
1. Add comprehensive tests
2. Implement monitoring/logging
3. Security audit
4. Performance optimization

---

## 📞 Need Help?

For issues with specific components, check:
- **Wallet connection issues:** Debug `src/store/appStore.ts` lines 98-146
- **Transaction failures:** Check RPC endpoint and contract addresses
- **Balance display:** Verify token decimals in `src/store/appStore.ts`
- **UI glitches:** Check `index.css` and Tailwind config

---

**Generated:** 2026-05-17  
**Status:** Needs fixes for production use  
**Severity:** 🔴 Critical issues must be addressed
