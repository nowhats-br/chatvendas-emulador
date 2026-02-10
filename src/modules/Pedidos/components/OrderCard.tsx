import React from 'react';
import { Order } from '../../../services/OrderService';
import { cn } from '../../../lib/utils';

// Ícones customizados para evitar problemas de importação
const Clock = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('circle', { cx: '12', cy: '12', r: '10' }),
  React.createElement('polyline', { points: '12,6 12,12 16,14' }));

const User = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('path', { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }),
  React.createElement('circle', { cx: '12', cy: '7', r: '4' }));

const Truck = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('path', { d: 'M14 18V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2' }),
  React.createElement('path', { d: 'M15 18H9' }),
  React.createElement('path', { d: 'M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14' }),
  React.createElement('circle', { cx: '17', cy: '18', r: '2' }),
  React.createElement('circle', { cx: '7', cy: '18', r: '2' }));

const Store = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('path', { d: 'm2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7' }),
  React.createElement('path', { d: 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8' }),
  React.createElement('path', { d: 'M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4' }),
  React.createElement('path', { d: 'M2 7h20' }),
  React.createElement('path', { d: 'M22 7v3a2 2 0 0 1-2 2v0a2.18 2.18 0 0 1-2-2v0a2.18 2.18 0 0 1-2 2v0a2.18 2.18 0 0 1-2-2v0a2.18 2.18 0 0 1-2 2v0a2.18 2.18 0 0 1-2-2v0a2.18 2.18 0 0 1-2 2v0a2 2 0 0 1-2-2V7' }));

const CreditCard = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('rect', { width: '20', height: '14', x: '2', y: '5', rx: '2' }),
  React.createElement('line', { x1: '2', y1: '10', x2: '22', y2: '10' }));

const Banknote = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('rect', { width: '20', height: '12', x: '2', y: '6', rx: '2' }),
  React.createElement('circle', { cx: '12', cy: '12', r: '2' }),
  React.createElement('path', { d: 'M6 12h.01M18 12h.01' }));

const Smartphone = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('rect', { width: '14', height: '20', x: '5', y: '2', rx: '2', ry: '2' }),
  React.createElement('path', { d: 'M12 18h.01' }));

interface OrderCardProps {
  order: Order;
  onClick: () => void;
}

export function OrderCard({ order, onClick }: OrderCardProps) {
  const isDelivery = order.delivery.method === 'delivery';
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'paid': return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'preparing': return 'bg-purple-50 border-purple-200 text-purple-700';
      case 'delivery': return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'delivered': return 'bg-green-50 border-green-200 text-green-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'pix': return <Smartphone size={12} className="text-green-600" />;
      case 'cash': return <Banknote size={12} className="text-yellow-600" />;
      case 'credit_card':
      case 'debit_card': return <CreditCard size={12} className="text-blue-600" />;
      default: return <CreditCard size={12} className="text-gray-600" />;
    }
  };

  const getPaymentLabel = (method: string) => {
    switch (method) {
      case 'pix': return 'PIX';
      case 'cash': return 'Dinheiro';
      case 'credit_card': return 'Cartão Créd.';
      case 'debit_card': return 'Cartão Déb.';
      default: return method;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes}min`;
    } else if (diffMinutes < 1440) {
      return `${Math.floor(diffMinutes / 60)}h`;
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
    >
      {/* Status indicator */}
      <div className={cn("absolute top-0 left-0 right-0 h-1", getStatusColor(order.status).split(' ')[0])} />
      
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-800 text-sm">#{order.id.slice(-6)}</span>
          <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border", getStatusColor(order.status))}>
            {order.status === 'pending' ? 'Aguardando' :
             order.status === 'paid' ? 'Pago' :
             order.status === 'preparing' ? 'Preparando' :
             order.status === 'delivery' ? 'Entrega' :
             order.status === 'delivered' ? 'Entregue' : order.status}
          </span>
        </div>
        <span className="text-[10px] text-gray-400 flex items-center gap-1">
          <Clock size={10} />
          {formatTime(order.createdAt)}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
          <User size={12} />
        </div>
        <span className="text-sm text-gray-700 font-medium truncate">
          {order.customerName || 'Cliente não informado'}
        </span>
      </div>

      <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
        {isDelivery ? (
            <>
                <Truck size={12} className="text-orange-500" />
                <span className="truncate max-w-[150px]">
                    {order.delivery.address ? 
                      `${order.delivery.address.street}, ${order.delivery.address.number}` : 
                      'Endereço não informado'
                    }
                </span>
            </>
        ) : (
            <>
                <Store size={12} className="text-blue-500" />
                <span>Retirada na Loja</span>
            </>
        )}
      </div>

      {/* Items count */}
      <div className="text-xs text-gray-400 mb-2">
        {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-gray-50">
        <span className="font-bold text-emerald-600 text-sm">
            R$ {order.totals.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
        <div className="flex items-center gap-1">
            {getPaymentIcon(order.payment.method)}
            <span className={cn(
                "px-1.5 py-0.5 rounded text-[10px] font-bold",
                order.payment.method === 'pix' ? "bg-green-100 text-green-700" :
                order.payment.method === 'cash' ? "bg-yellow-100 text-yellow-700" :
                "bg-blue-100 text-blue-700"
            )}>
                {getPaymentLabel(order.payment.method)}
            </span>
        </div>
      </div>

      {/* Hover effect */}
      <div className="absolute inset-0 bg-emerald-50 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" />
    </div>
  );
}
