import { ContactService } from '../../../services/ContactService';
import { AIConfigService } from '../../../services/AIConfigService';
import { FollowUpTask, Priority } from '../types';

interface SaleData {
  contactId: string;
  orderId: string;
  value: number;
  products: string[];
  saleDate: string;
}

interface AutoSequenceConfig {
  id: string;
  name: string;
  trigger: 'post_sale' | 'future_purchase';
  steps: AutoSequenceStep[];
  active: boolean;
}

interface AutoSequenceStep {
  id: string;
  delayDays: number;
  messageType: 'confirmation' | 'satisfaction' | 'future_nurturing' | 'product_recommendation';
  priority: Priority;
}

class AutoFollowUpServiceClass {
  private sequences: AutoSequenceConfig[] = [];
  private activeSales: Map<string, SaleData> = new Map();

  constructor() {
    this.setupDefaultSequences();
    this.startSaleMonitoring();
  }

  private setupDefaultSequences() {
    this.sequences = [
      {
        id: 'post_delivery_complete',
        name: 'Pós-entrega Completa',
        trigger: 'post_sale',
        steps: [
          {
            id: 'satisfaction_check',
            delayDays: 2, // 2 dias após entrega
            messageType: 'satisfaction',
            priority: 'medium'
          }
        ],
        active: true
      },
      {
        id: 'future_purchase_nurturing',
        name: 'Nutrição para Compras Futuras',
        trigger: 'future_purchase',
        steps: [
          {
            id: 'gentle_reminder_1',
            delayDays: 30,
            messageType: 'future_nurturing',
            priority: 'low'
          },
          {
            id: 'product_recommendation',
            delayDays: 60,
            messageType: 'product_recommendation',
            priority: 'low'
          },
          {
            id: 'gentle_reminder_2',
            delayDays: 120,
            messageType: 'future_nurturing',
            priority: 'low'
          }
        ],
        active: true
      }
    ];
  }

  // === MÉTODO PRINCIPAL: DETECTAR VENDA FINALIZADA ===
  public async onSaleCompleted(saleData: SaleData) {
    try {
      console.log('🎉 Venda detectada - Aguardando entrega para iniciar follow-up:', saleData);
      
      // Armazenar dados da venda para aguardar entrega
      this.activeSales.set(saleData.contactId, saleData);
      
      // NÃO criar sequências imediatamente - aguardar entrega
      console.log('⏳ Aguardando status de entrega para iniciar follow-up automático');
    } catch (error) {
      console.error('Erro ao processar venda:', error);
    }
  }

  // === NOVO MÉTODO: DETECTAR ENTREGA FINALIZADA ===
  public async onOrderDelivered(deliveryData: {
    contactId: string;
    orderId: string;
    deliveredAt: string;
    trackingCode?: string;
  }) {
    try {
      console.log('📦 Entrega detectada - Iniciando follow-up pós-entrega:', deliveryData);
      
      // Buscar dados da venda original
      const saleData = this.activeSales.get(deliveryData.contactId);
      if (!saleData) {
        console.warn('Dados da venda não encontrados para:', deliveryData.contactId);
        return;
      }

      // Buscar dados do cliente
      const contacts = await ContactService.getAll();
      const contact = contacts.find(c => c.id === deliveryData.contactId);
      
      if (!contact) {
        console.warn('Cliente não encontrado:', deliveryData.contactId);
        return;
      }

      // Cancelar sequências anteriores do mesmo cliente
      await this.cancelPreviousSequences(deliveryData.contactId);

      // Criar sequência pós-entrega (2 dias após entrega)
      await this.createPostDeliverySequence(contact, saleData, deliveryData);
      
      // Agendar sequência para compras futuras
      await this.createFuturePurchaseSequence(contact, saleData);

      console.log('✅ Sequências pós-entrega criadas para:', contact.name);
    } catch (error) {
      console.error('Erro ao processar entrega:', error);
    }
  }

  // === SEQUÊNCIA PÓS-ENTREGA (2 DIAS APÓS ENTREGA) ===
  private async createPostDeliverySequence(contact: any, saleData: SaleData, deliveryData: any) {
    const sequence = this.sequences.find(s => s.trigger === 'post_sale' && s.active);
    if (!sequence) return;

    console.log(`📦 Criando sequência pós-entrega para ${contact.name} (2 dias após entrega)`);

    const tasks: FollowUpTask[] = [];

    for (const step of sequence.steps) {
      const message = await this.generatePostDeliveryMessage(contact, saleData, deliveryData, step.messageType);
      
      // Calcular data baseada na entrega, não na venda
      const deliveryDate = new Date(deliveryData.deliveredAt);
      const dueDate = this.addDays(deliveryDate, step.delayDays);

      const task: FollowUpTask = {
        id: this.generateId(),
        contactId: contact.id,
        contactName: contact.name,
        contactPhone: contact.phoneNumber,
        contactAvatar: contact.avatar || '',
        type: 'sequence_auto',
        status: 'scheduled',
        dueDate: dueDate.toISOString(),
        priority: step.priority,
        sequenceId: `auto_post_delivery_${saleData.orderId}`,
        sequenceStep: sequence.steps.indexOf(step) + 1,
        sequenceStepId: step.id,
        aiReason: `Pós-entrega automática: ${this.getStepDescription(step.messageType)}`,
        suggestedMessage: message,
        ltv: contact.ltv,
        context: {
          autoSend: true,
          totalSteps: sequence.steps.length,
          saleData: saleData,
          deliveryData: deliveryData,
          messageType: step.messageType,
          isPostDelivery: true
        }
      };

      tasks.push(task);
    }

    // Notificar que as tarefas foram criadas
    this.notifyTasksCreated(tasks);
  }

  // === SEQUÊNCIA PARA COMPRAS FUTURAS (SAUDÁVEL) ===
  private async createFuturePurchaseSequence(contact: any, saleData: SaleData) {
    const sequence = this.sequences.find(s => s.trigger === 'future_purchase' && s.active);
    if (!sequence) return;

    console.log(`🔮 Criando sequência para compras futuras - ${contact.name}`);

    const tasks: FollowUpTask[] = [];

    for (const step of sequence.steps) {
      const message = await this.generateFutureNurturingMessage(contact, saleData, step.messageType);
      const dueDate = this.addDays(new Date(), step.delayDays);

      const task: FollowUpTask = {
        id: this.generateId(),
        contactId: contact.id,
        contactName: contact.name,
        contactPhone: contact.phoneNumber,
        contactAvatar: contact.avatar || '',
        type: 'sequence_auto',
        status: 'scheduled',
        dueDate: dueDate.toISOString(),
        priority: step.priority,
        sequenceId: `auto_future_${saleData.orderId}`,
        sequenceStep: sequence.steps.indexOf(step) + 1,
        sequenceStepId: step.id,
        aiReason: `Nutrição futura: ${this.getStepDescription(step.messageType)}`,
        suggestedMessage: message,
        ltv: contact.ltv,
        context: {
          autoSend: true,
          totalSteps: sequence.steps.length,
          saleData: saleData,
          messageType: step.messageType,
          isNurturing: true
        }
      };

      tasks.push(task);
    }

    // Notificar que as tarefas foram criadas
    this.notifyTasksCreated(tasks);
  }

  // === GERAÇÃO DE MENSAGENS COM IA ===
  private async generatePostDeliveryMessage(contact: any, saleData: SaleData, deliveryData: any, messageType: string): Promise<string> {
    const firstName = this.getFirstName(contact.name);
    
    try {
      if (!AIConfigService.isConfigured()) {
        return this.getDefaultPostDeliveryMessage(firstName, saleData, deliveryData, messageType);
      }

      const context = this.buildAIContext(contact, saleData, deliveryData);
      const prompt = this.buildPostDeliveryPrompt(messageType, context);
      
      const result = await AIConfigService.generateSmartMessage('post_sale_satisfaction', context, prompt);
      return result.content;
    } catch (error) {
      console.warn('Erro ao gerar mensagem pós-entrega com IA:', error);
      return this.getDefaultPostDeliveryMessage(firstName, saleData, deliveryData, messageType);
    }
  }

  private async generateFutureNurturingMessage(contact: any, saleData: SaleData, messageType: string): Promise<string> {
    const firstName = this.getFirstName(contact.name);
    
    try {
      if (!AIConfigService.isConfigured()) {
        return this.getDefaultNurturingMessage(firstName, saleData, messageType);
      }

      const context = this.buildAIContext(contact, saleData);
      const prompt = this.buildNurturingPrompt(messageType, context);
      
      const result = await AIConfigService.generateSmartMessage('lead_nurturing', context, prompt);
      return result.content;
    } catch (error) {
      console.warn('Erro ao gerar mensagem de nutrição com IA:', error);
      return this.getDefaultNurturingMessage(firstName, saleData, messageType);
    }
  }

  // === CONSTRUÇÃO DE CONTEXTO PARA IA ===
  private buildAIContext(contact: any, saleData: SaleData, deliveryData?: any) {
    return {
      contactName: contact.name,
      contactPhone: contact.phoneNumber,
      contactTags: contact.tags || [],
      ltv: contact.ltv,
      lastPurchaseDate: saleData.saleDate,
      lastPurchaseValue: saleData.value,
      lastPurchaseProducts: saleData.products,
      kanbanStage: contact.kanbanStage,
      totalPurchases: contact.totalPurchases || 1,
      averageOrderValue: contact.averageOrderValue || saleData.value,
      preferredProducts: contact.preferredProducts || saleData.products,
      customFields: {
        orderId: saleData.orderId,
        isNewCustomer: !contact.lastPurchaseDate,
        purchaseHistory: contact.purchaseHistory || [],
        deliveredAt: deliveryData?.deliveredAt,
        trackingCode: deliveryData?.trackingCode,
        daysSinceDelivery: deliveryData ? Math.floor((Date.now() - new Date(deliveryData.deliveredAt).getTime()) / (1000 * 60 * 60 * 24)) : 0
      }
    };
  }

  // === PROMPTS ESPECÍFICOS PARA IA ===
  private buildPostDeliveryPrompt(messageType: string, context: any): string {
    const firstName = this.getFirstName(context.contactName);
    const products = context.lastPurchaseProducts.join(', ');
    const daysSinceDelivery = context.customFields.daysSinceDelivery || 2;

    const prompts = {
      satisfaction: `Gere uma mensagem CURTA pedindo feedback sobre o produto entregue.
Cliente: ${firstName}
Produtos entregues há ${daysSinceDelivery} dias: ${products}
Pedido: ${context.customFields.orderId}

INSTRUÇÕES:
- Máximo 120 caracteres
- Pergunte sobre satisfação com o produto recebido
- Seja gentil e não insistente
- Use 1 emoji apenas
- Foque na experiência com o produto, não na entrega
- Não mencione rastreamento (já foi tratado pelo módulo pedidos)`
    };

    return prompts[messageType as keyof typeof prompts] || prompts.satisfaction;
  }

  private buildNurturingPrompt(messageType: string, context: any): string {
    const firstName = this.getFirstName(context.contactName);
    const isVIP = context.ltv > 500;
    const daysSincePurchase = Math.floor((Date.now() - new Date(context.lastPurchaseDate).getTime()) / (1000 * 60 * 60 * 24));

    const prompts = {
      future_nurturing: `Gere uma mensagem SUTIL de nutrição para compra futura.
Cliente: ${firstName}
${isVIP ? 'Cliente VIP' : 'Cliente regular'}
Última compra há ${daysSincePurchase} dias

INSTRUÇÕES:
- Máximo 100 caracteres
- NÃO seja insistente ou vendedor
- Ofereça valor (dica, novidade)
- Tom casual e amigável
- 1 emoji apenas
- NÃO mencione "comprar" diretamente`,

      product_recommendation: `Gere uma mensagem DISCRETA com recomendação de produto.
Cliente: ${firstName}
Histórico: ${context.lastPurchaseProducts.join(', ')}

INSTRUÇÕES:
- Máximo 130 caracteres
- Recomende produto relacionado
- Seja sutil, não agressivo
- Foque no benefício para o cliente
- Use "que tal" ou "você conhece"
- 1-2 emojis apenas`
    };

    return prompts[messageType as keyof typeof prompts] || prompts.future_nurturing;
  }

  // === MENSAGENS PADRÃO (FALLBACK) ===
  private getDefaultPostDeliveryMessage(firstName: string, saleData: SaleData, deliveryData: any, messageType: string): string {
    const messages = {
      satisfaction: `Oi ${firstName}! Como está seu produto? Ficou satisfeito com sua compra? Sua opinião é muito importante! ⭐`
    };

    return messages[messageType as keyof typeof messages] || messages.satisfaction;
  }

  private getDefaultNurturingMessage(firstName: string, saleData: SaleData, messageType: string): string {
    const messages = {
      future_nurturing: `Oi ${firstName}! Tudo bem? Temos algumas novidades que podem te interessar! 😊`,
      product_recommendation: `${firstName}, que tal conhecer nossos lançamentos? Temos produtos incríveis para você! ✨`
    };

    return messages[messageType as keyof typeof messages] || messages.future_nurturing;
  }

  // === MÉTODOS AUXILIARES ===
  private async cancelPreviousSequences(contactId: string) {
    // Notificar para cancelar sequências anteriores
    window.dispatchEvent(new CustomEvent('cancel_auto_sequences', {
      detail: { contactId }
    }));
  }

  private notifyTasksCreated(tasks: FollowUpTask[]) {
    // Notificar que novas tarefas foram criadas
    window.dispatchEvent(new CustomEvent('auto_tasks_created', {
      detail: { tasks }
    }));
  }

  private getStepDescription(messageType: string): string {
    const descriptions = {
      confirmation: 'Confirmação do pedido',
      satisfaction: 'Pesquisa de satisfação',
      future_nurturing: 'Nutrição sutil',
      product_recommendation: 'Recomendação de produto'
    };

    return descriptions[messageType as keyof typeof descriptions] || messageType;
  }

  private getFirstName(fullName: string): string {
    return fullName.split(' ')[0];
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private generateId(): string {
    return `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // === MONITORAMENTO DE VENDAS E ENTREGAS ===
  private startSaleMonitoring() {
    // Escutar eventos de venda do sistema
    window.addEventListener('sale_completed', (event: any) => {
      this.onSaleCompleted(event.detail);
    });

    // Escutar eventos de entrega do módulo pedidos
    window.addEventListener('order_delivered', (event: any) => {
      this.onOrderDelivered(event.detail);
    });

    // Escutar mudanças no status de pedidos
    window.addEventListener('order_status_changed', (event: any) => {
      if (event.detail.newStatus === 'delivered') {
        this.onOrderDelivered({
          contactId: event.detail.contactId,
          orderId: event.detail.orderId,
          deliveredAt: event.detail.deliveredAt || new Date().toISOString(),
          trackingCode: event.detail.trackingCode
        });
      }
    });

    // Escutar mudanças no status de tickets para detectar vendas
    window.addEventListener('ticket_status_changed', (event: any) => {
      if (event.detail.newStatus === 'closed' && event.detail.saleData) {
        this.onSaleCompleted(event.detail.saleData);
      }
    });

    console.log('👂 Monitoramento de vendas e entregas iniciado');
  }

  // === MÉTODOS PÚBLICOS ===
  
  // Método para disparar manualmente uma venda (para testes)
  public triggerSale(contactId: string, orderId: string, value: number, products: string[]) {
    const saleData: SaleData = {
      contactId,
      orderId,
      value,
      products,
      saleDate: new Date().toISOString()
    };

    this.onSaleCompleted(saleData);
  }

  // Método para disparar manualmente uma entrega (para testes)
  public triggerDelivery(contactId: string, orderId: string, trackingCode?: string) {
    const deliveryData = {
      contactId,
      orderId,
      deliveredAt: new Date().toISOString(),
      trackingCode
    };

    this.onOrderDelivered(deliveryData);
  }

  // Método para configurar sequências
  public updateSequence(sequenceId: string, updates: Partial<AutoSequenceConfig>) {
    const index = this.sequences.findIndex(s => s.id === sequenceId);
    if (index !== -1) {
      this.sequences[index] = { ...this.sequences[index], ...updates };
    }
  }

  // Método para obter estatísticas
  public getStats() {
    const activeSales = this.activeSales.size;
    const totalSequences = this.sequences.filter(s => s.active).length;
    
    return {
      activeSales,
      totalSequences,
      postSaleActive: this.sequences.find(s => s.id === 'post_sale_complete')?.active || false,
      futureNurturingActive: this.sequences.find(s => s.id === 'future_purchase_nurturing')?.active || false
    };
  }

  // Método para pausar/reativar sequências
  public toggleSequence(sequenceId: string, active: boolean) {
    const sequence = this.sequences.find(s => s.id === sequenceId);
    if (sequence) {
      sequence.active = active;
      console.log(`${active ? '▶️' : '⏸️'} Sequência ${sequence.name} ${active ? 'ativada' : 'pausada'}`);
    }
  }
}

export const AutoFollowUpService = new AutoFollowUpServiceClass();

// Disponibilizar globalmente para debug e testes
if (typeof window !== 'undefined') {
  (window as any).AutoFollowUpService = AutoFollowUpService;
  
  console.log('🤖 Sistema automático de follow-up inicializado');
  console.log('💡 Para testar: AutoFollowUpService.triggerSale("contact_123", "order_123", 299.90, ["Produto Teste"])');
}