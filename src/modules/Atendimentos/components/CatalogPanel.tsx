import React from 'react';
import { Product } from '../../../types/global';
import { ProductService } from '../../../services/ProductService';

// Componentes de ícones usando React.createElement
const X = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M18 6 6 18' }),
    React.createElement('path', { d: 'm6 6 12 12' }));

const MessageSquare = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' }));

const ShoppingCart = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('circle', { cx: '8', cy: '21', r: '1' }),
    React.createElement('circle', { cx: '19', cy: '21', r: '1' }),
    React.createElement('path', { d: 'M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57L23 6H6' }));

const BookOpen = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z' }),
    React.createElement('path', { d: 'M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z' }));

const AlertTriangle = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z' }),
    React.createElement('path', { d: 'M12 9v4' }),
    React.createElement('path', { d: 'm12 17 .01 0' }));

interface CatalogPanelProps {
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onSendCatalog: (product: Product) => void;
}

export function CatalogPanel({ onClose, onAddToCart, onSendCatalog }: CatalogPanelProps) {
  const [products, setProducts] = React.useState<Product[]>([]);

  React.useEffect(() => {
    setProducts(ProductService.getAll());
    const handleUpdate = () => setProducts(ProductService.getAll());
    window.addEventListener('product-update', handleUpdate);
    return () => window.removeEventListener('product-update', handleUpdate);
  }, []);

  return (
    <div className="w-[380px] h-full bg-white border-r border-gray-200 flex flex-col shadow-2xl z-30 absolute left-0 top-0 bottom-0 animate-in slide-in-from-left duration-300">
      <div className="h-[60px] bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 flex items-center justify-between text-white shrink-0 shadow-md">
        <div className="flex items-center gap-2 font-bold text-lg">
          <BookOpen size={22} />
          Catálogo
        </div>
        <button onClick={onClose} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors">
          <X size={22} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="space-y-5">
          {products.map((product: Product) => (
            <div key={product.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">
              <div className="h-48 w-full bg-gray-100 relative overflow-hidden">
                {/* Exibe a primeira imagem */}
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200">
                    <BookOpen size={32} />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                <div className="absolute bottom-3 left-3 text-white">
                  <p className="font-bold text-lg shadow-black/50 drop-shadow-md">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </p>
                </div>

                <div className="absolute top-3 right-3 flex gap-1">
                  {product.stock <= 0 ? (
                    <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md">
                      ESGOTADO
                    </div>
                  ) : product.stock <= product.minStock ? (
                    <div className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
                      <AlertTriangle size={10} /> Poucas Unidades
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-gray-800 text-lg leading-tight">{product.name}</h3>
                  <span className="text-xs text-gray-400">Est: {product.stock}</span>
                </div>

                <p className="text-sm text-gray-500 mb-4 leading-relaxed line-clamp-2">
                  {product.description}
                </p>

                {/* Exibe variações resumidas se houver */}
                {product.variations && product.variations.length > 0 && (
                  <div className="flex gap-1 mb-3 flex-wrap">
                    {product.variations.slice(0, 3).map((v: any) => (
                      <span key={v.id} className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 border border-gray-200">
                        {v.color} - {v.size}
                      </span>
                    ))}
                    {product.variations.length > 3 && <span className="text-[10px] text-gray-400">...</span>}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => onSendCatalog(product)}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-colors"
                  >
                    <MessageSquare size={18} />
                    Enviar Catálogo
                  </button>
                  <button
                    onClick={() => onAddToCart(product)}
                    disabled={product.stock <= 0}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <ShoppingCart size={18} />
                    {product.stock <= 0 ? 'Indisponível' : 'Adicionar'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
