import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Switch } from '../../../components/ui/switch';
import { Badge } from '../../../components/ui/badge';
import { useAutoFollowUp } from '../hooks/useAutoFollowUp';
import {
    Zap,
    X,
    Clock,
    MessageSquare,
    ChevronRight,
    Save,
    Plus,
    Trash2
} from 'lucide-react';
import { cn } from '../../../lib/utils';

interface FollowUpSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function FollowUpSettingsModal({ isOpen, onClose }: FollowUpSettingsModalProps) {
    const { sequences, toggleSequence, updateSequence, isLoading } = useAutoFollowUp();
    const [editingSequenceId, setEditingSequenceId] = useState<string | null>(null);
    const [editData, setEditData] = useState<any>(null);

    const handleEdit = (sequence: any) => {
        setEditingSequenceId(sequence.id);
        setEditData(JSON.parse(JSON.stringify(sequence))); // Deep clone
    };

    const handleSaveEdit = () => {
        if (editingSequenceId && editData) {
            updateSequence(editingSequenceId, editData);
            setEditingSequenceId(null);
            setEditData(null);
        }
    };

    const handleUpdateStep = (index: number, field: string, value: any) => {
        const newSteps = [...editData.steps];
        newSteps[index] = { ...newSteps[index], [field]: value };
        setEditData({ ...editData, steps: newSteps });
    };

    const handleAddStep = () => {
        const newStep = {
            id: `step_${Date.now()}`,
            delayDays: 1,
            messageType: 'future_nurturing',
            priority: 'low'
        };
        setEditData({ ...editData, steps: [...editData.steps, newStep] });
    };

    const handleRemoveStep = (index: number) => {
        const newSteps = editData.steps.filter((_: any, i: number) => i !== index);
        setEditData({ ...editData, steps: newSteps });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">

                {/* Header */}
                <div className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Zap size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 leading-tight">Automação</h2>
                            <p className="text-xs text-gray-500">Gerencie suas sequências automáticas</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="hover:bg-gray-100 p-2 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                    {!editingSequenceId ? (
                        <div className="space-y-4">
                            {sequences.map((sequence: any) => {
                                const totalDays = sequence.steps.reduce((acc: number, step: any) => Math.max(acc, step.delayDays), 0);
                                return (
                                    <div
                                        key={sequence.id}
                                        className={cn(
                                            "flex items-center justify-between p-4 border rounded-xl bg-white shadow-sm transition-all hover:shadow-md group",
                                            sequence.active ? "border-blue-100 ring-1 ring-blue-50" : "border-gray-200 opacity-80"
                                        )}
                                    >
                                        <div className="flex-1 cursor-pointer" onClick={() => handleEdit(sequence)}>
                                            <div className="flex items-center gap-3 mb-1.5">
                                                <h4 className="font-bold text-gray-800">{sequence.name}</h4>
                                                <Badge
                                                    variant={sequence.active ? "default" : "secondary"}
                                                    className={cn(
                                                        "text-[10px] uppercase tracking-wider font-bold h-5",
                                                        sequence.active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500"
                                                    )}
                                                >
                                                    {sequence.active ? 'Ativo' : 'Pausado'}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-500 mb-3 font-medium">
                                                {sequence.id === 'post_sale_complete' ? 'Confirmação e Pesquisa de Satisfação' : 'Nutrição e Recomendação Automática'}
                                            </p>

                                            <div className="flex items-center gap-4 text-xs font-semibold text-gray-400 group-hover:text-blue-500 transition-colors">
                                                <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                                    <MessageSquare size={12} />
                                                    {sequence.steps.length} mensagens
                                                </span>
                                                <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                                    <Clock size={12} />
                                                    {totalDays} dias (máximo)
                                                </span>
                                                <span className="ml-auto flex items-center gap-1 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Editar <ChevronRight size={14} />
                                                </span>
                                            </div>
                                        </div>

                                        <div className="pl-6 border-l border-gray-100 ml-6 flex flex-col items-center gap-2">
                                            <Switch
                                                checked={sequence.active}
                                                onCheckedChange={(checked) => toggleSequence(sequence.id, checked)}
                                                className="data-[state=checked]:bg-blue-600"
                                            />
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">
                                                {sequence.active ? 'ON' : 'OFF'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => setEditingSequenceId(null)}
                                    className="text-sm font-bold text-gray-500 hover:text-gray-700 flex items-center gap-1"
                                >
                                    <ChevronRight size={16} className="rotate-180" /> Voltar
                                </button>
                                <h3 className="font-bold text-gray-800">Editando: {editData.name}</h3>
                            </div>

                            <div className="space-y-4">
                                {editData.steps.map((step: any, idx: number) => (
                                    <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Mensagem {idx + 1}</span>
                                            <button
                                                onClick={() => handleRemoveStep(idx)}
                                                className="text-gray-400 hover:text-red-500 p-1"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Atraso (Dias)</label>
                                                <input
                                                    type="number"
                                                    className="w-full p-2 border rounded-lg text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                    value={step.delayDays}
                                                    onChange={(e) => handleUpdateStep(idx, 'delayDays', parseInt(e.target.value) || 0)}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Estratégia</label>
                                                <select
                                                    className="w-full p-2 border rounded-lg text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                    value={step.messageType}
                                                    onChange={(e) => handleUpdateStep(idx, 'messageType', e.target.value)}
                                                >
                                                    <option value="confirmation">🚀 Confirmação</option>
                                                    <option value="satisfaction">⭐ Satisfação</option>
                                                    <option value="future_nurturing">💡 Nutrição</option>
                                                    <option value="product_recommendation">🛍️ Recomendação</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-100/50">
                                            <p className="text-[10px] font-bold text-blue-600 uppercase mb-1 flex items-center gap-1">
                                                <Zap size={10} /> O que a IA escreverá:
                                            </p>
                                            <p className="text-xs text-blue-800 italic leading-relaxed">
                                                {step.messageType === 'confirmation' && "Uma mensagem calorosa confirmando o pedido, agradecendo a confiança e mencionando o processamento do envio."}
                                                {step.messageType === 'satisfaction' && "Um contato amigável perguntando se o cliente gostou do produto e pedindo um feedback sincero."}
                                                {step.messageType === 'future_nurturing' && "Um toque sutil para manter a marca na mente do cliente, com uma dica ou novidade sem ser invasivo."}
                                                {step.messageType === 'product_recommendation' && "Uma sugestão personalizada baseada nos produtos que o cliente já comprou anteriormente."}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                <Button
                                    variant="outline"
                                    onClick={handleAddStep}
                                    className="w-full border-dashed border-gray-300 py-6 text-gray-500 hover:text-blue-600 hover:border-blue-300"
                                >
                                    <Plus size={18} className="mr-2" /> Adicionar Mensagem
                                </Button>
                            </div>

                            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-amber-800 text-[11px] leading-relaxed">
                                <strong>💡 Por que não vejo o texto fixo?</strong> As mensagens são geradas dinamicamente pela IA no momento do envio. Ela usa o nome do cliente, o produto comprado e o valor total para criar uma mensagem única e 100% humana para cada pessoa.
                            </div>

                            <div className="pt-4 flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setEditingSequenceId(null)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                    onClick={handleSaveEdit}
                                >
                                    <Save size={18} className="mr-2" /> Salvar Alterações
                                </Button>
                            </div>
                        </div>
                    )}

                    {!editingSequenceId && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-blue-700 text-sm mt-6">
                            <Zap size={20} className="shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold mb-1">Modo Automático</p>
                                <p className="text-blue-600/80 leading-relaxed text-xs">
                                    O sistema monitora vendas e carrinhos para disparar estas sequências automaticamente respeitando os horários comerciais e regras anti-spam.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
