import { OrderService } from './OrderService';
import { ProductService } from './ProductService';
import { faker } from '@faker-js/faker';

export interface FinancialSummary {
  revenue: number; // Faturamento
  cost: number;    // Custo (CMV)
  profit: number;  // Lucro
  margin: number;  // Margem %
  ticket: number;  // Ticket Médio
  orderCount: number;
  balance: number; // Saldo em caixa (considerando entradas/saídas manuais)
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  description: string;
  isManual?: boolean; // Flag para identificar lançamentos manuais
}

class FinanceServiceClass {
  private manualTransactions: Transaction[] = [];

  constructor() {
    const stored = localStorage.getItem('chatvendas_manual_transactions');
    if (stored) {
      this.manualTransactions = JSON.parse(stored);
    } else {
        // Inicializar com array vazio - dados reais serão adicionados
        this.manualTransactions = [];
        this.save();
    }
  }

  private save() {
    localStorage.setItem('chatvendas_manual_transactions', JSON.stringify(this.manualTransactions));
    window.dispatchEvent(new Event('finance-update')); // Notifica a UI
  }

  addTransaction(data: Omit<Transaction, 'id' | 'isManual'>) {
      const newTransaction: Transaction = {
          ...data,
          id: faker.string.uuid(),
          isManual: true
      };
      this.manualTransactions.unshift(newTransaction);
      this.save();
  }

  getSummary(period: 'today' | 'week' | 'month' | 'all'): FinancialSummary {
    const orders = OrderService.getAll().filter(o => o.status !== 'cancelled' && o.status !== 'pending');
    
    // 1. Receita de Vendas
    let revenue = 0;
    let cost = 0;

    orders.forEach(order => {
      revenue += order.totals.total;
      order.items.forEach(item => {
        const product = ProductService.getAll().find(p => p.id === item.id);
        const itemCost = product ? product.cost : (item.price * 0.5); 
        cost += itemCost * item.qty;
      });
    });

    // 2. Transações Manuais
    let manualIncome = 0;
    let manualExpense = 0;

    this.manualTransactions.forEach(t => {
        if (t.type === 'income') manualIncome += t.amount;
        else manualExpense += t.amount;
    });

    // 3. Consolidação
    const totalRevenue = revenue + manualIncome;
    const totalCost = cost + manualExpense;
    const profit = totalRevenue - totalCost;
    const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
    const ticket = orders.length > 0 ? revenue / orders.length : 0;

    return {
      revenue: totalRevenue,
      cost: totalCost,
      profit,
      margin,
      ticket,
      orderCount: orders.length,
      balance: profit // Simplificação: Saldo = Lucro neste contexto
    };
  }

  getRecentTransactions(): Transaction[] {
    const orders = OrderService.getAll().slice(0, 20); // Pega últimos 20 pedidos
    
    // Transforma pedidos em transações
    const orderTransactions: Transaction[] = orders.map(o => ({
      id: o.id,
      type: 'income',
      category: 'Venda',
      amount: o.totals.total,
      date: o.createdAt,
      description: `Pedido ${o.id} - ${o.customerName}`,
      isManual: false
    }));

    // Junta com manuais e ordena
    return [...orderTransactions, ...this.manualTransactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
}

export const FinanceService = new FinanceServiceClass();
