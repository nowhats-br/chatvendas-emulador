import React from 'react';
import { cn } from '../../../lib/utils';

interface RecurringSchedule {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  time: string;
  template: string;
  targetAudience: 'all' | 'inactive' | 'vip' | 'recent_buyers' | 'custom';
  customFilters?: any;
  isActive: boolean;
  nextRun: string;
  lastRun?: string;
  totalRuns: number;
  successRate: number;
}

export function RecurringScheduler() {
  const [schedules, setSchedules] = React.useState<RecurringSchedule[]>([]);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockSchedules: RecurringSchedule[] = [
        {
          id: '1',
          name: 'Follow-up Clientes Inativos',
          description: 'Reativar clientes que não compram há 30 dias',
          frequency: 'weekly',
          interval: 1,
          daysOfWeek: [1, 3, 5],
          time: '14:00',
          template: 'Reativação Cliente Inativo',
          targetAudience: 'inactive',
          isActive: true,
          nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          lastRun: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          totalRuns: 24,
          successRate: 18.5
        },
        {
          id: '2',
          name: 'Nutrição VIP Mensal',
          description: 'Mensagem especial para clientes VIP todo mês',
          frequency: 'monthly',
          interval: 1,
          dayOfMonth: 1,
          time: '10:00',
          template: 'Mensagem VIP Exclusiva',
          targetAudience: 'vip',
          isActive: true,
          nextRun: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          lastRun: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          totalRuns: 6,
          successRate: 34.2
        }
      ];

      setSchedules(mockSchedules);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSchedule = async (id: string) => {
    setSchedules(prev => prev.map(schedule => 
      schedule.id === id 
        ? { ...schedule, isActive: !schedule.isActive }
        : schedule
    ));
  };

  const deleteSchedule = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este agendamento recorrente?')) {
      setSchedules(prev => prev.filter(schedule => schedule.id !== id));
    }
  };

  const runNow = async (id: string) => {
    const schedule = schedules.find(s => s.id === id);
    if (schedule) {
      alert(`Executando agendamento "${schedule.name}" agora...`);
    }
  };

  const getFrequencyText = (schedule: RecurringSchedule) => {
    switch (schedule.frequency) {
      case 'daily':
        return 'Diariamente';
      case 'weekly':
        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        return `Semanalmente (${schedule.daysOfWeek?.map(d => days[d]).join(', ')})`;
      case 'monthly':
        return `Mensalmente (dia ${schedule.dayOfMonth})`;
      case 'custom':
        return `A cada ${schedule.interval} dias`;
      default:
        return 'Personalizado';
    }
  };

  const getAudienceText = (audience: string) => {
    const audiences = {
      'all': 'Todos os contatos',
      'inactive': 'Clientes inativos',
      'vip': 'Clientes VIP',
      'recent_buyers': 'Compradores recentes',
      'custom': 'Filtros personalizados'
    };
    return audiences[audience as keyof typeof audiences] || audience;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">Carregando agendamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            🔄 Follow-ups Recorrentes
          </h2>
          <p className="text-gray-500 text-sm">Automatize follow-ups com agendamentos recorrentes</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition font-medium"
        >
          ➕ Novo Agendamento
        </button>
      </div>

      <div className="space-y-4">
        {schedules.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <div className="text-6xl mb-4">🔄</div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhum agendamento recorrente</h3>
            <p className="text-gray-500 mb-4">Crie seu primeiro agendamento automático</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Criar Agendamento
            </button>
          </div>
        ) : (
          schedules.map((schedule) => (
            <div key={schedule.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{schedule.name}</h3>
                    <span className={cn(
                      "px-2 py-1 text-xs font-medium rounded-full",
                      schedule.isActive 
                        ? "bg-green-100 text-green-700" 
                        : "bg-gray-100 text-gray-600"
                    )}>
                      {schedule.isActive ? 'Ativo' : 'Pausado'}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{schedule.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-500">📅</span>
                      <span className="text-gray-600">{getFrequencyText(schedule)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">🕐</span>
                      <span className="text-gray-600">às {schedule.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-purple-500">👥</span>
                      <span className="text-gray-600">{getAudienceText(schedule.targetAudience)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleSchedule(schedule.id)}
                    className={cn(
                      "p-2 rounded-lg transition",
                      schedule.isActive
                        ? "bg-orange-100 text-orange-600 hover:bg-orange-200"
                        : "bg-green-100 text-green-600 hover:bg-green-200"
                    )}
                    title={schedule.isActive ? 'Pausar' : 'Ativar'}
                  >
                    {schedule.isActive ? '⏸️' : '▶️'}
                  </button>
                  <button
                    onClick={() => runNow(schedule.id)}
                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                    title="Executar agora"
                  >
                    ⚡
                  </button>
                  <button
                    onClick={() => deleteSchedule(schedule.id)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                    title="Excluir"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-800">{schedule.totalRuns}</div>
                  <div className="text-xs text-gray-500">Execuções</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{schedule.successRate}%</div>
                  <div className="text-xs text-gray-500">Taxa de Sucesso</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">
                    {schedule.lastRun ? new Date(schedule.lastRun).toLocaleDateString('pt-BR') : 'Nunca'}
                  </div>
                  <div className="text-xs text-gray-500">Última Execução</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-blue-600">
                    {new Date(schedule.nextRun).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="text-xs text-gray-500">Próxima Execução</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Novo Agendamento Recorrente</h3>
            <p className="text-gray-600 mb-4">
              Funcionalidade em desenvolvimento. Em breve você poderá criar agendamentos recorrentes personalizados.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}