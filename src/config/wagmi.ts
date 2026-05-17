import { http, createConfig } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { arcTestnet } from './blockchain';

// Wagmi configuration for ARC testnet
export const config = createConfig({
  chains: [arcTestnet],
  connectors: [
    injected({
      // Empty target allows connecting to any injected wallet (MetaMask, Rabby, Coinbase, Trust, etc.)
    }),
  ],
  transports: {
    [arcTestnet.id]: http(),
  },
});

// Chain configuration for easy access
export const CHAIN_CONFIG = {
  chainId: arcTestnet.id,
  chainName: arcTestnet.name,
  explorerUrl: arcTestnet.blockExplorers?.default?.url || '',
};
