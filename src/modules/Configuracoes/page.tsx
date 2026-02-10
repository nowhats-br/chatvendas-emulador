import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { cn } from '../../lib/utils';

import EtiquetasPage from './components/EtiquetasPage';
import AISettings from '../Settings/AISettings';

// Custom icon components
const SettingsIcon = ({ size = 18 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z' }), React.createElement('circle', { cx: '12', cy: '12', r: '3' }));
const ShieldIcon = ({ size = 18 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z' }));
const GlobeIcon = ({ size = 18 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('circle', { cx: '12', cy: '12', r: '10' }), React.createElement('line', { x1: '2', y1: '12', x2: '22', y2: '12' }), React.createElement('path', { d: 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' }));
const DatabaseIcon = ({ size = 18 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('ellipse', { cx: '12', cy: '5', rx: '9', ry: '3' }), React.createElement('path', { d: 'M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5' }), React.createElement('path', { d: 'M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3' }));
const SaveIcon = ({ size = 20 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z' }), React.createElement('polyline', { points: '17,21 17,13 7,13 7,21' }), React.createElement('polyline', { points: '7,3 7,8 15,8' }));
const SmartphoneIcon = ({ size = 18 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('rect', { x: '5', y: '2', width: '14', height: '20', rx: '2', ry: '2' }), React.createElement('line', { x1: '12', y1: '18', x2: '12.01', y2: '18' }));
const MapPinIcon = ({ size = 18 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z' }), React.createElement('circle', { cx: '12', cy: '10', r: '3' }));
const RefreshCwIcon = ({ size = 20, className }: { size?: number; className?: string }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className }, React.createElement('path', { d: 'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8' }), React.createElement('path', { d: 'M21 3v5h-5' }), React.createElement('path', { d: 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16' }), React.createElement('path', { d: 'M8 16H3v5' }));
const CoffeeIcon = ({ size = 20 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d: 'M18 8h1a4 4 0 0 1 0 8h-1' }), React.createElement('path', { d: 'M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z' }), React.createElement('line', { x1: '6', y1: '1', x2: '6', y2: '4' }), React.createElement('line', { x1: '10', y1: '1', x2: '10', y2: '4' }), React.createElement('line', { x1: '14', y1: '1', x2: '14', y2: '4' }));
const TagIcon = ({ size = 18 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' }));
const BrainIcon = ({ size = 18 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d: 'M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z' }), React.createElement('path', { d: 'M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z' }), React.createElement('path', { d: 'M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4' }), React.createElement('path', { d: 'M17.599 6.5a3 3 0 0 0 .399-1.375' }), React.createElement('path', { d: 'M6.003 5.125A3 3 0 0 0 6.401 6.5' }), React.createElement('path', { d: 'M3.477 10.896a4 4 0 0 1 .585-.396' }), React.createElement('path', { d: 'M19.938 10.5a4 4 0 0 1 .585.396' }), React.createElement('path', { d: 'M6 18a4 4 0 0 1-1.967-.516' }), React.createElement('path', { d: 'M19.967 17.484A4 4 0 0 1 18 18' }));

type Tab = 'general' | 'sending' | 'integrations' | 'security' | 'data' | 'tags' | 'ai';

export default function ConfiguracoesPage() {
    const [searchParams] = useSearchParams();
    const tabFromUrl = searchParams.get('tab') as Tab;
    const [activeTab, setActiveTab] = React.useState<Tab>(tabFromUrl || 'tags');
    const [isLoading, setIsLoading] = React.useState(false);
    const [latitude, setLatitude] = React.useState('-23.550520');
    const [longitude, setLongitude] = React.useState('-46.633308');

    // Atualizar aba quando a URL mudar
    React.useEffect(() => {
        if (tabFromUrl && tabFromUrl !== activeTab) {
            setActiveTab(tabFromUrl);
        }
    }, [tabFromUrl, activeTab]);

    React.useEffect(() => {
        const savedLat = localStorage.getItem('chatvendas_lat');
        const savedLng = localStorage.getItem('chatvendas_lng');
        if (savedLat) setLatitude(savedLat);
        if (savedLng) setLongitude(savedLng);
    }, []);

    const handleSave = () => {
        setIsLoading(true);
        localStorage.setItem('chatvendas_lat', latitude);
        localStorage.setItem('chatvendas_lng', longitude);
        setTimeout(() => {
            setIsLoading(false);
            alert('Configurações salvas com sucesso!');
        }, 1000);
    };

    const tabs = [
        { id: 'general', label: 'Geral', icon: SettingsIcon },
        { id: 'tags', label: 'Etiquetas', icon: TagIcon },
        { id: 'ai', label: 'Inteligência Artificial', icon: BrainIcon },
        { id: 'sending', label: 'Envio & Campanhas', icon: SmartphoneIcon },
        { id: 'integrations', label: 'Integrações', icon: GlobeIcon },
        { id: 'security', label: 'Segurança', icon: ShieldIcon },
        { id: 'data', label: 'Dados & Backup', icon: DatabaseIcon },
    ];

    return (
        <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
            {/* Header */}
            <div className="p-8 pb-4 shrink-0">
                <h1 className="text-2xl font-bold text-gray-800">Configurações</h1>
                <p className="text-gray-500 mt-1">Personalize o sistema e gerencie integrações.</p>
            </div>

            <div className="flex-1 overflow-hidden px-8 pb-8 flex gap-6">

                {/* Sidebar Tabs */}
                <div className="w-64 flex flex-col gap-2 shrink-0">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as Tab)}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left",
                                activeTab === tab.id
                                    ? "bg-white text-emerald-600 shadow-sm ring-1 ring-gray-200"
                                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                            )}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-y-auto p-8">

                    {activeTab === 'general' && (
                        <div className="space-y-6 animate-in fade-in">
                            <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Configurações Gerais</h2>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Nome do Sistema</label>
                                    <input type="text" defaultValue="ChatVendas" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Idioma</label>
                                    <select className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                                        <option>Português (Brasil)</option>
                                        <option>English</option>
                                        <option>Español</option>
                                    </select>
                                </div>
                            </div>

                            <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100 mt-6">
                                <h3 className="font-bold text-emerald-800 mb-4 flex items-center gap-2">
                                    <MapPinIcon size={20} /> Localização do Sistema (Padrão)
                                </h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-emerald-700 uppercase mb-1">Latitude</label>
                                        <input
                                            type="text"
                                            value={latitude}
                                            onChange={(e) => setLatitude(e.target.value)}
                                            className="w-full p-2.5 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                            placeholder="-23.550520"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-emerald-700 uppercase mb-1">Longitude</label>
                                        <input
                                            type="text"
                                            value={longitude}
                                            onChange={(e) => setLongitude(e.target.value)}
                                            className="w-full p-2.5 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                            placeholder="-46.633308"
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-emerald-600 mt-2">Esta localização será usada como base para cálculos de frete e envio de localização padrão para clientes.</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'sending' && (
                        <div className="space-y-6 animate-in fade-in">
                            <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Padrões de Envio</h2>
                            <p className="text-sm text-gray-500 mb-4">Defina os valores padrão para novas campanhas.</p>

                            <div className="grid grid-cols-2 gap-6">
                                {/* Configurações de delay movidas para a criação de campanhas individualmente */}
                                <div className="col-span-2 text-sm text-gray-500 bg-blue-50 p-4 rounded-lg">
                                    As configurações de intervalo (delay) e troca de contas agora são definidas individualmente no momento de criar cada campanha para maior flexibilidade.
                                </div>
                            </div>

                            {/* Nova Seção: Pausa de Segurança */}
                            <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 mt-6">
                                <h3 className="font-bold text-orange-800 mb-4 flex items-center gap-2">
                                    <CoffeeIcon size={20} /> Pausa de Segurança (Anti-Bloqueio)
                                </h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-orange-700 uppercase mb-1">Pausar após X mensagens</label>
                                        <input type="number" defaultValue={100} className="w-full p-2.5 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-orange-700 uppercase mb-1">Tempo de Pausa (Minutos)</label>
                                        <input type="number" defaultValue={5} className="w-full p-2.5 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                                    </div>
                                </div>
                                <p className="text-xs text-orange-600 mt-2">O sistema irá parar os envios automaticamente por este período para simular comportamento humano.</p>
                            </div>
                        </div>
                    )}

                    {/* ... Outras abas mantidas (integrations, security, data) ... */}
                    {activeTab === 'integrations' && <div className="text-gray-500">Conteúdo de Integrações...</div>}
                    {activeTab === 'security' && <div className="text-gray-500">Conteúdo de Segurança...</div>}
                    {activeTab === 'data' && <div className="text-gray-500">Conteúdo de Dados...</div>}
                    {activeTab === 'tags' && <EtiquetasPage />}
                    {activeTab === 'ai' && (
                        <div className="animate-in fade-in -m-8">
                            <AISettings />
                        </div>
                    )}

                    {/* Footer Actions */}
                    {activeTab !== 'ai' && (
                        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-700 transition flex items-center gap-2 shadow-sm disabled:opacity-70"
                            >
                                {isLoading ? <RefreshCwIcon size={20} className="animate-spin" /> : <SaveIcon size={20} />}
                                Salvar Alterações
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
