import React from 'react';
import { ReportFilters } from '../../../services/ReportsService';
import { reportsService } from '../../../services/ReportsService';

interface ReportFiltersPanelProps {
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
  onReset: () => void;
}

export function ReportFiltersPanel({ filters, onFiltersChange, onReset }: ReportFiltersPanelProps) {
  const [campaigns, setCampaigns] = React.useState<Array<{ id: string; name: string }>>([]);
  const [isExpanded, setIsExpanded] = React.useState(false);

  React.useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const campaignsData = await reportsService.getCampaignsForFilter();
      setCampaigns(campaignsData);
    } catch (error) {
      console.error('Erro ao carregar campanhas:', error);
    }
  };

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined
    });
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden'
    }}>
      {/* Header do Painel */}
      <div 
        style={{
          padding: '20px 24px',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}>🔍</span>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#374151' }}>
            Filtros de Relatório
          </h3>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReset();
            }}
            style={{
              padding: '6px 12px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Limpar
          </button>
          <span style={{ 
            fontSize: '20px', 
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}>
            ▼
          </span>
        </div>
      </div>

      {/* Conteúdo dos Filtros */}
      {isExpanded && (
        <div style={{ padding: '24px' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '20px' 
          }}>
            
            {/* Período */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px', 
                fontWeight: 'bold', 
                color: '#374151' 
              }}>
                📅 Data Inicial
              </label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px', 
                fontWeight: 'bold', 
                color: '#374151' 
              }}>
                📅 Data Final
              </label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Campanha */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px', 
                fontWeight: 'bold', 
                color: '#374151' 
              }}>
                🚀 Campanha
              </label>
              <select
                value={filters.campaignId || ''}
                onChange={(e) => handleFilterChange('campaignId', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: 'white'
                }}
              >
                <option value="">Todas as campanhas</option>
                {campaigns.map(campaign => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px', 
                fontWeight: 'bold', 
                color: '#374151' 
              }}>
                📊 Status
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: 'white'
                }}
              >
                <option value="">Todos os status</option>
                <option value="completed">Concluída</option>
                <option value="running">Em execução</option>
                <option value="paused">Pausada</option>
                <option value="failed">Falhou</option>
                <option value="draft">Rascunho</option>
              </select>
            </div>

            {/* Tipo de Mensagem */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px', 
                fontWeight: 'bold', 
                color: '#374151' 
              }}>
                💬 Tipo de Mensagem
              </label>
              <select
                value={filters.messageType || ''}
                onChange={(e) => handleFilterChange('messageType', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: 'white'
                }}
              >
                <option value="">Todos os tipos</option>
                <option value="text">Texto</option>
                <option value="media">Mídia</option>
                <option value="audio">Áudio</option>
                <option value="buttons">Botões</option>
                <option value="list">Lista</option>
                <option value="carousel">Carrossel</option>
              </select>
            </div>

            {/* Tipo de Interação */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px', 
                fontWeight: 'bold', 
                color: '#374151' 
              }}>
                🎯 Tipo de Interação
              </label>
              <select
                value={filters.interactionType || ''}
                onChange={(e) => handleFilterChange('interactionType', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: 'white'
                }}
              >
                <option value="">Todas as interações</option>
                <option value="button_click">Clique em Botão</option>
                <option value="list_selection">Seleção de Lista</option>
                <option value="carousel_click">Clique em Carrossel</option>
                <option value="keyword_response">Resposta por Palavra-chave</option>
                <option value="poll_vote">Voto em Enquete</option>
              </select>
            </div>

            {/* Palavra-chave */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px', 
                fontWeight: 'bold', 
                color: '#374151' 
              }}>
                🔑 Palavra-chave
              </label>
              <input
                type="text"
                placeholder="Digite uma palavra-chave..."
                value={filters.keyword || ''}
                onChange={(e) => handleFilterChange('keyword', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Resumo dos Filtros Ativos */}
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {Object.entries(filters).map(([key, value]) => {
                if (!value) return null;
                
                let label = '';
                let displayValue = value;
                
                switch (key) {
                  case 'dateFrom': label = 'De'; break;
                  case 'dateTo': label = 'Até'; break;
                  case 'campaignId': 
                    label = 'Campanha';
                    displayValue = campaigns.find(c => c.id === value)?.name || value;
                    break;
                  case 'status': label = 'Status'; break;
                  case 'messageType': label = 'Tipo'; break;
                  case 'interactionType': label = 'Interação'; break;
                  case 'keyword': label = 'Palavra-chave'; break;
                }
                
                return (
                  <div
                    key={key}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#eff6ff',
                      color: '#1d4ed8',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {label}: {displayValue}
                    <button
                      onClick={() => handleFilterChange(key as keyof ReportFilters, '')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#1d4ed8',
                        cursor: 'pointer',
                        fontSize: '12px',
                        padding: '0 2px'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportFiltersPanel;