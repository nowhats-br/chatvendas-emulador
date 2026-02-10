import React from 'react';
import { cn } from '../../../lib/utils';

// Custom Icons
const XIcon = () => React.createElement('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, 
  React.createElement('path', { d: 'M18 6 6 18' }),
  React.createElement('path', { d: 'm6 6 12 12' })
);

const SaveIcon = () => React.createElement('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, 
  React.createElement('path', { d: 'M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z' }),
  React.createElement('path', { d: 'M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7' }),
  React.createElement('path', { d: 'M7 3v4a1 1 0 0 0 1 1h8' })
);

const ImageIcon = ({ size = 20 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, 
  React.createElement('rect', { width: 18, height: 18, x: 3, y: 3, rx: 2, ry: 2 }),
  React.createElement('circle', { cx: 9, cy: 9, r: 2 }),
  React.createElement('path', { d: 'm21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21' })
);

const FileTextIcon = ({ size = 16 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, 
  React.createElement('path', { d: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z' }),
  React.createElement('path', { d: 'M14 2v4a2 2 0 0 0 2 2h4' }),
  React.createElement('path', { d: 'M10 9H8' }),
  React.createElement('path', { d: 'M16 13H8' }),
  React.createElement('path', { d: 'M16 17H8' })
);

const MicIcon = ({ size = 20 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, 
  React.createElement('path', { d: 'M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z' }),
  React.createElement('path', { d: 'M19 10v2a7 7 0 0 1-14 0v-2' }),
  React.createElement('line', { x1: 12, x2: 12, y1: 19, y2: 22 }),
  React.createElement('line', { x1: 8, x2: 16, y1: 22, y2: 22 })
);

const ZapIcon = () => React.createElement('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, 
  React.createElement('path', { d: 'M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14Z' })
);

const MousePointer2Icon = ({ size = 16 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, 
  React.createElement('path', { d: 'M9 9c.64-.64 1.521-.954 2.402-.954s1.762.29 2.402.954' }),
  React.createElement('path', { d: 'M21 12c0 1.2-.6 2.4-1.8 3.6a5 5 0 0 1-8.4 0C9.6 14.4 9 13.2 9 12s.6-2.4 1.8-3.6a5 5 0 0 1 8.4 0c1.2 1.2 1.8 2.4 1.8 3.6' }),
  React.createElement('path', { d: 'M12 2v10' })
);

const ListIcon = ({ size = 16 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, 
  React.createElement('line', { x1: 8, x2: 21, y1: 6, y2: 6 }),
  React.createElement('line', { x1: 8, x2: 21, y1: 12, y2: 12 }),
  React.createElement('line', { x1: 8, x2: 21, y1: 18, y2: 18 }),
  React.createElement('line', { x1: 3, x2: 3.01, y1: 6, y2: 6 }),
  React.createElement('line', { x1: 3, x2: 3.01, y1: 12, y2: 12 }),
  React.createElement('line', { x1: 3, x2: 3.01, y1: 18, y2: 18 })
);

const QrCodeIcon = ({ size = 16 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, 
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

const PlusIcon = ({ size = 14 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, 
  React.createElement('path', { d: 'M5 12h14' }),
  React.createElement('path', { d: 'm12 5 0 14' })
);

const Trash2Icon = ({ size = 16 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, 
  React.createElement('path', { d: 'M3 6h18' }),
  React.createElement('path', { d: 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' }),
  React.createElement('path', { d: 'M8 6V4c0-1 1-2 2-2h4c-1 0 2 1 2 2v2' }),
  React.createElement('line', { x1: 10, x2: 10, y1: 11, y2: 17 }),
  React.createElement('line', { x1: 14, x2: 14, y1: 11, y2: 17 })
);

// Interfaces
interface QuickReply {
  id: string;
  shortcut: string;
  message: string;
  category: string;
  attachments?: string[];
  type: 'text' | 'buttons' | 'list' | 'pix';
  content?: any; // Para armazenar estruturas complexas
}

interface QuickReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  replyToEdit?: QuickReply | null;
  onSave: (data: any) => void;
}

interface Button {
  id: string;
  text: string;
}

interface PixData {
  key: string;
  name: string;
  city: string;
  amount: string;
}

interface ListRow {
  title: string;
  description: string;
}

interface ListSection {
  title: string;
  rows: ListRow[];
}

interface AttachmentState {
  image: boolean;
  audio: boolean;
  file: boolean;
}

export function QuickReplyModal({ isOpen, onClose, replyToEdit, onSave }: QuickReplyModalProps) {
  const [formData, setFormData] = React.useState<Partial<QuickReply>>({
    shortcut: '',
    message: '',
    category: 'Geral',
    attachments: [],
    type: 'text',
    content: {}
  });

  // Estados para Anexos
  const [activeAttachments, setActiveAttachments] = React.useState<AttachmentState>({
      image: false, audio: false, file: false
  });

  // Estados para Botões
  const [buttons, setButtons] = React.useState<Button[]>([{id: '1', text: ''}]);

  // Estados para Pix
  const [pixData, setPixData] = React.useState<PixData>({ key: '', name: '', city: '', amount: '' });

  // Estados para Lista
  const [listSections, setListSections] = React.useState<ListSection[]>([{title: 'Seção 1', rows: [{title: '', description: ''}]}]);

  React.useEffect(() => {
    if (isOpen) {
      if (replyToEdit) {
        setFormData(replyToEdit);
        if(replyToEdit.type === 'buttons' && replyToEdit.content?.buttons) setButtons(replyToEdit.content.buttons);
        if(replyToEdit.type === 'pix' && replyToEdit.content) setPixData(replyToEdit.content);
        if(replyToEdit.type === 'list' && replyToEdit.content?.sections) setListSections(replyToEdit.content.sections);
      } else {
        setFormData({ shortcut: '', message: '', category: 'Geral', attachments: [], type: 'text', content: {} });
        setButtons([{id: '1', text: ''}]);
        setPixData({ key: '', name: '', city: '', amount: '' });
        setListSections([{title: 'Seção 1', rows: [{title: '', description: ''}]}]);
        setActiveAttachments({ image: false, audio: false, file: false });
      }
    }
  }, [isOpen, replyToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalContent = {};
    if (formData.type === 'buttons') finalContent = { buttons };
    if (formData.type === 'pix') finalContent = pixData;
    if (formData.type === 'list') finalContent = { sections: listSections };

    onSave({
        ...formData,
        content: finalContent
    });
    onClose();
  };

  const insertVariable = (variable: string) => {
      setFormData((prev: Partial<QuickReply>) => ({
          ...prev,
          message: (prev.message || '') + ` {{${variable}}} `
      }));
  };

  const toggleAttachment = (type: 'image' | 'audio' | 'file') => {
      setActiveAttachments((prev: AttachmentState) => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
        
        <div className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shrink-0">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ZapIcon />
            {replyToEdit ? 'Editar Resposta Rápida' : 'Nova Resposta Rápida'}
          </h2>
          <button onClick={onClose} className="hover:bg-white/10 p-1.5 rounded-full transition">
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="p-6 space-y-6 overflow-y-auto">
                
                {/* Cabeçalho: Atalho e Categoria */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Atalho</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">/</span>
                            <input 
                                type="text" required
                                className="w-full pl-6 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                placeholder="ex: pix"
                                value={formData.shortcut?.replace('/', '')}
                                onChange={e => setFormData({...formData, shortcut: '/' + e.target.value})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoria</label>
                        <select 
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                            value={formData.category}
                            onChange={e => setFormData({...formData, category: e.target.value})}
                        >
                            <option value="Geral">Geral</option>
                            <option value="Vendas">Vendas</option>
                            <option value="Suporte">Suporte</option>
                            <option value="Financeiro">Financeiro</option>
                        </select>
                    </div>
                </div>

                {/* Seletor de Tipo */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tipo de Resposta</label>
                    <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                        {[
                            { id: 'text', label: 'Texto', icon: FileTextIcon },
                            { id: 'buttons', label: 'Botões', icon: MousePointer2Icon },
                            { id: 'list', label: 'Lista', icon: ListIcon },
                            { id: 'pix', label: 'Pix', icon: QrCodeIcon },
                        ].map(type => (
                            <button
                                key={type.id}
                                type="button"
                                onClick={() => setFormData({...formData, type: type.id as any})}
                                className={cn(
                                    "flex-1 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-all",
                                    formData.type === type.id 
                                        ? "bg-white text-emerald-600 shadow-sm" 
                                        : "text-gray-500 hover:bg-gray-200"
                                )}
                            >
                                <type.icon /> {type.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Área de Conteúdo Dinâmico */}
                <div className="space-y-4">
                    
                    {/* Mensagem Principal (Comum a todos) */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                            {formData.type === 'pix' ? 'Mensagem de Cobrança' : 'Mensagem Principal'}
                        </label>
                        <textarea 
                            rows={4}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                            placeholder="Digite o texto..."
                            value={formData.message}
                            onChange={e => setFormData({...formData, message: e.target.value})}
                        />
                        <div className="flex gap-2 mt-1.5 overflow-x-auto pb-1">
                            {['nome', 'telefone', 'protocolo'].map(v => (
                                <button key={v} type="button" onClick={() => insertVariable(v)} className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-100 hover:bg-emerald-100">
                                    {`{{${v}}}`}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Formulário de Botões */}
                    {formData.type === 'buttons' && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 animate-in fade-in">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Opções (Máx 3)</label>
                            <div className="space-y-2">
                                {buttons.map((btn: Button, idx: number) => (
                                    <div key={btn.id} className="flex gap-2">
                                        <input 
                                            type="text" 
                                            className="flex-1 p-2 border border-gray-300 rounded text-sm"
                                            placeholder={`Botão ${idx + 1}`}
                                            value={btn.text}
                                            onChange={e => {
                                                const newBtns = [...buttons];
                                                newBtns[idx].text = e.target.value;
                                                setButtons(newBtns);
                                            }}
                                        />
                                        {buttons.length > 1 && (
                                            <button type="button" onClick={() => setButtons(buttons.filter((_: Button, i: number) => i !== idx))} className="text-red-400 p-2">
                                                <Trash2Icon />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {buttons.length < 3 && (
                                    <button type="button" onClick={() => setButtons([...buttons, {id: Date.now().toString(), text: ''}])} className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                                        <PlusIcon /> Adicionar Botão
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Formulário Pix */}
                    {formData.type === 'pix' && (
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200 animate-in fade-in grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-green-700 uppercase mb-1">Chave Pix</label>
                                <input type="text" className="w-full p-2 border border-green-300 rounded text-sm" placeholder="CPF, Email, Telefone ou Aleatória" value={pixData.key} onChange={e => setPixData({...pixData, key: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-green-700 uppercase mb-1">Nome Beneficiário</label>
                                <input type="text" className="w-full p-2 border border-green-300 rounded text-sm" value={pixData.name} onChange={e => setPixData({...pixData, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-green-700 uppercase mb-1">Cidade</label>
                                <input type="text" className="w-full p-2 border border-green-300 rounded text-sm" value={pixData.city} onChange={e => setPixData({...pixData, city: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-green-700 uppercase mb-1">Valor (Opcional)</label>
                                <input type="number" className="w-full p-2 border border-green-300 rounded text-sm" placeholder="0.00" value={pixData.amount} onChange={e => setPixData({...pixData, amount: e.target.value})} />
                            </div>
                        </div>
                    )}

                    {/* Formulário Lista */}
                    {formData.type === 'list' && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 animate-in fade-in space-y-4">
                            {listSections.map((section: ListSection, sIdx: number) => (
                                <div key={sIdx}>
                                    <input 
                                        type="text" 
                                        className="w-full bg-transparent font-bold text-sm mb-2 border-b border-gray-300 focus:border-emerald-500 outline-none"
                                        placeholder="Título da Seção"
                                        value={section.title}
                                        onChange={e => {
                                            const newSections = [...listSections];
                                            newSections[sIdx].title = e.target.value;
                                            setListSections(newSections);
                                        }}
                                    />
                                    <div className="space-y-2 pl-2">
                                        {section.rows.map((row: ListRow, rIdx: number) => (
                                            <div key={rIdx} className="flex gap-2">
                                                <input type="text" className="flex-1 p-1.5 border rounded text-xs" placeholder="Opção" value={row.title} onChange={e => {
                                                    const newSections = [...listSections];
                                                    newSections[sIdx].rows[rIdx].title = e.target.value;
                                                    setListSections(newSections);
                                                }} />
                                                <input type="text" className="flex-1 p-1.5 border rounded text-xs" placeholder="Descrição" value={row.description} onChange={e => {
                                                    const newSections = [...listSections];
                                                    newSections[sIdx].rows[rIdx].description = e.target.value;
                                                    setListSections(newSections);
                                                }} />
                                            </div>
                                        ))}
                                        <button type="button" onClick={() => {
                                            const newSections = [...listSections];
                                            newSections[sIdx].rows.push({title: '', description: ''});
                                            setListSections(newSections);
                                        }} className="text-xs text-emerald-600 font-bold">+ Opção</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Anexos Funcionais */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Anexos</label>
                        <div className="flex gap-3">
                            <button 
                                type="button" 
                                onClick={() => toggleAttachment('image')}
                                className={cn("flex-1 py-3 border-2 rounded-lg flex flex-col items-center justify-center transition-all", activeAttachments.image ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-dashed border-gray-300 text-gray-500 hover:bg-gray-50")}
                            >
                                <ImageIcon />
                                <span className="text-xs">{activeAttachments.image ? 'Imagem Selecionada' : 'Imagem/Vídeo'}</span>
                            </button>
                            <button 
                                type="button" 
                                onClick={() => toggleAttachment('audio')}
                                className={cn("flex-1 py-3 border-2 rounded-lg flex flex-col items-center justify-center transition-all", activeAttachments.audio ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-dashed border-gray-300 text-gray-500 hover:bg-gray-50")}
                            >
                                <MicIcon />
                                <span className="text-xs">{activeAttachments.audio ? 'Áudio Gravado' : 'Áudio'}</span>
                            </button>
                            <button 
                                type="button" 
                                onClick={() => toggleAttachment('file')}
                                className={cn("flex-1 py-3 border-2 rounded-lg flex flex-col items-center justify-center transition-all", activeAttachments.file ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-dashed border-gray-300 text-gray-500 hover:bg-gray-50")}
                            >
                                <FileTextIcon />
                                <span className="text-xs">{activeAttachments.file ? 'Arquivo Anexado' : 'Documento'}</span>
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            <div className="flex justify-end gap-3 p-4 border-t border-gray-100 bg-gray-50 shrink-0">
                <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 shadow-sm flex items-center gap-2">
                    <SaveIcon /> Salvar Resposta
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}
