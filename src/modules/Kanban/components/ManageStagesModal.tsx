import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, GripVertical, Save } from 'lucide-react';
import { kanbanService, KanbanStage } from '../../../services/KanbanService';

interface ManageStagesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function ManageStagesModal({ isOpen, onClose, onSuccess }: ManageStagesModalProps) {
    const [stages, setStages] = useState<KanbanStage[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingStage, setEditingStage] = useState<Partial<KanbanStage> | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadStages();
        }
    }, [isOpen]);

    const loadStages = async () => {
        try {
            const data = await kanbanService.getStages();
            setStages(data);
        } catch (error) {
            console.error('Erro ao carregar estágios:', error);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingStage?.label) return;

        setLoading(true);
        try {
            if (editingStage.id) {
                await kanbanService.updateStage(editingStage.id, editingStage);
            } else {
                await kanbanService.createStage({
                    ...editingStage,
                    sort_order: stages.length
                });
            }
            setEditingStage(null);
            loadStages();
            onSuccess();
        } catch (error) {
            console.error('Erro ao salvar estágio:', error);
            alert('Erro ao salvar estágio');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza? Isso só é possível se não houver contatos neste estágio.')) return;
        try {
            await kanbanService.deleteStage(id);
            loadStages();
            onSuccess();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Erro ao remover estágio');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl animate-in fade-in zoom-in duration-200 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800">Gerenciar Funil de Vendas</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 flex-1 overflow-y-auto">
                    <div className="space-y-3">
                        {stages.map((stage) => (
                            <div key={stage.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 group">
                                <GripVertical size={16} className="text-gray-400 cursor-move" />
                                <div className={`w-1 h-8 rounded-full ${stage.color.replace('border-', 'bg-')}`} />
                                <div className="flex-1">
                                    <p className="font-bold text-sm text-gray-800">{stage.label}</p>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-tighter">{stage.id}</p>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setEditingStage(stage)}
                                        className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded"
                                    >
                                        <Save size={14} className="rotate-0" />
                                    </button>
                                    {!stage.is_system && (
                                        <button
                                            onClick={() => handleDelete(stage.id)}
                                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => setEditingStage({ label: '', color: 'border-blue-500' })}
                        className="mt-4 w-full py-3 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 hover:border-emerald-500 hover:text-emerald-600 font-medium transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={18} /> Adicionar Nova Etapa
                    </button>
                </div>

                {editingStage && (
                    <div className="p-4 border-t bg-gray-50 border-gray-100">
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500">NOME DA ETAPA</label>
                                    <input
                                        autoFocus
                                        className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                                        value={editingStage.label}
                                        onChange={e => setEditingStage({ ...editingStage, label: e.target.value })}
                                        placeholder="Ex: Em Negociação"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500">COR (BORDER CLASS)</label>
                                    <select
                                        className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                                        value={editingStage.color}
                                        onChange={e => setEditingStage({ ...editingStage, color: e.target.value })}
                                    >
                                        <option value="border-blue-500">Azul</option>
                                        <option value="border-emerald-500">Verde</option>
                                        <option value="border-yellow-500">Amarelo</option>
                                        <option value="border-orange-500">Laranja</option>
                                        <option value="border-red-500">Vermelho</option>
                                        <option value="border-purple-500">Roxo</option>
                                        <option value="border-pink-500">Rosa</option>
                                        <option value="border-gray-500">Cinza</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button type="button" onClick={() => setEditingStage(null)} className="px-4 py-2 text-gray-500 hover:bg-gray-200 rounded-lg">Cancelar</button>
                                <button type="submit" disabled={loading} className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-all flex items-center gap-2">
                                    {loading ? 'Salvando...' : 'Salvar'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
