import React, { useState, useEffect } from 'react';
import { 
  DollarSign, MessageSquare, ShoppingBag, Users, 
  Calendar, ArrowRight, Bell, RefreshCw, AlertTriangle
} from 'lucide-react';
import { StatCard } from './components/StatCard';
import { SalesChart, CategoryChart } from './components/DashboardCharts';
import { motion } from 'framer-motion';
import DashboardService, { DashboardStats, RecentOrder } from '../../services/DashboardService';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentDate = new Date().toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsData, ordersData] = await Promise.all([
        DashboardService.getStats().catch(err => {
          console.warn('Erro ao carregar stats:', err);
          return null;
        }),
        DashboardService.getRecentOrders(5).catch(err => {
          console.warn('Erro ao carregar pedidos:', err);
          return [];
        })
      ]);
      
      setStats(statsData);
      setRecentOrders(ordersData);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setError('Erro ao conectar com o servidor. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadDashboardData();
    
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="h-full overflow-y-auto bg-gray-50/50 dark:bg-black p-6 md:p-8 transition-colors duration-300">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-emerald-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                Carregando Dashboard
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Conectando com o servidor...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full overflow-y-auto bg-gray-50/50 dark:bg-black p-6 md:p-8 transition-colors duration-300">
        <div className="flex items-center justify-center h-64">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <div className="w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Erro de Conexão
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error}
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {refreshing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Tentando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Tentar Novamente
                  </>
                )}
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Recarregar Página
              </button>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">💡 Dica:</p>
              <p>Execute o comando <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">start-backend.bat</code> para iniciar o servidor.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50/50 dark:bg-black p-6 md:p-8 transition-colors duration-300">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight"
          >
            Olá, Admin! 👋
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2 capitalize"
          >
            <Calendar size={14} />
            {currentDate}
          </motion.p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-3 bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-200 dark:border-[#333] text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button className="p-3 bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-200 dark:border-[#333] text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 transition-all shadow-sm relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#1c1c1c]"></span>
          </button>
          <button className="px-5 py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-medium shadow-lg shadow-gray-200 dark:shadow-none hover:bg-gray-800 dark:hover:bg-gray-200 transition-all flex items-center gap-2">
            <span>Ver Relatórios</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Receita Total" 
          value={stats ? DashboardService.formatCurrency(stats.revenue.total) : 'R$ 0,00'} 
          subValue={stats ? `+ ${DashboardService.formatCurrency(stats.revenue.today)} hoje` : '+ R$ 0 hoje'}
          icon={DollarSign} 
          trend={stats?.revenue.trendDirection || 'up'} 
          trendValue={stats ? `${stats.revenue.trend}%` : '0%'} 
          color="emerald"
          delay={0.1}
        />
        <StatCard 
          title="Atendimentos" 
          value={stats ? DashboardService.formatNumber(stats.tickets.total) : '0'} 
          subValue={stats ? `${stats.tickets.active} ativos agora` : '0 ativos agora'}
          icon={MessageSquare} 
          trend={stats?.tickets.trendDirection || 'up'} 
          trendValue={stats ? `${stats.tickets.trend}%` : '0%'} 
          color="blue"
          delay={0.2}
        />
        <StatCard 
          title="Novos Pedidos" 
          value={stats ? DashboardService.formatNumber(stats.orders.today) : '0'} 
          subValue={stats ? `${stats.orders.pending} pendentes` : '0 pendentes'}
          icon={ShoppingBag} 
          trend={stats?.orders.trendDirection || 'up'} 
          trendValue={stats ? `${stats.orders.trend}%` : '0%'} 
          color="orange"
          delay={0.3}
        />
        <StatCard 
          title="Novos Clientes" 
          value={stats ? DashboardService.formatNumber(stats.contacts.today) : '0'} 
          subValue={stats ? `Total: ${DashboardService.formatNumber(stats.contacts.total)}` : 'Total: 0'}
          icon={Users} 
          trend={stats?.contacts.trendDirection || 'up'} 
          trendValue={stats ? `${stats.contacts.trend}%` : '0%'} 
          color="purple"
          delay={0.4}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        <div>
          <CategoryChart />
        </div>
      </div>

      {/* Recent Activity Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-gray-100 dark:border-[#333] shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 dark:border-[#333] flex justify-between items-center">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">Atividade Recente</h3>
          <button className="text-sm text-emerald-600 dark:text-emerald-400 font-bold hover:underline">Ver Todos</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 dark:bg-[#252525]">
              <tr className="text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Valor</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-[#333]">
              {recentOrders.length > 0 ? recentOrders.map((order, index) => (
                <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-[#222] transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-200">
                    #{order.id.substring(0, 8)}
                  </td>
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#333] dark:to-[#444] flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                      {order.customer_name ? order.customer_name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                      <span className="text-sm text-gray-900 dark:text-gray-200 font-medium">
                        {order.customer_name || 'Cliente'}
                      </span>
                      {order.customer_phone && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {order.customer_phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      DashboardService.getStatusColor(order.status) === 'green'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : DashboardService.getStatusColor(order.status) === 'yellow'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {DashboardService.getStatusText(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300">
                    {order.total_amount ? DashboardService.formatCurrency(order.total_amount) : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {DashboardService.formatRelativeDate(order.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                      Detalhes
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    {stats ? 'Nenhuma atividade recente encontrada' : 'Aguardando dados do servidor...'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
