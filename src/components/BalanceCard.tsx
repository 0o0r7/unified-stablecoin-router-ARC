import { clsx } from 'clsx';
import type { Token, Balance } from '../types';
import { TOKENS } from './TokenSelector';
import { TrendingUp, Wallet } from 'lucide-react';

interface BalanceCardProps {
  balance: Balance;
  variant?: 'default' | 'highlight';
}

export function BalanceCard({ balance, variant = 'default' }: BalanceCardProps) {
  const tokenInfo = TOKENS.find(t => t.symbol === balance.token);
  
  const formatAmount = (amount: number) => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-2xl p-5",
        "bg-white border border-gray-100",
        "shadow-sm hover:shadow-md transition-all duration-300",
        variant === 'highlight' && "ring-2 ring-violet-500 ring-offset-2"
      )}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-violet-50 to-indigo-50 rounded-full -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-xl">
            {tokenInfo?.logo}
          </div>
          <div>
            <p className="text-sm text-gray-500">{tokenInfo?.name}</p>
            <p className="font-semibold text-gray-900">{balance.token}</p>
          </div>
        </div>
        
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-gray-400 mb-1">Balance</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatAmount(balance.amount)}
            </p>
          </div>
          <div className={clsx(
            "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium",
            variant === 'highlight' ? "bg-violet-100 text-violet-700" : "bg-gray-100 text-gray-600"
          )}>
            <Wallet className="w-3 h-3" />
            <span>Available</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TotalBalanceProps {
  totalBalance: number;
}

export function TotalBalance({ totalBalance }: TotalBalanceProps) {
  const formatAmount = (amount: number) => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-violet-600 to-indigo-700 text-white">
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-white/80" />
          <span className="text-white/80 text-sm">Total Balance</span>
        </div>
        <p className="text-4xl font-bold mb-1">${formatAmount(totalBalance)}</p>
        <p className="text-white/60 text-sm">Across all stablecoins</p>
      </div>
    </div>
  );
}
