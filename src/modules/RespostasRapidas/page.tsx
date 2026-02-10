import React from 'react';
import { QuickReplyModal } from './components/QuickReplyModal';
import { cn } from '../../lib/utils';

// Custom Icons
const SearchIcon = () => React.createElement('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, 
  React.createElement('circle', { cx: 11, cy: 11, r: 8 }),
  React.createElement('path', { d: 'm21 21-4.35-4.35' })
);

const PlusIcon = () => React.createElement('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, 
  React.createElement('path', { d: 'M5 12h14' }),
  React.createElement('path', { d: 'm12 5 0 14' })
);

const ZapIcon = ({ size = 12 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, 
  React.createElement('path', { d: 'M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14Z' })
);

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

const FileTextIcon = ({ size = 14 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, 
  React.createElement('path', { d: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z' }),
  React.createElement('path', { d: 'M14 2v4a2 2 0 0 0 2 2h4' }),
  React.createElement('path', { d: 'M10 9H8' }),
  React.createElement('path', { d: 'M16 13H8' }),
  React.createElement('path', { d: 'M16 17H8' })
);

const ImageIcon = ({ size = 12 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, 
  React.createElement('rect', { width: 18, height: 18, x: 3, y: 3, rx: 2, ry: 2 }),
  React.createElement('circle', { cx: 9, cy: 9, r: 2 }),
  React.createElement('path', { d: 'm21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21' })
);

const MousePointer2Icon = ({ size = 14 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, 
  React.createElement('path', { d: 'M9 9c.64-.64 1.521-.954 2.402-.954s1.762.29 2.402.954' }),
  React.createElement('path', { d: 'M21 12c0 1.2-.6 2.4-1.8 3.6a5 5 0 0 1-8.4 0C9.6 14.4 9 13.2 9 12s.6-2.4 1.8-3.6a5 5 0 0 1 8.4 0c1.2 1.2 1.8 2.4 1.8 3.6' }),
  React.createElement('path', { d: 'M12 2v10' })
);

const ListIcon = ({ size = 14 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, 
  React.createElement('line', { x1: 8, x2: 21, y1: 6, y2: 6 }),
  React.createElement('line', { x1: 8, x2: 21, y1: 12, y2: 12 }),
  React.createElement('line', { x1: 8, x2: 21, y1: 18, y2: 18 }),
  React.createElement('line', { x1: 3, x2: 3.01, y1: 6, y2: 6 }),
  React.createElement('line', { x1: 3, x2: 3.01, y1: 12, y2: 12 }),
  React.createElement('line', { x1: 3, x2: 3.01, y1: 18, y2: 18 })
);

const QrCodeIcon = ({ size = 14 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, 
  React.createElement('rect', { width: 5, height: 5, x: 3, y: 3, rx: 1 }),
  React.createElement('rect', { width: 5, height: 5, x: 16, y: 3, rx: 1 }),
  React.createElement('rect', { width: 5, height: 5, x: 3, y: 16, rx: 1 }),
  React.createElement('path', { d: 'M21 16h-3a2 2 0 0 0-2 2v3' }),
  React.createElement('path', { d: 'M21 21v.01' }),
  React.createElement('path', { d: 'M12 7v3a2 2 0 0 1-2 2H7' }),
  React.createElement('path', { d: 'M3 12h.01' }),
  React.createElement('path', { d: 'M12 3h.01' }),
  React.createElement('path', { d: 'M12 16v.01' }),
  React.createElement('path', { d: 'M16 12h1' }),
  React.createElement('path', { d: 'M21 12v.01' }),
  React.createElement('path', { d: 'M12 21v-1' })
);

const TrendingUpIcon = () => React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, 
  React.createElement('polyline', { points: '22,7 13.5,15.5 8.5,10.5 2,17' }),
  React.createElement('polyline', { points: '16,7 22,7 22,13' })
);

const ClockIcon = () => React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, 
  React.createElement('circle', { cx: 12, cy: 12, r: 10 }),
  React.createElement('polyline', { points: '12,6 12,12 16,14' })
);

const HashIcon = () => React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, 
  React.createElement('line', { x1: 4, x2: 20, y1: 9, y2: 9 }),
  React.createElement('line', { x1: 4, x2: 20, y1: 15, y2: 15 }),
  React.createElement('line', { x1: 10, x2: 8, y1: 3, y2: 21 }),
  React.createElement('line', { x1: 16, x2: 14, y1: 3, y2: 21 })
);

// Interfaces
interface QuickReply {
  id: string;
  shortcut: string;
  message: string;
  category: string;
  attachments?: string[];
  usageCount: number;
  type: 'text' | 'buttons' | 'list' | 'pix';
  content?: any;
}

interface ButtonContent {
  text: string;
}

interface PixContent {
  key: string;
  name: string;
  city: string;
  amount?: string;
}

export default function RespostasRapidasPage() {
  const [replies, setReplies] = React.useState<QuickReply[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('Todas');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingReply, setEditingReply] = React.useState<QuickReply | null>(null);

  // Estatísticas
  const [stats, setStats] = React.useState({
    total: 0,
    totalUsage: 0,
    mostUsed: '',
    categories: 0
  });

  // Load Initial Data
  React.useEffect(() => {
    const stored = localStorage.getItem('chatvendas_quick_replies');
    if (stored) {
      const loadedReplies = JSON.parse(stored);
      setReplies(loadedReplies);
      calculateStats(loadedReplies);
    } else {
      const initial: QuickReply[] = [
        { 
          id: '1', 
          shortcut: '/ola', 
          message: 'Olá {{nome}}! Tudo bem? Como posso ajudar você hoje?', 
          category: 'Saudação', 
          usageCount: 150, 
          type: 'text' 
        },
        { 
          id: '2', 
          shortcut: '/pix', 
          message: 'Segue nosso Pix para pagamento:', 
          category: 'Financeiro', 
          usageCount: 89, 
          type: 'pix', 
          content: { key: '12.345.678/0001-99', name: 'Loja Exemplo', city: 'São Paulo' } 
        },
        { 
          id: '3', 
          shortcut: '/menu', 
          message: 'Escolha uma opção:', 
          category: 'Vendas', 
          usageCount: 45, 
          type: 'buttons', 
          content: { buttons: [{text: 'Comprar'}, {text: 'Falar com Atendente'}] } 
        },
        { 
          id: '4', 
          shortcut: '/horario', 
          message: 'Nosso horário de funcionamento:', 
          category: 'Informações', 
          usageCount: 32, 
          type: 'text' 
        },
        { 
          id: '5', 
          shortcut: '/produtos', 
          message: 'Confira nossos produtos:', 
          category: 'Vendas', 
          usageCount: 67, 
          type: 'list', 
          content: { sections: [{ title: 'Categorias', rows: [{ title: 'Eletrônicos', description: 'Smartphones, tablets' }] }] } 
        }
      ];
      setReplies(initial);
      calculateStats(initial);
      localStorage.setItem('chatvendas_quick_replies', JSON.stringify(initial));
    }
  }, []);

  const calculateStats = (repliesList: QuickReply[]) => {
    const totalUsage = repliesList.reduce((acc, r) => acc + r.usageCount, 0);
    const mostUsed = repliesList.reduce((prev, current) => 
      prev.usageCount > current.usageCount ? prev : current
    );
    const categories = new Set(repliesList.map((r: QuickReply) => r.category)).size;

    setStats({
      total: repliesList.length,
      totalUsage,
      mostUsed: mostUsed?.shortcut || '',
      categories
    });
  };

  const saveToStorage = (newReplies: QuickReply[]) => {
      setReplies(newReplies);
      calculateStats(newReplies);
      localStorage.setItem('chatvendas_quick_replies', JSON.stringify(newReplies));
  };

  const handleSave = (data: any) => {
      if (editingReply) {
          const updated = replies.map((r: QuickReply) => r.id === editingReply.id ? { ...r, ...data } : r);
          saveToStorage(updated);
      } else {
          const newReply = { ...data, id: Date.now().toString(), usageCount: 0 };
          saveToStorage([...replies, newReply]);
      }
      setIsModalOpen(false);
      setEditingReply(null);
  };

  const handleDelete = (id: string) => {
      if (confirm('Tem certeza que deseja excluir esta resposta rápida?\n\nEsta ação não pode ser desfeita.')) {
          saveToStorage(replies.filter((r: QuickReply) => r.id !== id));
      }
  };

  const handleEdit = (reply: QuickReply) => {
      setEditingReply(reply);
      setIsModalOpen(true);
  };

  const filteredReplies = replies.filter((r: QuickReply) => {
      const matchesSearch = r.shortcut.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           r.message.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Todas' || r.category === selectedCategory;
      return matchesSearch && matchesCategory;
  });

  const uniqueCategories = replies.map((r: QuickReply) => r.category);
  const categorySet = new Set<string>(uniqueCategories);
  const categories: string[] = ['Todas', ...categorySet];

  const getTypeIcon = (type: string) => {
      switch(type) {
          case 'buttons': return <MousePointer2Icon />;
          case 'list': return <ListIcon />;
          case 'pix': return <QrCodeIcon />;
          default: return <FileTextIcon />;
      }
  };

  const getTypeLabel = (type: string) => {
      switch(type) {
          case 'buttons': return 'Botões';
          case 'list': return 'Lista';
          case 'pix': return 'PIX';
          default: return 'Texto';
      }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      <QuickReplyModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingReply(null); }}
        onSave={handleSave}
        replyToEdit={editingReply}
      />

      {/* Header */}
      <div className="p-8 pb-4 shrink-0">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Respostas Rápidas</h1>
            <p className="text-gray-500 mt-1">Gerencie sua biblioteca de mensagens prontas e atalhos.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition shadow-sm font-medium"
          >
            <PlusIcon />
            Nova Resposta
          </button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total de Respostas</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <HashIcon />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Usos Totais</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.totalUsage}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <TrendingUpIcon />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Mais Usada</p>
                <p className="text-lg font-bold text-yellow-600 font-mono">{stats.mostUsed || 'N/A'}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <ZapIcon size={16} />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Categorias</p>
                <p className="text-2xl font-bold text-purple-600">{stats.categories}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 font-bold text-sm">Cat</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
          <div className="relative flex-1 w-full">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </div>
            <input 
              type="text"
              placeholder="Buscar por atalho (/...) ou conteúdo..."
              className="w-full pl-10 pr-4 py-2 bg-transparent outline-none text-gray-700"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
             {categories.map((cat: string, index: number) => (
                 <button
                    key={`${cat}-${index}`}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap",
                        selectedCategory === cat 
                            ? "bg-gray-900 text-white shadow-sm" 
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                 >
                     {cat}
                 </button>
             ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {filteredReplies.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-white rounded-xl border border-gray-200 shadow-sm">
            <ZapIcon size={48} />
            <p className="mt-4 text-lg font-medium">Nenhuma resposta encontrada</p>
            <p className="text-sm text-gray-500">
              {searchTerm || selectedCategory !== 'Todas' 
                ? 'Tente ajustar os filtros de busca' 
                : 'Comece criando sua primeira resposta rápida'
              }
            </p>
            {(!searchTerm && selectedCategory === 'Todas') && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition"
              >
                <PlusIcon />
                Criar Primeira Resposta
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Header da Lista */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <ZapIcon size={20} />
                  Respostas Encontradas ({filteredReplies.length})
                </h3>
                <div className="text-sm text-gray-500">
                  Total de usos: {filteredReplies.reduce((acc: number, r: QuickReply) => acc + r.usageCount, 0)}
                </div>
              </div>
            </div>

            {/* Grid de Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReplies.map((reply: QuickReply) => (
                    <div key={reply.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group flex flex-col">
                        <div className="p-5 flex-1">
                            <div className="flex justify-between items-start mb-3">
                                <span className="bg-yellow-100 text-yellow-800 font-mono font-bold px-2.5 py-1.5 rounded-lg text-sm border border-yellow-200 flex items-center gap-1">
                                    <span className="text-yellow-600">/</span>
                                    {reply.shortcut.replace('/', '')}
                                </span>
                                <div className="flex gap-2">
                                    <span className={cn("text-[10px] uppercase font-bold px-2 py-1 rounded-full flex items-center gap-1", 
                                        reply.type === 'pix' ? "bg-green-100 text-green-700 border border-green-200" : 
                                        reply.type === 'buttons' ? "bg-blue-100 text-blue-700 border border-blue-200" :
                                        reply.type === 'list' ? "bg-purple-100 text-purple-700 border border-purple-200" :
                                        "bg-gray-100 text-gray-700 border border-gray-200"
                                    )}>
                                        {getTypeIcon(reply.type)} {getTypeLabel(reply.type)}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="mb-3">
                                <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full border">
                                    {reply.category}
                                </span>
                            </div>
                            
                            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                                {reply.message}
                            </p>

                            {/* Preview do Conteúdo */}
                            {reply.type === 'buttons' && reply.content?.buttons && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {reply.content.buttons.map((b: ButtonContent, i: number) => (
                                        <span key={i} className="text-[10px] bg-blue-50 border border-blue-200 px-2 py-1 rounded text-blue-700 font-medium">
                                            {b.text}
                                        </span>
                                    ))}
                                </div>
                            )}
                            {reply.type === 'pix' && reply.content && (
                                <div className="bg-green-50 border border-green-200 p-2 rounded-lg text-xs text-green-700 font-mono mb-3">
                                    <div className="font-bold">PIX: {(reply.content as PixContent).key}</div>
                                    <div>{(reply.content as PixContent).name} - {(reply.content as PixContent).city}</div>
                                </div>
                            )}
                            {reply.type === 'list' && reply.content?.sections && (
                                <div className="bg-purple-50 border border-purple-200 p-2 rounded-lg text-xs text-purple-700 mb-3">
                                    <div className="font-bold">Lista: {reply.content.sections.length} seção(ões)</div>
                                    <div>{reply.content.sections[0]?.title}</div>
                                </div>
                            )}

                            {reply.attachments && reply.attachments.length > 0 && (
                                <div className="flex gap-2 mb-3">
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 flex items-center gap-1 text-xs text-gray-500">
                                        <ImageIcon /> {reply.attachments.length} anexo(s)
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center rounded-b-xl">
                            <div className="text-xs text-gray-500 flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                    <ZapIcon /> 
                                    <span className="font-medium">{reply.usageCount}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <ClockIcon />
                                    <span>Recente</span>
                                </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => handleEdit(reply)} 
                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                    title="Editar resposta"
                                >
                                    <EditIcon />
                                </button>
                                <button 
                                    onClick={() => handleDelete(reply.id)} 
                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                    title="Excluir resposta"
                                >
                                    <Trash2Icon />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
