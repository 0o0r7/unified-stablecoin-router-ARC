import { useState, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { Wallet, ChevronDown, LogOut, RefreshCw, AlertCircle, Network } from 'lucide-react';
import { clsx } from 'clsx';
import { CHAIN_CONFIG } from '../config/wagmi';

export function WalletConnect() {
  const { wallet, connectWallet, disconnectWallet, switchToArc, isLoading, addNotification } = useAppStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasWallet, setHasWallet] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasInjectedProvider = !!(window as any).ethereum?.providers 
        || !!(window as any).ethereum;
      setHasWallet(hasInjectedProvider);
    }
  }, []);

  const handleConnect = async () => {
    if (!hasWallet) {
      addNotification('error', 'Please install MetaMask or another Ethereum wallet');
      return;
    }
    setIsConnecting(true);
    await connectWallet();
    setIsConnecting(false);
  };

  const handleSwitchNetwork = async () => {
    await switchToArc();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isWrongNetwork = wallet.isConnected && wallet.chainId !== CHAIN_CONFIG.chainId;

  // Check if shadow mode is active
  const isShadowMode = typeof document !== 'undefined' && document.body.classList.contains('shadow-mode');

  if (wallet.isConnected) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={clsx(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
            isShadowMode 
              ? (isWrongNetwork ? "bg-red-900 border-2 border-red-500 text-white" : "bg-black border-2 border-white text-white")
              : (isWrongNetwork 
                  ? "bg-amber-900/30 border border-amber-500/50 text-amber-400"
                  : "bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/30 text-[var(--accent-color)]"),
          )}
        >
          <div className={clsx(
            "w-2 h-2 rounded-full animate-pulse",
            isWrongNetwork ? "bg-red-500" : (isShadowMode ? "bg-cyan-400" : "bg-[var(--accent-color)]")
          )} />
          <span className="text-sm font-mono">{formatAddress(wallet.address!)}</span>
          {isWrongNetwork && (
            <span className={clsx("text-xs px-1.5 py-0.5 rounded", isShadowMode ? "bg-red-600" : "bg-amber-500/20")}>
              Wrong Network
            </span>
          )}
          <ChevronDown className={clsx("w-4 h-4 transition-transform", isDropdownOpen && "rotate-180")} />
        </button>

        {isDropdownOpen && (
          <div className={clsx(
            "absolute right-0 mt-2 w-72 rounded-lg overflow-hidden z-50",
            isShadowMode ? "bg-white border-2 border-black shadow-[8px_8px_0px_#000]" : "bg-[#0a0a0a] border border-white/10 shadow-lg"
          )}>
            <div className={clsx("p-3", isShadowMode ? "border-b-2 border-black" : "border-b border-white/10")}>
              <p className={clsx("text-xs mb-1", isShadowMode ? "text-gray-600" : "text-gray-500")}>Connected to</p>
              <p className={clsx("text-sm font-medium font-mono truncate", isShadowMode ? "text-black" : "text-white")}>
                {wallet.address}
              </p>
            </div>
            <div className={clsx("p-2", isShadowMode ? "border-b-2 border-black" : "border-b border-white/10")}>
              <div className={clsx("flex items-center gap-2 px-3 py-2 text-sm", isShadowMode ? "text-black" : "text-gray-400")}>
                <Network className="w-4 h-4" />
                <span className="flex-1 font-mono">{wallet.chainName}</span>
                {isWrongNetwork && (
                  <button
                    onClick={handleSwitchNetwork}
                    className={clsx(
                      "text-xs font-medium px-2 py-1 rounded",
                      isShadowMode ? "bg-black text-white" : "text-[var(--accent-color)]"
                    )}
                  >
                    Switch
                  </button>
                )}
              </div>
            </div>
            <div className="p-2">
              <button
                onClick={() => {
                  disconnectWallet();
                  setIsDropdownOpen(false);
                }}
                className={clsx(
                  "flex items-center gap-2 w-full px-3 py-2 text-sm rounded transition-colors",
                  isShadowMode 
                    ? "text-red-600 hover:bg-red-50" 
                    : "text-red-400 hover:bg-red-900/20"
                )}
              >
                <LogOut className="w-4 h-4" />
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className={clsx(
        "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200",
        isShadowMode 
          ? "bg-black text-white border-2 border-black hover:border-[var(--accent-color)]"
          : "bg-transparent border border-[var(--accent-color)] text-[var(--accent-color)] hover:bg-[var(--accent-color)] hover:text-black"
      )}
    >
      <Wallet className="w-4 h-4" />
      <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
    </button>
  );
}
