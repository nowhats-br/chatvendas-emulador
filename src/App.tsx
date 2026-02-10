import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './hooks/useToast';
import { ToastContainer } from './components/ui/Toast';
import { useToast } from './hooks/useToast';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingFallback from './components/LoadingFallback';

// Lazy load pages for better performance
const DashboardPage = React.lazy(() => import('./modules/Dashboard/page'));
const AtendimentosPage = React.lazy(() => import('./modules/Atendimentos/page'));
const InstanciasPage = React.lazy(() => import('./modules/Instancias/page'));
const ConfiguracoesPage = React.lazy(() => import('./modules/Configuracoes/page'));
const ProdutosPage = React.lazy(() => import('./modules/Produtos/page'));
const PedidosPage = React.lazy(() => import('./modules/Pedidos/page'));
const ContatosPage = React.lazy(() => import('./modules/Contatos/page'));
const CampanhasPage = React.lazy(() => import('./modules/Campanhas/page'));
const EntregadoresPage = React.lazy(() => import('./modules/Entregadores/page'));
const FinanceiroPage = React.lazy(() => import('./modules/Financeiro/page'));
const KanbanPage = React.lazy(() => import('./modules/Kanban/page'));
const FlowListPage = React.lazy(() => import('./modules/Chatbot/pages/FlowListPage'));
const FlowBuilderPage = React.lazy(() => import('./modules/Chatbot/pages/FlowBuilderPage'));
const RespostasRapidasPage = React.lazy(() => import('./modules/RespostasRapidas/page'));
const FollowUpPage = React.lazy(() => import('./modules/FollowUp/page'));
const ModelosPage = React.lazy(() => import('./modules/Modelos/page'));
const RelatoriosPage = React.lazy(() => import('./modules/Relatorios/page'));
const AndroidEmulatorPage = React.lazy(() => import('./modules/AndroidEmulator/page'));

// Loading component
function LoadingSpinner() {
  return <LoadingFallback message="Carregando aplicação..." />;
}

// App Content Component
function AppContent() {
  const { toasts, removeToast } = useToast();

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <React.Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Rotas do Chatbot Builder (Full Screen) */}
            <Route path="/chatbot-builder/:id" element={
              <ErrorBoundary>
                <FlowBuilderPage />
              </ErrorBoundary>
            } />

            <Route path="/" element={
              <ErrorBoundary>
                <MainLayout />
              </ErrorBoundary>
            }>
              <Route index element={
                <ErrorBoundary>
                  <DashboardPage />
                </ErrorBoundary>
              } />
              <Route path="atendimentos" element={
                <ErrorBoundary>
                  <AtendimentosPage />
                </ErrorBoundary>
              } />
              <Route path="instancias" element={
                <ErrorBoundary>
                  <InstanciasPage />
                </ErrorBoundary>
              } />
              <Route path="chatbots" element={
                <ErrorBoundary>
                  <FlowListPage />
                </ErrorBoundary>
              } />
              <Route path="respostas-rapidas" element={
                <ErrorBoundary>
                  <RespostasRapidasPage />
                </ErrorBoundary>
              } />
              <Route path="modelos" element={
                <ErrorBoundary>
                  <ModelosPage />
                </ErrorBoundary>
              } />
              <Route path="follow-up" element={
                <ErrorBoundary>
                  <FollowUpPage />
                </ErrorBoundary>
              } />
              <Route path="produtos" element={
                <ErrorBoundary>
                  <ProdutosPage />
                </ErrorBoundary>
              } />
              <Route path="pedidos" element={
                <ErrorBoundary>
                  <PedidosPage />
                </ErrorBoundary>
              } />
              <Route path="entregadores" element={
                <ErrorBoundary>
                  <EntregadoresPage />
                </ErrorBoundary>
              } />
              <Route path="contatos" element={
                <ErrorBoundary>
                  <ContatosPage />
                </ErrorBoundary>
              } />
              <Route path="campanhas" element={
                <ErrorBoundary>
                  <CampanhasPage />
                </ErrorBoundary>
              } />
              <Route path="relatorios" element={
                <ErrorBoundary>
                  <RelatoriosPage />
                </ErrorBoundary>
              } />
              <Route path="financeiro" element={
                <ErrorBoundary>
                  <FinanceiroPage />
                </ErrorBoundary>
              } />
              <Route path="kanban" element={
                <ErrorBoundary>
                  <KanbanPage />
                </ErrorBoundary>
              } />
              <Route path="configuracoes" element={
                <ErrorBoundary>
                  <ConfiguracoesPage />
                </ErrorBoundary>
              } />
              <Route path="android-emulator" element={
                <ErrorBoundary>
                  <AndroidEmulatorPage />
                </ErrorBoundary>
              } />
            </Route>
          </Routes>
        </React.Suspense>
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
