import { CartItem } from '../modules/Atendimentos/types';
import { ProductService } from './ProductService';

export type OrderStatus = 'pending' | 'paid' | 'preparing' | 'delivery' | 'delivered' | 'cancelled';

export interface OrderPayload {
  items: CartItem[];
  totals: {
    subtotal: number;
    freight: number;
    discount: number;
    total: number;
  };
  delivery: {
    method: 'pickup' | 'delivery';
    address?: any;
  };
  payment: {
    method: 'pix' | 'credit_card' | 'debit_card' | 'cash';
    changeFor?: number;
  };
  customerId?: string;
  customerName?: string; // Adicionado para facilitar visualização
  createdAt: string;
}

export interface Order extends OrderPayload {
  id: string;
  status: OrderStatus;
  driverId?: string;
  updatedAt: string;
}

// Simulação de Banco de Dados Persistente
class OrderServiceClass {
  private orders: Order[] = [];

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData() {
    const stored = localStorage.getItem('chatvendas_orders');
    if (stored) {
      this.orders = JSON.parse(stored);
    } else {
      // Mock inicial se vazio
      this.orders = []; 
    }
  }

  private save() {
    localStorage.setItem('chatvendas_orders', JSON.stringify(this.orders));
    window.dispatchEvent(new Event('order-update'));
  }

  // --- Métodos ---

  getAll(): Order[] {
    return [...this.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getById(id: string): Order | undefined {
    return this.orders.find(o => o.id === id);
  }

  async createOrder(payload: OrderPayload): Promise<{ success: boolean; orderId: string }> {
    console.log('[OrderService] Processando nova venda...');
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // 1. Baixa no Estoque
        payload.items.forEach(item => {
            ProductService.decrementStock(item.id.toString(), item.qty);
        });

        // 2. Criação do Pedido
        const newOrder: Order = {
            ...payload,
            id: `#${Math.floor(1000 + Math.random() * 9000)}`,
            status: payload.payment.method === 'pix' || payload.payment.method === 'cash' ? 'pending' : 'paid',
            updatedAt: new Date().toISOString(),
            customerName: payload.customerName || 'Cliente Visitante'
        };

        this.orders.unshift(newOrder);
        this.save();

        console.log('[Financeiro] Venda registrada:', newOrder.id);

        resolve({
          success: true,
          orderId: newOrder.id
        });
      }, 1000);
    });
  }

  updateStatus(id: string, status: OrderStatus): void {
      const order = this.orders.find(o => o.id === id);
      if (order) {
          order.status = status;
          order.updatedAt = new Date().toISOString();
          this.save();
      }
  }

  assignDriver(id: string, driverId: string): void {
      const order = this.orders.find(o => o.id === id);
      if (order) {
          order.driverId = driverId;
          order.status = 'delivery'; // Move automaticamente para entrega
          order.updatedAt = new Date().toISOString();
          this.save();
      }
  }
}

export const OrderService = new OrderServiceClass();
