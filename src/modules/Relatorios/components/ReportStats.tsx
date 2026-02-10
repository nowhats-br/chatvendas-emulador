import React from 'react';

interface ReportStatsProps {
  stats: {
    totalCampaigns: number;
    totalMessages: number;
    totalInteractions: number;
    averageDeliveryRate: number;
    averageReadRate: number;
    averageInteractionRate: number;
    topKeywords: Array<{ keyword: string; count: number }>;
    interactionsByType: Array<{ type: string; count: number }>;
  };
  isVertical?: boolean;
}

export function ReportStats({ stats, isVertical }: ReportStatsProps) {
  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

  const getInteractionTypeIcon = (type: string) => {
    switch (type) {
      case 'button_click': return '🔘';
      case 'list_selection': return '📋';
      case 'carousel_click': return '🎠';
      case 'keyword_response': return '🔑';
      case 'poll_vote': return '📊';
      default: return '💬';
    }
  };

  const getInteractionTypeName = (type: string) => {
    switch (type) {
      case 'button_click': return 'Cliques em Botões';
      case 'list_selection': return 'Seleções de Lista';
      case 'carousel_click': return 'Cliques em Carrossel';
      case 'keyword_response': return 'Respostas por Palavra-chave';
      case 'poll_vote': return 'Votos em Enquetes';
      default: return type;
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: isVertical ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>

      {/* Estatísticas Principais */}
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '100px',
          height: '100px',
          background: 'rgba(59, 130, 246, 0.03)',
          borderRadius: '50%'
        }} />

        <h3 style={{
          margin: '0 0 24px 0',
          fontSize: '18px',
          fontWeight: 700,
          color: '#334155',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{
            backgroundColor: '#eff6ff',
            padding: '8px',
            borderRadius: '12px',
            fontSize: '20px'
          }}>📈</span>
          Panorama Geral
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{
            padding: '16px',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
            border: '1px solid #f1f5f9'
          }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.025em', marginBottom: '4px' }}>Campanhas</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#10b981' }}>{stats.totalCampaigns}</div>
          </div>

          <div style={{
            padding: '16px',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
            border: '1px solid #f1f5f9'
          }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.025em', marginBottom: '4px' }}>Mensagens</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#3b82f6' }}>{stats.totalMessages.toLocaleString()}</div>
          </div>

          <div style={{
            padding: '16px',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
            border: '1px solid #f1f5f9'
          }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.025em', marginBottom: '4px' }}>Interações</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#f59e0b' }}>{stats.totalInteractions.toLocaleString()}</div>
          </div>

          <div style={{
            padding: '16px',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
            border: '1px solid #f1f5f9'
          }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.025em', marginBottom: '4px' }}>Engajamento</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#ef4444' }}>{formatPercentage(stats.averageInteractionRate)}</div>
          </div>
        </div>
      </div>

      {/* Taxas de Performance */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
        border: '1px solid #f1f5f9'
      }}>
        <h3 style={{
          margin: '0 0 24px 0',
          fontSize: '18px',
          fontWeight: 700,
          color: '#334155',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{
            backgroundColor: '#fff7ed',
            padding: '8px',
            borderRadius: '12px',
            fontSize: '20px'
          }}>🎯</span>
          Funil de Conversão
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Taxa de Entrega */}
          <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#10b981' }}>📤</span> Taxa de Entrega
              </span>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#10b981' }}>
                {formatPercentage(stats.averageDeliveryRate)}
              </span>
            </div>
            <div style={{ width: '100%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ width: `${stats.averageDeliveryRate * 100}%`, height: '100%', background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)', borderRadius: '5px' }} />
            </div>
          </div>

          {/* Taxa de Leitura */}
          <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#3b82f6' }}>👁️</span> Taxa de Leitura
              </span>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#3b82f6' }}>
                {formatPercentage(stats.averageReadRate)}
              </span>
            </div>
            <div style={{ width: '100%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ width: `${stats.averageReadRate * 100}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)', borderRadius: '5px' }} />
            </div>
          </div>

          {/* Taxa de Interação */}
          <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#f59e0b' }}>✨</span> Taxa de Cliques
              </span>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#f59e0b' }}>
                {formatPercentage(stats.averageInteractionRate)}
              </span>
            </div>
            <div style={{ width: '100%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ width: `${stats.averageInteractionRate * 100}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)', borderRadius: '5px' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Top Palavras-chave */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
        border: '1px solid #f1f5f9'
      }}>
        <h3 style={{
          margin: '0 0 24px 0',
          fontSize: '18px',
          fontWeight: 700,
          color: '#334155',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{
            backgroundColor: '#fef2f2',
            padding: '8px',
            borderRadius: '12px',
            fontSize: '20px'
          }}>🔑</span>
          Keywords Mais Relevantes
        </h3>

        {stats.topKeywords.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats.topKeywords.slice(0, 5).map((keyword, index) => (
              <div key={keyword.keyword} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                backgroundColor: index === 0 ? '#f0fdf4' : '#f8fafc',
                borderRadius: '12px',
                border: `1px solid ${index === 0 ? '#dcfce7' : '#f1f5f9'}`,
                transition: 'transform 0.2s ease'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: 800,
                    color: index === 0 ? '#10b981' : '#94a3b8',
                    minWidth: '24px'
                  }}>
                    {index + 1}º
                  </span>
                  <span style={{ fontSize: '15px', fontWeight: 600, color: '#334155' }}>
                    {keyword.keyword}
                  </span>
                </div>
                <div style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: index === 0 ? '#10b981' : '#64748b',
                  backgroundColor: index === 0 ? '#ffffff' : '#f1f5f9',
                  padding: '4px 10px',
                  borderRadius: '10px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}>
                  {keyword.count} envios
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: '14px',
            backgroundColor: '#f8fafc',
            borderRadius: '16px',
            border: '1px dashed #e2e8f0'
          }}>
            Sem dados de palavras-chave no período
          </div>
        )}
      </div>

      {/* Interações por Tipo */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
        border: '1px solid #f1f5f9'
      }}>
        <h3 style={{
          margin: '0 0 24px 0',
          fontSize: '18px',
          fontWeight: 700,
          color: '#334155',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{
            backgroundColor: '#f5f3ff',
            padding: '8px',
            borderRadius: '12px',
            fontSize: '20px'
          }}>⚡</span>
          Ações dos Usuários
        </h3>

        {stats.interactionsByType.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
            {stats.interactionsByType.map((interaction) => (
              <div key={interaction.type} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '1px solid #f1f5f9',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    fontSize: '18px',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f8fafc',
                    borderRadius: '10px'
                  }}>
                    {getInteractionTypeIcon(interaction.type)}
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>
                    {getInteractionTypeName(interaction.type)}
                  </span>
                </div>
                <span style={{
                  fontSize: '15px',
                  fontWeight: 800,
                  color: '#6366f1',
                  backgroundColor: '#f5f3ff',
                  padding: '4px 12px',
                  borderRadius: '12px'
                }}>
                  {interaction.count}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: '14px',
            backgroundColor: '#f8fafc',
            borderRadius: '16px',
            border: '1px dashed #e2e8f0'
          }}>
            Nenhuma interação registrada ainda
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportStats;