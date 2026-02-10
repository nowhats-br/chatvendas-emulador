import { Product, Category } from '../types/global';
import { faker } from '@faker-js/faker';

class ProductServiceClass {
  private products: Product[] = [];

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData() {
    const stored = localStorage.getItem('chatvendas_products');
    if (stored) {
      this.products = JSON.parse(stored);
    } else {
      // Inicializar com array vazio - produtos serão adicionados pelo usuário
      this.products = [];
      this.save();
    }
  }

  private save() {
    localStorage.setItem('chatvendas_products', JSON.stringify(this.products));
    window.dispatchEvent(new Event('product-update'));
  }

  getAll(): Product[] {
    return [...this.products];
  }

  // Gera categorias dinamicamente baseado nos produtos cadastrados
  getCategories(): Category[] {
    const categoryMap = new Map<string, number>();
    
    this.products.forEach(p => {
        const count = categoryMap.get(p.category) || 0;
        categoryMap.set(p.category, count + 1);
    });

    return Array.from(categoryMap.entries()).map(([name, count]) => ({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        count
    }));
  }

  create(product: Omit<Product, 'id'>): Product {
    const newProduct: Product = {
      ...product,
      id: faker.string.uuid(),
    };
    this.products.push(newProduct);
    this.save();
    return newProduct;
  }

  update(id: string, data: Partial<Product>): Product | null {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    this.products[index] = { ...this.products[index], ...data };
    this.save();
    return this.products[index];
  }

  delete(id: string): boolean {
    const initialLen = this.products.length;
    this.products = this.products.filter(p => p.id !== id);
    this.save();
    return this.products.length !== initialLen;
  }

  decrementStock(id: string, quantity: number): boolean {
    const product = this.products.find(p => p.id === id);
    if (!product) return false;
    
    product.stock -= quantity;
    this.update(id, { stock: product.stock });
    return true;
  }
}

export const ProductService = new ProductServiceClass();
