import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { TokenSelector } from './TokenSelector';
import { Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import type { Token } from '../types';

export function SpendForm() {
  const { wallet, spend, isSpending, balances } = useAppStore();
  const [token, setToken] = useState<Token>('USDT');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  const handleSpend = async () => {
    setError('');
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (!recipient || !recipient.startsWith('0x') || recipient.length !== 42) {
      setError('Please enter a valid recipient address (0x...)');
      return;
    }
    
    const result = await spend(token, parseFloat(amount), recipient);
    
    if (result.success) {
      setTxHash(result.txHash);
      setIsSuccess(true);
      setAmount('');
      setRecipient('');
    } else {
      setError(result.error || 'Transaction failed');
    }
  };

  const getBalance = () => {
    const balance = balances.find(b => b.token === token);
    return balance?.amount || 0;
  };

  const handleSetMax = () => {
    const balance = getBalance();
    setAmount(balance.toString());
  };

  const isInsufficientBalance = () => {
    const balance = getBalance();
    return amount && parseFloat(amount) > balance;
  };

  if (!wallet.isConnected) {
    return (
      <div className="bg-gray-50 rounded-2xl p-8 text-center">
        <Send className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Connect your wallet to spend</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Spend Successful!</h3>
          <p className="text-gray-600 mb-4">
            {amount} {token} sent to {recipient.slice(0, 6)}...{recipient.slice(-4)}
          </p>
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-xs text-gray-500 mb-1">Transaction Hash</p>
            <p className="text-xs font-mono text-gray-900 break-all">{txHash}</p>
          </div>
          <button
            onClick={() => setIsSuccess(false)}
            className="text-violet-600 hover:text-violet-700 font-medium"
          >
            Make Another Transaction
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
          <Send className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Spend</h3>
          <p className="text-sm text-gray-500">Send stablecoins via router</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Token</label>
          <TokenSelector value={token} onChange={setToken} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <button
              type="button"
              onClick={handleSetMax}
              className="text-xs text-violet-600 hover:text-violet-700 font-medium"
            >
              Max: {getBalance().toFixed(2)} {token}
            </button>
          </div>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className={clsx(
                "w-full px-4 py-3 rounded-xl",
                "bg-white border border-gray-200",
                "focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100",
                "transition-all",
                isInsufficientBalance() && "border-red-300 focus:border-red-500 focus:ring-red-100"
              )}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
              {token}
            </span>
          </div>
          {isInsufficientBalance() && (
            <p className="text-xs text-red-500 mt-1">Insufficient balance</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Address</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className={clsx(
              "w-full px-4 py-3 rounded-xl",
              "bg-white border border-gray-200",
              "focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100",
              "transition-all font-mono text-sm"
            )}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleSpend}
          disabled={!amount || parseFloat(amount) <= 0 || !recipient || isSpending || isInsufficientBalance()}
          className={clsx(
            "w-full flex items-center justify-center gap-2",
            "px-5 py-3 rounded-xl",
            "bg-gradient-to-r from-violet-500 to-indigo-500",
            "text-white font-medium",
            "hover:from-violet-600 hover:to-indigo-600",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-all duration-200"
          )}
        >
          {isSpending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Send {token}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
