import React from 'react';
import { reportsService, CampaignReport, ReportFilters, ExportOptions, CampaignStats, Pagination } from '../../services/ReportsService';
import { ReportFiltersPanel } from './components/ReportFiltersPanel';
import { CampaignReportsTable } from './components/CampaignReportsTable';
import { ReportStats } from './components/ReportStats';
import { InteractionDetailsModal } from './components/InteractionDetailsModal';
import { ExportModal } from './components/ExportModal';

export function RelatoriosPage() {
  const [reports, setReports] = React.useState<CampaignReport[]>([]);
  const [stats, setStats] = React.useState<CampaignStats | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [filters, setFilters] = React.useState<ReportFilters>({
    dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias atrás
    dateTo: new Date().toISOString().split('T')[0] // hoje
  });
  const [pagination, setPagination] = React.useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Modais
  const [showInteractionDetails, setShowInteractionDetails] = React.useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = React.useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = React.useState<'excel' | 'pdf' | undefined>(undefined);
  const [showExportModal, setShowExportModal] = React.useState(false);

  // Carregar dados iniciais
  React.useEffect(() => {
    loadReports();
    loadStats();
  }, [filters, pagination.page]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await reportsService.getCampaignReports({
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      });

      setReports(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
        pages: response.pagination.pages
      }));
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await reportsService.getCampaignStats(filters);
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleFiltersChange = (newFilters: ReportFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleViewInteractions = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    setShowInteractionDetails(true);
  };

  const handleOpenExportModal = (campaignId: string, format?: 'excel' | 'pdf') => {
    setSelectedCampaignId(campaignId);
    setSelectedFormat(format);
    setShowExportModal(true);
  };

  const handleExport = async (options: ExportOptions) => {
    try {
      // Se tiver um ID selecionado, exporta apenas essa campanha
      const exportFilters = selectedCampaignId
        ? { campaignId: selectedCampaignId }
        : filters;

      const blob = await reportsService.exportReport(exportFilters, options);

      // Criar URL para download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `relatorio-campanhas-${timestamp}.${options.format === 'excel' ? 'xlsx' : 'pdf'}`;
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setShowExportModal(false);
      setSelectedCampaignId(null);
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      alert('Erro ao exportar relatório. Tente novamente.');
    }
  };

  const handleDeleteReport = async (campaignId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este relatório? Esta ação é irreversível.')) return;
    try {
      await reportsService.deleteCampaignReport(campaignId);
      loadReports();
      loadStats();
    } catch (error) {
      console.error('Erro ao excluir relatório:', error);
      alert('Erro ao excluir relatório.');
    }
  };

  const handleDeleteAllReports = async () => {
    if (!window.confirm('Tem certeza que deseja excluir TODOS os relatórios filtrados? Esta ação é irreversível.')) return;
    try {
      await reportsService.deleteAllCampaignReports(filters);
      // Resetar página para 1 e recarregar
      setPagination(prev => ({ ...prev, page: 1 }));
      loadReports();
      loadStats();
    } catch (error) {
      console.error('Erro ao excluir todos os relatórios:', error);
      alert('Erro ao excluir relatórios.');
    }
  };

  return (
    <div style={{
      height: '100vh',
      overflowY: 'auto',
      backgroundColor: '#f1f5f9',
      padding: '24px',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: '32px',
              fontWeight: 800,
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              letterSpacing: '-0.025em'
            }}>
              <span style={{
                padding: '12px',
                backgroundColor: 'white',
                borderRadius: '16px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>📊</span>
              Relatórios de Performance
            </h1>
            <p style={{ margin: '8px 0 0 0', fontSize: '16px', color: '#64748b', fontWeight: 500 }}>
              Métricas detalhadas e insights das suas campanhas de WhatsApp
            </p>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 1fr) 3fr',
        gap: '32px',
        alignItems: 'start'
      }}>
        {/* Lado Esquerdo - Estatísticas na Vertical */}
        <aside style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          position: 'sticky',
          top: '0'
        }}>
          {stats && <ReportStats stats={stats} isVertical={true} />}
        </aside>

        {/* Lado Direito - Filtros e Tabela */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Filtros */}
          <ReportFiltersPanel
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onReset={() => handleFiltersChange({
              dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              dateTo: new Date().toISOString().split('T')[0]
            })}
          />

          {/* Tabela de Relatórios */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
            marginBottom: '40px',
            border: '1px solid #e2e8f0'
          }}>
            <CampaignReportsTable
              reports={reports}
              loading={loading}
              pagination={pagination}
              onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
              onViewInteractions={handleViewInteractions}
              onExport={handleOpenExportModal}
              onDelete={handleDeleteReport}
              onDeleteAll={handleDeleteAllReports}
            />
          </div>
        </main>
      </div>

      {/* Modal de Detalhes de Interações */}
      <InteractionDetailsModal
        isOpen={showInteractionDetails}
        campaignId={selectedCampaignId}
        filters={filters}
        onClose={() => {
          setShowInteractionDetails(false);
          setSelectedCampaignId(null);
        }}
      />

      {/* Modal de Exportação */}
      <ExportModal
        isOpen={showExportModal}
        initialFormat={selectedFormat}
        onClose={() => {
          setShowExportModal(false);
          setSelectedFormat(undefined);
        }}
        onExport={handleExport}
      />
    </div>
  );
}

export default RelatoriosPage;