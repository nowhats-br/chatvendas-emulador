import { Edge, Node } from '@xyflow/react';
import { faker } from '@faker-js/faker';
import { AIConfigService } from '../../../services/AIConfigService';

export interface ChatbotFlow {
  id: string;
  name: string;
  description: string;
  nodes: Node[];
  edges: Edge[];
  connectedInstanceId?: string; 
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  triggerKeywords: string[];
}

class ChatbotServiceClass {
  private flows: ChatbotFlow[] = [];

  constructor() {
    const stored = localStorage.getItem('chatvendas_flows');
    if (stored) {
      this.flows = JSON.parse(stored);
    } else {
      // Mock Inicial
      this.flows = [
        {
          id: 'flow_1',
          name: 'Atendimento Principal',
          description: 'Fluxo de triagem inicial para novos clientes.',
          nodes: [
             { id: 'start_1', type: 'startNode', position: { x: 100, y: 100 }, data: { label: 'Início' } },
             { id: 'msg_1', type: 'messageNode', position: { x: 300, y: 100 }, data: { label: 'Boas Vindas', content: 'Olá! Bem-vindo ao nosso atendimento.' } }
          ],
          edges: [
             { id: 'e1', source: 'start_1', target: 'msg_1', animated: true, style: { stroke: '#10b981' } }
          ],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          triggerKeywords: ['oi', 'olá', 'bom dia']
        }
      ];
      this.save();
    }
  }

  private save() {
    localStorage.setItem('chatvendas_flows', JSON.stringify(this.flows));
  }

  getAll(): ChatbotFlow[] {
    return [...this.flows];
  }

  getById(id: string): ChatbotFlow | undefined {
    return this.flows.find(f => f.id === id);
  }

  create(data: Pick<ChatbotFlow, 'name' | 'description'>): ChatbotFlow {
    const newFlow: ChatbotFlow = {
      id: `flow_${Date.now()}`,
      ...data,
      nodes: [
        { id: 'start_1', type: 'startNode', position: { x: 250, y: 250 }, data: { label: 'Início' } }
      ],
      edges: [],
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      triggerKeywords: []
    };
    this.flows.push(newFlow);
    this.save();
    return newFlow;
  }

  update(id: string, data: Partial<ChatbotFlow>) {
    const index = this.flows.findIndex(f => f.id === id);
    if (index !== -1) {
      this.flows[index] = { ...this.flows[index], ...data, updatedAt: new Date().toISOString() };
      this.save();
    }
  }

  delete(id: string) {
    this.flows = this.flows.filter(f => f.id !== id);
    this.save();
  }

  async generateFlowFromPrompt(prompt: string): Promise<ChatbotFlow> {
    // Verificar se a IA está configurada
    if (!AIConfigService.isConfigured()) {
      throw new Error('IA não configurada. Configure uma API key nas configurações primeiro.');
    }

    try {
      // Usar o AIConfigService para gerar o fluxo
      const aiPrompt = `Crie um fluxo de chatbot baseado na seguinte descrição: "${prompt}"

Retorne uma estrutura JSON com:
- name: Nome do fluxo
- description: Descrição do fluxo
- nodes: Array de nós com id, type, position, data
- edges: Array de conexões entre nós

Tipos de nós disponíveis:
- startNode: Nó inicial
- messageNode: Mensagem de texto
- buttonsNode: Botões interativos
- listNode: Lista de opções
- aiNode: Resposta com IA
- delayNode: Pausa/delay

Crie um fluxo funcional e lógico baseado na descrição fornecida.`;

      const aiResponse = await AIConfigService.generateText(aiPrompt);
      
      // Tentar parsear a resposta da IA
      let flowData;
      try {
        flowData = JSON.parse(aiResponse);
      } catch {
        // Se não conseguir parsear, criar um fluxo básico
        flowData = this.createBasicFlowFromPrompt(prompt);
      }

      // Criar o fluxo
      const newFlow = this.create({
        name: flowData.name || `Bot IA: ${prompt.substring(0, 20)}...`,
        description: flowData.description || `Gerado via IA: ${prompt}`
      });

      // Atualizar com os nós e edges gerados
      const nodes = flowData.nodes || this.generateBasicNodes(prompt);
      const edges = flowData.edges || this.generateBasicEdges();

      this.update(newFlow.id, { nodes, edges });
      return { ...newFlow, nodes, edges };

    } catch (error) {
      console.error('Erro ao gerar fluxo com IA:', error);
      
      // Fallback: criar fluxo básico
      return new Promise((resolve) => {
        setTimeout(() => {
          const newFlow = this.create({ 
            name: `Bot: ${prompt.substring(0, 20)}...`, 
            description: `Baseado em: ${prompt}` 
          });
          
          const nodes = this.generateBasicNodes(prompt);
          const edges = this.generateBasicEdges();

          this.update(newFlow.id, { nodes, edges });
          resolve({ ...newFlow, nodes, edges });
        }, 1000);
      });
    }
  }

  private createBasicFlowFromPrompt(prompt: string) {
    return {
      name: `Bot IA: ${prompt.substring(0, 20)}...`,
      description: `Gerado via IA: ${prompt}`,
      nodes: this.generateBasicNodes(prompt),
      edges: this.generateBasicEdges()
    };
  }

  private generateBasicNodes(prompt: string): Node[] {
    const isEcommerce = /loja|produto|compra|venda|pedido|carrinho/i.test(prompt);
    const isSupport = /suporte|ajuda|problema|dúvida|atendimento/i.test(prompt);
    const isPizzaria = /pizza|pizzaria|cardápio|entrega/i.test(prompt);

    let nodes: Node[] = [
      { 
        id: 'start', 
        type: 'startNode', 
        position: { x: 100, y: 50 }, 
        data: { label: 'Início' } 
      },
      { 
        id: 'welcome', 
        type: 'messageNode', 
        position: { x: 300, y: 50 }, 
        data: { 
          label: 'Boas-vindas', 
          content: 'Olá! Como posso ajudar você hoje?' 
        } 
      }
    ];

    if (isPizzaria) {
      nodes.push(
        {
          id: 'menu',
          type: 'buttonsNode',
          position: { x: 500, y: 50 },
          data: {
            label: 'Menu Principal',
            content: 'Escolha uma opção:',
            buttons: [
              { id: 'cardapio', text: 'Ver Cardápio' },
              { id: 'pedido', text: 'Fazer Pedido' },
              { id: 'status', text: 'Status do Pedido' }
            ]
          }
        },
        {
          id: 'ai_cardapio',
          type: 'aiNode',
          position: { x: 700, y: 0 },
          data: {
            label: 'IA - Cardápio',
            provider: AIConfigService.getConfig()?.provider || 'openai',
            prompt: 'Mostre o cardápio da pizzaria com preços e descrições das pizzas disponíveis.'
          }
        }
      );
    } else if (isEcommerce) {
      nodes.push(
        {
          id: 'menu',
          type: 'buttonsNode',
          position: { x: 500, y: 50 },
          data: {
            label: 'Menu Loja',
            content: 'O que você procura?',
            buttons: [
              { id: 'produtos', text: 'Ver Produtos' },
              { id: 'pedidos', text: 'Meus Pedidos' },
              { id: 'suporte', text: 'Suporte' }
            ]
          }
        },
        {
          id: 'ai_produtos',
          type: 'aiNode',
          position: { x: 700, y: 0 },
          data: {
            label: 'IA - Produtos',
            provider: AIConfigService.getConfig()?.provider || 'openai',
            prompt: 'Ajude o cliente a encontrar produtos baseado no que ele está procurando. Seja útil e sugira opções relevantes.'
          }
        }
      );
    } else if (isSupport) {
      nodes.push(
        {
          id: 'ai_support',
          type: 'aiNode',
          position: { x: 500, y: 50 },
          data: {
            label: 'IA - Suporte',
            provider: AIConfigService.getConfig()?.provider || 'openai',
            prompt: 'Você é um assistente de suporte. Ajude o cliente com suas dúvidas de forma clara e objetiva.'
          }
        }
      );
    } else {
      nodes.push({
        id: 'ai_general',
        type: 'aiNode',
        position: { x: 500, y: 50 },
        data: {
          label: 'IA - Assistente',
          provider: AIConfigService.getConfig()?.provider || 'openai',
          prompt: `Você é um assistente virtual. Contexto: ${prompt}. Ajude o usuário de forma útil e amigável.`
        }
      });
    }

    return nodes;
  }

  private generateBasicEdges(): Edge[] {
    return [
      { id: 'e1', source: 'start', target: 'welcome', animated: true, style: { stroke: '#10b981' } },
      { id: 'e2', source: 'welcome', target: 'menu', animated: true, style: { stroke: '#10b981' } },
    ];
  }
}

export const ChatbotService = new ChatbotServiceClass();
