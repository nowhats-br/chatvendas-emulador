import { ContactService } from '../../../services/ContactService';
import { AIConfigService } from '../../../services/AIConfigService';
import { FollowUpTask, FollowUpStats, FollowUpSequence, FollowUpTrigger, Priority } from '../types';

class FollowUpServiceClass {
  public tasks: FollowUpTask[] = [];
  private sequences: FollowUpSequence[] = [];
  private triggers: FollowUpTrigger[] = [];

  // Configurações anti-spam
  private readonly COOLDOWN_DAYS = 7; // Dias de cooldown entre mensagens IA
  private cooldownDays = 7; // Valor configurável

  constructor() {
    try {
      this.loadInitialData();
      this.setupDefaultSequences();
      this.setupEventListeners();
    } catch (error) {
      console.error('Erro ao inicializar FollowUpService:', error);
      // Inicialização mínima em caso de erro
      this.tasks = [];
      this.sequences = [];
      this.triggers = [];
    }
  }

  private async loadInitialData() {
    try {
      const stored = localStorage.getItem('chatvendas_followups');
      if (stored) {
        this.tasks = JSON.parse(stored);
        // Limpar tarefas antigas se não há contatos reais
        try {
          const contacts = await ContactService.getAll();
          if (contacts.length === 0) {
            console.log('🧹 Limpando tarefas antigas - sistema sem contatos reais');
            this.tasks = [];
            this.save();
          }
        } catch (error) {
          console.warn('Erro ao verificar contatos:', error);
        }
      }

      const storedSequences = localStorage.getItem('chatvendas_followup_sequences');
      if (storedSequences) {
        this.sequences = JSON.parse(storedSequences);
      }

      const storedTriggers = localStorage.getItem('chatvendas_followup_triggers');
      if (storedTriggers) {
        this.triggers = JSON.parse(storedTriggers);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do FollowUp:', error);
      this.tasks = [];
      this.sequences = [];
      this.triggers = [];
    }
  }

  public save() {
    localStorage.setItem('chatvendas_followups', JSON.stringify(this.tasks));
    localStorage.setItem('chatvendas_followup_sequences', JSON.stringify(this.sequences));
    localStorage.setItem('chatvendas_followup_triggers', JSON.stringify(this.triggers));
    window.dispatchEvent(new Event('followup-update'));
  }

  private generateId(): string {
    return `followup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private getFirstName(fullName: string): string {
    return fullName.split(' ')[0];
  }

  private daysSince(dateString: string): number {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Verificar se o contato recebeu mensagens nos últimos X dias
  private hasRecentMessages(contactId: string, days: number = 7): boolean {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      // Verificar tarefas completadas (mensagens enviadas) nos últimos X dias
      const recentTasks = this.tasks.filter(task =>
        task.contactId === contactId &&
        task.status === 'completed' &&
        task.completedAt &&
        new Date(task.completedAt) > cutoffDate
      );

      // Verificar tarefas agendadas para os próximos dias (evitar duplicação)
      const scheduledTasks = this.tasks.filter(task =>
        task.contactId === contactId &&
        task.status === 'scheduled' &&
        new Date(task.dueDate) > new Date()
      );

      const hasRecent = recentTasks.length > 0 || scheduledTasks.length > 0;

      if (hasRecent) {
        console.log(`⏭️ Pulando ${contactId} - mensagens recentes ou agendadas (últimos ${days} dias)`);
      }

      return hasRecent;
    } catch (error) {
      console.warn('Erro ao verificar mensagens recentes:', error);
      return false;
    }
  }

  // === SEQUÊNCIAS AUTOMÁTICAS ===
  private setupDefaultSequences() {
    if (this.sequences.length === 0) {
      this.sequences = [
        {
          id: 'post_sale_sequence',
          name: 'Pós-venda Completa',
          description: 'Sequência automática após finalizar venda',
          trigger: 'sale_completed',
          steps: [
            {
              id: 'step_1',
              delayDays: 1,
              messageTemplate: 'Oi {{nome}}! Seu pedido foi confirmado 🎉 Em breve você receberá o código de rastreamento!',
              type: 'text',
              priority: 'medium'
            },
            {
              id: 'step_2',
              delayDays: 7,
              messageTemplate: 'Olá {{nome}}! Como está seu pedido? Ficou satisfeito? Sua avaliação é muito importante! ⭐',
              type: 'text',
              priority: 'low'
            },
            {
              id: 'step_3',
              delayDays: 30,
              messageTemplate: 'Oi {{nome}}! Que tal dar uma olhada nas novidades? Temos produtos incríveis para você! 🛍️',
              type: 'text',
              priority: 'medium'
            }
          ],
          active: true
        },
        {
          id: 'campaign_response_sequence',
          name: 'Resposta de Campanha',
          description: 'Sequência quando cliente responde campanha mas não compra',
          trigger: 'campaign_response_no_sale',
          steps: [
            {
              id: 'step_1',
              delayDays: 2,
              messageTemplate: 'Oi {{nome}}! Vi que você demonstrou interesse. Posso esclarecer alguma dúvida? 😊',
              type: 'text',
              priority: 'high'
            },
            {
              id: 'step_2',
              delayDays: 7,
              messageTemplate: 'Olá {{nome}}! Preparei uma oferta especial só para você. Que tal conversarmos? 💎',
              type: 'text',
              priority: 'medium'
            }
          ],
          active: true
        },
        {
          id: 'abandoned_cart_sequence',
          name: 'Carrinho Abandonado',
          description: 'Recuperação de carrinho abandonado',
          trigger: 'cart_abandoned',
          steps: [
            {
              id: 'step_1',
              delayDays: 1,
              messageTemplate: 'Oi {{nome}}! Você esqueceu alguns itens no seu carrinho. Que tal finalizar? 🛒',
              type: 'text',
              priority: 'high'
            },
            {
              id: 'step_2',
              delayDays: 3,
              messageTemplate: 'Olá {{nome}}! Seus itens ainda estão reservados. Finalize agora com 10% OFF! 🎁',
              type: 'text',
              priority: 'high'
            }
          ],
          active: true
        }
      ];
      this.save();
    }
  }

  // === LISTENERS DE EVENTOS ===
  private setupEventListeners() {
    // Escutar eventos do sistema
    window.addEventListener('sale_completed', (event: any) => {
      this.handleSaleCompleted(event.detail);
    });

    window.addEventListener('campaign_response', (event: any) => {
      this.handleCampaignResponse(event.detail);
    });

    window.addEventListener('cart_abandoned', (event: any) => {
      this.handleCartAbandoned(event.detail);
    });

    window.addEventListener('message_received', (event: any) => {
      this.handleMessageReceived(event.detail);
    });
  }

  // === HANDLERS DE EVENTOS ===
  private handleSaleCompleted(data: { contactId: string, orderId: string, value: number }) {
    console.log('🎉 Venda finalizada - Iniciando sequência pós-venda:', data);
    this.createAISequence('sale_completed', data.contactId, {
      orderId: data.orderId,
      orderValue: data.value
    });
  }

  private async handleCampaignResponse(data: { contactId: string, campaignId: string, messageId: string }) {
    console.log('📱 Resposta de campanha - Verificando se houve venda:', data);

    // Verificar se houve venda nas últimas 24h
    setTimeout(async () => {
      try {
        const contacts = await ContactService.getAll();
        const contact = contacts.find(c => c.id === data.contactId);
        if (contact && contact.lastPurchaseDate) {
          const hoursSinceLastPurchase = (Date.now() - new Date(contact.lastPurchaseDate).getTime()) / (1000 * 60 * 60);

          if (hoursSinceLastPurchase > 24) {
            // Não houve venda, iniciar sequência de follow-up
            this.createAISequence('lead_cold', data.contactId, {
              campaignId: data.campaignId,
              responseMessageId: data.messageId
            });
          }
        }
      } catch (error) {
        console.error('Erro ao verificar contato:', error);
      }
    }, 24 * 60 * 60 * 1000); // Aguardar 24h
  }

  private handleCartAbandoned(data: { contactId: string, cartId: string, items: any[] }) {
    console.log('🛒 Carrinho abandonado - Iniciando recuperação:', data);
    this.createAISequence('cart_abandoned', data.contactId, {
      cartId: data.cartId,
      items: data.items
    });
  }

  // === NOVO MÉTODO PARA CRIAR SEQUÊNCIAS COM IA ===

  private async createAISequence(trigger: string, contactId: string, context: any = {}) {
    try {
      const contacts = await ContactService.getAll();
      const contact = contacts.find(c => c.id === contactId);
      if (!contact) {
        console.warn('Contato não encontrado para sequência IA:', contactId);
        return;
      }

      // Buscar sequência configurada para este trigger
      const sequences = AIConfigService.getSequences();
      const sequence = sequences.find(s => s.trigger === trigger && s.active);

      if (!sequence) {
        console.warn('Sequência IA não encontrada para trigger:', trigger);
        return;
      }

      console.log(`🤖 Criando sequência IA "${sequence.name}" para ${contact.name}`);

      // Cancelar sequências anteriores do mesmo tipo
      this.cancelSequence(contactId, `ai_${trigger}`);

      // Criar contexto rico para IA
      const aiContext = {
        contactName: contact.name,
        contactPhone: contact.phoneNumber,
        contactTags: contact.tags || [],
        ltv: contact.ltv,
        lastPurchaseDate: contact.lastPurchaseDate,
        lastPurchaseValue: contact.lastPurchaseValue,
        lastPurchaseProducts: contact.lastPurchaseProducts,
        kanbanStage: contact.kanbanStage,
        daysSinceLastPurchase: contact.lastPurchaseDate ? this.daysSince(contact.lastPurchaseDate) : undefined,
        totalPurchases: contact.totalPurchases,
        averageOrderValue: contact.averageOrderValue,
        preferredProducts: contact.preferredProducts,
        birthday: contact.birthday,
        location: contact.location,
        customFields: { ...contact.customFields, ...context }
      };

      // Criar tarefas para cada template da sequência
      for (let i = 0; i < sequence.templates.length; i++) {
        const template = sequence.templates[i];
        const delay = sequence.delays[i] || 0;
        const dueDate = this.addDays(new Date(), delay);

        try {
          // Gerar mensagem com IA
          const aiResult = await AIConfigService.generateSmartMessage(template.id, aiContext);

          const task: FollowUpTask = {
            id: this.generateId(),
            contactId: contact.id,
            contactName: contact.name,
            contactPhone: contact.phoneNumber,
            contactAvatar: contact.avatar,
            type: 'sequence_auto',
            status: delay === 0 ? 'pending' : 'scheduled',
            dueDate: dueDate.toISOString(),
            priority: 'medium',
            sequenceId: `ai_${trigger}`,
            sequenceStep: i + 1,
            sequenceStepId: template.id,
            aiReason: `IA: ${sequence.name} - ${template.name}`,
            suggestedMessage: aiResult.content,
            ltv: contact.ltv,
            context: {
              autoSend: true,
              totalSteps: sequence.templates.length,
              messageType: aiResult.type,
              buttons: aiResult.buttons,
              listItems: aiResult.listItems,
              aiGenerated: true
            }
          };

          this.tasks.push(task);
          console.log(`📝 Mensagem ${i + 1}/${sequence.templates.length} criada: ${template.name}`);
        } catch (error) {
          console.error(`Erro ao gerar mensagem ${i + 1} da sequência:`, error);
          // Criar com mensagem padrão em caso de erro
          const fallbackMessage = this.getDefaultMessage(contact, trigger);

          const task: FollowUpTask = {
            id: this.generateId(),
            contactId: contact.id,
            contactName: contact.name,
            contactPhone: contact.phoneNumber,
            contactAvatar: contact.avatar,
            type: 'sequence_auto',
            status: delay === 0 ? 'pending' : 'scheduled',
            dueDate: dueDate.toISOString(),
            priority: 'medium',
            sequenceId: `ai_${trigger}`,
            sequenceStep: i + 1,
            aiReason: `Sequência automática: ${sequence.name} (fallback)`,
            suggestedMessage: fallbackMessage,
            ltv: contact.ltv,
            context: { autoSend: true, totalSteps: sequence.templates.length }
          };

          this.tasks.push(task);
        }
      }

      this.save();
      console.log(`✅ Sequência IA "${sequence.name}" criada com ${sequence.templates.length} mensagens`);
    } catch (error) {
      console.error('Erro ao criar sequência IA:', error);
    }
  }

  private handleMessageReceived(data: { contactId: string, messageId: string, content: string }) {
    // Verificar se há sequência ativa para este contato
    const activeTasks = this.tasks.filter(t =>
      t.contactId === data.contactId &&
      t.status === 'scheduled' &&
      t.sequenceId
    );

    if (activeTasks.length > 0) {
      console.log('💬 Cliente respondeu - Pausando sequência automática:', data.contactId);
      // Pausar sequência por alguns dias quando cliente responde
      activeTasks.forEach(task => {
        task.dueDate = this.addDays(new Date(), 5).toISOString(); // Adiar 5 dias
        task.notes = (task.notes || '') + ' [Pausado - cliente respondeu]';
      });
      this.save();
    }
  }

  // === GERENCIAMENTO DE SEQUÊNCIAS ===
  public async startSequence(sequenceId: string, contactId: string, context: any = {}) {
    const sequence = this.sequences.find(s => s.id === sequenceId && s.active);
    if (!sequence) {
      console.warn('Sequência não encontrada ou inativa:', sequenceId);
      return;
    }

    try {
      const contacts = await ContactService.getAll();
      const contact = contacts.find(c => c.id === contactId);
      if (!contact) {
        console.warn('Contato não encontrado:', contactId);
        return;
      }

      console.log(`🚀 Iniciando sequência "${sequence.name}" para ${contact.name}`);

      // Cancelar sequências anteriores do mesmo tipo
      this.cancelSequence(contactId, sequenceId);

      // Criar tarefas para cada step da sequência
      sequence.steps.forEach((step, index) => {
        const dueDate = this.addDays(new Date(), step.delayDays);

        const task: FollowUpTask = {
          id: this.generateId(),
          contactId: contact.id,
          contactName: contact.name,
          contactPhone: contact.phoneNumber,
          contactAvatar: contact.avatar,
          type: 'sequence_auto',
          status: 'scheduled',
          dueDate: dueDate.toISOString(),
          priority: step.priority,
          sequenceId: sequence.id,
          sequenceStep: index + 1,
          sequenceStepId: step.id,
          aiReason: `Sequência automática: ${sequence.name} - Etapa ${index + 1}`,
          suggestedMessage: this.processMessageTemplate(step.messageTemplate, contact, context),
          ltv: contact.ltv,
          context: context
        };

        this.tasks.push(task);
      });

      this.save();
    } catch (error) {
      console.error('Erro ao iniciar sequência:', error);
    }
  }

  public cancelSequence(contactId: string, sequenceId?: string) {
    const initialCount = this.tasks.length;

    this.tasks = this.tasks.filter(task => {
      if (task.contactId === contactId && task.status === 'scheduled') {
        if (!sequenceId || task.sequenceId === sequenceId) {
          return false; // Remove
        }
      }
      return true; // Mantém
    });

    if (this.tasks.length !== initialCount) {
      console.log(`🚫 Canceladas ${initialCount - this.tasks.length} tarefas da sequência`);
      this.save();
    }
  }

  private processMessageTemplate(template: string, contact: any, context: any): string {
    const firstName = this.getFirstName(contact.name);

    return template
      .replace(/\{\{nome\}\}/g, firstName)
      .replace(/\{\{telefone\}\}/g, contact.phoneNumber)
      .replace(/\{\{valor_pedido\}\}/g, context.orderValue ? `R$ ${context.orderValue.toLocaleString()}` : '')
      .replace(/\{\{protocolo\}\}/g, context.orderId || `FU-${Date.now()}`)
      .replace(/\{\{saudacao\}\}/g, this.getGreeting());
  }

  private getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }

  // Método para gerar mensagens com IA
  private async generateAIMessage(contact: any, context: string): Promise<string> {
    try {
      if (!AIConfigService.isConfigured()) {
        // Fallback para mensagens padrão
        return this.getDefaultMessage(contact, context);
      }

      const firstName = this.getFirstName(contact.name);

      // Criar contexto rico para a IA
      const aiContext = {
        contactName: contact.name,
        contactPhone: contact.phoneNumber,
        contactTags: contact.tags || [],
        ltv: contact.ltv,
        lastPurchaseDate: contact.lastPurchaseDate,
        lastPurchaseValue: contact.lastPurchaseValue,
        lastPurchaseProducts: contact.lastPurchaseProducts,
        kanbanStage: contact.kanbanStage,
        daysSinceLastPurchase: contact.lastPurchaseDate ? this.daysSince(contact.lastPurchaseDate) : undefined,
        totalPurchases: contact.totalPurchases,
        averageOrderValue: contact.averageOrderValue,
        preferredProducts: contact.preferredProducts,
        birthday: contact.birthday,
        location: contact.location,
        customFields: contact.customFields
      };

      // Mapear contexto para template ID
      const templateMap: Record<string, string> = {
        'vip_inactive': 'vip_reactivation',
        'kanban_stuck': 'lead_nurturing',
        'cold_lead': 'lead_nurturing',
        'post_sale': 'post_sale_satisfaction',
        'vip_attention': 'vip_reactivation',
        'sale_completed': 'post_sale_confirmation',
        'cart_abandoned': 'cart_abandoned_recovery',
        'birthday': 'birthday_celebration'
      };

      const templateId = templateMap[context] || 'lead_nurturing';

      // Gerar mensagem inteligente
      const result = await AIConfigService.generateSmartMessage(templateId, aiContext);

      return result.content;
    } catch (error) {
      console.warn('Erro ao gerar mensagem com IA, usando padrão:', error);
      return this.getDefaultMessage(contact, context);
    }
  }

  private getDefaultMessage(contact: any, context: string): string {
    const firstName = this.getFirstName(contact.name);

    const messages = {
      'vip_inactive': `Oi ${firstName}! Sentimos sua falta 😊 Que tal dar uma olhada nas novidades? Temos uma surpresa especial para você!`,
      'kanban_stuck': `Oi ${firstName}! Como está nossa conversa? Posso esclarecer alguma dúvida para você? 🤝`,
      'cold_lead': `Olá ${firstName}! Vi que você demonstrou interesse em nossos produtos. Posso te ajudar com alguma informação? 😊`,
      'post_sale': `Oi ${firstName}! Como está seu pedido? Ficou satisfeito? Sua opinião é muito importante para nós! ⭐`,
      'vip_attention': `${firstName}, como cliente VIP você tem acesso exclusivo às nossas melhores ofertas! Vamos conversar? 👑`
    };

    return messages[context as keyof typeof messages] || `Oi ${firstName}! Como posso ajudar você hoje? 😊`;
  }

  // === PROCESSAMENTO AUTOMÁTICO ===
  public async processScheduledTasks() {
    try {
      const now = new Date();
      const dueTasks = this.tasks.filter(t =>
        t.status === 'scheduled' &&
        new Date(t.dueDate) <= now
      );

      console.log(`⏰ Processando ${dueTasks.length} tarefas agendadas`);

      for (const task of dueTasks) {
        // Verificar se deve enviar automaticamente
        if (task.context?.autoSend && task.suggestedMessage) {
          try {
            console.log(`📤 Enviando mensagem automática para ${task.contactName}`);

            const success = await this.sendAutomaticMessage(task);

            if (success) {
              task.status = 'completed';
              task.completedAt = now.toISOString();
              task.sentAt = now.toISOString();
              task.notes = (task.notes || '') + ` [Enviado automaticamente em ${now.toLocaleString('pt-BR')}]`;
              console.log(`✅ Mensagem enviada automaticamente para ${task.contactName}`);
            } else {
              // Se falhou o envio, muda para pendente para revisão manual
              task.status = 'pending';
              task.notes = (task.notes || '') + ` [Falha no envio automático - requer ação manual]`;
              console.log(`❌ Falha no envio automático para ${task.contactName} - movido para pendente`);
            }
          } catch (error: any) {
            console.error(`Erro no envio automático para ${task.contactName}:`, error);
            task.status = 'pending';
            task.notes = (task.notes || '') + ` [Erro no envio automático: ${error.message}]`;
          }
        } else {
          // Sem envio automático, apenas muda para pendente
          task.status = 'pending';
          task.notes = (task.notes || '') + ` [Agendamento atingido em ${now.toLocaleString('pt-BR')}]`;
        }
      }

      if (dueTasks.length > 0) {
        this.save();
      }

      return dueTasks.length;
    } catch (error) {
      console.error('Erro ao processar tarefas agendadas:', error);
      return 0;
    }
  }

  private async sendAutomaticMessage(task: FollowUpTask): Promise<boolean> {
    try {
      const messageType = task.context?.messageType || 'text';
      let messageData: any = {
        phoneNumber: task.contactPhone,
        messageType: messageType,
        content: {}
      };

      // Configurar conteúdo baseado no tipo
      if (messageType === 'text') {
        messageData.content = { text: task.suggestedMessage };
      }
      else if (messageType === 'buttons' && task.context?.buttons) {
        messageData.content = {
          text: task.suggestedMessage,
          buttons: task.context.buttons,
          footer: task.context.footer
        };
      }
      else if (messageType === 'list' && task.context?.listItems) {
        messageData.content = {
          text: task.suggestedMessage,
          buttonText: task.context.buttonText || 'Ver Opções',
          footer: task.context.footer,
          sections: task.context.listItems
        };
      }
      else if (messageType === 'carousel' && task.context?.cards) {
        messageData.content = task.context.cards;
      }
      else if (['image', 'video', 'audio'].includes(messageType)) {
        messageData.content = {
          caption: task.suggestedMessage,
          url: task.context?.mediaUrl
        };
      }
      else {
        messageData.content = { text: task.suggestedMessage };
      }

      const response = await fetch('http://127.0.0.1:3010/api/messages/send-quick', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        // Criar ticket automaticamente se a mensagem foi enviada
        try {
          const ticketId = await this.createFollowUpTicket(task.contactId, 'default');
          if (ticketId) {
            task.ticketId = ticketId;
          }
        } catch (ticketError) {
          console.warn('Erro ao criar ticket automático:', ticketError);
        }

        return true;
      } else {
        const errorData = await response.text();
        console.error('Erro na API de envio:', errorData);
        return false;
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem automática:', error);
      return false;
    }
  }

  // === NOVOS MÉTODOS PARA AGENDAMENTO COM ENVIO AUTOMÁTICO ===

  async createScheduledMessage(data: {
    contactId: string;
    contactName: string;
    contactPhone: string;
    contactAvatar: string;
    message: string;
    scheduledDate: string;
    priority: Priority;
    notes?: string;
    autoSend: boolean;
  }) {
    const task: FollowUpTask = {
      id: this.generateId(),
      contactId: data.contactId,
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      contactAvatar: data.contactAvatar,
      type: 'manual',
      status: 'scheduled',
      dueDate: data.scheduledDate,
      priority: data.priority,
      notes: data.notes,
      aiReason: 'Agendamento Manual com Envio Automático',
      suggestedMessage: data.message,
      context: { autoSend: data.autoSend }
    };

    this.tasks.push(task);
    this.save();

    console.log(`📅 Mensagem agendada para ${new Date(data.scheduledDate).toLocaleString('pt-BR')} - ${data.contactName}`);
    return task;
  }

  async createMessageSequence(data: {
    contactId: string;
    contactName: string;
    contactPhone: string;
    contactAvatar: string;
    messages: Array<{
      message: string;
      delayDays: number;
      delayHours: number;
      delayMinutes: number;
    }>;
    priority: Priority;
    notes?: string;
    autoSend: boolean;
  }) {
    const sequenceId = `seq_${Date.now()}`;
    const now = new Date();
    const tasks: FollowUpTask[] = [];

    data.messages.forEach((msg, index) => {
      let scheduledDate: Date;

      if (index === 0) {
        // Primeira mensagem: imediata (ou com delay mínimo)
        scheduledDate = new Date(now.getTime() + (msg.delayMinutes * 60 * 1000));
      } else {
        // Mensagens subsequentes: baseadas no delay
        const totalMinutes = (msg.delayDays * 24 * 60) + (msg.delayHours * 60) + msg.delayMinutes;
        scheduledDate = new Date(now.getTime() + (totalMinutes * 60 * 1000));
      }

      const task: FollowUpTask = {
        id: this.generateId(),
        contactId: data.contactId,
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        contactAvatar: data.contactAvatar,
        type: 'sequence_auto',
        status: 'scheduled',
        dueDate: scheduledDate.toISOString(),
        priority: data.priority,
        notes: data.notes,
        aiReason: `Sequência Automática - Mensagem ${index + 1}/${data.messages.length}`,
        suggestedMessage: msg.message,
        sequenceId: sequenceId,
        sequenceStep: index + 1,
        context: { autoSend: data.autoSend, totalSteps: data.messages.length }
      };

      tasks.push(task);
    });

    this.tasks.push(...tasks);
    this.save();

    console.log(`🔄 Sequência de ${data.messages.length} mensagens criada para ${data.contactName}`);
    return tasks;
  }

  // === MÉTODOS PÚBLICOS EXISTENTES ===
  async generateAiTasks() {
    try {
      const contacts = await ContactService.getAll();

      // Se não há contatos, não gerar tarefas
      if (contacts.length === 0) {
        console.log('📭 Nenhum contato encontrado - não há dados para análise da IA');
        return;
      }

      // Verificar se a IA está configurada
      if (!AIConfigService.isConfigured()) {
        console.log('🤖 IA não configurada - usando mensagens padrão');
      }

      const newTasks: FollowUpTask[] = [];
      const now = new Date();
      let contactsProcessed = 0;
      let contactsSkipped = 0;

      console.log(`🔍 IA analisando ${contacts.length} contatos para oportunidades...`);

      // Processar contatos sequencialmente para aguardar IA
      for (const contact of contacts) {
        try {
          // REGRA ANTI-SPAM: Pular contatos que receberam mensagens nos últimos X dias
          if (this.hasRecentMessages(contact.id, this.cooldownDays)) {
            contactsSkipped++;
            continue; // Pular este contato
          }

          contactsProcessed++;
          const firstName = this.getFirstName(contact.name);

          // 1. REGRA: Cliente VIP Inativo (LTV alto + sem compra recente)
          if (contact.ltv > 800 && contact.lastPurchaseDate) {
            const daysSinceLastPurchase = this.daysSince(contact.lastPurchaseDate);

            if (daysSinceLastPurchase > 30) {
              const aiMessage = await this.generateAIMessage(contact, 'vip_inactive');

              newTasks.push({
                id: this.generateId(),
                contactId: contact.id,
                contactName: contact.name,
                contactPhone: contact.phoneNumber,
                contactAvatar: contact.avatar,
                type: 'ai_recovery',
                status: 'pending',
                dueDate: now.toISOString(),
                priority: contact.ltv > 2000 ? 'high' : 'medium',
                aiReason: `Cliente VIP (LTV R$ ${contact.ltv.toLocaleString()}) sem compras há ${daysSinceLastPurchase} dias`,
                suggestedMessage: aiMessage,
                ltv: contact.ltv
              });
            }
          }

          // 2. REGRA: Travado no Funil de Vendas
          if (contact.kanbanStage === 'negotiation' || contact.kanbanStage === 'proposal') {
            const aiMessage = await this.generateAIMessage(contact, 'kanban_stuck');

            newTasks.push({
              id: this.generateId(),
              contactId: contact.id,
              contactName: contact.name,
              contactPhone: contact.phoneNumber,
              contactAvatar: contact.avatar,
              type: 'kanban_stuck',
              status: 'pending',
              dueDate: this.addDays(now, 1).toISOString(),
              priority: 'medium',
              aiReason: `Parado na etapa "${contact.kanbanStage}" - precisa de follow-up`,
              suggestedMessage: aiMessage,
              kanbanStage: contact.kanbanStage
            });
          }

          // 3. REGRA: Leads Frios (sem interação)
          if (contact.kanbanStage === 'lead' && contact.status === 'active') {
            const aiMessage = await this.generateAIMessage(contact, 'cold_lead');

            newTasks.push({
              id: this.generateId(),
              contactId: contact.id,
              contactName: contact.name,
              contactPhone: contact.phoneNumber,
              contactAvatar: contact.avatar,
              type: 'cold_lead',
              status: 'pending',
              dueDate: this.addDays(now, 2).toISOString(),
              priority: 'low',
              aiReason: 'Lead sem interação - oportunidade de aquecimento',
              suggestedMessage: aiMessage
            });
          }

          // 4. REGRA: Pós-venda (clientes recentes)
          if (contact.lastPurchaseDate) {
            const daysSinceLastPurchase = this.daysSince(contact.lastPurchaseDate);

            if (daysSinceLastPurchase >= 7 && daysSinceLastPurchase <= 15) {
              const aiMessage = await this.generateAIMessage(contact, 'post_sale');

              newTasks.push({
                id: this.generateId(),
                contactId: contact.id,
                contactName: contact.name,
                contactPhone: contact.phoneNumber,
                contactAvatar: contact.avatar,
                type: 'post_sale',
                status: 'pending',
                dueDate: this.addDays(now, 1).toISOString(),
                priority: 'low',
                aiReason: `Comprou há ${daysSinceLastPurchase} dias - momento ideal para feedback`,
                suggestedMessage: aiMessage
              });
            }
          }

          // 5. REGRA: Clientes com Tags VIP
          if (contact.tags.includes('VIP') && !contact.lastPurchaseDate) {
            const aiMessage = await this.generateAIMessage(contact, 'vip_attention');

            newTasks.push({
              id: this.generateId(),
              contactId: contact.id,
              contactName: contact.name,
              contactPhone: contact.phoneNumber,
              contactAvatar: contact.avatar,
              type: 'vip_attention',
              status: 'pending',
              dueDate: now.toISOString(),
              priority: 'high',
              aiReason: 'Cliente VIP sem histórico de compras - atenção especial necessária',
              suggestedMessage: aiMessage,
              ltv: contact.ltv
            });
          }
        } catch (error: any) {
          console.warn(`Erro ao processar contato ${contact.name}:`, error);
        }
      }

      // Remover duplicatas por contactId
      const uniqueTasks = newTasks.filter((task, index, self) =>
        index === self.findIndex(t => t.contactId === task.contactId && t.type === task.type)
      );

      if (uniqueTasks.length === 0) {
        console.log(`✅ IA analisou ${contactsProcessed} contatos (${contactsSkipped} em cooldown) - Nenhuma oportunidade crítica encontrada`);
        return;
      }

      console.log(`🎯 IA detectou ${uniqueTasks.length} oportunidades de follow-up (${contactsProcessed} analisados, ${contactsSkipped} em cooldown de ${this.cooldownDays} dias)`);
      this.tasks = [...this.tasks, ...uniqueTasks];
      this.save();
    } catch (error) {
      console.error('Erro ao gerar tarefas de IA:', error);
    }
  }

  getAll(): FollowUpTask[] {
    try {
      return [...this.tasks].sort((a, b) => {
        // Prioridade: high > medium > low
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;

        // Depois por data (mais antigos primeiro)
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    } catch (error) {
      console.error('Erro ao obter tarefas:', error);
      return [];
    }
  }

  getStats(): FollowUpStats {
    try {
      const pending = this.tasks.filter(t => t.status === 'pending');
      const scheduled = this.tasks.filter(t => t.status === 'scheduled');
      const today = new Date().toDateString();
      const completedToday = this.tasks.filter(t =>
        t.status === 'completed' &&
        t.completedAt &&
        new Date(t.completedAt).toDateString() === today
      ).length;

      // Calcula potencial de recuperação (soma LTV dos pendentes de alta prioridade)
      const recoveryPotential = [...pending, ...scheduled]
        .filter(t => t.priority === 'high' && t.ltv)
        .reduce((acc, curr) => acc + (curr.ltv || 0), 0);

      return {
        pending: pending.length,
        scheduled: scheduled.length,
        completedToday,
        highPriority: [...pending, ...scheduled].filter(t => t.priority === 'high').length,
        recoveryPotential,
        activeSequences: this.getActiveSequencesCount()
      };
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      return {
        pending: 0,
        scheduled: 0,
        completedToday: 0,
        highPriority: 0,
        recoveryPotential: 0,
        activeSequences: 0
      };
    }
  }

  private getActiveSequencesCount(): number {
    const activeContacts = new Set(
      this.tasks
        .filter(t => t.status === 'scheduled' && t.sequenceId)
        .map(t => t.contactId)
    );
    return activeContacts.size;
  }

  completeTask(id: string) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.status = 'completed';
      task.completedAt = new Date().toISOString();

      // Se faz parte de uma sequência, cancelar próximos steps
      if (task.sequenceId) {
        this.cancelSequence(task.contactId, task.sequenceId);
      }

      this.save();
    }
  }

  snoozeTask(id: string, days: number) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      const date = new Date();
      date.setDate(date.getDate() + days);
      task.dueDate = date.toISOString();
      this.save();
    }
  }

  createManualTask(data: Partial<FollowUpTask>) {
    const newTask: FollowUpTask = {
      id: this.generateId(),
      contactId: data.contactId!,
      contactName: data.contactName!,
      contactPhone: data.contactPhone!,
      contactAvatar: data.contactAvatar || '',
      type: 'manual',
      status: 'pending',
      dueDate: data.dueDate || new Date().toISOString(),
      priority: data.priority || 'medium',
      notes: data.notes,
      aiReason: 'Agendamento Manual'
    };
    this.tasks.push(newTask);
    this.save();
    return newTask;
  }

  // Novo método para criar ticket quando mensagem é respondida
  async createFollowUpTicket(contactId: string, instanceId: string): Promise<string | null> {
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact_id: contactId,
          instance_id: instanceId,
          subject: 'Follow-up Respondido',
          priority: 'normal',
          origin: 'followup',
          tags: ['follow-up']
        }),
      });

      if (response.ok) {
        const ticket = await response.json();
        return ticket.id;
      }
      return null;
    } catch (error) {
      console.error('Erro ao criar ticket de follow-up:', error);
      return null;
    }
  }

  // Método para enviar mensagem com criação automática de ticket
  async sendFollowUpMessage(taskId: string, messageData: any): Promise<boolean> {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return false;

    try {
      // Enviar mensagem via API send-quick
      const response = await fetch('http://localhost:3010/api/messages/send-quick', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: task.contactPhone,
          messageType: messageData.type,
          content: messageData.content
        }),
      });

      if (response.ok) {
        // Marcar tarefa como enviada
        task.status = 'completed';
        task.completedAt = new Date().toISOString();
        this.save();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao enviar mensagem de follow-up:', error);
      return false;
    }
  }

  // === MÉTODOS PÚBLICOS PARA EVENTOS ===
  public triggerSaleCompleted(contactId: string, orderId: string, value: number, products?: string[]) {
    window.dispatchEvent(new CustomEvent('sale_completed', {
      detail: { contactId, orderId, value, products }
    }));
  }

  public triggerCampaignResponse(contactId: string, campaignId: string, messageId: string) {
    window.dispatchEvent(new CustomEvent('campaign_response', {
      detail: { contactId, campaignId, messageId }
    }));
  }

  public triggerCartAbandoned(contactId: string, cartId: string, items: any[], totalValue: number) {
    window.dispatchEvent(new CustomEvent('cart_abandoned', {
      detail: { contactId, cartId, items, totalValue }
    }));
  }

  public triggerMessageReceived(contactId: string, messageId: string, content: string) {
    window.dispatchEvent(new CustomEvent('message_received', {
      detail: { contactId, messageId, content }
    }));
  }

  public triggerBirthday(contactId: string) {
    window.dispatchEvent(new CustomEvent('birthday', {
      detail: { contactId }
    }));
  }

  // === MÉTODO PARA CRIAR SEQUÊNCIA MANUAL COM IA ===

  public async createManualAISequence(contactId: string, trigger: string, customContext?: any) {
    try {
      await this.createAISequence(trigger, contactId, customContext);
      console.log(`🎯 Sequência IA manual criada: ${trigger} para contato ${contactId}`);
    } catch (error) {
      console.error('Erro ao criar sequência IA manual:', error);
      throw error;
    }
  }

  // === GERENCIAMENTO DE SEQUÊNCIAS ===
  public getSequences(): FollowUpSequence[] {
    return [...this.sequences];
  }

  public getActiveSequences(): FollowUpSequence[] {
    return this.sequences.filter(s => s.active);
  }

  public updateSequence(sequenceId: string, updates: Partial<FollowUpSequence>) {
    const index = this.sequences.findIndex(s => s.id === sequenceId);
    if (index !== -1) {
      this.sequences[index] = { ...this.sequences[index], ...updates };
      this.save();
    }
  }

  public getTasksBySequence(sequenceId: string): FollowUpTask[] {
    return this.tasks.filter(t => t.sequenceId === sequenceId);
  }

  // Limpar tarefas antigas completadas (mais de 30 dias)
  cleanupOldTasks() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const initialCount = this.tasks.length;
    this.tasks = this.tasks.filter(task => {
      if (task.status === 'completed' && task.completedAt) {
        return new Date(task.completedAt) > thirtyDaysAgo;
      }
      return true;
    });

    if (this.tasks.length !== initialCount) {
      this.save();
      console.log(`Limpeza: ${initialCount - this.tasks.length} tarefas antigas removidas`);
    }
  }

  // Novo método: Limpar TODAS as tarefas (útil para reset completo)
  clearAllTasks() {
    this.tasks = [];
    this.save();
    console.log('🧹 Todas as tarefas foram removidas');
  }

  // === CONFIGURAÇÕES ANTI-SPAM ===

  // Configurar período de cooldown entre mensagens IA
  setCooldownDays(days: number) {
    if (days < 1 || days > 30) {
      console.warn('Cooldown deve estar entre 1 e 30 dias');
      return;
    }
    this.cooldownDays = days;
    console.log(`⏰ Cooldown configurado para ${days} dias`);
  }

  // Obter período de cooldown atual
  getCooldownDays(): number {
    return this.cooldownDays;
  }

  // Verificar se um contato específico está em cooldown
  isContactInCooldown(contactId: string): boolean {
    return this.hasRecentMessages(contactId, this.cooldownDays);
  }

  // Obter estatísticas de cooldown
  getCooldownStats() {
    try {
      const contacts = this.tasks.map(t => t.contactId);
      const uniqueContacts = [...new Set(contacts)];
      const contactsInCooldown = uniqueContacts.filter(contactId =>
        this.hasRecentMessages(contactId, this.cooldownDays)
      );

      return {
        totalContacts: uniqueContacts.length,
        contactsInCooldown: contactsInCooldown.length,
        contactsAvailable: uniqueContacts.length - contactsInCooldown.length,
        cooldownDays: this.cooldownDays
      };
    } catch (error) {
      console.error('Erro ao calcular estatísticas de cooldown:', error);
      return {
        totalContacts: 0,
        contactsInCooldown: 0,
        contactsAvailable: 0,
        cooldownDays: this.cooldownDays
      };
    }
  }

  // === INICIALIZAÇÃO AUTOMÁTICA ===
  public startAutomation() {
    try {
      // Processar tarefas agendadas a cada 30 segundos para maior precisão
      setInterval(() => {
        this.processScheduledTasks();
      }, 30000); // 30 segundos

      // Limpeza automática diária
      setInterval(() => {
        this.cleanupOldTasks();
      }, 24 * 60 * 60 * 1000); // 24 horas

      console.log('🤖 Follow-up automático iniciado (processamento a cada 30s)');
    } catch (error) {
      console.error('Erro ao iniciar automação:', error);
    }
  }
}

export const FollowUpService = new FollowUpServiceClass();

// Iniciar automação quando o serviço for carregado
if (typeof window !== 'undefined') {
  try {
    FollowUpService.startAutomation();
    console.log('🤖 Sistema de follow-up iniciado');
  } catch (error) {
    console.warn('Erro ao iniciar automação do FollowUp:', error);
  }
}
