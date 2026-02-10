import React from 'react';
import { CartItem } from '../types';
import { OrderService, OrderPayload } from '../../../services/OrderService';
import { cn } from '../../../lib/utils';
import { attendanceService } from '../../../services/AttendanceService';

// Componentes de ícones usando React.createElement
const X = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M18 6 6 18' }),
    React.createElement('path', { d: 'm6 6 12 12' }));

const Trash2 = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M3 6h18' }),
    React.createElement('path', { d: 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' }),
    React.createElement('path', { d: 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2' }),
    React.createElement('line', { x1: '10', x2: '10', y1: '11', y2: '17' }),
    React.createElement('line', { x1: '14', x2: '14', y1: '11', y2: '17' }));

const ChevronDown = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  }, React.createElement('path', { d: 'm6 9 6 6 6-6' }));

const Store = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'm2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7' }),
    React.createElement('path', { d: 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8' }),
    React.createElement('path', { d: 'M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4' }),
    React.createElement('path', { d: 'M2 7h20' }),
    React.createElement('path', { d: 'M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7' }));

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

const ArrowLeft = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'm12 19-7-7 7-7' }),
    React.createElement('path', { d: 'M19 12H5' }));

const MapPin = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z' }),
    React.createElement('circle', { cx: '12', cy: '10', r: '3' }));

const CheckCircle = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }),
    React.createElement('path', { d: 'm9 11 3 3L22 4' }));

const Send = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'm22 2-7 20-4-9-9-4Z' }),
    React.createElement('path', { d: 'M22 2 11 13' }));

const CreditCard = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('rect', { width: '20', height: '14', x: '2', y: '5', rx: '2' }),
    React.createElement('line', { x1: '2', x2: '22', y1: '10', y2: '10' }));

const ShoppingBag = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z' }),
    React.createElement('path', { d: 'M3 6h18' }),
    React.createElement('path', { d: 'M16 10a4 4 0 0 1-8 0' }));

const Banknote = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('rect', { width: '20', height: '12', x: '2', y: '6', rx: '2' }),
    React.createElement('circle', { cx: '12', cy: '12', r: '2' }),
    React.createElement('path', { d: 'M6 12h.01M18 12h.01' }));

const QrCode = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('rect', { width: '5', height: '5', x: '3', y: '3', rx: '1' }),
    React.createElement('rect', { width: '5', height: '5', x: '16', y: '3', rx: '1' }),
    React.createElement('rect', { width: '5', height: '5', x: '3', y: '16', rx: '1' }),
    React.createElement('path', { d: 'M21 16h-3a2 2 0 0 0-2 2v3' }),
    React.createElement('path', { d: 'M21 21v.01' }),
    React.createElement('path', { d: 'M12 7v3a2 2 0 0 1-2 2H7' }),
    React.createElement('path', { d: 'M3 12h.01' }),
    React.createElement('path', { d: 'M12 3h.01' }),
    React.createElement('path', { d: 'M12 16v.01' }),
    React.createElement('path', { d: 'M16 12h1' }),
    React.createElement('path', { d: 'M21 12v.01' }),
    React.createElement('path', { d: 'M12 21v-1' }));

const Wallet = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M19 7V6a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1v-2a2 2 0 0 0-2-2H2' }),
    React.createElement('path', { d: 'M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4' }));

const Loader2 = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M21 12a9 9 0 1 1-6.219-8.56' }));

interface CartPanelProps {
  onClose: () => void;
  items: CartItem[];
  freight: number;
  discount: number;
  ticketId: string | null;
  customerName?: string;
  ticket?: any; // Adicionado: Recebe o ticket completo para acesso a dados como telefone
  onUpdateFreight: (val: number) => void;
  onUpdateDiscount: (val: number) => void;
  onRemoveItem: (id: string) => void;
  onUpdateQty: (id: string, delta: number) => void;
  onClearCart?: () => void; // Adicionado
}

type CartStep = 'cart' | 'delivery-selection' | 'address' | 'payment' | 'processing' | 'success';
type DeliveryMethod = 'pickup' | 'delivery' | null;
type PaymentMethod = 'pix' | 'credit_card' | 'debit_card' | 'cash' | null;

export function CartPanel({
  onClose,
  items,
  freight,
  discount,
  ticketId,
  customerName,
  ticket, // Adicionado
  onUpdateFreight,
  onUpdateDiscount,
  onRemoveItem,
  onUpdateQty,
  onClearCart // Adicionado
}: CartPanelProps) {
  const [step, setStep] = React.useState<CartStep>('cart');
  const [deliveryMethod, setDeliveryMethod] = React.useState<DeliveryMethod>(null);
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>(null);
  const [cashChange, setCashChange] = React.useState('');
  const [generatedOrderId, setGeneratedOrderId] = React.useState<string>('');
  const [freightInput, setFreightInput] = React.useState(freight > 0 ? freight.toString() : '');
  const [discountInput, setDiscountInput] = React.useState(discount > 0 ? discount.toString() : '');

  // Estados para fallback de telefone
  const [missingPhoneMode, setMissingPhoneMode] = React.useState(false);
  const [manualPhone, setManualPhone] = React.useState('');
  const [localTicket, setLocalTicket] = React.useState<any>(null); // Ticket buscado diretamente da API

  // Buscar ticket atualizado ao abrir
  React.useEffect(() => {
    if (ticketId) {
      console.log(`🔄 CartPanel: Buscando detalhes do ticket ${ticketId}...`);
      attendanceService.getTicket(ticketId)
        .then(t => {
          console.log('✅ CartPanel: Ticket carregado:', t);
          setLocalTicket(t);
        })
        .catch(err => console.error('❌ Erro ao buscar ticket no CartPanel:', err));
    }
  }, [ticketId]);

  React.useEffect(() => {
    setFreightInput(freight > 0 ? freight.toString() : '');
    setDiscountInput(discount > 0 ? discount.toString() : '');
  }, [freight, discount]);

  const handleFreightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFreightInput(val);
    const num = parseFloat(val.replace(',', '.'));
    onUpdateFreight(isNaN(num) ? 0 : num);
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDiscountInput(val);
    const num = parseFloat(val.replace(',', '.'));
    onUpdateDiscount(isNaN(num) ? 0 : num);
  };

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const total = Math.max(0, subtotal + freight - discount);

  const customerAddress = {
    cep: '74000-000',
    street: 'Av. Paulista',
    number: '1000',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    uf: 'SP',
    complement: 'Apto 101'
  };

  const handleStartSale = () => {
    if (items.length === 0) return alert('Adicione itens ao carrinho primeiro.');
    setStep('delivery-selection');
  };

  const handleSelectDeliveryMethod = (method: DeliveryMethod) => {
    setDeliveryMethod(method);
    if (method === 'delivery') {
      setStep('address');
    } else {
      setStep('payment');
    }
  };

  const handleConfirmAddress = () => {
    setStep('payment');
  };

  const handleConfirmPayment = async () => {
    if (!paymentMethod) return alert('Selecione uma forma de pagamento.');

    const orderPayload: any = {
      items,
      totals: { subtotal, freight, discount, total },
      delivery: {
        method: deliveryMethod || 'pickup',
        address: deliveryMethod === 'delivery' ? customerAddress : null
      },
      payment: {
        method: paymentMethod,
        changeFor: paymentMethod === 'cash' ? parseFloat(cashChange) : undefined
      },
      customerName: customerName || 'Cliente Visitante',
      ticketId: ticketId || undefined, // Vínculo com o Ticket
      createdAt: new Date().toISOString()
    };

    setStep('processing');

    try {
      const result = await OrderService.createOrder(orderPayload);
      if (result.success) {
        setGeneratedOrderId(result.orderId);
        setStep('success');
      }
    } catch (error) {
      alert('Erro ao processar venda. Tente novamente.');
      setStep('payment');
    }
  };

  // Implementação correta do handleSendSummary
  const handleSendSummary = async () => {
    if (items.length === 0) return alert('Carrinho vazio!');

    // Usar ticket local atualizado ou o da prop
    const targetTicket = localTicket || ticket;
    console.log('📦 DEBUG CartPanel - Ticket alvo:', targetTicket);

    // Tentar todas as possibilidades de telefone
    let phoneNumber = targetTicket?.phone || targetTicket?.contact_phone || targetTicket?.contactPhone || targetTicket?.contact?.phone;

    // Se não achou e temos o nome do contato que parece um número (caso do ID longo)
    if (!phoneNumber && targetTicket?.name && /^\d+$/.test(targetTicket.name)) {
      phoneNumber = targetTicket.name;
    }

    // Se o ticket tem whatsapp_id (alguns backends enviam)
    if (!phoneNumber && targetTicket?.whatsapp_id) {
      phoneNumber = targetTicket.whatsapp_id.split('@')[0];
    }

    console.log('📱 DEBUG CartPanel - Telefone identificado:', phoneNumber);

    // Fallback final: Perguntar ao usuário via UI (não prompt)
    if (!phoneNumber) {
      if (!missingPhoneMode) {
        console.warn('Telefone do contato não identificado, ativando entrada manual.');
        setMissingPhoneMode(true);
        // Tentar sugerir algo se houver
        setManualPhone(targetTicket?.name || targetTicket?.contact_name || '');
        return; // Para a execução e espera o usuário confirmar no input
      } else {
        // Estamos no modo manual, usar o valor do estado
        if (!manualPhone) return alert('Por favor, digite o número do telefone.');
        phoneNumber = manualPhone.replace(/\D/g, '');
      }
    }

    if (!phoneNumber) {
      return alert('Operação cancelada: Nenhum telefone válido fornecido.');
    }

    const summary = items.map(i => `${i.qty}x ${i.name} - R$ ${i.price.toFixed(2)}`).join('\n');
    const messageText = `*Resumo do Pedido:*\n\n${summary}\n\nSubtotal: R$ ${subtotal.toFixed(2)}\nFrete: R$ ${freight.toFixed(2)}\nDesconto: - R$ ${discount.toFixed(2)}\n*Total: R$ ${total.toFixed(2)}*`;

    try {
      await attendanceService.sendQuickMessage({
        phoneNumber: phoneNumber,
        messageType: 'buttons',
        content: {
          text: messageText,
          footer: 'Confirme seu pedido abaixo',
          buttons: [
            { id: 'confirm_order', text: '✅ Fechar Pedido', type: 'reply' }
          ]
        }
      });
      alert('Resumo com botão enviado para o cliente!');
    } catch (error) {
      console.error('Erro ao enviar resumo:', error);
      alert('Erro ao enviar resumo. Verifique o console.');
    }
  };

  const renderContent = () => {
    switch (step) {
      case 'cart':
        return (
          <>
            <div className="mb-6">
              <h3 className="flex items-center gap-2 font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">
                Itens no Carrinho ({items.length})
              </h3>

              {items.length === 0 ? (
                <div className="text-center py-8 text-gray-400 bg-white rounded-lg border border-dashed border-gray-200">
                  <ShoppingBag size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Seu carrinho está vazio.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3">
                      {item.images && item.images.length > 0 ? (
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="w-14 h-14 rounded-md object-cover bg-gray-100"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-md bg-gray-100 flex items-center justify-center text-gray-400">
                          <ShoppingBag size={20} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 text-sm truncate">{item.name}</h4>
                        <p className="text-gray-500 text-xs">R$ {item.price.toFixed(2).replace('.', ',')}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium bg-gray-50 rounded px-2 py-1 border border-gray-100">
                          <button onClick={() => onUpdateQty(item.id, -1)} className="text-gray-400 hover:text-emerald-600 w-4">-</button>
                          <span>{item.qty}</span>
                          <button onClick={() => onUpdateQty(item.id, 1)} className="text-gray-400 hover:text-emerald-600 w-4">+</button>
                        </div>
                        <button onClick={() => onRemoveItem(item.id)} className="text-red-300 hover:text-red-500 p-1">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4 mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Frete (R$)</label>
                <input
                  type="text" placeholder="0,00" value={freightInput} onChange={handleFreightChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Desconto (R$)</label>
                <input
                  type="text" placeholder="0,00" value={discountInput} onChange={handleDiscountChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
            </div>
          </>
        );

      case 'delivery-selection':
        return (
          <div className="flex flex-col gap-4 mt-4 animate-in fade-in duration-300">
            <h3 className="text-lg font-bold text-gray-800 text-center mb-2">Como o cliente vai receber?</h3>
            <button onClick={() => handleSelectDeliveryMethod('pickup')} className="group flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all shadow-sm">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-emerald-100 group-hover:text-emerald-600">
                <Store size={24} />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-gray-800">Retirar no Local</h4>
                <p className="text-sm text-gray-500">Cliente busca na loja</p>
              </div>
            </button>
            <button onClick={() => handleSelectDeliveryMethod('delivery')} className="group flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all shadow-sm">
              <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center group-hover:bg-emerald-100 group-hover:text-emerald-600">
                <Truck size={24} />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-gray-800">Para Entregar</h4>
                <p className="text-sm text-gray-500">Motoboy ou Transportadora</p>
              </div>
            </button>
          </div>
        );

      case 'address':
        return (
          <div className="mt-4 space-y-4 animate-in fade-in duration-300">
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg flex gap-2 text-yellow-800 text-sm">
              <MapPin size={16} className="shrink-0 mt-0.5" />
              <p>Endereço vinculado ao cadastro do cliente.</p>
            </div>
            <div className="space-y-3 opacity-75 pointer-events-none">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CEP</label>
                  <input type="text" defaultValue={customerAddress.cep} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cidade/UF</label>
                  <input type="text" defaultValue={`${customerAddress.city}/${customerAddress.uf}`} className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-sm" readOnly />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Rua</label>
                <input type="text" defaultValue={customerAddress.street} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="mt-4 space-y-4 animate-in fade-in duration-300">
            <div className="text-center mb-6">
              <p className="text-sm text-gray-500">Valor Total a Pagar</p>
              <h2 className="text-3xl font-bold text-emerald-600">R$ {total.toFixed(2).replace('.', ',')}</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setPaymentMethod('pix')} className={cn("p-4 rounded-xl border flex flex-col items-center gap-2 transition-all", paymentMethod === 'pix' ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-white border-gray-200 hover:bg-gray-50 text-gray-600")}>
                <QrCode size={24} /> <span className="text-sm font-bold">PIX</span>
              </button>
              <button onClick={() => setPaymentMethod('credit_card')} className={cn("p-4 rounded-xl border flex flex-col items-center gap-2 transition-all", paymentMethod === 'credit_card' ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-white border-gray-200 hover:bg-gray-50 text-gray-600")}>
                <CreditCard size={24} /> <span className="text-sm font-bold">Cartão</span>
              </button>
              <button onClick={() => setPaymentMethod('cash')} className={cn("p-4 rounded-xl border flex flex-col items-center gap-2 transition-all", paymentMethod === 'cash' ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-white border-gray-200 hover:bg-gray-50 text-gray-600")}>
                <Banknote size={24} /> <span className="text-sm font-bold">Dinheiro</span>
              </button>
              <button onClick={() => setPaymentMethod('debit_card')} className={cn("p-4 rounded-xl border flex flex-col items-center gap-2 transition-all", paymentMethod === 'debit_card' ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-white border-gray-200 hover:bg-gray-50 text-gray-600")}>
                <Wallet size={24} /> <span className="text-sm font-bold">Débito</span>
              </button>
            </div>

            {/* Lógica de Troco */}
            {paymentMethod === 'cash' && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mt-4 animate-in fade-in">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Precisa de troco para quanto?</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                  <input
                    type="number"
                    placeholder="0,00"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={cashChange}
                    onChange={(e) => setCashChange(e.target.value)}
                  />
                </div>
                {cashChange && parseFloat(cashChange) > total && (
                  <p className="text-sm font-bold text-emerald-600 mt-2 text-right">
                    Troco: R$ {(parseFloat(cashChange) - total).toFixed(2)}
                  </p>
                )}
              </div>
            )}
          </div>
        );

      case 'processing':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 animate-in fade-in">
            <Loader2 size={48} className="text-emerald-600 animate-spin mb-4" />
            <h3 className="text-lg font-bold text-gray-800">Processando Venda...</h3>
            <p className="text-sm text-gray-500 mt-2">Atualizando estoque e financeiro.</p>
          </div>
        );

      case 'success':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 animate-bounce">
              <CheckCircle size={48} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Venda Realizada!</h3>
            <p className="text-gray-500 mb-1">Pedido {generatedOrderId}</p>
            <p className="text-xs text-gray-400 mb-8">Estoque atualizado e lançamento financeiro criado.</p>
            <button onClick={() => {
              if (onClearCart) onClearCart();
              onClose();
            }} className="bg-gray-800 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors">
              Fechar Carrinho
            </button>
          </div>
        );
    }
  };

  const renderFooter = () => {
    if (step === 'success' || step === 'processing') return null;

    if (step === 'cart') {
      return (
        <div className="bg-white p-4 border-t border-gray-200 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          {missingPhoneMode ? (
            <div className="mb-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm text-yellow-800 mb-2">
                <p className="font-bold flex items-center gap-2">⚠️ Telefone não identificado</p>
                <p>O sistema não encontrou o número deste contato. Por favor, confirme abaixo para enviar:</p>
              </div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefone (Whatsapp)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                  placeholder="5511999999999"
                  className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSendSummary}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 transition-colors"
                >
                  Enviar
                </button>
                <button
                  onClick={() => setMissingPhoneMode(false)}
                  className="bg-gray-200 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-gray-400">Subtotal:</span>
                <span className="text-sm font-medium text-gray-600">R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-gray-700">Total a pagar:</span>
                <span className="text-2xl font-bold text-emerald-600">R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>

              <div className="space-y-2">
                <button onClick={handleSendSummary} disabled={items.length === 0} className="w-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                  <Send size={18} /> Enviar resumo
                </button>
                <button onClick={handleStartSale} disabled={items.length === 0} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50">
                  <CreditCard size={18} /> Finalizar venda
                </button>
              </div>
            </>
          )}
        </div>
      );
    }

    const handleBack = () => {
      if (step === 'delivery-selection') setStep('cart');
      if (step === 'address') setStep('delivery-selection');
      if (step === 'payment') {
        setStep(deliveryMethod === 'delivery' ? 'address' : 'delivery-selection');
      }
    };

    return (
      <div className="bg-white p-4 border-t border-gray-200 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex gap-2">
          <button onClick={handleBack} className="px-4 py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
            <ArrowLeft size={20} />
          </button>

          {step === 'delivery-selection' ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Selecione uma opção acima</div>
          ) : step === 'address' ? (
            <button onClick={handleConfirmAddress} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-colors shadow-sm">
              Confirmar Endereço
            </button>
          ) : (
            <button onClick={handleConfirmPayment} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2">
              <CheckCircle size={18} /> Confirmar Pagamento
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-[380px] h-full bg-gray-50 border-l border-gray-200 flex flex-col shadow-2xl z-20 absolute right-0 top-0 bottom-0 animate-in slide-in-from-right duration-300">
      <div className="h-[60px] bg-emerald-600 px-4 flex items-center justify-between text-white shrink-0 shadow-md z-10">
        <div className="flex items-center gap-3 font-bold text-lg">
          {step === 'cart' ? <Store size={22} /> : (
            <span className="bg-white/20 p-1 rounded-full"><CreditCard size={16} /></span>
          )}
          <span>
            {step === 'cart' && 'Carrinho'}
            {step === 'delivery-selection' && 'Entrega'}
            {step === 'address' && 'Endereço'}
            {step === 'payment' && 'Pagamento'}
            {step === 'processing' && 'Processando'}
            {step === 'success' && 'Concluído'}
          </span>
        </div>
        <button onClick={onClose} className="hover:bg-emerald-700 p-1.5 rounded-lg transition-colors">
          <ChevronDown size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 relative">
        {renderContent()}
      </div>

      {renderFooter()}
    </div>
  );
}
