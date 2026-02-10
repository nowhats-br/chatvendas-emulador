import React from 'react';
import { Product, ProductVariation } from '../../../types/global';
import { ProductService } from '../../../services/ProductService';
import { cn } from '../../../lib/utils';

// Custom Icons
const XIcon = () => React.createElement('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, 
  React.createElement('path', { d: 'M18 6 6 18' }),
  React.createElement('path', { d: 'm6 6 12 12' })
);

const SaveIcon = () => React.createElement('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, 
  React.createElement('path', { d: 'M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z' }),
  React.createElement('path', { d: 'M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7' }),
  React.createElement('path', { d: 'M7 3v4a1 1 0 0 0 1 1h8' })
);

const ImageIcon = ({ size = 18 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, 
  React.createElement('rect', { width: 18, height: 18, x: 3, y: 3, rx: 2, ry: 2 }),
  React.createElement('circle', { cx: 9, cy: 9, r: 2 }),
  React.createElement('path', { d: 'm21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21' })
);

const DollarSignIcon = () => React.createElement('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, 
  React.createElement('line', { x1: 12, x2: 12, y1: 2, y2: 22 }),
  React.createElement('path', { d: 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' })
);

const PackageIcon = () => React.createElement('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, 
  React.createElement('path', { d: 'm7.5 4.27 9 5.15' }),
  React.createElement('path', { d: 'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z' }),
  React.createElement('path', { d: 'M3.3 7l8.7 5 8.7-5' }),
  React.createElement('path', { d: 'M12 22V12' })
);

const TagIcon = () => React.createElement('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, 
  React.createElement('path', { d: 'M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z' }),
  React.createElement('circle', { cx: 7.5, cy: 7.5, r: 0.5, fill: 'currentColor' })
);

const SmartphoneIcon = () => React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, 
  React.createElement('rect', { width: 14, height: 20, x: 5, y: 2, rx: 2, ry: 2 }),
  React.createElement('path', { d: 'M12 18h.01' })
);

const PlusIcon = () => React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, 
  React.createElement('path', { d: 'M5 12h14' }),
  React.createElement('path', { d: 'm12 5 0 14' })
);

const Trash2Icon = ({ size = 14 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, 
  React.createElement('path', { d: 'M3 6h18' }),
  React.createElement('path', { d: 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' }),
  React.createElement('path', { d: 'M8 6V4c0-1 1-2 2-2h4c-1 0 2 1 2 2v2' }),
  React.createElement('line', { x1: 10, x2: 10, y1: 11, y2: 17 }),
  React.createElement('line', { x1: 14, x2: 14, y1: 11, y2: 17 })
);

const UploadCloudIcon = () => React.createElement('svg', { width: 40, height: 40, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, 
  React.createElement('path', { d: 'M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242' }),
  React.createElement('path', { d: 'M12 12v9' }),
  React.createElement('path', { d: 'm16 16-4-4-4 4' })
);

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  onSave: () => void;
}

// Utilitário para formatar moeda BRL
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(value);
};

const parseCurrency = (value: string) => {
    return Number(value.replace(/\./g, '').replace(',', '.'));
};

export function ProductForm({ isOpen, onClose, productToEdit, onSave }: ProductFormProps) {
  // Estado do Formulário
  const [formData, setFormData] = React.useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 5,
    images: [],
    category: '',
    sku: '',
    variations: [],
    status: 'active'
  });

  // Estados locais para inputs controlados
  const [priceInput, setPriceInput] = React.useState('');
  const [costInput, setCostInput] = React.useState('');
  
  // Estado para nova variação
  const [newVar, setNewVar] = React.useState({ color: '', size: '', stock: '' });

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
        if (productToEdit) {
            setFormData(productToEdit);
            setPriceInput(formatCurrency(productToEdit.price));
            setCostInput(formatCurrency(productToEdit.cost));
        } else {
            // Reset
            setFormData({
                name: '', description: '', price: 0, cost: 0, stock: 0, minStock: 5,
                images: [], category: '', sku: '', variations: [], status: 'active'
            });
            setPriceInput('');
            setCostInput('');
            setNewVar({ color: '', size: '', stock: '' });
        }
    }
  }, [productToEdit, isOpen]);

  // Atualiza estoque total baseado nas variações
  React.useEffect(() => {
      if (formData.variations && formData.variations.length > 0) {
          const totalStock = formData.variations.reduce((acc: number, curr: ProductVariation) => acc + curr.stock, 0);
          setFormData((prev: Partial<Product>) => ({ ...prev, stock: totalStock }));
      }
  }, [formData.variations]);

  if (!isOpen) return null;

  // --- Handlers de Moeda ---
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'price' | 'cost') => {
      let value = e.target.value.replace(/\D/g, '');
      const numberValue = Number(value) / 100;
      
      if (field === 'price') {
          setPriceInput(formatCurrency(numberValue));
          setFormData((prev: Partial<Product>) => ({ ...prev, price: numberValue }));
      } else {
          setCostInput(formatCurrency(numberValue));
          setFormData((prev: Partial<Product>) => ({ ...prev, cost: numberValue }));
      }
  };

  // --- Handlers de Imagem ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) {
          const remainingSlots = 10 - (formData.images?.length || 0);
          const filesToProcess = Array.from(files).slice(0, remainingSlots);

          for (const file of filesToProcess) {
              if (file instanceof File) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                      setFormData((prev: Partial<Product>) => ({
                          ...prev,
                          images: [...(prev.images || []), reader.result as string]
                      }));
                  };
                  reader.readAsDataURL(file);
              }
          }
      }
  };

  const removeImage = (index: number) => {
      setFormData((prev: Partial<Product>) => ({
          ...prev,
          images: prev.images?.filter((_: string, i: number) => i !== index)
      }));
  };

  // --- Handlers de Variação ---
  const addVariation = () => {
      if (!newVar.color || !newVar.stock) return alert('Preencha cor e quantidade');
      
      const variation: ProductVariation = {
          id: Date.now().toString(),
          color: newVar.color,
          size: newVar.size || 'Único',
          stock: parseInt(newVar.stock) || 0 // Fix: Fallback para 0 se inválido
      };

      setFormData((prev: Partial<Product>) => ({
          ...prev,
          variations: [...(prev.variations || []), variation]
      }));
      setNewVar({ color: '', size: '', stock: '' });
  };

  const removeVariation = (id: string) => {
      setFormData((prev: Partial<Product>) => ({
          ...prev,
          variations: prev.variations?.filter((v: ProductVariation) => v.id !== id)
      }));
  };

  // --- Submit ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (productToEdit) {
      ProductService.update(productToEdit.id, formData);
    } else {
      ProductService.create(formData as Omit<Product, 'id'>);
    }
    onSave();
    onClose();
  };

  const calculateMargin = () => {
    if (!formData.price || !formData.cost) return 0;
    return ((formData.price - formData.cost) / formData.price) * 100;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shrink-0">
          <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <PackageIcon />
                {productToEdit ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <p className="text-xs text-gray-400 mt-1">Configure os dados para o carrossel do WhatsApp</p>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition">
            <XIcon />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <form id="product-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Coluna Esquerda: Dados Principais (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Card Dados Básicos */}
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                  <TagIcon /> Dados Gerais
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome do Produto</label>
                    <input 
                      type="text" required
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="Ex: Tênis Esportivo Runner"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">SKU (Código)</label>
                    <input 
                      type="text"
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="COD-001"
                      value={formData.sku}
                      onChange={e => setFormData({...formData, sku: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoria</label>
                    <input 
                      type="text" required
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="Ex: Calçados"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descrição (WhatsApp)</label>
                    <textarea 
                      rows={3}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                      placeholder="Esta descrição aparecerá no carrossel do WhatsApp..."
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Card Variações e Estoque */}
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                  <PackageIcon /> Variações e Estoque
                </h3>
                
                {/* Adicionar Variação */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4">
                    <div className="grid grid-cols-4 gap-2 items-end">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Cor</label>
                            <input type="text" placeholder="Ex: Azul" className="w-full p-2 border rounded text-sm" 
                                value={newVar.color} onChange={e => setNewVar({...newVar, color: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Tamanho</label>
                            <input type="text" placeholder="Ex: 42" className="w-full p-2 border rounded text-sm"
                                value={newVar.size} onChange={e => setNewVar({...newVar, size: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Qtd</label>
                            <input type="number" placeholder="0" className="w-full p-2 border rounded text-sm"
                                value={newVar.stock} onChange={e => setNewVar({...newVar, stock: e.target.value})} />
                        </div>
                        <button type="button" onClick={addVariation} className="bg-emerald-600 text-white p-2 rounded hover:bg-emerald-700 font-medium text-sm h-[38px]">
                            Adicionar
                        </button>
                    </div>
                </div>

                {/* Lista de Variações */}
                <div className="mb-4">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                            <tr>
                                <th className="px-3 py-2">Cor</th>
                                <th className="px-3 py-2">Tamanho</th>
                                <th className="px-3 py-2">Estoque</th>
                                <th className="px-3 py-2 text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {formData.variations?.length === 0 && (
                                <tr><td colSpan={4} className="text-center py-3 text-gray-400">Nenhuma variação adicionada.</td></tr>
                            )}
                            {formData.variations?.map((v: ProductVariation) => (
                                <tr key={v.id}>
                                    <td className="px-3 py-2">{v.color}</td>
                                    <td className="px-3 py-2">{v.size}</td>
                                    <td className="px-3 py-2 font-bold">{v.stock}</td>
                                    <td className="px-3 py-2 text-right">
                                        <button type="button" onClick={() => removeVariation(v.id)} className="text-red-500 hover:text-red-700">
                                            <Trash2Icon />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex gap-4 border-t pt-4">
                     <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Estoque Total</label>
                        <input 
                            type="number" readOnly
                            className="w-full p-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 font-bold"
                            value={formData.stock || 0} // Fix: Fallback para 0
                        />
                     </div>
                     <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Estoque Mínimo (Alerta)</label>
                        <input 
                            type="number"
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={formData.minStock || 0} // Fix: Fallback para 0
                            onChange={e => setFormData({...formData, minStock: parseInt(e.target.value) || 0})} // Fix: Parse seguro
                        />
                     </div>
                </div>
              </div>

              {/* Card Financeiro */}
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                  <DollarSignIcon /> Financeiro
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Custo</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                        <input 
                        type="text"
                        className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={costInput}
                        onChange={e => handlePriceChange(e, 'cost')}
                        placeholder="0,00"
                        />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Preço de Venda</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 font-bold">R$</span>
                        <input 
                        type="text"
                        className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-emerald-700"
                        value={priceInput}
                        onChange={e => handlePriceChange(e, 'price')}
                        placeholder="0,00"
                        />
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${calculateMargin() > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      Margem de Lucro: {calculateMargin().toFixed(1)}%
                    </span>
                </div>
              </div>

            </div>

            {/* Coluna Direita: Imagens (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Upload Imagem */}
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm h-full flex flex-col">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                  <ImageIcon /> Imagens do Carrossel
                </h3>
                
                <div className="flex-1 flex flex-col">
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-emerald-50 hover:border-emerald-400 transition-all cursor-pointer mb-4"
                    >
                        <UploadCloudIcon />
                        <span className="font-bold text-gray-700">Clique para enviar imagens</span>
                        <span className="text-xs mt-1">Suporta até 10 imagens (Cards)</span>
                    </div>
                    <input 
                        type="file" multiple accept="image/*" 
                        ref={fileInputRef} className="hidden" 
                        onChange={handleImageUpload}
                    />

                    {/* Grid de Imagens */}
                    <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-[300px]">
                        {formData.images?.map((img: string, idx: number) => (
                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                                <img src={img} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button type="button" onClick={() => removeImage(idx)} className="bg-red-500 text-white p-1.5 rounded-full">
                                        <Trash2Icon size={16} />
                                    </button>
                                </div>
                                <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 rounded">
                                    Card {idx + 1}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Preview WhatsApp */}
                <div className="mt-6 bg-[#e5ddd5] p-4 rounded-lg border border-gray-300 shadow-inner">
                    <h3 className="font-bold text-gray-600 mb-3 flex items-center gap-2 text-xs uppercase">
                    <SmartphoneIcon /> Preview Carrossel
                    </h3>
                    
                    {/* Simulação de Scroll Horizontal */}
                    <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                        {(formData.images && formData.images.length > 0 ? formData.images : ['']).map((img: string, idx: number) => (
                            <div key={idx} className="bg-white rounded-lg shadow-sm min-w-[180px] w-[180px] overflow-hidden snap-start shrink-0">
                                <div className="h-24 bg-gray-200 flex items-center justify-center">
                                    {img ? (
                                    <img src={img} className="w-full h-full object-cover" />
                                    ) : (
                                    <ImageIcon />
                                    )}
                                </div>
                                <div className="p-2">
                                    <h4 className="font-bold text-gray-800 text-xs truncate">{formData.name || 'Produto'}</h4>
                                    <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">
                                    {formData.description || 'Descrição...'}
                                    </p>
                                    <div className="mt-1 text-xs font-bold text-gray-800">R$ {formData.price?.toFixed(2)}</div>
                                </div>
                                <div className="border-t border-gray-100 p-1.5 text-center text-emerald-600 text-xs font-medium">
                                    Ver Opções
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
              </div>

            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="bg-white border-t border-gray-200 p-4 flex justify-end gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            form="product-form"
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition flex items-center gap-2 shadow-sm"
          >
            <SaveIcon />
            Salvar Produto
          </button>
        </div>

      </div>
    </div>
  );
}
