import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FollowUpService } from './services/FollowUpService';
import { AIConfigService } from '../../services/AIConfigService';
import { FollowUpTask, FollowUpStats } from './types';
import { AiOpportunities } from './components/AiOpportunities';
import { FollowUpCalendar } from './components/FollowUpCalendar';
import { TaskList } from './components/TaskList';
import { QuickSendModal } from './components/QuickSendModal';
import { NewScheduleModal } from './components/NewScheduleModal';
import { FollowUpSettingsModal } from './components/FollowUpSettingsModal';
import { useAutoFollowUp } from './hooks/useAutoFollowUp';
import { cn } from '../../lib/utils';
import {
  CalendarClock,
  Sparkles,
  ListTodo,
  Plus,
  RefreshCw,
  Settings
} from 'lucide-react';

type ViewMode = 'suggestions' | 'list' | 'calendar';

export default function FollowUpPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = React.useState<FollowUpTask[]>([]);
  const [stats, setStats] = React.useState<FollowUpStats | null>(null);
  const [viewMode, setViewMode] = React.useState<ViewMode>('list');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Estados dos Modais
  const [showQuickSend, setShowQuickSend] = React.useState(false);
  const [showNewSchedule, setShowNewSchedule] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<FollowUpTask | null>(null);

  // Inicializar sistema automático
  useAutoFollowUp();

  const loadData = () => {
    try {
      setTasks(FollowUpService.getAll());
      setStats(FollowUpService.getStats());
    } catch (error) {
      console.error('Erro ao carregar dados do follow-up:', error);
      setTasks([]);
      setStats({
        pending: 0,
        scheduled: 0,
        completedToday: 0,
        highPriority: 0,
        recoveryPotential: 0,
        activeSequences: 0
      });
    }
  };

  React.useEffect(() => {
    setIsLoading(true);
    loadData();
    setIsLoading(false);

    window.addEventListener('followup-update', loadData);
    return () => window.removeEventListener('followup-update', loadData);
  }, []);

  const handleAction = (task: FollowUpTask, action: 'chat' | 'complete' | 'snooze' | 'quick_send') => {
    if (action === 'complete') {
      FollowUpService.completeTask(task.id);
      loadData(); // Atualiza imediatamente
    } else if (action === 'snooze') {
      FollowUpService.snoozeTask(task.id, 1);
      loadData(); // Atualiza imediatamente
    } else if (action === 'chat') {
      // Navega para o chat com o ID do contato
      navigate(`/atendimentos?contact=${task.contactId}`);
    } else if (action === 'quick_send') {
      // Abre modal de envio rápido
      setSelectedTask(task);
      setShowQuickSend(true);
    }
  };

  const handleRefreshAi = async () => {
    setIsRefreshing(true);
    try {
      await FollowUpService.generateAiTasks();
      loadData();
      if (viewMode !== 'suggestions') {
        setViewMode('suggestions');
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const aiCount = React.useMemo(() => {
    return tasks.filter((t: FollowUpTask) =>
      ['ai_recovery', 'kanban_stuck', 'cold_lead', 'vip_attention', 'post_sale'].includes(t.type) &&
      t.status === 'pending'
    ).length;
  }, [tasks]);

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 shrink-0">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <CalendarClock className="text-emerald-600" />
              Follow-up
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Gerencie seus retornos e não perca vendas.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              title="Configurações de Automação"
            >
              <Settings size={20} />
            </button>
            <button
              onClick={handleRefreshAi}
              disabled={isRefreshing}
              className={cn(
                "bg-purple-50 text-purple-700 border border-purple-200 px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-100 transition text-sm font-medium",
                isRefreshing && "opacity-50 cursor-not-allowed"
              )}
              title="Buscar oportunidades com IA"
            >
              <Sparkles size={16} className={isRefreshing ? "animate-spin" : ""} />
              {isRefreshing ? 'Analisando...' : 'Buscar Oportunidades'}
            </button>
            <button
              onClick={() => setShowNewSchedule(true)}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition shadow-sm font-bold text-sm"
            >
              <Plus size={18} />
              Novo Agendamento
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setViewMode('suggestions')}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all relative",
                viewMode === 'suggestions' ? "bg-white text-purple-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Sparkles size={16} />
              Sugestões
              {aiCount > 0 && (
                <span className="ml-1 bg-purple-100 text-purple-700 text-xs px-1.5 rounded-full font-bold">
                  {aiCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all relative",
                viewMode === 'list' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <ListTodo size={16} />
              Minhas Tarefas
              {stats && stats.pending > 0 && (
                <span className="ml-1 bg-gray-200 text-gray-700 text-xs px-1.5 rounded-full font-bold">
                  {stats.pending}
                </span>
              )}
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all",
                viewMode === 'calendar' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <CalendarClock size={16} />
              Calendário
            </button>
          </div>

          {/* Mini Stats (Simplified) */}
          {stats && (
            <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                <span>Pendentes: <span className="font-bold text-gray-900">{stats.pending}</span></span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span>Prioridade: <span className="font-bold text-gray-900">{stats.highPriority}</span></span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Feitos Hoje: <span className="font-bold text-gray-900">{stats.completedToday}</span></span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw size={32} className="animate-spin text-gray-400" />
              <p className="text-gray-500">Carregando...</p>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            {viewMode === 'suggestions' && <AiOpportunities tasks={tasks} onAction={handleAction} />}
            {viewMode === 'list' && <TaskList tasks={tasks} onAction={handleAction} />}
            {viewMode === 'calendar' && <FollowUpCalendar tasks={tasks} />}
          </div>
        )}
      </div>

      {/* QuickSend Modal */}
      {showQuickSend && selectedTask && (
        <QuickSendModal
          isOpen={showQuickSend}
          onClose={() => {
            setShowQuickSend(false);
            setSelectedTask(null);
            loadData(); // Recarregar dados após envio
          }}
          contactId={selectedTask.contactId}
          contactName={selectedTask.contactName}
          contactPhone={selectedTask.contactPhone}
          suggestedMessage={selectedTask.suggestedMessage}
          taskId={selectedTask.id}
        />
      )}

      {/* NewSchedule Modal */}
      <NewScheduleModal
        isOpen={showNewSchedule}
        onClose={() => setShowNewSchedule(false)}
        onSuccess={() => {
          loadData(); // Recarregar dados após criar agendamento
        }}
      />

      {/* Settings Modal */}
      <FollowUpSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}
