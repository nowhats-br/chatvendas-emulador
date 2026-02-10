import React from 'react';
import { reportsService, InteractionDetail, ReportFilters } from '../../../services/ReportsService';

interface InteractionDetailsModalProps {
  isOpen: boolean;
  campaignId: string | null;
  filters: ReportFilters;
  onClose: () => void;
}

export function InteractionDetailsModal({ isOpen, campaignId, filters, onClose }: InteractionDetailsModalProps) {
  const [interactions, setInteractions] = React.useState<InteractionDetail[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });
  const [localFilters, setLocalFilters] = React.useState<ReportFilters>({});

  React.useEffect(() => {
    if (isOpen && campaignId) {
      loadInteractions();
    }
  }, [isOpen, campaignId, pagination.page, localFilters]);

  const loadInteractions = async () => {
    if (!campaignId) return;

    try {
      setLoading(true);
      const response = await reportsService.getInteractionDetails(campaignId, {
        ...filters,
        ...localFilters,
        page: pagination.page,
        limit: pagination.limit
      });

      setInteractions(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
        pages: response.pagination.pages
      }));
    } catch (error) {
      console.error('Erro ao carregar detalhes de interações:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

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
      case 'button_click': return 'Clique em Botão';
      case 'list_selection': return 'Seleção de Lista';
      case 'carousel_click': return 'Clique em Carrossel';
      case 'keyword_response': return 'Resposta por Palavra-chave';
      case 'poll_vote': return 'Voto em Enquete';
      default: return type;
    }
  };

  const exportToCSV = () => {
    const headers = ['Data', 'Contato', 'Telefone', 'Tipo de Interação', 'Detalhes'];
    const csvContent = [
      headers.join(','),
      ...interactions.map(interaction => [
        formatDate(interaction.created_at),
        `"${interaction.contact_name}"`,
        interaction.contact_phone,
        `"${getInteractionTypeName(interaction.interaction_type)}"`,
        `"${interaction.button_text || interaction.list_option_text || interaction.keyword || interaction.response_text || '-'}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `interacoes-campanha-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        width: '100%',
        maxWidth: '900px',
        maxHeight: '85vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>

        {/* Header */}
        <div style={{
          backgroundColor: '#1e293b',
          color: 'white',
          padding: '24px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, letterSpacing: '-0.025em' }}>
              🎯 Detalhes de Interação
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#94a3b8', fontWeight: 500 }}>
              {interactions.length > 0 ? interactions[0].campaign_name : 'Monitoramento de Engajamento'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {interactions.length > 0 && (
              <button
                onClick={exportToCSV}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                📥 Exportar CSV
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                fontSize: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Filtros Locais */}
        <div style={{ padding: '20px 30px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 'bold', color: '#374151' }}>
                Tipo de Interação
              </label>
              <select
                value={localFilters.interactionType || ''}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, interactionType: e.target.value || undefined }))}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="">Todas</option>
                <option value="button_click">Clique em Botão</option>
                <option value="list_selection">Seleção de Lista</option>
                <option value="carousel_click">Clique em Carrossel</option>
                <option value="keyword_response">Palavra-chave</option>
                <option value="poll_vote">Voto em Enquete</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 'bold', color: '#374151' }}>
                Palavra-chave
              </label>
              <input
                type="text"
                placeholder="Filtrar por palavra-chave..."
                value={localFilters.keyword || ''}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, keyword: e.target.value || undefined }))}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{
              padding: '60px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <p style={{ margin: 0, color: '#6b7280' }}>Carregando interações...</p>
            </div>
          ) : interactions.length === 0 ? (
            <div style={{
              padding: '60px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{ fontSize: '64px' }}>🎯</div>
              <h3 style={{ margin: 0, fontSize: '20px', color: '#374151' }}>
                Nenhuma interação encontrada
              </h3>
              <p style={{ margin: 0, color: '#6b7280' }}>
                Esta campanha ainda não possui interações registradas
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Data/Hora
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Contato
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Tipo
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Detalhes da Interação
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {interactions.map((interaction) => (
                    <tr key={interaction.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px 16px', fontSize: '12px', color: '#6b7280' }}>
                        {formatDate(interaction.created_at)}
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>
                            {interaction.contact_name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {interaction.contact_phone}
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '6px 12px',
                          backgroundColor:
                            interaction.interaction_type === 'button_click' ? '#eff6ff' :
                              interaction.interaction_type === 'poll_vote' ? '#f5f3ff' :
                                interaction.interaction_type === 'keyword_response' ? '#fdf2f8' :
                                  '#f8fafc',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: 700,
                          color:
                            interaction.interaction_type === 'button_click' ? '#2563eb' :
                              interaction.interaction_type === 'poll_vote' ? '#6366f1' :
                                interaction.interaction_type === 'keyword_response' ? '#db2777' :
                                  '#475569',
                          textTransform: 'uppercase',
                          letterSpacing: '0.025em',
                          border: `1px solid ${interaction.interaction_type === 'button_click' ? '#dbeafe' :
                              interaction.interaction_type === 'poll_vote' ? '#ddd6fe' :
                                '#e2e8f0'
                            }`
                        }}>
                          <span style={{ fontSize: '14px' }}>{getInteractionTypeIcon(interaction.interaction_type)}</span>
                          {getInteractionTypeName(interaction.interaction_type)}
                        </div>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: '14px', color: '#374151' }}>
                          {interaction.button_text && (
                            <div>
                              <strong>Botão:</strong> {interaction.button_text}
                            </div>
                          )}
                          {interaction.list_option_text && (
                            <div>
                              <strong>Opção:</strong> {interaction.list_option_text}
                            </div>
                          )}
                          {interaction.keyword && (
                            <div>
                              <strong>Palavra-chave:</strong> {interaction.keyword}
                            </div>
                          )}
                          {interaction.response_text && (
                            <div style={{
                              marginTop: '4px',
                              padding: '8px',
                              backgroundColor: '#f8fafc',
                              borderRadius: '6px',
                              fontSize: '13px',
                              color: '#6b7280'
                            }}>
                              <strong>Resposta:</strong> "{interaction.response_text}"
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer com Paginação */}
        {pagination.pages > 1 && (
          <div style={{
            padding: '16px 30px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              {pagination.total} interações encontradas
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                style={{
                  padding: '6px 12px',
                  backgroundColor: pagination.page === 1 ? '#f3f4f6' : '#3b82f6',
                  color: pagination.page === 1 ? '#9ca3af' : 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: pagination.page === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                ← Anterior
              </button>

              <span style={{
                padding: '6px 12px',
                fontSize: '12px',
                color: '#374151',
                display: 'flex',
                alignItems: 'center'
              }}>
                {pagination.page} de {pagination.pages}
              </span>

              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
                style={{
                  padding: '6px 12px',
                  backgroundColor: pagination.page === pagination.pages ? '#f3f4f6' : '#3b82f6',
                  color: pagination.page === pagination.pages ? '#9ca3af' : 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: pagination.page === pagination.pages ? 'not-allowed' : 'pointer'
                }}
              >
                Próxima →
              </button>
            </div>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default InteractionDetailsModal;