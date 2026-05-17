import { useAppStore } from '../store/appStore';
import { ArrowDownToLine, Send, CheckCircle2, Clock, FileText } from 'lucide-react';
import { clsx } from 'clsx';
import type { Deposit, Spend, RegistryLog } from '../types';

function formatDate(date: Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

interface ActivityItemProps {
  deposit?: Deposit;
  spend?: Spend;
}

function ActivityItem({ deposit, spend }: ActivityItemProps) {
  const item = deposit || spend;
  if (!item) return null;

  const isDeposit = !!deposit;

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors">
      <div className={clsx(
        "w-10 h-10 rounded-xl flex items-center justify-center",
        isDeposit ? "bg-emerald-100" : "bg-violet-100"
      )}>
        {isDeposit ? (
          <ArrowDownToLine className="w-5 h-5 text-emerald-600" />
        ) : (
          <Send className="w-5 h-5 text-violet-600" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-gray-900">
            {isDeposit ? 'Deposit' : 'Spend'}
          </p>
          <span className={clsx(
            "px-2 py-0.5 rounded-full text-xs font-medium",
            isDeposit ? "bg-emerald-100 text-emerald-700" : "bg-violet-100 text-violet-700"
          )}>
            {item.token}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-3 h-3" />
          <span>{formatDate(item.createdAt)}</span>
        </div>
      </div>
      
      <div className="text-right">
        <p className={clsx(
          "font-semibold",
          isDeposit ? "text-emerald-600" : "text-gray-900"
        )}>
          {isDeposit ? '+' : '-'}{item.amount} {item.token}
        </p>
        <p className="text-xs text-gray-400 font-mono">
          {formatAddress(item.txHash)}
        </p>
      </div>
    </div>
  );
}

interface LogItemProps {
  log: RegistryLog;
}

function LogItem({ log }: LogItemProps) {
  const getActionIcon = () => {
    switch (log.action) {
      case 'DEPOSIT':
        return <ArrowDownToLine className="w-4 h-4 text-emerald-600" />;
      case 'SPEND':
        return <Send className="w-4 h-4 text-violet-600" />;
      case 'APPROVE':
        return <CheckCircle2 className="w-4 h-4 text-blue-600" />;
    }
  };

  const getActionColor = () => {
    switch (log.action) {
      case 'DEPOSIT':
        return 'bg-emerald-100 text-emerald-700';
      case 'SPEND':
        return 'bg-violet-100 text-violet-700';
      case 'APPROVE':
        return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center", getActionColor())}>
        {getActionIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">
          {log.action}
        </p>
        <p className="text-xs text-gray-500">
          {log.amount} {log.token}
        </p>
      </div>
      <div className="text-xs text-gray-400">
        {formatDate(log.createdAt)}
      </div>
    </div>
  );
}

export function ActivityList() {
  const { wallet, deposits, spends, registryLogs } = useAppStore();

  if (!wallet.isConnected) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <FileText className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Activity</h3>
            <p className="text-sm text-gray-500">Recent transactions</p>
          </div>
        </div>
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p>Connect your wallet to view activity</p>
        </div>
      </div>
    );
  }

  const allActivity = [...deposits, ...spends]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
          <FileText className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Activity</h3>
          <p className="text-sm text-gray-500">Recent transactions</p>
        </div>
      </div>

      {allActivity.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p>No transactions yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {allActivity.map((item) => (
            <ActivityItem
              key={item.id}
              deposit={'token' in item && item.token ? (item as Deposit) : undefined}
              spend={!('token' in item) || !item.token ? (item as Spend) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function RegistryLogs() {
  const { wallet, registryLogs } = useAppStore();

  if (!wallet.isConnected) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
          <FileText className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Registry Logs</h3>
          <p className="text-sm text-gray-500">Smart contract events</p>
        </div>
      </div>

      {registryLogs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No registry logs yet</p>
        </div>
      ) : (
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {registryLogs.map((log) => (
            <LogItem key={log.id} log={log} />
          ))}
        </div>
      )}
    </div>
  );
}
