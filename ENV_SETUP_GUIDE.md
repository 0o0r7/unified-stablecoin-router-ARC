# ARC Unified Stablecoin Router - Environment Setup Guide

This guide will help you properly configure your project for real-world deployment.

---

## Step 1: Create Environment Files

### 1.1 Create `.env.local` for Development

```bash
# Terminal - Run from project root
touch .env.local
```

### 1.2 Create `.env.example` for Documentation

```bash
touch .env.example
```

---

## Step 2: Get Your ARC Testnet Information

You need to gather the following information:

### Required Information:
1. **ARC Testnet RPC URL**
2. **ARC Testnet Chain ID**
3. **Block Explorer URL**
4. **Contract Addresses:**
   - Spend Registry Contract Address
   - USDT Token Address
   - USDC Token Address
   - DAI Token Address

### Where to Find This:
- Check your ARC testnet documentation
- Ask your ARC network administrator
- Check ARC's official GitHub repository
- Look in your deployment scripts

### Example (Update with real values):
```
RPC URL: https://rpc.arc.testnet  // ❌ This is FAKE - get real one
Chain ID: 123456                  // ❌ This is FAKE - get real one
Explorer: https://explorer.arc.testnet  // ❌ This is FAKE
```

---

## Step 3: Deploy or Get Contract Addresses

### Option A: Deploy New Smart Contracts

If you haven't deployed contracts yet:

```bash
# 1. Write your Solidity contracts
#    Location: Create a /contracts directory in project root
#    Files needed:
#    - SpendRegistry.sol
#    - MockERC20.sol (for USDT, USDC, DAI)

# 2. Deploy using Hardhat or Foundry
npm install -D hardhat @nomicfoundation/hardhat-toolbox

# 3. Deploy to testnet
npx hardhat run scripts/deploy.js --network arc-testnet

# 4. Save the deployed addresses from the output
```

**Example Deployment Output:**
```
SpendRegistry deployed to: 0x1234567890123456789012345678901234567890
USDT deployed to:         0x2234567890123456789012345678901234567890
USDC deployed to:         0x3234567890123456789012345678901234567890
DAI deployed to:          0x4234567890123456789012345678901234567890
```

### Option B: Use Existing Contracts

If contracts already exist on the testnet:
- Get the addresses from your deployment team
- Get the ABIs from your contract repository

---

## Step 4: Fill in `.env.local`

Create your `.env.local` file with actual values:

```env
# ARC Testnet Configuration
VITE_ARC_RPC_URL=https://your-actual-rpc-url-here.com
VITE_CHAIN_ID=your_actual_chain_id_here
VITE_CHAIN_NAME=ARC Testnet
VITE_BLOCK_EXPLORER=https://your-explorer-url.com

# Smart Contract Addresses
VITE_SPEND_REGISTRY_ADDRESS=0x1234567890123456789012345678901234567890
VITE_USDT_ADDRESS=0x2234567890123456789012345678901234567890
VITE_USDC_ADDRESS=0x3234567890123456789012345678901234567890
VITE_DAI_ADDRESS=0x4234567890123456789012345678901234567890

# Application Configuration
VITE_APP_NAME=ARC Stablecoin Router
VITE_APP_URL=http://localhost:5173
VITE_ENV=development
```

### Important:
- **Never commit `.env.local` to Git** - It contains sensitive information
- **Create `.env.example`** with placeholder values for documentation
- **Share `.env.local` securely** with your team through:
  - Private password manager (1Password, LastPass)
  - Secure file sharing (Tresorit, Sync.com)
  - Direct messages (NOT email)

---

## Step 5: Create `.env.example` for Team

This file should be committed to Git as documentation:

```env
# ARC Testnet Configuration
# Get these values from your ARC network documentation or provider
VITE_ARC_RPC_URL=https://rpc.arc.testnet
VITE_CHAIN_ID=123456
VITE_CHAIN_NAME=ARC Testnet
VITE_BLOCK_EXPLORER=https://explorer.arc.testnet

# Smart Contract Addresses
# Deploy contracts first, then update these addresses
VITE_SPEND_REGISTRY_ADDRESS=0x0000000000000000000000000000000000000000
VITE_USDT_ADDRESS=0x0000000000000000000000000000000000000000
VITE_USDC_ADDRESS=0x0000000000000000000000000000000000000000
VITE_DAI_ADDRESS=0x0000000000000000000000000000000000000000

# Application Configuration
VITE_APP_NAME=ARC Stablecoin Router
VITE_APP_URL=http://localhost:5173
VITE_ENV=development
```

---

## Step 6: Update Your Code to Use Environment Variables

### 6.1 Update `src/config/blockchain.ts`

Replace the current file with this updated version:

```typescript
import { defineChain } from 'viem';

// Get values from environment variables
const RPC_URL = import.meta.env.VITE_ARC_RPC_URL || 'https://rpc.arc.testnet';
const CHAIN_ID = parseInt(import.meta.env.VITE_CHAIN_ID || '123456', 10);
const CHAIN_NAME = import.meta.env.VITE_CHAIN_NAME || 'ARC Testnet';
const BLOCK_EXPLORER = import.meta.env.VITE_BLOCK_EXPLORER || 'https://explorer.arc.testnet';

// ARC Testnet Configuration
export const arcTestnet = defineChain({
  id: CHAIN_ID,
  name: CHAIN_NAME,
  nativeCurrency: {
    decimals: 18,
    name: 'ARC',
    symbol: 'ARC',
  },
  rpcUrls: {
    default: {
      http: [RPC_URL],
    },
  },
  blockExplorers: {
    default: {
      name: 'ARCscan',
      url: BLOCK_EXPLORER,
      apiUrl: `${BLOCK_EXPLORER}/api`,
    },
  },
});

// Contract Configuration with Environment Variables
export const CONTRACT_CONFIG = {
  SPEND_REGISTRY_ADDRESS: (import.meta.env.VITE_SPEND_REGISTRY_ADDRESS || 
    '0x0000000000000000000000000000000000000001') as `0x${string}`,
  TOKENS: {
    USDT: (import.meta.env.VITE_USDT_ADDRESS || 
      '0x0000000000000000000000000000000000000002') as `0x${string}`,
    USDC: (import.meta.env.VITE_USDC_ADDRESS || 
      '0x0000000000000000000000000000000000000003') as `0x${string}`,
    DAI: (import.meta.env.VITE_DAI_ADDRESS || 
      '0x0000000000000000000000000000000000000004') as `0x${string}`,
  },
};

// Token Decimals Configuration
export const TOKEN_DECIMALS: Record<'USDT' | 'USDC' | 'DAI', number> = {
  USDT: 6,
  USDC: 6,
  DAI: 18,
};

// ... rest of the file (ABIs remain the same)
```

### 6.2 Update `src/store/appStore.ts`

Update the `formatTokenAmount` and `parseTokenAmount` functions:

```typescript
import { TOKEN_DECIMALS } from '../config/blockchain';

// Helper to format amount (convert to wei using token decimals)
const formatTokenAmount = (amount: number, token: Token): bigint => {
  const decimals = TOKEN_DECIMALS[token];
  return ethers.parseUnits(amount.toString(), decimals);
};

// Helper to parse token amount from wei
const parseTokenAmount = (amount: bigint, token: Token): number => {
  const decimals = TOKEN_DECIMALS[token];
  return parseFloat(ethers.formatUnits(amount, decimals));
};

// Update the deposit function to use token-aware decimals
deposit: async (token: Token, amount: number) => {
  // ... existing code ...
  
  const tokenAddress = getTokenAddress(token);
  const amountInWei = formatTokenAmount(amount, token); // Now uses correct decimals
  
  // ... rest of implementation
}

// Update the spend function similarly
spend: async (token: Token, amount: number, recipient: string) => {
  // ... existing code ...
  
  const tokenAddress = getTokenAddress(token);
  const amountInWei = formatTokenAmount(amount, token); // Now uses correct decimals
  
  // ... rest of implementation
}
```

---

## Step 7: Update `.gitignore`

Make sure your `.gitignore` includes environment files:

```bash
# Environment variables
.env
.env.local
.env.*.local
.env.production.local
```

Check your current `.gitignore`:
```bash
cat .gitignore
```

Add the lines if they're missing:
```bash
echo ".env.local" >> .gitignore
```

---

## Step 8: Test Your Configuration

### 8.1 Verify Environment Variables Load

Create a test file `src/config/verify.ts`:

```typescript
import { arcTestnet, CONTRACT_CONFIG, TOKEN_DECIMALS } from './blockchain';
import { CHAIN_CONFIG } from './wagmi';

export function verifyConfiguration() {
  console.log('=== ARC Router Configuration ===');
  console.log('Chain ID:', arcTestnet.id);
  console.log('Chain Name:', arcTestnet.name);
  console.log('RPC URL:', arcTestnet.rpcUrls.default.http[0]);
  console.log('Block Explorer:', arcTestnet.blockExplorers?.default.url);
  console.log('\n=== Contract Addresses ===');
  console.log('Spend Registry:', CONTRACT_CONFIG.SPEND_REGISTRY_ADDRESS);
  console.log('USDT:', CONTRACT_CONFIG.TOKENS.USDT);
  console.log('USDC:', CONTRACT_CONFIG.TOKENS.USDC);
  console.log('DAI:', CONTRACT_CONFIG.TOKENS.DAI);
  console.log('\n=== Token Decimals ===');
  console.log('USDT:', TOKEN_DECIMALS.USDT);
  console.log('USDC:', TOKEN_DECIMALS.USDC);
  console.log('DAI:', TOKEN_DECIMALS.DAI);
  
  // Validation
  const errors: string[] = [];
  
  if (arcTestnet.id === 123456) {
    errors.push('⚠️  Chain ID is still using placeholder value (123456)');
  }
  if (CONTRACT_CONFIG.SPEND_REGISTRY_ADDRESS === '0x0000000000000000000000000000000000000001') {
    errors.push('⚠️  Spend Registry Address is still using placeholder value');
  }
  if (CONTRACT_CONFIG.TOKENS.USDT === '0x0000000000000000000000000000000000000002') {
    errors.push('⚠️  USDT Address is still using placeholder value');
  }
  
  if (errors.length > 0) {
    console.log('\n=== Configuration Issues ===');
    errors.forEach(error => console.log(error));
    return false;
  }
  
  console.log('\n✅ Configuration is valid!');
  return true;
}
```

Add to `src/main.tsx` during development:

```typescript
import { verifyConfiguration } from './config/verify';

// Development only
if (import.meta.env.DEV) {
  verifyConfiguration();
}
```

### 8.2 Run the Development Server

```bash
npm run dev
```

Check the browser console (F12) for configuration output.

---

## Step 9: Production Environment Setup

### 9.1 For Production Deployment

Create `.env.production`:

```env
VITE_ARC_RPC_URL=https://rpc.arc.mainnet
VITE_CHAIN_ID=actual_mainnet_chain_id
VITE_CHAIN_NAME=ARC Mainnet
VITE_BLOCK_EXPLORER=https://explorer.arc.mainnet
VITE_SPEND_REGISTRY_ADDRESS=0x...
VITE_USDT_ADDRESS=0x...
VITE_USDC_ADDRESS=0x...
VITE_DAI_ADDRESS=0x...
VITE_APP_NAME=ARC Stablecoin Router
VITE_APP_URL=https://router.arc.io
VITE_ENV=production
```

### 9.2 Build for Production

```bash
npm run build

# Test the production build locally
npm run preview
```

---

## Step 10: Troubleshooting

### Issue: Environment Variables Not Loading

**Solution:**
1. Make sure variable names start with `VITE_`
2. Variables must be defined before `npm run dev`
3. Restart dev server after changing `.env.local`

```bash
# Restart dev server
npm run dev
```

### Issue: RPC Connection Fails

**Solution:**
```typescript
// Test RPC connection
import { createPublicClient, http } from 'viem';

const client = createPublicClient({
  transport: http(import.meta.env.VITE_ARC_RPC_URL),
});

try {
  const blockNumber = await client.getBlockNumber();
  console.log('✅ RPC Connected! Latest block:', blockNumber);
} catch (error) {
  console.error('❌ RPC Connection failed:', error);
}
```

### Issue: Contract Addresses Invalid

**Solution:**
```typescript
// Validate addresses
import { isAddress } from 'viem';

const addresses = [
  CONTRACT_CONFIG.SPEND_REGISTRY_ADDRESS,
  CONTRACT_CONFIG.TOKENS.USDT,
  CONTRACT_CONFIG.TOKENS.USDC,
  CONTRACT_CONFIG.TOKENS.DAI,
];

addresses.forEach(addr => {
  if (!isAddress(addr)) {
    console.error(`❌ Invalid address: ${addr}`);
  } else {
    console.log(`✅ Valid address: ${addr}`);
  }
});
```

---

## Checklist Before Deployment

- [ ] `.env.local` created with real values
- [ ] `.env.example` created and committed to Git
- [ ] `blockchain.ts` updated to use environment variables
- [ ] RPC URL tested and working
- [ ] Contract addresses verified on block explorer
- [ ] Chain ID matches your network
- [ ] Token decimals configured correctly
- [ ] `.gitignore` includes `.env.local`
- [ ] Configuration verification script passes
- [ ] Dev server runs without errors
- [ ] Production build completes successfully

---

## Next Steps

1. Complete the checklist above
2. Test wallet connection on your testnet
3. Test deposit/spend transactions
4. See `PROJECT_REVIEW_AND_DEBUG_GUIDE.md` for other required fixes

---

**Generated:** 2026-05-17  
**Last Updated:** 2026-05-17
