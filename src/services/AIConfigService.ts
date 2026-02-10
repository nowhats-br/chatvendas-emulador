export interface AIProvider {
  id: 'openai' | 'gemini';
  name: string;
  description: string;
  apiKeyLabel: string;
  modelOptions: string[];
  defaultModel: string;
}

export interface AIConfig {
  provider: 'openai' | 'gemini';
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  enabled: boolean;
}

export interface AIMessageTemplate {
  id: string;
  name: string;
  type: 'text' | 'buttons' | 'list' | 'image' | 'video';
  context: string; // Contexto para quando usar este template
  prompt: string; // Prompt para a IA
  variables: string[]; // Variáveis disponíveis: nome, produto, valor, etc.
  active: boolean;
}

export interface AISequenceConfig {
  id: string;
  name: string;
  trigger: 'sale_completed' | 'cart_abandoned' | 'lead_cold' | 'vip_inactive' | 'birthday' | 'follow_up';
  templates: AIMessageTemplate[];
  delays: number[]; // Delays em dias para cada mensagem
  active: boolean;
}

export interface AIPersonalizationRules {
  useFirstName: boolean;
  greetingByTime: boolean; // Bom dia, boa tarde, boa noite
  emojiLevel: 'none' | 'low' | 'medium' | 'high';
  toneOfVoice: 'formal' | 'casual' | 'friendly' | 'professional';
  maxMessageLength: number;
  includeCompanyName: boolean;
  companyName?: string;
}

export interface AIMessageContext {
  contactName: string;
  contactPhone: string;
  contactTags: string[];
  ltv?: number;
  lastPurchaseDate?: string;
  lastPurchaseValue?: number;
  lastPurchaseProducts?: string[];
  kanbanStage?: string;
  daysSinceLastPurchase?: number;
  totalPurchases?: number;
  averageOrderValue?: number;
  preferredProducts?: string[];
  birthday?: string;
  location?: string;
  customFields?: Record<string, any>;
}

class AIConfigServiceClass {
  private config: AIConfig | null = null;
  private templates: AIMessageTemplate[] = [];
  private sequences: AISequenceConfig[] = [];
  private personalization: AIPersonalizationRules = {
    useFirstName: true,
    greetingByTime: true,
    emojiLevel: 'medium',
    toneOfVoice: 'friendly',
    maxMessageLength: 300,
    includeCompanyName: false,
    companyName: ''
  };

  constructor() {
    try {
      this.loadConfig();
      this.setupDefaultTemplates();
      this.setupDefaultSequences();
    } catch (error) {
      console.warn('Erro ao inicializar AIConfigService:', error);
      this.config = null;
    }
  }

  private loadConfig() {
    try {
      const stored = localStorage.getItem('chatvendas_ai_config');
      if (stored) {
        this.config = JSON.parse(stored);
      }

      const storedTemplates = localStorage.getItem('chatvendas_ai_templates');
      if (storedTemplates) {
        this.templates = JSON.parse(storedTemplates);
      }

      const storedSequences = localStorage.getItem('chatvendas_ai_sequences');
      if (storedSequences) {
        this.sequences = JSON.parse(storedSequences);
      }

      const storedPersonalization = localStorage.getItem('chatvendas_ai_personalization');
      if (storedPersonalization) {
        this.personalization = { ...this.personalization, ...JSON.parse(storedPersonalization) };
      }
    } catch (error) {
      console.warn('Erro ao carregar configuração de IA:', error);
      this.config = null;
    }
  }

  private save() {
    try {
      if (this.config) {
        localStorage.setItem('chatvendas_ai_config', JSON.stringify(this.config));
      }
      localStorage.setItem('chatvendas_ai_templates', JSON.stringify(this.templates));
      localStorage.setItem('chatvendas_ai_sequences', JSON.stringify(this.sequences));
      localStorage.setItem('chatvendas_ai_personalization', JSON.stringify(this.personalization));
      window.dispatchEvent(new Event('ai-config-update'));
    } catch (error) {
      console.error('Erro ao salvar configuração de IA:', error);
    }
  }

  getProviders(): AIProvider[] {
    return [
      {
        id: 'openai',
        name: 'OpenAI (ChatGPT)',
        description: 'GPT-3.5 Turbo, GPT-4, GPT-4 Turbo',
        apiKeyLabel: 'OpenAI API Key',
        modelOptions: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo-preview'],
        defaultModel: 'gpt-3.5-turbo'
      },
      {
        id: 'gemini',
        name: 'Google Gemini',
        description: 'Gemini Pro, Gemini Pro Vision',
        apiKeyLabel: 'Google AI API Key',
        modelOptions: ['gemini-pro', 'gemini-pro-vision'],
        defaultModel: 'gemini-pro'
      }
    ];
  }

  getConfig(): AIConfig | null {
    return this.config;
  }

  isConfigured(): boolean {
    try {
      return this.config !== null && this.config.enabled && this.config.apiKey.length > 0;
    } catch (error) {
      console.warn('Erro ao verificar configuração de IA:', error);
      return false;
    }
  }

  updateConfig(config: AIConfig) {
    this.config = config;
    this.save();
  }

  clearConfig() {
    this.config = null;
    localStorage.removeItem('chatvendas_ai_config');
    window.dispatchEvent(new Event('ai-config-update'));
  }

  // === MÉTODOS PARA TEMPLATES ===
  
  private setupDefaultTemplates() {
    if (this.templates.length === 0) {
      this.templates = [
        {
          id: 'post_sale_confirmation',
          name: 'Confirmação Pós-Venda',
          type: 'text',
          context: 'sale_completed',
          prompt: `Gere uma mensagem de confirmação de venda personalizada e amigável.
Contexto: Cliente {{nome}} acabou de comprar {{produtos}} por {{valor}}.
Inclua: agradecimento, confirmação do pedido, próximos passos.
Tom: {{toneOfVoice}}, máximo {{maxLength}} caracteres.`,
          variables: ['nome', 'produtos', 'valor', 'protocolo'],
          active: true
        },
        {
          id: 'post_sale_satisfaction',
          name: 'Pesquisa de Satisfação',
          type: 'buttons',
          context: 'sale_completed_7days',
          prompt: `Gere uma mensagem pedindo feedback sobre a compra.
Cliente: {{nome}}, comprou há 7 dias: {{produtos}}.
Inclua: pergunta sobre satisfação, botões de avaliação.
Tom: {{toneOfVoice}}, use emojis {{emojiLevel}}.`,
          variables: ['nome', 'produtos', 'dataCompra'],
          active: true
        },
        {
          id: 'cart_abandoned_recovery',
          name: 'Recuperação Carrinho Abandonado',
          type: 'buttons',
          context: 'cart_abandoned',
          prompt: `Gere mensagem para recuperar carrinho abandonado.
Cliente: {{nome}}, abandonou carrinho com {{produtos}} ({{valor}}).
Inclua: lembrete gentil, urgência sutil, botão para finalizar.
Tom: {{toneOfVoice}}, máximo {{maxLength}} caracteres.`,
          variables: ['nome', 'produtos', 'valor', 'desconto'],
          active: true
        },
        {
          id: 'vip_reactivation',
          name: 'Reativação Cliente VIP',
          type: 'list',
          context: 'vip_inactive',
          prompt: `Gere mensagem para reativar cliente VIP inativo.
Cliente: {{nome}}, LTV: {{ltv}}, última compra há {{diasUltimaCompra}} dias.
Inclua: reconhecimento VIP, ofertas exclusivas, lista de produtos.
Tom: {{toneOfVoice}}, use emojis {{emojiLevel}}.`,
          variables: ['nome', 'ltv', 'diasUltimaCompra', 'produtosPreferidos'],
          active: true
        },
        {
          id: 'lead_nurturing',
          name: 'Nutrição de Lead',
          type: 'text',
          context: 'lead_cold',
          prompt: `Gere mensagem para aquecer lead frio.
Lead: {{nome}}, sem compras, tags: {{tags}}.
Inclua: valor educativo, dica útil, call-to-action suave.
Tom: {{toneOfVoice}}, máximo {{maxLength}} caracteres.`,
          variables: ['nome', 'tags', 'interesse'],
          active: true
        },
        {
          id: 'birthday_celebration',
          name: 'Parabéns Aniversário',
          type: 'buttons',
          context: 'birthday',
          prompt: `Gere mensagem de aniversário personalizada.
Cliente: {{nome}}, aniversário hoje, histórico: {{totalCompras}} compras.
Inclua: parabéns calorosos, oferta especial, botão para usar desconto.
Tom: {{toneOfVoice}}, use muitos emojis festivos.`,
          variables: ['nome', 'totalCompras', 'descontoAniversario'],
          active: true
        }
      ];
      this.save();
    }
  }

  private setupDefaultSequences() {
    if (this.sequences.length === 0) {
      this.sequences = [
        {
          id: 'post_sale_complete',
          name: 'Sequência Pós-Venda Completa',
          trigger: 'sale_completed',
          templates: [
            this.templates.find(t => t.id === 'post_sale_confirmation')!,
            this.templates.find(t => t.id === 'post_sale_satisfaction')!
          ],
          delays: [0, 7], // Imediato e 7 dias
          active: true
        },
        {
          id: 'cart_recovery_sequence',
          name: 'Recuperação Carrinho Abandonado',
          trigger: 'cart_abandoned',
          templates: [
            this.templates.find(t => t.id === 'cart_abandoned_recovery')!
          ],
          delays: [1], // 1 dia após abandono
          active: true
        },
        {
          id: 'vip_reactivation_sequence',
          name: 'Reativação Cliente VIP',
          trigger: 'vip_inactive',
          templates: [
            this.templates.find(t => t.id === 'vip_reactivation')!
          ],
          delays: [0], // Imediato
          active: true
        },
        {
          id: 'lead_nurturing_sequence',
          name: 'Nutrição de Leads Frios',
          trigger: 'lead_cold',
          templates: [
            this.templates.find(t => t.id === 'lead_nurturing')!
          ],
          delays: [3], // 3 dias
          active: true
        },
        {
          id: 'birthday_sequence',
          name: 'Sequência Aniversário',
          trigger: 'birthday',
          templates: [
            this.templates.find(t => t.id === 'birthday_celebration')!
          ],
          delays: [0], // No dia do aniversário
          active: true
        }
      ];
      this.save();
    }
  }

  // Getters para templates e sequências
  getTemplates(): AIMessageTemplate[] {
    return [...this.templates];
  }

  getSequences(): AISequenceConfig[] {
    return [...this.sequences];
  }

  getPersonalization(): AIPersonalizationRules {
    return { ...this.personalization };
  }

  // Setters
  updatePersonalization(rules: Partial<AIPersonalizationRules>) {
    this.personalization = { ...this.personalization, ...rules };
    this.save();
  }

  updateTemplate(templateId: string, updates: Partial<AIMessageTemplate>) {
    const index = this.templates.findIndex(t => t.id === templateId);
    if (index !== -1) {
      this.templates[index] = { ...this.templates[index], ...updates };
      this.save();
    }
  }

  updateSequence(sequenceId: string, updates: Partial<AISequenceConfig>) {
    const index = this.sequences.findIndex(s => s.id === sequenceId);
    if (index !== -1) {
      this.sequences[index] = { ...this.sequences[index], ...updates };
      this.save();
    }
  }

  // Método para fazer chamadas à API de IA
  async generateText(prompt: string, context?: any): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('IA não configurada. Configure uma API key primeiro.');
    }

    const config = this.config!;

    try {
      if (config.provider === 'openai') {
        return await this.callOpenAI(prompt, context);
      } else if (config.provider === 'gemini') {
        return await this.callGemini(prompt, context);
      }
      
      throw new Error('Provedor de IA não suportado');
    } catch (error) {
      console.error('Erro ao gerar texto com IA:', error);
      throw error;
    }
  }

  // === MÉTODO PRINCIPAL PARA GERAR MENSAGENS INTELIGENTES ===
  
  async generateSmartMessage(
    templateId: string, 
    context: AIMessageContext, 
    customPrompt?: string
  ): Promise<{ content: string; type: string; buttons?: any[]; listItems?: any[] }> {
    if (!this.isConfigured()) {
      return this.getFallbackMessage(templateId, context);
    }

    const template = this.templates.find(t => t.id === templateId);
    if (!template || !template.active) {
      return this.getFallbackMessage(templateId, context);
    }

    try {
      // Processar prompt com variáveis
      const processedPrompt = this.processPromptVariables(
        customPrompt || template.prompt, 
        context
      );

      // Gerar conteúdo com IA
      const aiContent = await this.generateText(processedPrompt, context);

      // Processar baseado no tipo de mensagem
      return this.processAIResponse(aiContent, template.type, context);
    } catch (error) {
      console.error('Erro ao gerar mensagem inteligente:', error);
      return this.getFallbackMessage(templateId, context);
    }
  }

  private processPromptVariables(prompt: string, context: AIMessageContext): string {
    const firstName = this.getFirstName(context.contactName);
    const greeting = this.personalization.greetingByTime ? this.getTimeBasedGreeting() : '';
    const companyName = this.personalization.includeCompanyName ? this.personalization.companyName : '';

    let processedPrompt = prompt
      .replace(/\{\{nome\}\}/g, firstName)
      .replace(/\{\{nomeCompleto\}\}/g, context.contactName)
      .replace(/\{\{telefone\}\}/g, context.contactPhone)
      .replace(/\{\{saudacao\}\}/g, greeting)
      .replace(/\{\{empresa\}\}/g, companyName || '')
      .replace(/\{\{toneOfVoice\}\}/g, this.personalization.toneOfVoice)
      .replace(/\{\{emojiLevel\}\}/g, this.personalization.emojiLevel)
      .replace(/\{\{maxLength\}\}/g, this.personalization.maxMessageLength.toString());

    // Variáveis específicas do contexto
    if (context.ltv) {
      processedPrompt = processedPrompt.replace(/\{\{ltv\}\}/g, `R$ ${context.ltv.toLocaleString('pt-BR')}`);
    }

    if (context.lastPurchaseValue) {
      processedPrompt = processedPrompt.replace(/\{\{valor\}\}/g, `R$ ${context.lastPurchaseValue.toLocaleString('pt-BR')}`);
    }

    if (context.lastPurchaseProducts) {
      processedPrompt = processedPrompt.replace(/\{\{produtos\}\}/g, context.lastPurchaseProducts.join(', '));
    }

    if (context.daysSinceLastPurchase) {
      processedPrompt = processedPrompt.replace(/\{\{diasUltimaCompra\}\}/g, context.daysSinceLastPurchase.toString());
    }

    if (context.contactTags) {
      processedPrompt = processedPrompt.replace(/\{\{tags\}\}/g, context.contactTags.join(', '));
    }

    if (context.totalPurchases) {
      processedPrompt = processedPrompt.replace(/\{\{totalCompras\}\}/g, context.totalPurchases.toString());
    }

    // Adicionar instruções de personalização
    processedPrompt += `\n\nInstruções de personalização:
- Use o nome "${firstName}" na mensagem
- Tom de voz: ${this.personalization.toneOfVoice}
- Nível de emojis: ${this.personalization.emojiLevel}
- Máximo ${this.personalization.maxMessageLength} caracteres
- ${this.personalization.greetingByTime ? 'Inclua saudação baseada no horário' : 'Sem saudação temporal'}
- ${this.personalization.useFirstName ? 'Use apenas o primeiro nome' : 'Use nome completo'}`;

    return processedPrompt;
  }

  private async processAIResponse(
    aiContent: string, 
    messageType: string, 
    context: AIMessageContext
  ): Promise<{ content: string; type: string; buttons?: any[]; listItems?: any[] }> {
    const baseResponse = {
      content: aiContent.trim(),
      type: messageType
    };

    switch (messageType) {
      case 'buttons':
        return {
          ...baseResponse,
          buttons: await this.generateButtons(context)
        };
      
      case 'list':
        return {
          ...baseResponse,
          listItems: await this.generateListItems(context)
        };
      
      default:
        return baseResponse;
    }
  }

  private async generateButtons(context: AIMessageContext): Promise<any[]> {
    const buttons = [];

    // Botões baseados no contexto
    if (context.lastPurchaseProducts && context.lastPurchaseProducts.length > 0) {
      buttons.push({
        id: 'reorder',
        title: 'Comprar Novamente',
        description: 'Repetir último pedido'
      });
    }

    if (context.ltv && context.ltv > 500) {
      buttons.push({
        id: 'vip_offers',
        title: 'Ofertas VIP',
        description: 'Ver ofertas exclusivas'
      });
    }

    buttons.push({
      id: 'catalog',
      title: 'Ver Catálogo',
      description: 'Produtos disponíveis'
    });

    buttons.push({
      id: 'support',
      title: 'Falar com Atendente',
      description: 'Suporte personalizado'
    });

    return buttons.slice(0, 3); // WhatsApp permite máximo 3 botões
  }

  private async generateListItems(context: AIMessageContext): Promise<any[]> {
    const items = [];

    if (context.preferredProducts && context.preferredProducts.length > 0) {
      context.preferredProducts.slice(0, 5).forEach((product, index) => {
        items.push({
          id: `product_${index}`,
          title: product,
          description: 'Produto recomendado para você'
        });
      });
    } else {
      // Lista genérica
      items.push(
        {
          id: 'new_arrivals',
          title: 'Novidades',
          description: 'Últimos lançamentos'
        },
        {
          id: 'bestsellers',
          title: 'Mais Vendidos',
          description: 'Produtos populares'
        },
        {
          id: 'promotions',
          title: 'Promoções',
          description: 'Ofertas especiais'
        }
      );
    }

    return items;
  }

  private getFallbackMessage(templateId: string, context: AIMessageContext): { content: string; type: string } {
    const firstName = this.getFirstName(context.contactName);
    const greeting = this.getTimeBasedGreeting();

    const fallbackMessages: Record<string, string> = {
      'post_sale_confirmation': `${greeting} ${firstName}! 🎉 Seu pedido foi confirmado com sucesso! Em breve você receberá o código de rastreamento. Obrigado pela confiança! 😊`,
      'post_sale_satisfaction': `Oi ${firstName}! Como foi sua experiência com o produto? Sua opinião é muito importante para nós! ⭐`,
      'cart_abandoned_recovery': `${firstName}, você esqueceu alguns itens no seu carrinho! 🛒 Que tal finalizar sua compra? Seus produtos estão te esperando! 😊`,
      'vip_reactivation': `${firstName}, sentimos sua falta! 💎 Como cliente VIP, você tem acesso às nossas melhores ofertas. Vamos conversar?`,
      'lead_nurturing': `Oi ${firstName}! Espero que esteja bem! 😊 Tenho algumas dicas que podem te interessar. Posso compartilhar?`,
      'birthday_celebration': `🎉 Parabéns, ${firstName}! 🎂 Hoje é seu dia especial e preparamos uma surpresa para você! 🎁`
    };

    return {
      content: fallbackMessages[templateId] || `Oi ${firstName}! Como posso ajudar você hoje? 😊`,
      type: 'text'
    };
  }

  private getFirstName(fullName: string): string {
    return fullName.split(' ')[0];
  }

  private getTimeBasedGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }

  private async callOpenAI(prompt: string, context?: any): Promise<string> {
    const config = this.config!;
    
    const systemPrompt = `Você é um especialista em vendas e marketing digital para WhatsApp Business.

REGRAS IMPORTANTES:
1. SEMPRE use o nome do cliente na mensagem (fornecido no prompt)
2. Seja natural, amigável e personalizado
3. Use emojis de forma equilibrada (não exagere)
4. Mantenha o tom profissional mas caloroso
5. Inclua call-to-action quando apropriado
6. Respeite o limite de caracteres especificado
7. Para mensagens com botões: termine com uma pergunta ou convite à ação
8. Para listas: organize informações de forma clara e atrativa
9. Use linguagem brasileira (pt-BR)
10. Evite ser repetitivo ou robótico

TIPOS DE MENSAGEM:
- text: Mensagem simples de texto
- buttons: Mensagem que terá botões interativos (termine com pergunta)
- list: Mensagem que terá lista de opções (organize o conteúdo)

Gere apenas o conteúdo da mensagem, sem explicações adicionais.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API Error: ${error.error?.message || 'Erro desconhecido'}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Erro ao gerar resposta';
  }

  private async callGemini(prompt: string, context?: any): Promise<string> {
    const config = this.config!;
    
    const systemPrompt = `Você é um especialista em vendas e marketing digital para WhatsApp Business.

REGRAS IMPORTANTES:
1. SEMPRE use o nome do cliente na mensagem (fornecido no prompt)
2. Seja natural, amigável e personalizado
3. Use emojis de forma equilibrada (não exagere)
4. Mantenha o tom profissional mas caloroso
5. Inclua call-to-action quando apropriado
6. Respeite o limite de caracteres especificado
7. Para mensagens com botões: termine com uma pergunta ou convite à ação
8. Para listas: organize informações de forma clara e atrativa
9. Use linguagem brasileira (pt-BR)
10. Evite ser repetitivo ou robótico

TIPOS DE MENSAGEM:
- text: Mensagem simples de texto
- buttons: Mensagem que terá botões interativos (termine com pergunta)
- list: Mensagem que terá lista de opções (organize o conteúdo)

Gere apenas o conteúdo da mensagem, sem explicações adicionais.

${prompt}`;
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: systemPrompt
          }]
        }],
        generationConfig: {
          temperature: config.temperature,
          maxOutputTokens: config.maxTokens
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API Error: ${error.error?.message || 'Erro desconhecido'}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Erro ao gerar resposta';
  }

  // Método para testar a configuração
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.generateText('Teste de conexão. Responda apenas "OK" se estiver funcionando.');
      return {
        success: true,
        message: 'Conexão testada com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}

export const AIConfigService = new AIConfigServiceClass();