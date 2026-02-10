export type KanbanStage = 'lead' | 'contacted' | 'negotiation' | 'proposal' | 'closed';

export const COLUMNS: { id: KanbanStage; label: string; color: string }[] = [
    { id: 'lead', label: 'Novos Leads', color: 'border-blue-500' },
    { id: 'contacted', label: 'Em Contato', color: 'border-yellow-500' },
    { id: 'negotiation', label: 'Negociação', color: 'border-orange-500' },
    { id: 'proposal', label: 'Proposta Enviada', color: 'border-purple-500' },
    { id: 'closed', label: 'Fechado', color: 'border-emerald-500' },
];
