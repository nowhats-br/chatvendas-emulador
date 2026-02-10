import React from 'react';
import { cn } from '../../../lib/utils';

// Ícones emoji para evitar problemas de importação
const DollarIcon = () => <span className="text-lg">💰</span>;
const TrendingUpIcon = () => <span className="text-lg">📈</span>;
const BarChartIcon = () => <span className="text-lg">📊</span>;
const PieChartIcon = () => <span className="text-lg">🥧</span>;
const DownloadIcon = () => <span className="text-lg">⬇️</span>;
const CalendarIcon = () => <span className="text-lg">📅</span>;
const TargetIcon = () => <span className="text-lg">🎯</span>;

interface ROIData {
  period: string;
  investment: number;
  revenue: number;
  roi: number;
  conversions: number;
  costPerConversion: number;
}

interface ChannelPerformance {
  channel: string;
  investment: number;
  revenue: number;
  roi: number;
  conversions: number;
  color: string;
}

interface CampaignROI {
  id: string;
  name: string;
  type: string;
  investment: number;
  revenue: number;
  roi: number;
  conversions: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'paused';
}

export function ROIReports() {
  const [roiData, setRoiData] = React.useState<ROIData[]>([]);
  const [channelData, setChannelData] = React.useState<ChannelPerformance[]>([]);
  const [campaignData, setCampaignData] = React.useState<CampaignROI[]>([]);
  const [period, setPeriod] = React.useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    loadROIData();
  }, [period]);

  const loadROIData = async () => {
    setIsLoading(true);
    try {
      // Simular carregamento de dados de ROI
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockROIData: ROIData[] = [
        { period: 'Semana 1', investment: 2500, revenue: 8750, roi: 250, conversions: 35, costPerConversion: 71.43 },
        { period: 'Semana 2', investment: 3200, revenue: 11840, roi: 270, conversions: 48, costPerConversion: 66.67 },
        { period: 'Semana 3', investment: 2800, revenue: 10080, roi: 260, conversions: 42, costPerConversion: 66.67 },
        { period: 'Semana 4', investment: 3500, revenue: 14000, roi: 300, conversions: 56, costPerConversion: 62.50 }
      ];

      const mockChannelData: ChannelPerformance[] = [
        { channel: 'Follow-up Automático', investment: 4500, revenue: 18900, roi: 320, conversions: 89, color: 'bg-blue-500' },
        { channel: 'Campanhas Manuais', investment: 3200, revenue: 11520, roi: 260, conversions: 64, color: 'bg-green-500' },
        { channel: 'Sequências IA', investment: 2800, revenue: 12320, roi: 340, conversions: 52, color: 'bg-purple-500' },
        { channel: 'Reativação VIP', investment: 1500, revenue: 7500, roi: 400, conversions: 25, color: 'bg-yellow-500' }
      ];

      const mockCampaignData: CampaignROI[] = [
        {
          id: '1',
          name: 'Reativação Black Friday',
          type: 'Sazonal',
          investment: 5000,
          revenue: 22500,
          roi: 350,
          conversions: 125,
          startDate: '2024-11-20',
          endDate: '2024-11-30',
          status: 'completed'
        },
        {
          id: '2',
          name: 'Follow-up Pós-Venda',
          type: 'Automático',
          investment: 1200,
          revenue: 4800,
          roi: 300,
          conversions: 48,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          status: 'active'
        },
        {
          id: '3',
          name: 'Carrinho Abandonado',
          type: 'Recuperação',
          investment: 800,
          revenue: 3200,
          roi: 300,
          conversions: 32,
          startDate: '2024-01-15',
          endDate: '2024-12-31',
          status: 'active'
        }
      ];

      setRoiData(mockROIData);
      setChannelData(mockChannelData);
      setCampaignData(mockCampaignData);
    } catch (error) {
      console.error('Erro ao carregar dados de ROI:', error);
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
    return `${value}%`;
  };

  const getTotalMetrics = () => {
    const totalInvestment = channelData.reduce((sum, channel) => sum + channel.investment, 0);
    const totalRevenue = channelData.reduce((sum, channel) => sum + channel.revenue, 0);
    const totalConversions = channelData.reduce((sum, channel) => sum + channel.conversions, 0);
    const averageROI = totalRevenue > 0 ? ((totalRevenue - totalInvestment) / totalInvestment) * 100 : 0;

    return {
      totalInvestment,
      totalRevenue,
      totalConversions,
      averageROI,
      profit: totalRevenue - totalInvestment
    };
  };

  const exportReport = () => {
    // Simular exportação de relatório
    alert('Relatório de ROI exportado com sucesso!');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">Calculando ROI...</p>
        </div>
      </div>
    );
  }

  const totalMetrics = getTotalMetrics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <DollarIcon />
            Relatórios de ROI
          </h2>
          <p className="text-gray-500 text-sm">Análise de retorno sobre investimento dos follow-ups</p>
        </div>
        <div className="flex gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="1y">Último ano</option>
          </select>
          <button
            onClick={exportReport}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition font-medium"
          >
            <DownloadIcon />
            Exportar
          </button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <DollarIcon />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(totalMetrics.totalInvestment)}</h3>
          <p className="text-sm text-gray-500">Investimento Total</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUpIcon />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(totalMetrics.totalRevenue)}</h3>
          <p className="text-sm text-gray-500">Receita Gerada</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TargetIcon />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{totalMetrics.totalConversions}</h3>
          <p className="text-sm text-gray-500">Conversões</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChartIcon />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-green-600">{formatPercentage(Math.round(totalMetrics.averageROI))}</h3>
          <p className="text-sm text-gray-500">ROI Médio</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <DollarIcon />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-emerald-600">{formatCurrency(totalMetrics.profit)}</h3>
          <p className="text-sm text-gray-500">Lucro Líquido</p>
        </div>
      </div>

      {/* Gráfico de ROI por Período */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <BarChartIcon />
          ROI por Período
        </h3>
        <div className="space-y-4">
          {roiData.map((data, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-20 text-sm font-medium text-gray-600">{data.period}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                  style={{ width: `${Math.min((data.roi / 400) * 100, 100)}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-between px-4">
                  <span className="text-xs font-medium text-white">
                    {formatCurrency(data.revenue)}
                  </span>
                  <span className="text-xs font-medium text-white">
                    ROI: {formatPercentage(data.roi)}
                  </span>
                </div>
              </div>
              <div className="w-24 text-right">
                <div className="text-sm font-bold text-gray-800">{data.conversions}</div>
                <div className="text-xs text-gray-500">conversões</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance por Canal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <PieChartIcon />
            Performance por Canal
          </h3>
          <div className="space-y-4">
            {channelData.map((channel, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={cn("w-4 h-4 rounded-full", channel.color)}></div>
                  <div>
                    <h4 className="font-medium text-gray-800">{channel.channel}</h4>
                    <p className="text-sm text-gray-500">{channel.conversions} conversões</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">{formatPercentage(channel.roi)}</div>
                  <div className="text-sm text-gray-500">{formatCurrency(channel.revenue)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Campanhas */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TargetIcon />
            Top Campanhas
          </h3>
          <div className="space-y-4">
            {campaignData.map((campaign) => (
              <div key={campaign.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-gray-800">{campaign.name}</h4>
                    <p className="text-sm text-gray-500">{campaign.type}</p>
                  </div>
                  <span className={cn(
                    "px-2 py-1 text-xs font-medium rounded-full",
                    campaign.status === 'active' ? "bg-green-100 text-green-700" :
                    campaign.status === 'completed' ? "bg-blue-100 text-blue-700" :
                    "bg-gray-100 text-gray-600"
                  )}>
                    {campaign.status === 'active' ? 'Ativo' : 
                     campaign.status === 'completed' ? 'Concluído' : 'Pausado'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-bold text-green-600">{formatPercentage(campaign.roi)}</div>
                    <div className="text-gray-500">ROI</div>
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">{formatCurrency(campaign.revenue)}</div>
                    <div className="text-gray-500">Receita</div>
                  </div>
                  <div>
                    <div className="font-bold text-blue-600">{campaign.conversions}</div>
                    <div className="text-gray-500">Conversões</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights e Recomendações */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">💡 Insights e Recomendações</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border border-green-100">
            <h4 className="font-medium text-green-800 mb-2">🎯 Melhor Performance</h4>
            <p className="text-sm text-gray-600">
              Sequências IA têm o melhor ROI (340%). Considere expandir este canal.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-blue-100">
            <h4 className="font-medium text-blue-800 mb-2">📈 Oportunidade</h4>
            <p className="text-sm text-gray-600">
              Campanhas manuais têm potencial de melhoria. Teste automação.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-yellow-100">
            <h4 className="font-medium text-yellow-800 mb-2">⏰ Timing</h4>
            <p className="text-sm text-gray-600">
              Semana 4 teve melhor performance. Analise fatores sazonais.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-purple-100">
            <h4 className="font-medium text-purple-800 mb-2">💰 Investimento</h4>
            <p className="text-sm text-gray-600">
              ROI médio de {formatPercentage(Math.round(totalMetrics.averageROI))} está acima da média do mercado (200%).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}