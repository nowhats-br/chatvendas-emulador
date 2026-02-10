import React from 'react';
import { Package, Bike } from 'lucide-react';
import { Order, OrderService } from '../../../services/OrderService';

// Ícones customizados para evitar problemas de importação
const X = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('path', { d: 'm18 6-12 12' }),
  React.createElement('path', { d: 'm6 6 12 12' }));

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

const CheckCircle = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('path', { d: 'M9 11l3 3l8-8' }),
  React.createElement('path', { d: 'm21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.12 0 4.07.74 5.61 1.98' }));

interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
  onUpdate: () => void;
}

export function OrderDetailsModal({ order, onClose, onUpdate }: OrderDetailsModalProps) {
  const [driverName, setDriverName] = React.useState('');

  if (!order) return null;

  const handleAssignDriver = () => {
      if(!driverName) return alert('Selecione um entregador');
      OrderService.assignDriver(order.id, driverName);
      onUpdate();
      onClose();
  };

  const handleAdvanceStatus = () => {
      if(order.status === 'pending') OrderService.updateStatus(order.id, 'paid');
      else if(order.status === 'paid') OrderService.updateStatus(order.id, 'preparing');
      else if(order.status === 'preparing') OrderService.updateStatus(order.id, 'delivery'); // Normalmente via driver
      else if(order.status === 'delivery') OrderService.updateStatus(order.id, 'delivered');
      onUpdate();
      onClose();
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'pix': return <Smartphone size={16} className="text-green-600" />;
      case 'cash': return <Banknote size={16} className="text-yellow-600" />;
      case 'credit_card':
      case 'debit_card': return <CreditCard size={16} className="text-blue-600" />;
      default: return <CreditCard size={16} className="text-gray-600" />;
    }
  };

  const getPaymentLabel = (method: string) => {
    switch (method) {
      case 'pix': return 'PIX';
      case 'cash': return 'Dinheiro';
      case 'credit_card': return 'Cartão de Crédito';
      case 'debit_card': return 'Cartão de Débito';
      default: return method;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'paid': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'preparing': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'delivery': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Aguardando Pagamento';
      case 'paid': return 'Pago';
      case 'preparing': return 'Preparando';
      case 'delivery': return 'Saiu para Entrega';
      case 'delivered': return 'Entregue';
      default: return status;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Package className="text-emerald-400" />
              Pedido #{order.id.slice(-6)}
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-xs text-gray-400">
                Realizado em {new Date(order.createdAt).toLocaleString('pt-BR')}
              </p>
              <span className={`px-2 py-1 rounded text-xs font-bold border ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="hover:bg-white/10 p-2 rounded-full transition"
            title="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-2 gap-6">
            {/* Esquerda: Itens */}
            <div className="space-y-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
                    <Package size={18} className="text-emerald-600" /> Itens do Pedido
                </h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {order.items.map((item, idx) => (
                        <div key={idx} className="flex gap-3 items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <img 
                              src={item.images?.[0] || '/placeholder-product.png'} 
                              alt={item.name}
                              className="w-12 h-12 rounded object-cover bg-white border border-gray-200" 
                            />
                            <div className="flex-1">
                                <p className="text-sm font-bold text-gray-800">{item.qty}x {item.name}</p>
                                <p className="text-xs text-gray-500">
                                  R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} cada
                                </p>
                                {item.description && (
                                  <p className="text-xs text-gray-400 mt-1">{item.description}</p>
                                )}
                            </div>
                            <p className="text-sm font-bold text-emerald-600">
                              R$ {(item.price * item.qty).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    ))}
                </div>
                <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Subtotal</span>
                        <span>R$ {order.totals.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    {order.totals.freight > 0 && (
                      <div className="flex justify-between text-sm text-gray-600">
                          <span>Frete</span>
                          <span>R$ {order.totals.freight.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    {order.totals.discount > 0 && (
                      <div className="flex justify-between text-sm text-gray-600">
                          <span>Desconto</span>
                          <span className="text-red-500">- R$ {order.totals.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold text-emerald-600 pt-2 border-t border-gray-200">
                        <span>Total</span>
                        <span>R$ {order.totals.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>

            {/* Direita: Cliente e Entrega */}
            <div className="space-y-6">
                <div>
                    <h3 className="font-bold text-gray-800 flex items-center gap-2 border-b pb-2 mb-3">
                        <User size={18} className="text-blue-600" /> Cliente
                    </h3>
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <p className="font-medium text-gray-800">{order.customerName || 'Cliente não informado'}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {getPaymentIcon(order.payment.method)}
                        <span className="text-sm text-gray-600">
                          Pagamento via {getPaymentLabel(order.payment.method)}
                        </span>
                      </div>
                      {order.payment.changeFor && (
                          <p className="text-sm text-orange-600 mt-1 flex items-center gap-1">
                            <Banknote size={14} />
                            Troco para R$ {order.payment.changeFor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                      )}
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-gray-800 flex items-center gap-2 border-b pb-2 mb-3">
                        {order.delivery.method === 'delivery' ? <Truck size={18} className="text-orange-600" /> : <Store size={18} className="text-blue-600" />}
                        {order.delivery.method === 'delivery' ? 'Entrega' : 'Retirada'}
                    </h3>
                    {order.delivery.method === 'delivery' && order.delivery.address ? (
                        <div className="text-sm text-gray-600 bg-orange-50 p-3 rounded-lg border border-orange-100">
                            <p>{order.delivery.address.street}, {order.delivery.address.number}</p>
                            <p>{order.delivery.address.neighborhood}</p>
                            <p>{order.delivery.address.city}/{order.delivery.address.uf}</p>
                            {order.delivery.address.complement && <p className="text-xs mt-1 text-gray-400">{order.delivery.address.complement}</p>}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">Cliente irá retirar na loja.</p>
                    )}
                </div>

                {/* Ações de Status */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                      <CheckCircle size={14} />
                      Ações do Pedido
                    </h4>
                    
                    {order.status === 'preparing' && order.delivery.method === 'delivery' ? (
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-600 block">Atribuir Entregador</label>
                            <div className="flex gap-2">
                                <select 
                                    className="flex-1 text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                    value={driverName}
                                    onChange={e => setDriverName(e.target.value)}
                                >
                                    <option value="">Selecione um entregador...</option>
                                    <option value="motoboy1">João Motoboy</option>
                                    <option value="motoboy2">Carlos Express</option>
                                    <option value="motoboy3">Pedro Delivery</option>
                                </select>
                                <button 
                                    onClick={handleAssignDriver}
                                    disabled={!driverName}
                                    className="bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                    title="Atribuir entregador"
                                >
                                    <Bike size={20} />
                                </button>
                            </div>
                        </div>
                    ) : order.status === 'delivered' ? (
                        <div className="text-center py-4">
                          <CheckCircle size={48} className="mx-auto text-green-500 mb-2" />
                          <p className="text-green-600 font-medium">Pedido Concluído</p>
                          <p className="text-xs text-gray-500 mt-1">Este pedido foi entregue com sucesso</p>
                        </div>
                    ) : (
                        <button 
                            onClick={handleAdvanceStatus}
                            className="w-full py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                        >
                            {order.status === 'pending' && (
                              <>
                                <CreditCard size={18} />
                                Marcar como Pago
                              </>
                            )}
                            {order.status === 'paid' && (
                              <>
                                <Package size={18} />
                                Iniciar Preparo
                              </>
                            )}
                            {order.status === 'preparing' && order.delivery.method === 'pickup' && (
                              <>
                                <Store size={18} />
                                Pronto para Retirada
                              </>
                            )}
                            {order.status === 'delivery' && (
                              <>
                                <CheckCircle size={18} />
                                Confirmar Entrega
                              </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
