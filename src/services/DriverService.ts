import { faker } from '@faker-js/faker';
import { OrderService } from './OrderService';

export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle: 'moto' | 'car' | 'bike';
  plate?: string;
  status: 'available' | 'busy' | 'offline';
  avatar: string;
  totalDeliveries: number;
  balance: number; // Valor a receber
  rating: number;
}

class DriverServiceClass {
  private drivers: Driver[] = [];

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData() {
    const stored = localStorage.getItem('chatvendas_drivers');
    if (stored) {
      this.drivers = JSON.parse(stored);
    } else {
      // Inicializar com array vazio - dados reais serão adicionados
      this.drivers = [];
      this.save();
    }
  }

  private save() {
    localStorage.setItem('chatvendas_drivers', JSON.stringify(this.drivers));
    window.dispatchEvent(new Event('driver-update'));
  }

  getAll(): Driver[] {
    return [...this.drivers];
  }

  create(data: Omit<Driver, 'id' | 'totalDeliveries' | 'balance' | 'rating'>) {
    const newDriver: Driver = {
      ...data,
      id: faker.string.uuid(),
      totalDeliveries: 0,
      balance: 0,
      rating: 5.0,
      avatar: '' // Avatar será gerado no frontend com iniciais
    };
    this.drivers.push(newDriver);
    this.save();
  }

  update(id: string, data: Partial<Driver>) {
    const index = this.drivers.findIndex(d => d.id === id);
    if (index !== -1) {
      this.drivers[index] = { ...this.drivers[index], ...data };
      this.save();
    }
  }

  delete(id: string) {
    this.drivers = this.drivers.filter(d => d.id !== id);
    this.save();
  }

  // Paga o entregador (Zera o saldo)
  payDriver(id: string) {
    const index = this.drivers.findIndex(d => d.id === id);
    if (index !== -1) {
      this.drivers[index].balance = 0;
      this.save();
    }
  }

  // Busca histórico de entregas do OrderService
  getDeliveryHistory(driverId: string) {
    const allOrders = OrderService.getAll();
    return allOrders.filter(o => o.driverId === driverId);
  }
}

export const DriverService = new DriverServiceClass();
