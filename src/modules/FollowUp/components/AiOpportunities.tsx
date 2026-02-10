import React from 'react';
import { MessageSquare, DollarSign, Sparkles, AlertTriangle, TrendingUp, Users, Crown, Clock } from 'lucide-react';
import { FollowUpTask } from '../types';
import { Avatar } from '../../../components/Avatar';
import { cn } from '../../../lib/utils';

interface AiOpportunitiesProps {
  tasks: FollowUpTask[];
  onAction: (task: FollowUpTask, action: 'chat' | 'complete' | 'snooze' | 'quick_send') => void;
}

const getTaskTypeInfo = (type: string) => {
  switch (type) {
    case 'ai_recovery':
      return {
        icon: TrendingUp,
        label: 'Recuperação VIP',
        color: 'text-purple-700',
        bg: 'bg-purple-50',
        border: 'border-purple-200'
      };
    case 'kanban_stuck':
      return {
        icon: AlertTriangle,
        label: 'Travado no Funil',
        color: 'text-orange-700',
        bg: 'bg-orange-50',
        border: 'border-orange-200'
      };
    case 'cold_lead':
      return {
        icon: Users,
        label: 'Lead Frio',
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-200'
      };
    case 'vip_attention':
      return {
        icon: Crown,
        label: 'Atenção VIP',
        color: 'text-yellow-700',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200'
      };
    case 'post_sale':
      return {
        icon: MessageSquare,
        label: 'Pós-venda',
        color: 'text-green-700',
        bg: 'bg-green-50',
        border: 'border-green-200'
      };
    default:
      return {
        icon: Sparkles,
        label: 'Sugestão IA',
        color: 'text-gray-700',
        bg: 'bg-gray-50',
        border: 'border-gray-200'
      };
  }
};

export function AiOpportunities({ tasks, onAction }: AiOpportunitiesProps) {
  const opportunities = tasks.filter(t =>
    t.status === 'pending' &&
    ['ai_recovery', 'kanban_stuck', 'cold_lead', 'vip_attention', 'post_sale'].includes(t.type)
  );

  if (opportunities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
        <Sparkles size={48} className="mb-4 text-emerald-300" />
        <p className="text-center font-medium">Nenhuma oportunidade detectada.</p>
        <p className="text-xs text-gray-400 mt-2 max-w-sm text-center">
          A IA analisará seus contatos e sugerirá ações aqui.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="text-purple-600" size={20} />
        <div>
          <h3 className="font-bold text-gray-800 text-lg">Radar de Oportunidades</h3>
          <p className="text-sm text-gray-500">{opportunities.length} oportunidades encontradas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {opportunities.map((task) => {
          const typeInfo = getTaskTypeInfo(task.type);
          const TypeIcon = typeInfo.icon;

          return (
            <div
              key={task.id}
              className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow relative"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <Avatar name={task.contactName} size="sm" />
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">{task.contactName}</h4>
                    <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 mt-1",
                      typeInfo.bg, typeInfo.color
                    )}>
                      <TypeIcon size={10} />
                      {typeInfo.label}
                    </span>
                  </div>
                </div>
                {task.ltv && (
                  <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 flex items-center gap-1">
                    <DollarSign size={10} /> {task.ltv.toLocaleString()}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="mb-4 space-y-3">
                <div className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100 italic">
                  "{task.aiReason}"
                </div>

                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Sugestão:</p>
                  <div className="text-xs text-gray-700 bg-blue-50/50 p-2 rounded border border-blue-100">
                    {task.suggestedMessage}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex gap-2 mt-auto pt-2 border-t border-gray-50">
                <button
                  onClick={() => onAction(task, 'quick_send')}
                  className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-emerald-700 flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageSquare size={14} /> Enviar Mensagem
                </button>
                <button
                  onClick={() => onAction(task, 'snooze')}
                  className="px-3 py-2 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Adiar"
                >
                  <Clock size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
