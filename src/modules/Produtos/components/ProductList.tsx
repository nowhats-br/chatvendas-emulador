import React from 'react';
import { Product } from '../../../types/global';

// Custom Icons
const EditIcon = () => React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, 
  React.createElement('path', { d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }),
  React.createElement('path', { d: 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' })
);

const Trash2Icon = () => React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, 
  React.createElement('path', { d: 'M3 6h18' }),
  React.createElement('path', { d: 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' }),
  React.createElement('path', { d: 'M8 6V4c0-1 1-2 2-2h4c-1 0 2 1 2 2v2' }),
  React.createElement('line', { x1: 10, x2: 10, y1: 11, y2: 17 }),
  React.createElement('line', { x1: 14, x2: 14, y1: 11, y2: 17 })
);

const AlertTriangleIcon = ({ size = 12 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, 
  React.createElement('path', { d: 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z' }),
  React.createElement('path', { d: 'M12 9v4' }),
  React.createElement('path', { d: 'M12 17h.01' })
);

const PackageIcon = ({ size = 16 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, 
  React.createElement('path', { d: 'm7.5 4.27 9 5.15' }),
  React.createElement('path', { d: 'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z' }),
  React.createElement('path', { d: 'M3.3 7l8.7 5 8.7-5' }),
  React.createElement('path', { d: 'M12 22V12' })
);

const EyeIcon = () => React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, 
  React.createElement('path', { d: 'M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z' }),
  React.createElement('circle', { cx: 12, cy: 12, r: 3 })
);

const TrendingUpIcon = () => React.createElement('svg', { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, 
  React.createElement('polyline', { points: '22,7 13.5,15.5 8.5,10.5 2,17' }),
  React.createElement('polyline', { points: '16,7 22,7 22,13' })
);

const TrendingDownIcon = () => React.createElement('svg', { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, 
  React.createElement('polyline', { points: '22,17 13.5,8.5 8.5,13.5 2,7' }),
  React.createElement('polyline', { points: '16,17 22,17 22,11' })
);

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export function ProductList({ products, onEdit, onDelete }: ProductListProps) {
  // Função para calcular margem de lucro
  const calculateMargin = (product: Product) => {
    if (!product.price || !product.cost) return 0;
    return ((product.price - product.cost) / product.price) * 100;
  };

  // Função para formatar moeda brasileira
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  // Função para determinar status do estoque
  const getStockStatus = (product: Product) => {
    if (product.stock === 0) return 'out';
    if (product.stock <= product.minStock) return 'low';
    return 'good';
  };

  // Função para obter cor do status
  const getStockColor = (status: string) => {
    switch (status) {
      case 'out': return 'bg-red-100 text-red-700 border-red-200';
      case 'low': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  // Função para obter texto do status
  const getStockText = (product: Product) => {
    const status = getStockStatus(product);
    switch (status) {
      case 'out': return 'Sem Estoque';
      case 'low': return 'Estoque Baixo';
      default: return 'Em Estoque';
    }
  };

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-white rounded-xl border border-gray-200 shadow-sm">
        <PackageIcon size={48} />
        <p className="mt-4 text-lg font-medium">Nenhum produto encontrado</p>
        <p className="text-sm text-gray-500">Os produtos aparecerão aqui quando adicionados</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header da Tabela */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <PackageIcon />
            Lista de Produtos ({products.length})
          </h3>
          <div className="text-sm text-gray-500">
            Total: {formatCurrency(products.reduce((acc, p) => acc + (p.price * p.stock), 0))}
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-xs uppercase border-b border-gray-200">
              <th className="p-4 font-bold">Produto</th>
              <th className="p-4 font-bold">Categoria</th>
              <th className="p-4 font-bold">Financeiro</th>
              <th className="p-4 font-bold text-center">Estoque</th>
              <th className="p-4 font-bold text-center">Status</th>
              <th className="p-4 font-bold text-center">Margem</th>
              <th className="p-4 font-bold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => {
              const margin = calculateMargin(product);
              const stockStatus = getStockStatus(product);
              
              return (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                  {/* Produto */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200 shadow-sm">
                        {product.images && product.images.length > 0 ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <PackageIcon />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-gray-800 text-sm truncate">{product.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <span className="font-mono">{product.sku || 'Sem SKU'}</span>
                          {product.variations && product.variations.length > 0 && (
                            <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-medium">
                              {product.variations.length} variações
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Categoria */}
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium capitalize border">
                      {product.category}
                    </span>
                  </td>

                  {/* Financeiro */}
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Custo:</span>
                        <span className="text-sm font-medium text-gray-600">
                          {formatCurrency(product.cost)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Venda:</span>
                        <span className="text-sm font-bold text-emerald-600">
                          {formatCurrency(product.price)}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Estoque */}
                  <td className="p-4 text-center">
                    <div className="space-y-1">
                      <div className="text-lg font-bold text-gray-800">
                        {product.stock}
                      </div>
                      <div className="text-xs text-gray-500">
                        Min: {product.minStock}
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="p-4 text-center">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStockColor(stockStatus)}`}>
                      {stockStatus === 'out' && <AlertTriangleIcon />}
                      {stockStatus === 'low' && <AlertTriangleIcon />}
                      {stockStatus === 'good' && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                      {getStockText(product)}
                    </div>
                  </td>

                  {/* Margem */}
                  <td className="p-4 text-center">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                      margin > 30 ? 'bg-green-100 text-green-700' : 
                      margin > 15 ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {margin > 15 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                      {margin.toFixed(1)}%
                    </div>
                  </td>

                  {/* Ações */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onEdit(product)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar produto"
                      >
                        <EditIcon />
                      </button>
                      <button 
                        onClick={() => {
                          if(confirm(`Tem certeza que deseja excluir "${product.name}"?\n\nEsta ação não pode ser desfeita.`)) {
                            onDelete(product.id);
                          }
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir produto"
                      >
                        <Trash2Icon />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer com Resumo */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <span className="text-gray-600">
              <strong>{products.length}</strong> produtos listados
            </span>
            <span className="text-gray-600">
              <strong>{products.reduce((acc, p) => acc + p.stock, 0)}</strong> unidades em estoque
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Em Estoque</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Estoque Baixo</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Sem Estoque</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
