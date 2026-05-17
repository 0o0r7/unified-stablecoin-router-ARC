# ARC Unified Stablecoin Router - Project Documentation

## Project Overview

**Project Name:** ARC Unified Stablecoin Router  
**Project Type:** React + TypeScript Full-Stack Web Application  
**Core Functionality:** A unified stablecoin router that allows users to connect crypto wallets, deposit stablecoins (USDT, USDC, DAI), spend through a unified router, and view balances, logs, and activity.

## Architecture

### Technology Stack
- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS 3.4.17
- **State Management:** Zustand with persistence
- **Routing:** React Router DOM v6
- **Icons:** Lucide React

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── WalletConnect.tsx
│   ├── TokenSelector.tsx
│   ├── BalanceCard.tsx
│   ├── DepositForm.tsx
│   ├── SpendForm.tsx
│   ├── ActivityList.tsx
│   ├── Notifications.tsx
│   └── index.ts
├── pages/              # Page components
│   ├── HomePage.tsx
│   ├── DashboardPage.tsx
│   └── index.ts
├── store/              # State management
│   └── appStore.ts
├── types/              # TypeScript types
│   └── index.ts
├── App.tsx            # Main app with routing
├── main.tsx           # Entry point
└── index.css          # Global styles
```

## Features Implemented

### 1. Wallet System
- Wallet connect button with simulated connection
- Display connected wallet address
- Auto-detect chain (Ethereum Mainnet)
- Disconnect functionality

### 2. Deposit Flow
- Token selector (USDT, USDC, DAI)
- Amount input with max button
- Simulated deposit with loading state
- Success/failure notifications
- Transaction hash display

### 3. Spend Flow
- Token selector
- Amount input with balance check
- Recipient address input with validation
- Simulated spend with loading state
- Success/failure states with tx hash

### 4. Dashboard
- Total balance display
- Per-token balance cards
- Recent deposits list
- Recent spends list
- Registry logs display

### 5. Smart Contract Simulation (SpendRegistry.sol)
- `deposit()` - Simulates deposit to router
- `spend()` - Simulates spend through router
- `logAction()` - Logs actions to registry
- Mock transaction hashes generated

## Data Storage

In-memory storage with Zustand persistence for:
- User wallet state
- Token balances (USDT, USDC, DAI)
- Deposit history
- Spend history
- Registry logs

## API Endpoints (Simulated)

All operations are handled through the Zustand store:
- `deposit(token, amount)` - Deposit stablecoins
- `spend(token, amount, recipient)` - Spend stablecoins
- `fetchBalance()` - Get user balances
- `fetchActivity()` - Get transaction history

## UI/UX Design

- Modern dashboard layout with card-based design
- Light mode with clean typography
- Responsive design for all screen sizes
- Smooth transitions and animations
- Gradient accents with violet/indigo theme

## Running the Project

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## Notes

- This is a simulated blockchain application with mock data
- No real cryptocurrency transactions are performed
- All data is stored in-memory and resets on page refresh (except persisted wallet state)
- Transaction hashes are randomly generated for simulation
