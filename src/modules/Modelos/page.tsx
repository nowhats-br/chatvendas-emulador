import React from 'react';
import { MessageSquare } from 'lucide-react';
import { TemplateService, MessageTemplate } from '../../services/TemplateService';
import { ScheduleModal } from '../Atendimentos/components/ScheduleModal';
import { useToast } from '../../hooks/useToast';
import { useErrorHandler } from '../../hooks/useErrorHandler';

// Ícones customizados para evitar problemas de importação
const Plus = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('path', { d: 'M5 12h14' }),
  React.createElement('path', { d: 'M12 5v14' }));

const Trash2 = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('path', { d: 'M3 6h18' }),
  React.createElement('path', { d: 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' }),
  React.createElement('path', { d: 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2' }),
  React.createElement('line', { x1: '10', y1: '11', x2: '10', y2: '17' }),
  React.createElement('line', { x1: '14', y1: '11', x2: '14', y2: '17' }));

const MousePointer2 = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('path', { d: 'm4 4 7.07 17 2.51-7.39L21 11.07z' }));

const List = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('line', { x1: '8', y1: '6', x2: '21', y2: '6' }),
  React.createElement('line', { x1: '8', y1: '12', x2: '21', y2: '12' }),
  React.createElement('line', { x1: '8', y1: '18', x2: '21', y2: '18' }),
  React.createElement('line', { x1: '3', y1: '6', x2: '3.01', y2: '6' }),
  React.createElement('line', { x1: '3', y1: '12', x2: '3.01', y2: '12' }),
  React.createElement('line', { x1: '3', y1: '18', x2: '3.01', y2: '18' }));

const ImageIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('rect', { width: '18', height: '18', x: '3', y: '3', rx: '2', ry: '2' }),
  React.createElement('circle', { cx: '9', cy: '9', r: '2' }),
  React.createElement('path', { d: 'm21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21' }));

const Search = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('circle', { cx: '11', cy: '11', r: '8' }),
  React.createElement('path', { d: 'm21 21-4.35-4.35' }));

const FileText = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('path', { d: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z' }),
  React.createElement('path', { d: 'M14 2v4a2 2 0 0 0 2 2h4' }),
  React.createElement('path', { d: 'M10 9H8' }),
  React.createElement('path', { d: 'M16 13H8' }),
  React.createElement('path', { d: 'M16 17H8' }));

export default function ModelosPage() {
  const [templates, setTemplates] = React.useState<MessageTemplate[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [stats, setStats] = React.useState<any>({});

  const { showToast } = useToast();
  const { handleError } = useErrorHandler();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [templatesData, statsData] = await Promise.all([
        TemplateService.getAll(),
        Promise.resolve(TemplateService.getStats())
      ]);
      setTemplates(templatesData);
      setStats(statsData);
    } catch (error) {
      handleError(error, 'Erro ao carregar modelos');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
    
    window.addEventListener('template-update', loadData);
    return () => window.removeEventListener('template-update', loadData);
  }, []);

  const handleDelete = async (id: string) => {
    if(!confirm('Excluir este modelo?')) return;
    
    try {
      await TemplateService.delete(id);
      showToast('Modelo excluído com sucesso', 'success');
      loadData();
    } catch (error) {
      handleError(error, 'Erro ao excluir modelo');
    }
  };

  const handleCreate = async (data: any) => {
      const name = prompt('Dê um nome para este modelo:');
      if (!name) return;

      try {
        await TemplateService.create({
            name: name.trim(),
            type: data.type || 'text',
            content: data.content || { text: 'Novo modelo' },
            description: `Modelo ${data.type || 'texto'} criado em ${new Date().toLocaleDateString()}`
        });
        
        setIsModalOpen(false);
        showToast('Modelo criado com sucesso!', 'success');
        loadData();
      } catch (error) {
        handleError(error, 'Erro ao criar modelo');
      }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await TemplateService.duplicate(id);
      showToast('Modelo duplicado com sucesso!', 'success');
      loadData();
    } catch (error) {
      handleError(error, 'Erro ao duplicar modelo');
    }
  };

  const handleUse = async (template: MessageTemplate) => {
    try {
      await TemplateService.incrementUsage(template.id);
      showToast(`Modelo "${template.name}" selecionado para uso`, 'success');
      // Aqui você pode implementar a lógica para usar o template
      // Por exemplo, abrir o composer com o template pré-carregado
    } catch (error) {
      handleError(error, 'Erro ao usar modelo');
    }
  };

  const handleNewTemplate = () => {
    setIsModalOpen(true);
  };

  const getIcon = (type: string) => {
      switch(type) {
          case 'buttons': return <MousePointer2 size={20} className="text-blue-600" />;
          case 'list': return <List size={20} className="text-green-600" />;
          case 'media': 
          case 'carousel': return <ImageIcon size={20} className="text-purple-600" />;
          case 'text': return <FileText size={20} className="text-gray-600" />;
          default: return <MessageSquare size={20} className="text-emerald-600" />;
      }
  };

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'buttons': return 'Botões';
      case 'list': return 'Lista';
      case 'media': return 'Mídia';
      case 'carousel': return 'Carrossel';
      case 'text': return 'Texto';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'buttons': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'list': return 'bg-green-100 text-green-700 border-green-200';
      case 'media': 
      case 'carousel': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'text': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  const filtered = templates.filter((t: MessageTemplate) => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      <ScheduleModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleCreate}
      />

      <div className="p-8 pb-4 shrink-0">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FileText className="text-emerald-600" />
              Modelos de Mensagem
            </h1>
            <p className="text-gray-500 mt-1">Crie e gerencie templates para usar em campanhas e atendimentos.</p>
          </div>
          <button 
            onClick={handleNewTemplate} 
            className="bg-emerald-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-emerald-700 font-bold shadow-sm transition-colors"
          >
            <Plus size={20} /> Novo Modelo
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-bold">Total</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total || 0}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-bold">Texto</p>
            <p className="text-2xl font-bold text-gray-800">
              {stats.byType?.text || 0}
            </p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-bold">Botões</p>
            <p className="text-2xl font-bold text-gray-800">
              {stats.byType?.buttons || 0}
            </p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-bold">Mídia</p>
            <p className="text-2xl font-bold text-gray-800">
              {(stats.byType?.media || 0) + (stats.byType?.carousel || 0)}
            </p>
          </div>
        </div>

        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
                type="text" 
                placeholder="Buscar por nome ou tipo..." 
                className="w-full pl-10 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500">Carregando modelos...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
            <FileText size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">
              {searchTerm ? 'Nenhum modelo encontrado' : 'Nenhum modelo criado'}
            </p>
            <p className="text-sm mt-1">
              {searchTerm ? 'Tente buscar por outro termo' : 'Crie seu primeiro modelo de mensagem'}
            </p>
            {!searchTerm && (
              <button 
                onClick={handleNewTemplate}
                className="mt-4 text-emerald-600 font-bold hover:underline"
              >
                Criar primeiro modelo
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((t: MessageTemplate) => (
                  <div key={t.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group">
                      <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                              <div className="bg-gray-100 p-2 rounded-lg">
                                  {getIcon(t.type)}
                              </div>
                              <div>
                                  <h3 className="font-bold text-gray-800 truncate">{t.name}</h3>
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getTypeColor(t.type)}`}>
                                    {getTypeLabel(t.type)}
                                  </span>
                              </div>
                          </div>
                          <button 
                            onClick={() => handleDelete(t.id)} 
                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1 rounded hover:bg-red-50"
                            title="Excluir modelo"
                          >
                              <Trash2 size={18} />
                          </button>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600 h-20 overflow-hidden border border-gray-100 relative">
                          {t.type === 'text' ? (
                            <p className="line-clamp-3">{t.content.text || 'Conteúdo vazio'}</p>
                          ) : (
                            <pre className="whitespace-pre-wrap text-[10px] leading-tight">
                              {JSON.stringify(t.content, null, 1)}
                            </pre>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none"></div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                        <button 
                          onClick={() => handleUse(t)}
                          className="flex-1 py-2 text-xs font-medium text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 rounded transition-colors"
                        >
                          Usar
                        </button>
                        <button 
                          onClick={() => setIsModalOpen(true)}
                          className="flex-1 py-2 text-xs font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDuplicate(t.id)}
                          className="flex-1 py-2 text-xs font-medium text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded transition-colors"
                        >
                          Duplicar
                        </button>
                      </div>
                  </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
