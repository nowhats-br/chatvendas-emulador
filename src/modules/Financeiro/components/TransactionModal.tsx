import React from 'react';
import { cn } from '../../../lib/utils';

// Custom icon components
const XIcon = ({ size = 18 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d: 'm18 6-12 12' }), React.createElement('path', { d: 'm6 6 12 12' }));
const CheckIcon = ({ size = 18 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d: 'm9 12 2 2 4-4' }));
const DollarSignIcon = ({ size = 18, className }: { size?: number; className?: string }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className }, React.createElement('line', { x1: '12', y1: '1', x2: '12', y2: '23' }), React.createElement('path', { d: 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' }));
const ArrowUpCircleIcon = ({ size = 20 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('circle', { cx: '12', cy: '12', r: '10' }), React.createElement('path', { d: 'm16 12-4-4-4 4' }), React.createElement('path', { d: 'M12 16V8' }));
const ArrowDownCircleIcon = ({ size = 20 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('circle', { cx: '12', cy: '12', r: '10' }), React.createElement('path', { d: 'M8 12l4 4 4-4' }), React.createElement('path', { d: 'M12 8v8' }));

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
}

export function TransactionModal({ isOpen, onClose, onConfirm }: TransactionModalProps) {
  const [type, setType] = React.useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category) return;

    onConfirm({
        type,
        amount: parseFloat(amount.replace(',', '.')),
        category,
        description,
        date: new Date(date).toISOString()
    });
    
    // Reset
    setAmount('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="font-bold flex items-center gap-2">
            <DollarSignIcon size={18} className="text-emerald-400" /> Nova Transação
          </h2>
          <button onClick={onClose} className="hover:bg-white/10 p-1.5 rounded-full transition">
            <XIcon size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Tipo de Transação */}
          <div className="flex gap-3 mb-4">
              <button
                type="button"
                onClick={() => setType('income')}
                className={cn(
                    "flex-1 py-3 rounded-lg border font-bold flex items-center justify-center gap-2 transition-all",
                    type === 'income' 
                        ? "bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500" 
                        : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                )}
              >
                  <ArrowUpCircleIcon size={20} /> Entrada
              </button>
              <button
                type="button"
                onClick={() => setType('expense')}
                className={cn(
                    "flex-1 py-3 rounded-lg border font-bold flex items-center justify-center gap-2 transition-all",
                    type === 'expense' 
                        ? "bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500" 
                        : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                )}
              >
                  <ArrowDownCircleIcon size={20} /> Saída
              </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Valor (R$)</label>
            <input 
                type="number" step="0.01" required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-lg font-bold text-gray-800"
                placeholder="0,00"
                value={amount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoria</label>
            <select 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                value={category}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value)}
                required
            >
                <option value="">Selecione...</option>
                {type === 'income' ? (
                    <>
                        <option value="Aporte">Aporte de Capital</option>
                        <option value="Venda Balcão">Venda Balcão (Sem registro)</option>
                        <option value="Outros">Outras Entradas</option>
                    </>
                ) : (
                    <>
                        <option value="Marketing">Marketing / Anúncios</option>
                        <option value="Logística">Logística / Frete</option>
                        <option value="Fornecedores">Fornecedores</option>
                        <option value="Operacional">Custos Operacionais (Luz/Água)</option>
                        <option value="Pessoal">Pagamento de Pessoal</option>
                    </>
                )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descrição</label>
            <input 
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Detalhes da transação..."
                value={description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data</label>
            <input 
                type="date"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                value={date}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-600 font-medium hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 flex items-center justify-center gap-2">
              <CheckIcon size={18} /> Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
