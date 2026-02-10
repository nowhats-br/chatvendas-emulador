// Tipos Globais atualizados para suportar Carrossel e Variações
export interface ProductVariation {
  id: string;
  color: string;
  size: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number; // Estoque total (soma das variações ou geral)
  minStock: number;
  images: string[]; // Array de imagens para o Carrossel (Max 10)
  category: string; // Texto livre
  sku: string;
  variations: ProductVariation[];
  status: 'active' | 'inactive';
}

export interface Category {
  id: string;
  name: string;
  count: number;
}
