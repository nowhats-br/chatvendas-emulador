import React from 'react';
import { OrderService, Order, OrderStatus } from '../../services/OrderService';
import { OrderCard } from './components/OrderCard';
import { OrderDetailsModal } from './components/OrderDetailsModal';
import { cn } from '../../lib/utils';

// Ícones customizados para evitar problemas de importação
const RefreshCw = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('path', { d: 'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8' }),
  React.createElement('path', { d: 'M21 3v5h-5' }),
  React.createElement('path', { d: 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16' }),
  React.createElement('path', { d: 'M8 16H3v5' }));

const Search = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('circle', { cx: '11', cy: '11', r: '8' }),
  React.createElement('path', { d: 'm21 21-4.35-4.35' }));

const Filter = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('polygon', { points: '22,3 2,3 10,12.46 10,19 14,21 14,12.46' }));

const ShoppingBag = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('path', { d: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z' }),
  React.createElement('path', { d: 'M3 6h18' }),
  React.createElement('path', { d: 'M16 10a4 4 0 0 1-8 0' }));

const COLUMNS: { id: OrderStatus; label: string; color: string }[] = [
    { id: 'pending', label: 'Aguardando', color: 'bg-yellow-50 border-yellow-200' },
    { id: 'paid', label: 'Pago', color: 'bg-blue-50 border-blue-200' },
    { id: 'preparing', label: 'Preparando', color: 'bg-purple-50 border-purple-200' },
    { id: 'delivery', label: 'Saiu p/ Entrega', color: 'bg-orange-50 border-orange-200' },
    { id: 'delivered', label: 'Entregue', color: 'bg-green-50 border-green-200' },
];

export default function PedidosPage() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<OrderStatus | 'all'>('all');

  const loadOrders = () => {
      setIsLoading(true);
      // Simula delay
      setTimeout(() => {
          setOrders(OrderService.getAll());
          setIsLoading(false);
      }, 300);
  };

  React.useEffect(() => {
      loadOrders();
      window.addEventListener('order-update', loadOrders);
      return () => window.removeEventListener('order-update', loadOrders);
  }, []);

  const filteredOrders = React.useMemo(() => {
    return orders.filter((order: Order) => {
      const matchesSearch = searchTerm === '' || 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const getOrderStats = () => {
    const stats = {
      total: orders.length,
      pending: orders.filter((o: Order) => o.status === 'pending').length,
      paid: orders.filter((o: Order) => o.status === 'paid').length,
      preparing: orders.filter((o: Order) => o.status === 'preparing').length,
      delivery: orders.filter((o: Order) => o.status === 'delivery').length,
      delivered: orders.filter((o: Order) => o.status === 'delivered').length,
      totalValue: orders.reduce((sum: number, o: Order) => sum + o.totals.total, 0)
    };
    return stats;
  };

  const stats = getOrderStats();

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      <OrderDetailsModal 
        order={selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
        onUpdate={loadOrders}
      />

      {/* Header */}
      <div className="p-8 pb-4 shrink-0">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <ShoppingBag className="text-emerald-600" />
              Pedidos
            </h1>
            <p className="text-gray-500 mt-1">Gerencie o fluxo de vendas e entregas.</p>
          </div>
          <button 
            onClick={loadOrders} 
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-emerald-600 bg-white rounded-lg border border-gray-200 shadow-sm transition disabled:opacity-50"
            title="Atualizar pedidos"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-bold">Total</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-xs text-yellow-600 uppercase font-bold">Aguardando</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-xs text-blue-600 uppercase font-bold">Pagos</p>
            <p className="text-2xl font-bold text-blue-600">{stats.paid}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-xs text-purple-600 uppercase font-bold">Preparando</p>
            <p className="text-2xl font-bold text-purple-600">{stats.preparing}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-xs text-orange-600 uppercase font-bold">Entrega</p>
            <p className="text-2xl font-bold text-orange-600">{stats.delivery}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-xs text-green-600 uppercase font-bold">Entregues</p>
            <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por ID ou cliente..." 
              className="w-full pl-10 p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <select 
              className="pl-10 pr-8 p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors bg-white"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as OrderStatus | 'all')}
            >
              <option value="all">Todos os Status</option>
              <option value="pending">Aguardando</option>
              <option value="paid">Pago</option>
              <option value="preparing">Preparando</option>
              <option value="delivery">Saiu p/ Entrega</option>
              <option value="delivered">Entregue</option>
            </select>
          </div>
        </div>

        {/* Total Value */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-emerald-700 font-medium">Valor Total dos Pedidos:</span>
            <span className="text-2xl font-bold text-emerald-700">
              R$ {stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden px-8 pb-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw size={32} className="animate-spin text-gray-400" />
              <p className="text-gray-500">Carregando pedidos...</p>
            </div>
          </div>
        ) : (
          <div className="flex gap-4 h-full min-w-[1200px]">
              {COLUMNS.map(col => {
                const columnOrders = filteredOrders.filter((o: Order) => o.status === col.id);
                
                return (
                  <div key={col.id} className="flex-1 flex flex-col h-full min-w-[280px]">
                      <div className={cn("p-3 rounded-t-lg border-b-2 font-bold text-gray-700 flex justify-between items-center", col.color.replace('bg-', 'bg-opacity-50 '))} >
                          <span>{col.label}</span>
                          <span className="bg-white/50 px-2 py-0.5 rounded text-xs">
                              {columnOrders.length}
                          </span>
                      </div>
                      <div className={cn("flex-1 bg-gray-100/50 border-x border-b border-gray-200 rounded-b-lg p-3 overflow-y-auto space-y-3", col.color)}>
                          {columnOrders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-32 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                              <ShoppingBag size={32} className="mb-2 opacity-50" />
                              <p className="text-sm">Nenhum pedido</p>
                              <p className="text-xs">neste status</p>
                            </div>
                          ) : (
                            columnOrders.map((order: Order) => (
                                <OrderCard 
                                    key={order.id} 
                                    order={order} 
                                    onClick={() => setSelectedOrder(order)} 
                                />
                            ))
                          )}
                      </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
