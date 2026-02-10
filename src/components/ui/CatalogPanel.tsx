import React, { useState, useMemo } from 'react';
import { Search, ShoppingCart, X, FileText, Send } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    images?: string[];
    sku?: string;
    stock?: number;
}

interface CatalogPanelProps {
    isOpen: boolean;
    onClose: () => void;
    products: Product[];
    onAddProduct: (product: Product) => void;
    onSendCarousel: (product: Product) => void;
}

export default function CatalogPanel({
    isOpen,
    onClose,
    products = [],
    onAddProduct,
    onSendCarousel
}: CatalogPanelProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingAction, setLoadingAction] = useState<Record<string, 'cart' | 'carousel' | null>>({});

    const filteredProducts = useMemo(() => {
        if (!searchTerm.trim()) return products;
        const term = searchTerm.toLowerCase();
        return products.filter(p =>
            p.name.toLowerCase().includes(term) ||
            p.description?.toLowerCase().includes(term) ||
            p.sku?.toLowerCase().includes(term)
        );
    }, [products, searchTerm]);

    const handleAction = async (product: Product, action: 'cart' | 'carousel') => {
        setLoadingAction(prev => ({ ...prev, [product.id]: action }));
        try {
            if (action === 'cart') {
                await onAddProduct(product);
            } else {
                await onSendCarousel(product);
            }
        } catch (error) {
            console.error(`Error performing ${action}:`, error);
        } finally {
            setLoadingAction(prev => ({ ...prev, [product.id]: null }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="w-full h-full bg-white border-r border-gray-200 flex flex-col shadow-xl">
            {/* Header */}
            <div className="bg-blue-600 text-white p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                    <ShoppingCart size={20} />
                    <h2 className="font-semibold text-lg">Catálogo de Produtos</h2>
                </div>
                <button onClick={onClose} className="hover:bg-blue-700 p-1 rounded-full transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Search */}
            <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nome, descrição ou SKU..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="mt-2 text-xs text-gray-500 flex justify-end">
                    {filteredProducts.length} produtos encontrados
                </div>
            </div>

            {/* Product List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                        <Search size={48} className="mb-2 opacity-50" />
                        <p>Nenhum produto encontrado</p>
                    </div>
                ) : (
                    filteredProducts.map(product => (
                        <div key={product.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                            <div className="h-40 bg-gray-100 relative">
                                {product.images?.[0] ? (
                                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <FileText size={40} />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold shadow-sm">
                                    R$ {Number(product.price).toFixed(2)}
                                </div>
                            </div>

                            <div className="p-4">
                                <h3 className="font-semibold text-gray-800 mb-1">{product.name}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">{product.description || 'Sem descrição'}</p>

                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => handleAction(product, 'carousel')}
                                        disabled={!!loadingAction[product.id]}
                                        className="flex items-center justify-center gap-2 py-2 px-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium disabled:opacity-50"
                                    >
                                        {loadingAction[product.id] === 'carousel' ? (
                                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Send size={16} />
                                                Carrossel
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleAction(product, 'cart')}
                                        disabled={!!loadingAction[product.id]}
                                        className="flex items-center justify-center gap-2 py-2 px-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                                    >
                                        {loadingAction[product.id] === 'cart' ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <ShoppingCart size={16} />
                                                Adicionar
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}