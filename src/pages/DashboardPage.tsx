import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { WalletConnect, BalanceCard, TotalBalance, DepositForm, SpendForm, ActivityList, RegistryLogs } from '../components';
import { LayoutDashboard, Home, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';

export function DashboardPage() {
  const navigate = useNavigate();
  const { wallet, balances, fetchBalance, fetchActivity } = useAppStore();

  useEffect(() => {
    if (wallet.isConnected) {
      fetchBalance();
      fetchActivity();
    }
  }, [wallet.isConnected, fetchBalance, fetchActivity]);

  const totalBalance = balances.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-xl font-bold text-gray-900">ARC Router</span>
              <span className="hidden sm:inline text-sm text-gray-500 ml-2">Dashboard</span>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  fetchBalance();
                  fetchActivity();
                }}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <WalletConnect />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 h-12">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                "bg-violet-50 text-violet-700"
              )}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!wallet.isConnected ? (
          /* Not Connected State */
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
              <LayoutDashboard className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Connect your wallet to access the dashboard and manage your stablecoin portfolio
            </p>
            <WalletConnect />
          </div>
        ) : (
          /* Connected State */
          <div className="space-y-8">
            {/* Balance Overview */}
            <section>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="md:col-span-2">
                  <TotalBalance totalBalance={totalBalance} />
                </div>
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                  {balances.map((balance) => (
                    <BalanceCard
                      key={balance.token}
                      balance={balance}
                      variant={balance.amount > 0 ? 'default' : 'default'}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Actions */}
            <section className="grid lg:grid-cols-2 gap-8">
              <DepositForm />
              <SpendForm />
            </section>

            {/* Activity & Logs */}
            <section className="grid lg:grid-cols-2 gap-8">
              <ActivityList />
              <RegistryLogs />
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
