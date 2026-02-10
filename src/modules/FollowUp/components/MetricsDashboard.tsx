import React from 'react';
import { cn } from '../../../lib/utils';

interface MetricsData {
  totalFollowUps: number;
  completedFollowUps: number;
  conversionRate: number;
  totalRevenue: number;
  averageResponseTime: number;
  activeSequences: number;
  monthlyGrowth: number;
  topPerformingTemplate: string;
}

interface ConversionFunnel {
  sent: number;
  delivered: number;
  read: number;
  replied: number;
  converted: number;
}

export function MetricsDashboard() {
  const [metrics, setMetrics] = React.useState<MetricsData | null>(null);
  const [funnel, setFunnel] = React.useState<ConversionFunnel | null>(null);
  const [period, setPeriod] = React.useState<'7d' | '30d' | '90d'>('30d');
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    loadMetrics();
  }, [period]);

  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockMetrics: MetricsData = {
        totalFollowUps: 1247,
        completedFollowUps: 892,
        conversionRate: 23.5,
        totalRevenue: 45670.80,
        averageResponseTime: 2.3,
        activeSequences: 12,
        monthlyGrowth: 15.2,
        topPerformingTemplate: 'Pós-venda Satisfação'
      };

      const mockFunnel: ConversionFunnel = {
        sent: 1247,
        delivered: 1198,
        read: 987,
        replied: 456,
        converted: 293
      };

      setMetrics(mockMetrics);
      setFunnel(mockFunnel);
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">Carregando métricas...</p>
        </div>
      </div>
    );
  }

  if (!metrics || !funnel) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Erro ao carregar métricas</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">📊 Dashboard de Métricas</h2>
          <p className="text-gray-500 text-sm">Análise de performance dos follow-ups</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                period === p
                  ? "bg-purple-100 text-purple-700"
                  : "text-gray-500 hover:bg-gray-100"
              )}
            >
              {p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : '90 dias'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg text-2xl">📊</div>
            <span className="text-xs text-green-600 font-medium">+{metrics.monthlyGrowth}%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{metrics.totalFollowUps.toLocaleString()}</h3>
          <p className="text-sm text-gray-500">Follow-ups Enviados</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg text-2xl">🎯</div>
            <span className="text-xs text-green-600 font-medium">{formatPercentage(metrics.conversionRate)}</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{metrics.completedFollowUps.toLocaleString()}</h3>
          <p className="text-sm text-gray-500">Conversões</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-100 rounded-lg text-2xl">💰</div>
            <span className="text-xs text-emerald-600 font-medium">ROI: 340%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(metrics.totalRevenue)}</h3>
          <p className="text-sm text-gray-500">Receita Gerada</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg text-2xl">📅</div>
            <span className="text-xs text-purple-600 font-medium">{metrics.averageResponseTime}h</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{metrics.activeSequences}</h3>
          <p className="text-sm text-gray-500">Sequências Ativas</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📈 Funil de Conversão</h3>
        <div className="space-y-4">
          {[
            { label: 'Enviados', value: funnel.sent, color: 'bg-blue-500', percentage: 100 },
            { label: 'Entregues', value: funnel.delivered, color: 'bg-green-500', percentage: (funnel.delivered / funnel.sent) * 100 },
            { label: 'Lidos', value: funnel.read, color: 'bg-yellow-500', percentage: (funnel.read / funnel.sent) * 100 },
            { label: 'Respondidos', value: funnel.replied, color: 'bg-orange-500', percentage: (funnel.replied / funnel.sent) * 100 },
            { label: 'Convertidos', value: funnel.converted, color: 'bg-purple-500', percentage: (funnel.converted / funnel.sent) * 100 }
          ].map((stage, index) => (
            <div key={stage.label} className="flex items-center gap-4">
              <div className="w-20 text-sm font-medium text-gray-600">{stage.label}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                <div 
                  className={cn("h-full transition-all duration-500", stage.color)}
                  style={{ width: `${stage.percentage}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-between px-3">
                  <span className="text-xs font-medium text-white">
                    {stage.value.toLocaleString()}
                  </span>
                  <span className="text-xs font-medium text-white">
                    {formatPercentage(stage.percentage)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">🏆 Top Performers</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="font-medium text-green-800">Melhor Template</span>
              <span className="text-green-600 font-bold">{metrics.topPerformingTemplate}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="font-medium text-blue-800">Melhor Horário</span>
              <span className="text-blue-600 font-bold">14:00 - 16:00</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="font-medium text-purple-800">Melhor Dia</span>
              <span className="text-purple-600 font-bold">Terça-feira</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">💡 Recomendações</h3>
          <div className="space-y-3">
            <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Otimização:</strong> Aumente a frequência nos finais de semana (+12% conversão)
              </p>
            </div>
            <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
              <p className="text-sm text-blue-800">
                <strong>Template:</strong> Teste mensagens mais curtas (-23% tempo de resposta)
              </p>
            </div>
            <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded">
              <p className="text-sm text-green-800">
                <strong>Timing:</strong> Delay de 2h entre mensagens melhora engajamento
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}