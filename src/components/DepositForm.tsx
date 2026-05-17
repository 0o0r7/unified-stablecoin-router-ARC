import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { TokenSelector, TOKENS } from './TokenSelector';
import { ArrowDownToLine, Loader2, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';
import type { Token } from '../types';

export function DepositForm() {
  const { wallet, deposit, isDepositing, balances } = useAppStore();
  const [token, setToken] = useState<Token>('USDT');
  const [amount, setAmount] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [txHash, setTxHash] = useState('');

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    
    const result = await deposit(token, parseFloat(amount));
    
    if (result.success) {
      setTxHash(result.txHash);
      setIsSuccess(true);
      setAmount('');
    }
  };

  const getMaxAmount = () => {
    const balance = balances.find(b => b.token === token);
    return balance?.amount || 0;
  };

  const handleSetMax = () => {
    const max = getMaxAmount();
    setAmount(max.toString());
  };

  if (!wallet.isConnected) {
    return (
      <div className="bg-gray-50 rounded-2xl p-8 text-center">
        <ArrowDownToLine className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Connect your wallet to deposit</p>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Deposit Successful!</h3>
          <p className="text-gray-600 mb-4">
            Your {token} has been deposited to the router
          </p>
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-xs text-gray-500 mb-1">Transaction Hash</p>
            <p className="text-xs font-mono text-gray-900 break-all">{txHash}</p>
          </div>
          <button
            onClick={() => setIsSuccess(false)}
            className="text-violet-600 hover:text-violet-700 font-medium"
          >
            Make Another Deposit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
          <ArrowDownToLine className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Deposit</h3>
          <p className="text-sm text-gray-500">Add stablecoins to your router</p>
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
              Max: {getMaxAmount().toFixed(2)} {token}
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
                "transition-all"
              )}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
              {token}
            </span>
          </div>
        </div>

        <button
          onClick={handleDeposit}
          disabled={!amount || parseFloat(amount) <= 0 || isDepositing}
          className={clsx(
            "w-full flex items-center justify-center gap-2",
            "px-5 py-3 rounded-xl",
            "bg-gradient-to-r from-emerald-500 to-teal-500",
            "text-white font-medium",
            "hover:from-emerald-600 hover:to-teal-600",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-all duration-200"
          )}
        >
          {isDepositing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Depositing...</span>
            </>
          ) : (
            <>
              <ArrowDownToLine className="w-4 h-4" />
              <span>Deposit {token}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
