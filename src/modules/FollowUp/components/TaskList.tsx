import React from 'react';
import { MessageSquare } from 'lucide-react';
import { FollowUpTask } from '../types';
import { cn } from '../../../lib/utils';

// Ícones customizados para evitar problemas de importação
const CheckCircle = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('path', { d: 'M9 11l3 3l8-8' }),
  React.createElement('path', { d: 'm21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.12 0 4.07.74 5.61 1.98' }));

const Clock = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('circle', { cx: '12', cy: '12', r: '10' }),
  React.createElement('polyline', { points: '12,6 12,12 16,14' }));

const Send = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'm22 2-7 20-4-9-9-4Z' }),
    React.createElement('path', { d: 'M22 2 11 13' }));

interface TaskListProps {
  tasks: FollowUpTask[];
  onAction: (task: FollowUpTask, action: 'chat' | 'complete' | 'snooze' | 'quick_send') => void;
}

export function TaskList({ tasks, onAction }: TaskListProps) {
  const [filter, setFilter] = React.useState<'all' | 'high' | 'ai'>('all');
  
  const filteredTasks = React.useMemo(() => {
    let filtered = tasks.filter(t => t.status === 'pending' || t.status === 'scheduled');
    
    if (filter === 'high') {
      filtered = filtered.filter(t => t.priority === 'high');
    } else if (filter === 'ai') {
      filtered = filtered.filter(t => t.type === 'ai_recovery' || t.type === 'kanban_stuck');
    }
    
    // Ordenar por prioridade e data
    return filtered.sort((a: FollowUpTask, b: FollowUpTask) => {
      // Tarefas agendadas primeiro se ainda não chegou a hora
      const aScheduled = a.status === 'scheduled' && new Date(a.dueDate) > new Date();
      const bScheduled = b.status === 'scheduled' && new Date(b.dueDate) > new Date();
      
      if (aScheduled !== bScheduled) {
        return aScheduled ? 1 : -1; // Agendadas por último
      }
      
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [tasks, filter]);

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex gap-2 mb-4">
        <button 
          onClick={() => setFilter('all')}
          className={cn(
            "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
            filter === 'all' ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          )}
        >
          Todas ({tasks.filter(t => t.status === 'pending' || t.status === 'scheduled').length})
        </button>
        <button 
          onClick={() => setFilter('high')}
          className={cn(
            "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
            filter === 'high' ? "bg-red-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          )}
        >
          Alta Prioridade ({tasks.filter(t => (t.status === 'pending' || t.status === 'scheduled') && t.priority === 'high').length})
        </button>
        <button 
          onClick={() => setFilter('ai')}
          className={cn(
            "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
            filter === 'ai' ? "bg-purple-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          )}
        >
          Sugestões IA ({tasks.filter(t => (t.status === 'pending' || t.status === 'scheduled') && (t.type === 'ai_recovery' || t.type === 'kanban_stuck')).length})
        </button>
      </div>

      <div className="space-y-3">
        {filteredTasks.length === 0 && (
            <div className="text-center py-10 text-gray-400">
                <CheckCircle size={48} className="mx-auto mb-3 text-emerald-200" />
                <p>
                  {filter === 'all' ? 'Nenhuma tarefa pendente. Bom trabalho!' :
                   filter === 'high' ? 'Nenhuma tarefa de alta prioridade!' :
                   'Nenhuma sugestão da IA no momento.'}
                </p>
            </div>
        )}

        {filteredTasks.map((task: FollowUpTask) => {
            const isScheduled = task.status === 'scheduled';
            const scheduledTime = isScheduled ? new Date(task.dueDate) : null;
            const isAutoSend = task.context?.autoSend;
            
            return (
            <div key={task.id} className={`bg-white p-4 rounded-xl border shadow-sm flex items-center gap-4 hover:shadow-md transition-all group ${
              isScheduled ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
            }`}>
                <button 
                    onClick={() => onAction(task, 'complete')}
                    className="w-6 h-6 rounded-full border-2 border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 flex items-center justify-center text-emerald-600 transition-colors"
                    disabled={isScheduled}
                >
                    <CheckCircle size={14} className={`${isScheduled ? 'opacity-30' : 'opacity-0 hover:opacity-100'}`} />
                </button>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <h4 className="font-bold text-gray-800 text-sm truncate">{task.contactName}</h4>
                        <div className="flex items-center gap-2">
                          {isScheduled && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-blue-100 text-blue-700 border border-blue-200">
                              {isAutoSend ? 'Auto-Envio' : 'Agendado'}
                            </span>
                          )}
                          <span className={cn(
                              "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                              task.priority === 'high' ? "bg-red-100 text-red-700" :
                              task.priority === 'medium' ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                          )}>
                              {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                          </span>
                        </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        {task.type === 'ai_recovery' && <span className="text-purple-600 font-bold">IA:</span>}
                        {task.aiReason || task.notes || 'Follow-up de rotina'}
                    </p>

                    <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400">
                        <Clock size={12} />
                        {isScheduled && scheduledTime ? (
                          <span className="text-blue-600 font-medium">
                            {scheduledTime.toLocaleDateString('pt-BR')} às {scheduledTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        ) : (
                          new Date(task.dueDate).toLocaleDateString('pt-BR')
                        )}
                        {task.kanbanStage && (
                            <span className="bg-gray-100 px-1.5 rounded text-gray-600 border border-gray-200 capitalize">
                                Funil: {task.kanbanStage}
                            </span>
                        )}
                        {task.ltv && (
                            <span className="bg-emerald-50 px-1.5 rounded text-emerald-700 border border-emerald-200 font-bold">
                                LTV: R$ {task.ltv.toFixed(0)}
                            </span>
                        )}
                        {task.sequenceId && (
                            <span className="bg-purple-50 px-1.5 rounded text-purple-700 border border-purple-200 font-bold">
                                Seq: {task.sequenceStep}/{task.context?.totalSteps || '?'}
                            </span>
                        )}
                    </div>
                </div>

                <div className={`flex items-center gap-2 transition-opacity ${
                  isScheduled ? 'opacity-50' : 'opacity-0 group-hover:opacity-100'
                }`}>
                    <button 
                        onClick={() => onAction(task, 'quick_send')}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100" 
                        title={isScheduled ? "Agendado para envio automático" : "Envio Rápido"}
                        disabled={isScheduled}
                    >
                        <Send size={18} />
                    </button>
                    <button 
                        onClick={() => onAction(task, 'chat')}
                        className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100" title="Abrir Chat"
                    >
                        <MessageSquare size={18} />
                    </button>
                    <button 
                        onClick={() => onAction(task, 'snooze')}
                        className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100" 
                        title={isScheduled ? "Cancelar agendamento" : "Adiar (+1 dia)"}
                    >
                        <Clock size={18} />
                    </button>
                </div>
            </div>
        )})}
      </div>
    </div>
  );
}
