import React from 'react';
import { AIConfigService } from '../../../services/AIConfigService';
import { cn } from '../../../lib/utils';

// Ícones emoji para evitar problemas de importação
const SparklesIcon = () => <span className="text-lg">✨</span>;
const LightbulbIcon = () => <span className="text-lg">💡</span>;
const TargetIcon = () => <span className="text-lg">🎯</span>;
const TrendingUpIcon = () => <span className="text-lg">📈</span>;
const MessageSquareIcon = () => <span className="text-lg">💬</span>;
const CopyIcon = () => <span className="text-lg">📋</span>;
const RefreshIcon = () => <span className="text-lg">🔄</span>;

interface SmartSuggestion {
  id: string;
  context: string;
  scenario: string;
  template: string;
  confidence: number;
  performance: {
    openRate: number;
    responseRate: number;
    conversionRate: number;
  };
  tags: string[];
  lastUsed?: string;
}

interface ContextAnalysis {
  customerSegment: string;
  purchaseHistory: string;
  engagementLevel: string;
  timeOfDay: string;
  dayOfWeek: string;
  seasonality: string;
}

export function SmartTemplateManager() {
  const [suggestions, setSuggestions] = React.useState<SmartSuggestion[]>([]);
  const [contextAnalysis, setContextAnalysis] = React.useState<ContextAnalysis | null>(null);
  const [selectedContext, setSelectedContext] = React.useState<string>('all');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    loadSuggestions();
    loadContextAnalysis();
  }, [selectedContext]);

  const loadSuggestions = async () => {
    setIsLoading(true);
    try {
      // Simular carregamento de sugestões inteligentes
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockSuggestions: SmartSuggestion[] = [
        {
          id: '1',
          context: 'Pós-venda',
          scenario: 'Cliente comprou há 2 dias',
          template: 'Oi {{nome}}! 😊 Como está sendo sua experiência com {{produto}}? Se tiver alguma dúvida, estou aqui para ajudar! 💙',
          confidence: 92,
          performance: {
            openRate: 87.5,
            responseRate: 34.2,
            conversionRate: 12.8
          },
          tags: ['satisfacao', 'pos-venda', 'suporte'],
          lastUsed: '2024-01-10'
        },
        {
          id: '2',
          context: 'Carrinho Abandonado',
          scenario: 'Produto no carrinho há 4 horas',
          template: '🛒 {{nome}}, seus itens estão te esperando! Finalize agora e ganhe 10% OFF com o cupom VOLTA10 ✨',
          confidence: 88,
          performance: {
            openRate: 91.2,
            responseRate: 28.7,
            conversionRate: 18.5
          },
          tags: ['carrinho', 'desconto', 'urgencia'],
          lastUsed: '2024-01-09'
        },
        {
          id: '3',
          context: 'Cliente Inativo',
          scenario: 'Sem compras há 45 dias',
          template: 'Sentimos sua falta, {{nome}}! 💔 Que tal dar uma olhada nas nossas novidades? Temos uma surpresa especial para você! 🎁',
          confidence: 85,
          performance: {
            openRate: 76.3,
            responseRate: 22.1,
            conversionRate: 8.9
          },
          tags: ['reativacao', 'novidades', 'surpresa'],
          lastUsed: '2024-01-08'
        },
        {
          id: '4',
          context: 'Cliente VIP',
          scenario: 'Compras > R$ 5.000',
          template: '👑 {{nome}}, como nosso cliente VIP, você tem acesso exclusivo à nossa nova coleção! Quer dar uma espiada? ✨',
          confidence: 94,
          performance: {
            openRate: 95.1,
            responseRate: 45.6,
            conversionRate: 28.3
          },
          tags: ['vip', 'exclusivo', 'colecao'],
          lastUsed: '2024-01-11'
        },
        {
          id: '5',
          context: 'Aniversário',
          scenario: 'Aniversário do cliente',
          template: '🎉 Parabéns, {{nome}}! Hoje é seu dia especial e preparamos um presente: 20% OFF em toda a loja! 🎂🎁',
          confidence: 96,
          performance: {
            openRate: 98.7,
            responseRate: 52.3,
            conversionRate: 31.7
          },
          tags: ['aniversario', 'desconto', 'especial'],
          lastUsed: '2024-01-07'
        }
      ];

      // Filtrar por contexto se necessário
      const filteredSuggestions = selectedContext === 'all' 
        ? mockSuggestions 
        : mockSuggestions.filter(s => s.context.toLowerCase().includes(selectedContext.toLowerCase()));

      setSuggestions(filteredSuggestions);
    } catch (error) {
      console.error('Erro ao carregar sugestões:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadContextAnalysis = async () => {
    try {
      const mockAnalysis: ContextAnalysis = {
        customerSegment: 'Millennials urbanos (25-35 anos)',
        purchaseHistory: 'Compras frequentes de eletrônicos e moda',
        engagementLevel: 'Alto (78% de abertura)',
        timeOfDay: 'Melhor horário: 14h-16h',
        dayOfWeek: 'Terça e quinta-feira',
        seasonality: 'Pico em dezembro e junho'
      };

      setContextAnalysis(mockAnalysis);
    } catch (error) {
      console.error('Erro ao carregar análise de contexto:', error);
    }
  };

  const generateNewSuggestions = async () => {
    if (!AIConfigService.isConfigured()) {
      alert('Configure a IA primeiro nas configurações do sistema.');
      return;
    }

    setIsGenerating(true);
    try {
      // Simular geração de novas sugestões
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Adicionar nova sugestão gerada
      const newSuggestion: SmartSuggestion = {
        id: Date.now().toString(),
        context: 'IA Gerada',
        scenario: 'Baseado em análise de dados recentes',
        template: 'Oi {{nome}}! 🌟 Notei que você gosta de {{categoria}}. Temos novidades incríveis que combinam com seu estilo! Quer ver? 👀',
        confidence: 89,
        performance: {
          openRate: 0,
          responseRate: 0,
          conversionRate: 0
        },
        tags: ['ia-gerada', 'personalizada', 'novidades'],
        lastUsed: undefined
      };

      setSuggestions(prev => [newSuggestion, ...prev]);
    } catch (error) {
      console.error('Erro ao gerar sugestões:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyTemplate = (template: string) => {
    navigator.clipboard.writeText(template);
    // Aqui você poderia mostrar um toast de sucesso
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-100';
    if (confidence >= 80) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const contexts = [
    { value: 'all', label: 'Todos os Contextos' },
    { value: 'pos-venda', label: 'Pós-venda' },
    { value: 'carrinho', label: 'Carrinho Abandonado' },
    { value: 'inativo', label: 'Cliente Inativo' },
    { value: 'vip', label: 'Cliente VIP' },
    { value: 'aniversario', label: 'Aniversário' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">Analisando contextos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <SparklesIcon />
            Templates Inteligentes
          </h2>
          <p className="text-gray-500 text-sm">IA sugere templates baseados no contexto do cliente</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedContext}
            onChange={(e) => setSelectedContext(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
          >
            {contexts.map(context => (
              <option key={context.value} value={context.value}>
                {context.label}
              </option>
            ))}
          </select>
          <button
            onClick={generateNewSuggestions}
            disabled={isGenerating}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition font-medium disabled:opacity-50"
          >
            {isGenerating ? (
              <RefreshIcon />
            ) : (
              <SparklesIcon />
            )}
            {isGenerating ? 'Gerando...' : 'Gerar Novas'}
          </button>
        </div>
      </div>

      {/* Análise de Contexto */}
      {contextAnalysis && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <LightbulbIcon />
            Análise de Contexto Atual
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-purple-100">
              <h4 className="font-medium text-gray-700 mb-2">Segmento Principal</h4>
              <p className="text-sm text-gray-600">{contextAnalysis.customerSegment}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-purple-100">
              <h4 className="font-medium text-gray-700 mb-2">Histórico de Compras</h4>
              <p className="text-sm text-gray-600">{contextAnalysis.purchaseHistory}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-purple-100">
              <h4 className="font-medium text-gray-700 mb-2">Engajamento</h4>
              <p className="text-sm text-gray-600">{contextAnalysis.engagementLevel}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-purple-100">
              <h4 className="font-medium text-gray-700 mb-2">Melhor Horário</h4>
              <p className="text-sm text-gray-600">{contextAnalysis.timeOfDay}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-purple-100">
              <h4 className="font-medium text-gray-700 mb-2">Melhor Dia</h4>
              <p className="text-sm text-gray-600">{contextAnalysis.dayOfWeek}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-purple-100">
              <h4 className="font-medium text-gray-700 mb-2">Sazonalidade</h4>
              <p className="text-sm text-gray-600">{contextAnalysis.seasonality}</p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Sugestões */}
      <div className="space-y-4">
        {suggestions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <div className="text-5xl mb-4">✨</div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhuma sugestão encontrada</h3>
            <p className="text-gray-500 mb-4">Tente alterar o filtro de contexto ou gerar novas sugestões</p>
          </div>
        ) : (
          suggestions.map((suggestion) => (
            <div key={suggestion.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{suggestion.context}</h3>
                    <span className={cn(
                      "px-2 py-1 text-xs font-medium rounded-full",
                      getConfidenceColor(suggestion.confidence)
                    )}>
                      {suggestion.confidence}% confiança
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{suggestion.scenario}</p>
                  
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquareIcon />
                          <span className="text-sm font-medium text-gray-700">Template Sugerido</span>
                        </div>
                        <p className="text-gray-800 leading-relaxed">{suggestion.template}</p>
                      </div>
                      <button
                        onClick={() => copyTemplate(suggestion.template)}
                        className="ml-4 p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                        title="Copiar template"
                      >
                        <CopyIcon />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {suggestion.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Métricas de Performance */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{suggestion.performance.openRate}%</div>
                  <div className="text-xs text-gray-500">Taxa de Abertura</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{suggestion.performance.responseRate}%</div>
                  <div className="text-xs text-gray-500">Taxa de Resposta</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">{suggestion.performance.conversionRate}%</div>
                  <div className="text-xs text-gray-500">Taxa de Conversão</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">
                    {suggestion.lastUsed ? new Date(suggestion.lastUsed).toLocaleDateString('pt-BR') : 'Nunca usado'}
                  </div>
                  <div className="text-xs text-gray-500">Último Uso</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}