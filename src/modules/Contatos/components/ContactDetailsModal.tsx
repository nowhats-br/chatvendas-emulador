import React from 'react';
import { Contact, ContactService, KanbanStage } from '../../../services/ContactService';
import { Avatar } from '../../../components/Avatar';
import { cn } from '../../../lib/utils';

// Custom icon components
const XIcon = ({ size = 20 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d: 'm18 6-12 12' }), React.createElement('path', { d: 'm6 6 12 12' }));
const TagIcon = ({ size = 18 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d: 'M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z' }), React.createElement('circle', { cx: '7.5', cy: '7.5', r: '.5' }));
const WalletIcon = ({ size = 18, className }: { size?: number; className?: string }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className }, React.createElement('path', { d: 'M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1' }), React.createElement('path', { d: 'M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4' }));
const StickyNoteIcon = ({ size = 18 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d: 'M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z' }), React.createElement('path', { d: 'M15 3v4a2 2 0 0 0 2 2h4' }));
const KanbanSquareIcon = ({ size = 18 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }), React.createElement('path', { d: 'M8 7v7' }), React.createElement('path', { d: 'M12 7v4' }), React.createElement('path', { d: 'M16 7v9' }));
const SaveIcon = ({ size = 18 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z' }), React.createElement('polyline', { points: '17,21 17,13 7,13 7,21' }), React.createElement('polyline', { points: '7,3 7,8 15,8' }));
const PlusIcon = ({ size = 20 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d: 'M5 12h14' }), React.createElement('path', { d: 'M12 5v14' }));
const ArrowUpCircleIcon = ({ size = 18 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('circle', { cx: '12', cy: '12', r: '10' }), React.createElement('path', { d: 'm16 12-4-4-4 4' }), React.createElement('path', { d: 'M12 16V8' }));
const ArrowDownCircleIcon = ({ size = 18 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('circle', { cx: '12', cy: '12', r: '10' }), React.createElement('path', { d: 'M8 12l4 4 4-4' }), React.createElement('path', { d: 'M12 8v8' }));

interface ContactDetailsModalProps {
  contact: Contact | null;
  onClose: () => void;
  onUpdate: () => void;
}

type Tab = 'info' | 'tags' | 'wallet' | 'notes' | 'kanban';

export function ContactDetailsModal({ contact, onClose, onUpdate }: ContactDetailsModalProps) {
  const [activeTab, setActiveTab] = React.useState<Tab>('info');
  const [notes, setNotes] = React.useState(contact?.notes || '');
  const [newTag, setNewTag] = React.useState('');
  const [walletAmount, setWalletAmount] = React.useState('');
  const [localContact, setLocalContact] = React.useState<Contact | null>(contact);

  if (!localContact) return null;

  const handleSaveNotes = async () => {
    try {
      await ContactService.update(localContact.id, { notes });
      alert('Notas salvas!');
      onUpdate();
    } catch (error) {
      console.error('Erro ao salvar notas:', error);
      alert('Erro ao salvar notas');
    }
  };

  const handleAddTag = async () => {
    if (newTag && !localContact.tags.includes(newTag)) {
      try {
        const updatedTags = [...localContact.tags, newTag];
        await ContactService.update(localContact.id, { tags: updatedTags });
        setLocalContact({ ...localContact, tags: updatedTags });
        setNewTag('');
        onUpdate();
      } catch (error) {
        console.error('Erro ao adicionar tag:', error);
      }
    }
  };

  const handleRemoveTag = async (tag: string) => {
    try {
      const updatedTags = localContact.tags.filter((t: string) => t !== tag);
      await ContactService.update(localContact.id, { tags: updatedTags });
      setLocalContact({ ...localContact, tags: updatedTags });
      onUpdate();
    } catch (error) {
      console.error('Erro ao remover tag:', error);
    }
  };

  const handleWalletTransaction = async (type: 'add' | 'remove') => {
    const amount = parseFloat(walletAmount);
    if (isNaN(amount) || amount <= 0) return;

    try {
      const currentBalance = localContact.walletBalance || 0;
      const newBalance = type === 'add' ? currentBalance + amount : currentBalance - amount;

      await ContactService.update(localContact.id, { walletBalance: newBalance });
      setLocalContact({ ...localContact, walletBalance: newBalance });
      setWalletAmount('');
      onUpdate();
    } catch (error) {
      console.error('Erro ao atualizar carteira:', error);
    }
  };

  const handleKanbanChange = async (stage: KanbanStage) => {
    try {
      await ContactService.updateStage(localContact.id, stage);
      setLocalContact({ ...localContact, kanbanStage: stage });
      onUpdate();
    } catch (error) {
      console.error('Erro ao atualizar estágio:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-4xl h-[80vh] rounded-xl shadow-2xl flex overflow-hidden animate-in zoom-in-95">
        
        {/* Sidebar Tabs */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 flex flex-col gap-2">
            <div className="flex items-center gap-3 mb-6 px-2">
                <Avatar name={localContact.name} size="lg" />
                <div className="min-w-0">
                    <h3 className="font-bold text-gray-800 text-sm truncate">{localContact.name}</h3>
                    <p className="text-xs text-gray-500 truncate">{localContact.phoneNumber}</p>
                </div>
            </div>

            {[
                { id: 'info', label: 'Informações', icon: TagIcon },
                { id: 'tags', label: 'Etiquetas', icon: TagIcon },
                { id: 'wallet', label: 'Carteira', icon: WalletIcon },
                { id: 'notes', label: 'Notas', icon: StickyNoteIcon },
                { id: 'kanban', label: 'Funil (Kanban)', icon: KanbanSquareIcon },
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as Tab)}
                    className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left",
                        activeTab === tab.id 
                            ? "bg-white text-emerald-600 shadow-sm ring-1 ring-gray-200" 
                            : "text-gray-500 hover:bg-gray-200 hover:text-gray-900"
                    )}
                >
                    <tab.icon size={18} /> {tab.label}
                </button>
            ))}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
            <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
                <h2 className="text-lg font-bold text-gray-800 capitalize">{activeTab}</h2>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><XIcon size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-white">
                
                {activeTab === 'info' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome</label>
                                <input type="text" className="w-full p-2 border rounded bg-gray-50" value={localContact.name} readOnly />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefone</label>
                                <input type="text" className="w-full p-2 border rounded bg-gray-50" value={localContact.phoneNumber} readOnly />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                                <input type="text" className="w-full p-2 border rounded bg-gray-50" value={localContact.email} readOnly />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">LTV (Total Gasto)</label>
                                <input type="text" className="w-full p-2 border rounded bg-gray-50 font-bold text-emerald-600" value={`R$ ${localContact.ltv.toFixed(2)}`} readOnly />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'tags' && (
                    <div>
                        <div className="flex gap-2 mb-4">
                            <input 
                                type="text" 
                                placeholder="Nova etiqueta..." 
                                className="flex-1 p-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
                                value={newTag}
                                onChange={e => setNewTag(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                            />
                            <button onClick={handleAddTag} className="bg-emerald-600 text-white px-4 rounded-lg hover:bg-emerald-700"><PlusIcon size={20} /></button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {localContact.tags.map((tag: string) => (
                                <span key={tag} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 border border-gray-200">
                                    {tag}
                                    <button onClick={() => handleRemoveTag(tag)} className="text-gray-400 hover:text-red-500"><XIcon size={14} /></button>
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'wallet' && (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="bg-emerald-50 p-6 rounded-full mb-4">
                            <WalletIcon size={48} className="text-emerald-600" />
                        </div>
                        <h3 className="text-gray-500 uppercase font-bold text-sm mb-1">Saldo em Carteira</h3>
                        <p className="text-4xl font-bold text-gray-800 mb-8">R$ {(localContact.walletBalance || 0).toFixed(2)}</p>

                        <div className="w-full max-w-sm bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Gerenciar Saldo</label>
                            <div className="flex gap-2 mb-4">
                                <span className="flex items-center justify-center bg-white border border-gray-300 rounded-l-lg px-3 text-gray-500">R$</span>
                                <input 
                                    type="number" 
                                    className="flex-1 p-2 border-y border-r border-gray-300 rounded-r-lg outline-none"
                                    placeholder="0.00"
                                    value={walletAmount}
                                    onChange={e => setWalletAmount(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => handleWalletTransaction('add')} className="flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-bold">
                                    <ArrowUpCircleIcon size={18} /> Adicionar
                                </button>
                                <button onClick={() => handleWalletTransaction('remove')} className="flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 font-bold">
                                    <ArrowDownCircleIcon size={18} /> Remover
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'notes' && (
                    <div className="h-full flex flex-col">
                        <textarea 
                            className="flex-1 w-full p-4 border border-gray-300 rounded-xl resize-none outline-none focus:ring-2 focus:ring-emerald-500 bg-yellow-50/50 text-gray-700 leading-relaxed"
                            placeholder="Escreva notas sobre este cliente..."
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                        />
                        <div className="mt-4 flex justify-end">
                            <button onClick={handleSaveNotes} className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-700 flex items-center gap-2">
                                <SaveIcon size={18} /> Salvar Notas
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'kanban' && (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500">Mova o cliente para outra etapa do funil de vendas.</p>
                        <div className="grid grid-cols-1 gap-2">
                            {[
                                { id: 'lead', label: 'Novo Lead', color: 'bg-blue-100 text-blue-700 border-blue-200' },
                                { id: 'contacted', label: 'Em Contato', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
                                { id: 'negotiation', label: 'Negociação', color: 'bg-orange-100 text-orange-700 border-orange-200' },
                                { id: 'proposal', label: 'Proposta Enviada', color: 'bg-purple-100 text-purple-700 border-purple-200' },
                                { id: 'closed', label: 'Fechado', color: 'bg-green-100 text-green-700 border-green-200' },
                            ].map((stage) => (
                                <button
                                    key={stage.id}
                                    onClick={() => handleKanbanChange(stage.id as KanbanStage)}
                                    className={cn(
                                        "p-4 rounded-lg border text-left transition-all flex justify-between items-center",
                                        localContact.kanbanStage === stage.id 
                                            ? `${stage.color} ring-2 ring-offset-2 ring-emerald-500` 
                                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                                    )}
                                >
                                    <span className="font-bold">{stage.label}</span>
                                    {localContact.kanbanStage === stage.id && <SaveIcon size={16} />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
      </div>
    </div>
  );
}
