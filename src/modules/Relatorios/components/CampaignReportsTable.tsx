import React from 'react';
import { CampaignReport } from '../../../services/ReportsService';

interface CampaignReportsTableProps {
  reports: CampaignReport[];
  loading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  onPageChange: (page: number) => void;
  onViewInteractions: (campaignId: string) => void;
  onExport: (campaignId: string, format: 'excel' | 'pdf') => void;
  onDelete: (campaignId: string) => void;
  onDeleteAll: () => void;
}

export function CampaignReportsTable({
  reports,
  loading,
  pagination,
  onPageChange,
  onViewInteractions,
  onExport,
  onDelete,
  onDeleteAll
}: CampaignReportsTableProps) {

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return { bg: '#dcfce7', text: '#166534' };
      case 'running': return { bg: '#dbeafe', text: '#1d4ed8' };
      case 'paused': return { bg: '#fef3c7', text: '#92400e' };
      case 'failed': return { bg: '#fee2e2', text: '#dc2626' };
      case 'draft': return { bg: '#f3f4f6', text: '#374151' };
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluída';
      case 'running': return 'Em execução';
      case 'paused': return 'Pausada';
      case 'failed': return 'Falhou';
      case 'draft': return 'Rascunho';
      default: return status;
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return '📝';
      case 'media': return '🖼️';
      case 'audio': return '🎤';
      case 'buttons': return '🔘';
      case 'list': return '📋';
      case 'carousel': return '🎠';
      default: return '💬';
    }
  };

  if (loading) {
    return (
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
        <p style={{ margin: 0, color: '#6b7280', fontSize: '16px' }}>
          Carregando relatórios...
        </p>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div style={{
        padding: '60px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{ fontSize: '64px' }}>📊</div>
        <h3 style={{ margin: 0, fontSize: '20px', color: '#374151' }}>
          Nenhum relatório encontrado
        </h3>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '16px' }}>
          Ajuste os filtros ou verifique se há campanhas no período selecionado
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Header da Tabela */}
      <div style={{
        padding: '24px',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#334155',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '20px' }}>📋</span> Detalhamento das Campanhas
          <span style={{
            fontSize: '12px',
            fontWeight: 'normal',
            color: '#64748b',
            backgroundColor: '#e2e8f0',
            padding: '2px 8px',
            borderRadius: '12px',
            marginLeft: '8px'
          }}>
            {pagination.total} registros
          </span>
        </h3>
        <button
          onClick={onDeleteAll}
          style={{
            padding: '8px 16px',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            border: '1px solid #fecaca',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#fecaca';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#fee2e2';
          }}
        >
          🗑️ Excluir Todos
        </button>
      </div>

      {/* Tabela */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc' }}>
              <th style={{ padding: '12px 10px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                Campanha
              </th>
              <th style={{ padding: '12px 10px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                Status
              </th>
              <th style={{ padding: '12px 10px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                Enviadas
              </th>
              <th style={{ padding: '12px 10px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                Entregues
              </th>
              <th style={{ padding: '12px 10px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                Lidas
              </th>
              <th style={{ padding: '12px 10px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                Engaj.
              </th>
              <th style={{ padding: '12px 10px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => {
              const statusStyle = getStatusColor(report.status);
              const totalInteractions = report.button_clicks + report.list_selections +
                report.carousel_clicks + report.keyword_responses + report.poll_votes;

              return (
                <tr key={report.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px 10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#374151' }}>
                        {report.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {getMessageTypeIcon(report.message_type)} {formatDate(report.created_at)}
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: '8px',
                      fontSize: '10px',
                      fontWeight: 800,
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.text,
                      textTransform: 'uppercase'
                    }}>
                      {getStatusText(report.status)}
                    </span>
                  </td>

                  <td style={{ padding: '12px 10px', textAlign: 'center', fontSize: '12px', fontWeight: 700 }}>
                    {report.messages_sent}
                    <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 400 }}>
                      /{report.total_contacts}
                    </div>
                  </td>

                  <td style={{ padding: '12px 10px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#059669' }}>
                    {report.messages_delivered}
                    <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 400 }}>
                      {formatPercentage(report.delivery_rate)}
                    </div>
                  </td>

                  <td style={{ padding: '12px 10px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#3b82f6' }}>
                    {report.messages_read}
                    <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 400 }}>
                      {formatPercentage(report.read_rate)}
                    </div>
                  </td>

                  <td style={{ padding: '12px 10px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#ef4444' }}>
                    {formatPercentage(report.interaction_rate)}
                    <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 400 }}>
                      {totalInteractions} int.
                    </div>
                  </td>

                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <button
                        onClick={() => onViewInteractions(report.id)}
                        title="Ver Detalhes"
                        style={{
                          width: '28px',
                          height: '28px',
                          backgroundColor: '#eff6ff',
                          color: '#2563eb',
                          border: '1px solid #dbeafe',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#dbeafe'; }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#eff6ff'; }}
                      >
                        👁️
                      </button>

                      <button
                        onClick={() => onExport(report.id, 'excel')}
                        title="Excel"
                        style={{
                          width: '28px',
                          height: '28px',
                          backgroundColor: '#ecfdf5',
                          color: '#059669',
                          border: '1px solid #d1fae5',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#d1fae5'; }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ecfdf5'; }}
                      >
                        📄
                      </button>

                      <button
                        onClick={() => onExport(report.id, 'pdf')}
                        title="PDF"
                        style={{
                          width: '28px',
                          height: '28px',
                          backgroundColor: '#fff1f2',
                          color: '#e11d48',
                          border: '1px solid #ffe4e6',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#ffe4e6'; }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#fff1f2'; }}
                      >
                        📕
                      </button>

                      <button
                        onClick={() => onDelete(report.id)}
                        title="Excluir Relatório"
                        style={{
                          width: '28px',
                          height: '28px',
                          backgroundColor: '#f9fafb',
                          color: '#6b7280',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#fee2e2';
                          e.currentTarget.style.color = '#dc2626';
                          e.currentTarget.style.borderColor = '#fecaca';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                          e.currentTarget.style.color = '#6b7280';
                          e.currentTarget.style.borderColor = '#e5e7eb';
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {pagination.pages > 1 && (
        <div style={{
          padding: '20px 24px',
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} resultados
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              style={{
                padding: '8px 12px',
                backgroundColor: pagination.page === 1 ? '#f3f4f6' : '#3b82f6',
                color: pagination.page === 1 ? '#9ca3af' : 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: pagination.page === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              ← Anterior
            </button>

            <span style={{
              padding: '8px 12px',
              fontSize: '14px',
              color: '#374151',
              display: 'flex',
              alignItems: 'center'
            }}>
              Página {pagination.page} de {pagination.pages}
            </span>

            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              style={{
                padding: '8px 12px',
                backgroundColor: pagination.page === pagination.pages ? '#f3f4f6' : '#3b82f6',
                color: pagination.page === pagination.pages ? '#9ca3af' : 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: pagination.page === pagination.pages ? 'not-allowed' : 'pointer'
              }}
            >
              Próxima →
            </button>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  );
}

export default CampaignReportsTable;