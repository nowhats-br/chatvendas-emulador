import React from 'react';
import { ProductList } from './components/ProductList';
import { ProductForm } from './components/ProductForm';
import { ProductService } from '../../services/ProductService';
import { Product, Category } from '../../types/global';

// Custom Icons
const PlusIcon = () => React.createElement('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, 
  React.createElement('path', { d: 'M5 12h14' }),
  React.createElement('path', { d: 'm12 5 0 14' })
);

const SearchIcon = () => React.createElement('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, 
  React.createElement('circle', { cx: 11, cy: 11, r: 8 }),
  React.createElement('path', { d: 'm21 21-4.35-4.35' })
);

const FilterIcon = () => React.createElement('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, 
  React.createElement('polygon', { points: '22,3 2,3 10,12.46 10,19 14,21 14,12.46' })
);

const RefreshIcon = ({ className }: { className?: string }) => React.createElement('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className }, 
  React.createElement('path', { d: 'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8' }),
  React.createElement('path', { d: 'M21 3v5h-5' }),
  React.createElement('path', { d: 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16' }),
  React.createElement('path', { d: 'M3 21v-5h5' })
);

const PackageIcon = () => React.createElement('svg', { width: 48, height: 48, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, 
  React.createElement('path', { d: 'm7.5 4.27 9 5.15' }),
  React.createElement('path', { d: 'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z' }),
  React.createElement('path', { d: 'M3.3 7l8.7 5 8.7-5' }),
  React.createElement('path', { d: 'M12 22V12' })
);

export default function ProdutosPage() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  // Filtros
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);

  // Estatísticas
  const [stats, setStats] = React.useState({
    total: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0
  });

  const loadData = () => {
    setIsLoading(true);
    // Simula delay de rede
    setTimeout(() => {
      const allProducts = ProductService.getAll();
      const allCategories = ProductService.getCategories();
      
      setProducts(allProducts);
      setCategories(allCategories);
      
      // Calcula estatísticas
      const totalValue = allProducts.reduce((acc, p) => acc + (p.price * p.stock), 0);
      const lowStock = allProducts.filter(p => p.stock <= p.minStock && p.stock > 0).length;
      const outOfStock = allProducts.filter(p => p.stock === 0).length;
      
      setStats({
        total: allProducts.length,
        lowStock,
        outOfStock,
        totalValue
      });
      
      setIsLoading(false);
    }, 300);
  };

  React.useEffect(() => {
    loadData();
    
    // Escuta atualizações globais (ex: venda realizada em outra aba)
    const handleUpdate = () => loadData();
    window.addEventListener('product-update', handleUpdate);
    return () => window.removeEventListener('product-update', handleUpdate);
  }, []);

  const handleCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    ProductService.delete(id);
    loadData();
  };

  // Filtragem
  const filteredProducts = products.filter((p: Product) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      <ProductForm 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productToEdit={editingProduct}
        onSave={loadData}
      />

      {/* Header */}
      <div className="p-8 pb-4 shrink-0">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Produtos</h1>
            <p className="text-gray-500 mt-1">Gerencie seu catálogo, estoque e preços.</p>
          </div>
          <button 
            onClick={handleCreate}
            className="bg-emerald-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition shadow-sm font-medium"
          >
            <PlusIcon />
            Novo Produto
          </button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total de Produtos</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <PackageIcon />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Estoque Baixo</p>
                <p className="text-2xl font-bold text-orange-600">{stats.lowStock}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 font-bold">!</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Sem Estoque</p>
                <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 font-bold">0</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Valor Total</p>
                <p className="text-2xl font-bold text-emerald-600">
                  R$ {stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <span className="text-emerald-600 font-bold">R$</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex gap-4 items-center bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </div>
            <input 
              type="text"
              placeholder="Buscar por nome ou SKU..."
              className="w-full pl-10 pr-4 py-2 bg-transparent outline-none text-gray-700"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="h-6 w-px bg-gray-200" />
          <div className="flex items-center gap-2 px-2">
            <FilterIcon />
            <select 
              className="bg-transparent outline-none text-sm text-gray-600 cursor-pointer"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              <option value="all">Todas Categorias</option>
              {categories.map((c: Category) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <button onClick={loadData} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-gray-50 rounded-lg transition">
            <RefreshIcon className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3 text-gray-500">
              <RefreshIcon className="animate-spin" />
              <span>Carregando produtos...</span>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <PackageIcon />
            <p className="mt-4 text-lg font-medium">Nenhum produto encontrado</p>
            <p className="text-sm">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Tente ajustar os filtros de busca' 
                : 'Comece adicionando seu primeiro produto'
              }
            </p>
            {(!searchTerm && selectedCategory === 'all') && (
              <button 
                onClick={handleCreate}
                className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition"
              >
                <PlusIcon />
                Adicionar Produto
              </button>
            )}
          </div>
        ) : (
          <ProductList 
            products={filteredProducts}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}
