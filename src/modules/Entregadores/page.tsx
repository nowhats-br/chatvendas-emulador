import React from 'react';
import { DriverService, Driver } from '../../services/DriverService';
import { DriverModal } from './components/DriverModal';
import { cn } from '../../lib/utils';

// Custom icon components
const PlusIcon = ({ size = 20 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d: 'M5 12h14' }), React.createElement('path', { d: 'M12 5v14' }));
const BikeIcon = ({ size = 48, className }: { size?: number; className?: string }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className }, React.createElement('circle', { cx: '18.5', cy: '17.5', r: '3.5' }), React.createElement('circle', { cx: '5.5', cy: '17.5', r: '3.5' }), React.createElement('circle', { cx: '15', cy: '5', r: '1' }), React.createElement('path', { d: 'm14 17 1-9 4-4-2 3h-2l-1 3 3 4Z' }), React.createElement('path', { d: 'M6 17h6l-1-3-2-2-2-1Z' }));
const CarIcon = ({ size = 12 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d: 'M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18.4 9.6a2 2 0 0 0-1.3-.6H16V8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8c0 .6.4 1 1 1h2' }), React.createElement('circle', { cx: '7', cy: '17', r: '2' }), React.createElement('path', { d: 'M9 17h6' }), React.createElement('circle', { cx: '17', cy: '17', r: '2' }));
const StarIcon = ({ size = 16, className }: { size?: number; className?: string }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className }, React.createElement('polygon', { points: '12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26' }));
const MapPinIcon = ({ size = 12 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z' }), React.createElement('circle', { cx: '12', cy: '10', r: '3' }));
const PackageIcon = ({ size = 16, className }: { size?: number; className?: string }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className }, React.createElement('path', { d: 'm7.5 4.27 9 5.15' }), React.createElement('path', { d: 'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z' }), React.createElement('path', { d: 'M3.3 7 12 12l8.7-5' }), React.createElement('path', { d: 'M12 22V12' }));

export default function EntregadoresPage() {
  const [drivers, setDrivers] = React.useState<Driver[]>([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const loadDrivers = () => {
    setDrivers(DriverService.getAll());
  };

  React.useEffect(() => {
    loadDrivers();
    window.addEventListener('driver-update', loadDrivers);
    return () => window.removeEventListener('driver-update', loadDrivers);
  }, []);

  const handleCreate = (data: any) => {
    DriverService.create(data);
  };

  const handlePay = (id: string) => {
      if(confirm('Confirmar pagamento do saldo para este entregador?')) {
          DriverService.payDriver(id);
      }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      <DriverModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleCreate}
      />

      {/* Header */}
      <div className="p-8 pb-4 shrink-0">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Entregadores</h1>
            <p className="text-gray-500 mt-1">Gerencie sua frota e pagamentos.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition shadow-sm font-medium"
          >
            <PlusIcon size={20} />
            Novo Entregador
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {drivers.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                <BikeIcon size={48} className="mb-4 opacity-50" />
                <p>Nenhum entregador cadastrado.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {drivers.map((driver: Driver) => (
                    <div key={driver.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <img src={driver.avatar} alt={driver.name} className="w-14 h-14 rounded-full object-cover border border-gray-100" />
                                    <div>
                                        <h3 className="font-bold text-gray-800">{driver.name}</h3>
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            {driver.vehicle === 'moto' ? <BikeIcon size={12} /> : <CarIcon size={12} />}
                                            <span className="capitalize">{driver.vehicle}</span>
                                            {driver.plate && <span>• {driver.plate}</span>}
                                        </div>
                                    </div>
                                </div>
                                <span className={cn(
                                    "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                                    driver.status === 'available' ? "bg-green-100 text-green-700" : 
                                    driver.status === 'busy' ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"
                                )}>
                                    {driver.status === 'available' ? 'Livre' : driver.status === 'busy' ? 'Em Rota' : 'Offline'}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-gray-50 p-3 rounded-lg text-center">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Entregas</p>
                                    <div className="flex items-center justify-center gap-1 font-bold text-gray-800">
                                        <PackageIcon size={16} className="text-blue-500" />
                                        {driver.totalDeliveries}
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg text-center">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Avaliação</p>
                                    <div className="flex items-center justify-center gap-1 font-bold text-gray-800">
                                        <StarIcon size={16} className="text-yellow-500 fill-yellow-500" />
                                        {driver.rating}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div>
                                    <p className="text-xs text-gray-400 mb-0.5">Saldo a Pagar</p>
                                    <p className="font-bold text-emerald-600 text-lg">R$ {driver.balance.toFixed(2)}</p>
                                </div>
                                <button 
                                    onClick={() => handlePay(driver.id)}
                                    disabled={driver.balance <= 0}
                                    className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-bold hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    Pagar
                                </button>
                            </div>
                        </div>
                        
                        {/* Footer Actions */}
                        <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                            <span className="flex items-center gap-1"><MapPinIcon size={12} /> Última: Centro</span>
                            <button className="text-blue-600 hover:underline">Ver Histórico</button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
