import React, { useEffect, useState } from 'react';
import { cn } from '../../../lib/utils';
import { Ticket } from '../types';
import { attendanceService } from '../../../services/AttendanceService';
import { kanbanService, KanbanStage } from '../../../services/KanbanService';

// Icons
const ChevronDown = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  }, React.createElement('path', { d: 'm6 9 6 6 6-6' }));

const ShoppingCart = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('circle', { cx: '8', cy: '21', r: '1' }),
    React.createElement('circle', { cx: '19', cy: '21', r: '1' }),
    React.createElement('path', { d: 'M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57L23 6H6' }));

const StickyNote = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z' }),
    React.createElement('path', { d: 'M15 3v4a2 2 0 0 0 2 2h4' }));

const Wallet = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M19 7V6a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1v-2a2 2 0 0 0-2-2H2' }),
    React.createElement('path', { d: 'M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4' }));

const TagIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z' }),
    React.createElement('circle', { cx: '7.5', cy: '7.5', r: '.5', fill: 'currentColor' }));

const Columns = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }),
    React.createElement('path', { d: 'M12 3v18' })
  );

const Plus = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M5 12h14' }),
    React.createElement('path', { d: 'm12 5 0 14' }));

const X = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M18 6 6 18' }),
    React.createElement('path', { d: 'm6 6 12 12' }));

const Copy = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('rect', { width: '14', height: '14', x: '8', y: '8', rx: '2', ry: '2' }),
    React.createElement('path', { d: 'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2' }));

const Save = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z' }),
    React.createElement('path', { d: 'M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7' }),
    React.createElement('path', { d: 'M7 3v4a1 1 0 0 0 1 1h8' }));


interface RightPanelProps {
  ticket: Ticket | null;
  onOpenCatalog: () => void;
  onInsertMessage: (text: string) => void;
}

export function RightPanel({ ticket, onOpenCatalog, onInsertMessage }: RightPanelProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    notas: true,
    carteira: true,
    etiquetas: true,
    kanban: true, // New section for Kanban
  });

  const [notes, setNotes] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [tags, setTags] = useState<any[]>([]); // Permite string ou {name, color}
  const [tagInput, setTagInput] = useState('');
  const [kanbanStage, setKanbanStage] = useState('lead');
  const [isSaving, setIsSaving] = useState(false);

  // Estados de tags disponíveis
  const [availableTags, setAvailableTags] = useState<any[]>([]);
  const [kanbanStages, setKanbanStages] = useState<KanbanStage[]>([]);

  useEffect(() => {
    if (ticket) {
      setNotes(ticket.notes || '');
      // Ensure walletBalance is treated as a number
      setWalletBalance(typeof ticket.walletBalance === 'number' ? ticket.walletBalance : parseFloat(ticket.walletBalance as any) || 0);
      setTags(ticket.tags || []);
      setKanbanStage(ticket.contact_stage || ''); // Vazio se não estiver no kanban
    }
  }, [ticket]);

  // Carregar lista de etiquetas disponíveis do sistema
  useEffect(() => {
    const loadSystemTags = async () => {
      try {
        const uniqueTags = new Map<string, string>();

        // Carregar do localStorage (Fonte da Verdade definidas em Configurações)
        const systemTags = localStorage.getItem('system_tags');
        if (systemTags) {
          try {
            const parsed = JSON.parse(systemTags);
            if (Array.isArray(parsed)) {
              parsed.forEach((t: any) => {
                if (t.name && t.color) uniqueTags.set(t.name, t.color);
              });
            }
          } catch (e) { }
        } else {
          // Se não houver tags configuradas, a lista fica vazia, conforme solicitado.
        }

        // Converter para array
        const tagsList = Array.from(uniqueTags.entries())
          .map(([name, color]) => ({ name, color }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setAvailableTags(tagsList);
      } catch (error) {
        console.error('Erro ao carregar etiquetas do sistema:', error);
      }
    };

    loadSystemTags();

    const handleTagsUpdate = () => loadSystemTags();
    window.addEventListener('tags-updated', handleTagsUpdate);
    return () => window.removeEventListener('tags-updated', handleTagsUpdate);
  }, []); // Recarregar quando modal fecha ou evento dispara

  // Carregar estágios do Kanban
  useEffect(() => {
    const loadStages = async () => {
      try {
        const stages = await kanbanService.getStages();
        setKanbanStages(stages);
      } catch (error) {
        console.error('Erro ao carregar estágios kanban:', error);
      }
    };
    loadStages();
  }, []);

  const toggle = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSaveNotes = async () => {
    if (!ticket?.contact_id) return;
    setIsSaving(true);
    try {
      // Save notes and link to Kanban by updating the stage with notes (backend logic handles this)
      await attendanceService.updateContactStage(ticket.contact_id, kanbanStage, notes);
      // Also update general contact info just in case
      await attendanceService.updateContact(ticket.contact_id, { notes });
    } catch (error) {
      console.error('Erro ao salvar notas:', error);
      alert('Erro ao salvar notas.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectTag = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tagName = e.target.value;
    if (!tagName) return;

    // Encontrar a tag completa (com cor) na lista de disponíveis
    const tagObj = availableTags.find((t: any) => t.name === tagName);
    const tagToAdd = tagObj || { name: tagName, color: '#6B7280' };

    // Verificar duplicação considerando string e objeto
    const exists = tags.some(t => {
      const tName = typeof t === 'string' ? t : t.name;
      return tName === tagToAdd.name;
    });

    if (!exists) {
      const newTags = [...tags, tagToAdd];
      setTags(newTags); // Update local

      try {
        const promises = [];
        if (ticket?.contact_id) promises.push(attendanceService.updateContact(ticket.contact_id, { tags: newTags }));
        // Removido updateTicket para evitar race condition. Tags são do contato.
        await Promise.all(promises);
      } catch (error) {
        console.error('Erro ao vincular etiqueta:', error);
      }
    }
  };

  const handleRemoveTag = async (tagToRemove: any) => {
    const tagNameToRemove = typeof tagToRemove === 'string' ? tagToRemove : tagToRemove.name;
    const newTags = tags.filter((t) => {
      const currentTagName = typeof t === 'string' ? t : t.name;
      return currentTagName !== tagNameToRemove;
    });
    setTags(newTags);

    try {
      const promises = [];

      if (ticket?.contact_id) {
        promises.push(attendanceService.updateContact(ticket.contact_id, { tags: newTags }));
      }

      // Removido updateTicket para evitar race condition. Tags são do contato.

      await Promise.all(promises);
    } catch (error) {
      console.error('Erro ao remover etiqueta:', error);
    }
  };

  const handleStageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStage = e.target.value;
    setKanbanStage(newStage);
    if (ticket?.contact_id) {
      try {
        await attendanceService.updateContactStage(ticket.contact_id, newStage, notes);
      } catch (error) {
        console.error('Erro ao atualizar estágio:', error);
      }
    }
  };

  if (!ticket) {
    return (
      <div className="w-[350px] h-full bg-white border-l border-gray-200 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
        <p>Selecione um ticket para ver as informações do cliente.</p>
      </div>
    );
  }

  return (
    <div className="w-[350px] h-full bg-white border-l border-gray-200 flex flex-col overflow-y-auto">
      {/* Header do Cliente */}
      <div className="p-6 border-b border-gray-100 flex flex-col items-center bg-gray-50/50">
        <img src={ticket.avatar} className="w-20 h-20 rounded-full border-4 border-white shadow-sm mb-3" />
        <h2 className="font-bold text-gray-800 text-lg">{ticket.name}</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 mt-1 cursor-pointer hover:bg-gray-50" title="Copiar">
          {ticket.phoneNumber} <Copy size={12} />
        </div>
      </div>

      {/* Vender Produto */}
      <div className="p-4">
        <button
          onClick={onOpenCatalog}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all transform hover:scale-[1.02]"
        >
          <ShoppingCart size={20} />
          Vender Produto
        </button>
      </div>

      {/* Kanban Stage - Moved up for "attach to kanban" prominence */}
      <div className="border-b border-gray-100">
        <button onClick={() => toggle('kanban')} className="w-full px-4 py-3 flex items-center justify-between text-gray-700 hover:bg-gray-50">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Columns size={18} className="text-blue-500" /> Kanban
          </div>
          <ChevronDown size={16} className={cn("text-gray-400 transition-transform", openSections.kanban ? "rotate-180" : "")} />
        </button>
        {openSections.kanban && (
          <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2">
            <select
              value={kanbanStage}
              onChange={handleStageChange}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Não Anexado</option>
              {kanbanStages.map((col) => (
                <option key={col.id} value={col.id}>{col.label}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2">
              Alterar o estágio move o contato no Kanban.
            </p>
          </div>
        )}
      </div>

      {/* Etiquetas */}
      <div className="border-b border-gray-100">
        <button onClick={() => toggle('etiquetas')} className="w-full px-4 py-3 flex items-center justify-between text-gray-700 hover:bg-gray-50">
          <div className="flex items-center gap-2 font-bold text-sm">
            <TagIcon size={18} className="text-purple-500" /> Etiquetas
          </div>
          <ChevronDown size={16} className={cn("text-gray-400 transition-transform", openSections.etiquetas ? "rotate-180" : "")} />
        </button>
        {openSections.etiquetas && (
          <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2">

            <div className="flex gap-2 mb-3">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-purple-500 bg-white"
                onChange={handleSelectTag}
                value=""
              >
                <option value="">+ Anexar Etiqueta...</option>
                {availableTags.map((tag: any) => (
                  <option key={tag.name} value={tag.name}>{tag.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-2">
              {tags.map((tag: any, idx) => {
                const tagName = typeof tag === 'string' ? tag : tag.name;
                const tagColor = typeof tag === 'string' ? '#6B7280' : tag.color;

                return (
                  <span
                    key={idx}
                    className="text-white px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 group shadow-sm"
                    style={{ backgroundColor: tagColor }}
                  >
                    {tagName}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-200 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                );
              })}
              {tags.length === 0 && <p className="text-xs text-gray-400 italic">Nenhuma etiqueta.</p>}
            </div>

          </div>
        )}
      </div>

      {/* Notas */}
      <div className="border-b border-gray-100">
        <button onClick={() => toggle('notas')} className="w-full px-4 py-3 flex items-center justify-between text-gray-700 hover:bg-gray-50">
          <div className="flex items-center gap-2 font-bold text-sm">
            <StickyNote size={18} className="text-yellow-500" /> Notas
          </div>
          <ChevronDown size={16} className={cn("text-gray-400 transition-transform", openSections.notas ? "rotate-180" : "")} />
        </button>
        {openSections.notas && (
          <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2">
            <textarea
              className="w-full h-32 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder-yellow-700/50"
              placeholder="Escreva observações sobre o cliente..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="flex justify-end mt-2 items-center gap-2">
              <p className="text-[10px] text-gray-400 italic">Vinculado ao Kanban</p>
              <button onClick={handleSaveNotes} disabled={isSaving} className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-md font-bold hover:bg-yellow-200 transition-colors flex items-center gap-1 disabled:opacity-50">
                <Save size={12} /> {isSaving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Carteira - More discreet UI */}
      <div className="border-b border-gray-100">
        <button onClick={() => toggle('carteira')} className="w-full px-4 py-3 flex items-center justify-between text-gray-700 hover:bg-gray-50">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Wallet size={18} className="text-blue-500" /> Carteira
          </div>
          <ChevronDown size={16} className={cn("text-gray-400 transition-transform", openSections.carteira ? "rotate-180" : "")} />
        </button>
        {openSections.carteira && (
          <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2">
            {/* Discreet Wallet UI */}
            <div className="flex items-center justify-between bg-blue-50 rounded-lg p-3 border border-blue-100 mb-2">
              <span className="text-xs font-bold text-blue-700 uppercase">Saldo Disponível</span>
              <span className="text-lg font-bold text-blue-800">R$ {walletBalance.toFixed(2)}</span>
            </div>
            {/* Minimal input controls only if needed - keeping it simple for view currently or simple input */}
            <div className="flex gap-2 items-center">
              {/* Logic to add/remove balance could go here, for now keeping it display only or very simple if requested - User asked for "more discreet", so removing the big input block is key. */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
