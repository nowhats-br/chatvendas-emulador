import React from 'react';
import { Contact } from '../../../services/ContactService';
import { Order } from '../../../services/OrderService';

// Custom icon components
const XIcon = ({ size = 18 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d: 'm18 6-12 12' }), React.createElement('path', { d: 'm6 6 12 12' }));
const ShoppingBagIcon = ({ size = 18, className }: { size?: number; className?: string }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className }, React.createElement('path', { d: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z' }), React.createElement('path', { d: 'M3 6h18' }), React.createElement('path', { d: 'M16 10a4 4 0 0 1-8 0' }));
const CalendarIcon = ({ size = 12 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d: 'M8 2v4' }), React.createElement('path', { d: 'M16 2v4' }), React.createElement('rect', { width: '18', height: '18', x: '3', y: '4', rx: '2' }), React.createElement('path', { d: 'M3 10h18' }));
const CreditCardIcon = ({ size = 12 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('rect', { width: '20', height: '14', x: '2', y: '5', rx: '2' }), React.createElement('line', { x1: '2', y1: '10', x2: '22', y2: '10' }));

interface PurchaseHistoryModalProps {
  contact: Contact | null;
  history: Order[];
  onClose: () => void;
}

export function PurchaseHistoryModal({ contact, history, onClose }: PurchaseHistoryModalProps) {
  if (!contact) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <ShoppingBagIcon size={18} className="text-emerald-400" /> Histórico de Compras
            </h2>
            <p className="text-xs text-gray-400">{contact.name} • {contact.phoneNumber}</p>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-1.5 rounded-full transition">
            <XIcon size={18} />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto bg-gray-50">
          {history.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <ShoppingBagIcon size={48} className="mx-auto mb-3 opacity-30" />
              <p>Nenhuma compra registrada para este contato.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((order) => (
                <div key={order.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-2">
                    <div>
                      <span className="font-bold text-gray-800 text-sm">Pedido {order.id}</span>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <CalendarIcon size={12} />
                        {new Date(order.createdAt).toLocaleDateString()} às {new Date(order.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block font-bold text-emerald-600">R$ {order.totals.total.toFixed(2)}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.qty}x {item.name}</span>
                        <span className="text-gray-800 font-medium">R$ {(item.price * item.qty).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-2 border-t border-gray-50 flex items-center gap-2 text-xs text-gray-500">
                    <CreditCardIcon size={12} /> Pagamento via {order.payment.method}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
