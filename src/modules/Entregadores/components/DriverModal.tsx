import React from 'react';

// Custom icon components
const XIcon = ({ size = 18 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d: 'm18 6-12 12' }), React.createElement('path', { d: 'm6 6 12 12' }));
const CheckIcon = ({ size = 18 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d: 'm9 12 2 2 4-4' }));
const BikeIcon = ({ size = 18, className }: { size?: number; className?: string }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className }, React.createElement('circle', { cx: '18.5', cy: '17.5', r: '3.5' }), React.createElement('circle', { cx: '5.5', cy: '17.5', r: '3.5' }), React.createElement('circle', { cx: '15', cy: '5', r: '1' }), React.createElement('path', { d: 'm14 17 1-9 4-4-2 3h-2l-1 3 3 4Z' }), React.createElement('path', { d: 'M6 17h6l-1-3-2-2-2-1Z' }));
const UserIcon = ({ size = 18, className }: { size?: number; className?: string }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className }, React.createElement('path', { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }), React.createElement('circle', { cx: '12', cy: '7', r: '4' }));

interface DriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
}

export function DriverModal({ isOpen, onClose, onConfirm }: DriverModalProps) {
  const [formData, setFormData] = React.useState({
    name: '',
    phone: '',
    vehicle: 'moto',
    plate: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({ ...formData, status: 'available' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="font-bold flex items-center gap-2">
            <BikeIcon size={18} className="text-emerald-400" /> Novo Entregador
          </h2>
          <button onClick={onClose} className="hover:bg-white/10 p-1.5 rounded-full transition">
            <XIcon size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome Completo</label>
            <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" required
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Ex: João da Silva"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, name: e.target.value})}
                />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefone / WhatsApp</label>
            <input 
                type="text" required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="(11) 99999-9999"
                value={formData.phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Veículo</label>
                <select 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                    value={formData.vehicle}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, vehicle: e.target.value})}
                >
                    <option value="moto">Moto</option>
                    <option value="car">Carro</option>
                    <option value="bike">Bicicleta</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Placa (Opcional)</label>
                <input 
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="ABC-1234"
                    value={formData.plate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, plate: e.target.value})}
                />
              </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-600 font-medium hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 flex items-center justify-center gap-2">
              <CheckIcon size={18} /> Cadastrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
