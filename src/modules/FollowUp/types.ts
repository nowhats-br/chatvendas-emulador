import { Contact } from '../../services/ContactService';

export type FollowUpType = 'manual' | 'ai_recovery' | 'kanban_stuck' | 'post_sale' | 'birthday' | 'cold_lead' | 'vip_attention' | 'sequence_auto';
export type FollowUpStatus = 'pending' | 'completed' | 'skipped' | 'sent' | 'scheduled';
export type Priority = 'high' | 'medium' | 'low';

export interface FollowUpTask {
  id: string;
  contactId: string;
  contactName: string;
  contactPhone: string; // Obrigatório para envio
  contactAvatar: string;
  type: FollowUpType;
  status: FollowUpStatus;
  dueDate: string; // ISO Date
  priority: Priority;
  notes?: string;
  
  // Campos Inteligentes
  aiReason?: string; // Por que a IA sugeriu isso?
  suggestedMessage?: string; // O que a IA sugere enviar?
  kanbanStage?: string; // Em qual etapa do funil ele está?
  ltv?: number; // Valor do cliente para priorização
  
  // Campos de controle
  completedAt?: string; // Quando foi completado
  sentAt?: string; // Quando foi enviado
  ticketId?: string; // ID do ticket criado quando respondido
  
  // Campos de sequência automática
  sequenceId?: string; // ID da sequência que gerou esta tarefa
  sequenceStep?: number; // Número do step na sequência (1, 2, 3...)
  sequenceStepId?: string; // ID específico do step
  context?: any; // Contexto adicional (orderId, campaignId, etc.)
}

export interface FollowUpStats {
  pending: number;
  scheduled: number; // Tarefas agendadas para o futuro
  completedToday: number;
  highPriority: number;
  recoveryPotential: number; // Valor monetário estimado para recuperar
  activeSequences: number; // Quantas sequências estão ativas
}

// === SEQUÊNCIAS AUTOMÁTICAS ===
export interface FollowUpSequenceStep {
  id: string;
  delayDays: number; // Quantos dias após o trigger
  messageTemplate: string; // Template da mensagem com variáveis
  type: 'text' | 'buttons' | 'list' | 'image' | 'video' | 'audio';
  priority: Priority;
  conditions?: FollowUpCondition[]; // Condições para executar este step
}

export interface FollowUpSequence {
  id: string;
  name: string;
  description: string;
  trigger: FollowUpTriggerType; // O que dispara esta sequência
  steps: FollowUpSequenceStep[];
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type FollowUpTriggerType = 
  | 'sale_completed' // Venda finalizada
  | 'campaign_response' // Resposta de campanha
  | 'campaign_response_no_sale' // Resposta de campanha sem venda
  | 'cart_abandoned' // Carrinho abandonado
  | 'message_received' // Mensagem recebida
  | 'contact_created' // Contato criado
  | 'stage_changed' // Mudança de estágio no funil
  | 'tag_added' // Tag adicionada
  | 'birthday' // Aniversário
  | 'inactivity' // Inatividade por X dias
  | 'manual'; // Disparado manualmente

export interface FollowUpTrigger {
  id: string;
  type: FollowUpTriggerType;
  contactId: string;
  sequenceId: string;
  triggeredAt: string;
  context: any; // Dados específicos do trigger
  processed: boolean;
}

export interface FollowUpCondition {
  field: string; // Campo a verificar (ltv, tags, kanbanStage, etc.)
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
  value: any; // Valor para comparar
}

// === EVENTOS DO SISTEMA ===
export interface SaleCompletedEvent {
  contactId: string;
  orderId: string;
  value: number;
  products?: any[];
}

export interface CampaignResponseEvent {
  contactId: string;
  campaignId: string;
  messageId: string;
  responseContent?: string;
}

export interface CartAbandonedEvent {
  contactId: string;
  cartId: string;
  items: any[];
  totalValue: number;
}

export interface MessageReceivedEvent {
  contactId: string;
  messageId: string;
  content: string;
  timestamp: string;
}
