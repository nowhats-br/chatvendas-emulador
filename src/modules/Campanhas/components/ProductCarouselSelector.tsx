import React from 'react';
import { ProductService } from '../../../services/ProductService';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
}

interface ProductCarouselSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (products: Product[]) => void;
  selectedProducts: string[];
}

export function ProductCarouselSelector({ 
  isOpen, 
  onClose, 
  onSelect, 
  selectedProducts 
}: ProductCarouselSelectorProps) {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [tempSelected, setTempSelected] = React.useState<string[]>(selectedProducts);

  React.useEffect(() => {
    if (isOpen) {
      const allProducts = ProductService.getAll();
      setProducts(allProducts);
      setTempSelected(selectedProducts);
    }
  }, [isOpen, selectedProducts]);

  const categories = React.useMemo(() => {
    const cats = ProductService.getCategories();
    return [{ id: 'all', name: 'Todas as Categorias', count: products.length }, ...cats];
  }, [products]);

  const filteredProducts = React.useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory && product.stock > 0;
    });
  }, [products, searchTerm, selectedCategory]);

  const handleToggleProduct = (productId: string) => {
    setTempSelected(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleConfirm = () => {
    const selectedProductsData = products.filter(p => tempSelected.includes(p.id));
    onSelect(selectedProductsData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99998,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: '900px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          color: 'white',
          padding: '20px 30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
              🛍️ Selecionar Produtos
            </h2>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
              Escolha os produtos para o carrossel ({tempSelected.length} selecionados)
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {/* Filters */}
        <div style={{ padding: '20px 30px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="🔍 Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                minWidth: '200px'
              }}
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>
                  {cat.name} ({cat.count})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '20px 30px',
          maxHeight: 'calc(90vh - 200px)'
        }}>
          {filteredProducts.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Nenhum produto encontrado</h3>
              <p style={{ margin: 0, fontSize: '14px' }}>
                {searchTerm ? 'Tente ajustar os filtros de busca' : 'Cadastre produtos para usar no carrossel'}
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px'
            }}>
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  onClick={() => handleToggleProduct(product.id)}
                  style={{
                    border: tempSelected.includes(product.id) ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    backgroundColor: tempSelected.includes(product.id) ? '#eff6ff' : 'white',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                >
                  {tempSelected.includes(product.id) && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      ✓
                    </div>
                  )}
                  
                  {product.images && product.images.length > 0 && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      style={{
                        width: '100%',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        marginBottom: '12px'
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  
                  <h4 style={{
                    margin: '0 0 8px 0',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    lineHeight: '1.3'
                  }}>
                    {product.name}
                  </h4>
                  
                  <p style={{
                    margin: '0 0 12px 0',
                    fontSize: '14px',
                    color: '#6b7280',
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {product.description}
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#059669'
                    }}>
                      R$ {product.price.toFixed(2)}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      backgroundColor: '#f3f4f6',
                      padding: '4px 8px',
                      borderRadius: '4px'
                    }}>
                      {product.category}
                    </span>
                  </div>
                  
                  <div style={{
                    marginTop: '8px',
                    fontSize: '12px',
                    color: product.stock > 10 ? '#059669' : product.stock > 0 ? '#f59e0b' : '#ef4444'
                  }}>
                    📦 {product.stock} em estoque
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px 30px',
          backgroundColor: '#f9fafb',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          gap: '12px'
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px 24px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={tempSelected.length === 0}
            style={{
              flex: 1,
              padding: '12px 24px',
              backgroundColor: tempSelected.length > 0 ? '#3b82f6' : '#9ca3af',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: tempSelected.length > 0 ? 'pointer' : 'not-allowed'
            }}
          >
            ✓ Confirmar ({tempSelected.length})
          </button>
        </div>
      </div>
    </div>
  );
}