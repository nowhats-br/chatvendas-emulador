import React from 'react';
import { FollowUpTask } from '../types';
import { cn } from '../../../lib/utils';

// Ícones customizados para evitar problemas de importação
const ChevronLeft = ({ size = 16 }: { size?: number }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' 
  }, 
  React.createElement('path', { d: 'm15 18-6-6 6-6' }));

const ChevronRight = ({ size = 16 }: { size?: number }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' 
  }, 
  React.createElement('path', { d: 'm9 18 6-6-6-6' }));

const CalIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('path', { d: 'M8 2v4' }),
  React.createElement('path', { d: 'M16 2v4' }),
  React.createElement('rect', { width: '18', height: '18', x: '3', y: '4', rx: '2' }),
  React.createElement('path', { d: 'M3 10h18' }));

interface FollowUpCalendarProps {
  tasks: FollowUpTask[];
}

export function FollowUpCalendar({ tasks }: FollowUpCalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const startDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 = Domingo

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: startDay }, (_, i) => i);

  const getTasksForDay = (day: number) => {
    return tasks.filter(t => {
        const d = new Date(t.dueDate);
        return d.getDate() === day && 
               d.getMonth() === currentDate.getMonth() && 
               d.getFullYear() === currentDate.getFullYear() &&
               t.status === 'pending';
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev: Date) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <CalIcon size={18} className="text-emerald-600" />
            {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex gap-1">
            <button 
              onClick={() => navigateMonth('prev')}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Mês anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => navigateMonth('next')}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Próximo mês"
            >
              <ChevronRight size={20} />
            </button>
        </div>
      </div>

      <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
            <div key={d} className="py-2 text-center text-xs font-bold text-gray-500 uppercase">
                {d}
            </div>
        ))}
      </div>

      <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-gray-200 gap-px border-b border-gray-200">
        {blanks.map(b => <div key={`blank-${b}`} className="bg-white min-h-[100px]" />)}
        
        {days.map(day => {
            const dayTasks = getTasksForDay(day);
            const isToday = day === new Date().getDate() && 
                           currentDate.getMonth() === new Date().getMonth() &&
                           currentDate.getFullYear() === new Date().getFullYear();

            return (
                <div key={day} className={cn("bg-white p-2 min-h-[100px] hover:bg-gray-50 transition-colors relative group", isToday && "bg-blue-50/30")}>
                    <span className={cn(
                        "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1",
                        isToday ? "bg-blue-600 text-white" : "text-gray-500"
                    )}>{day}</span>
                    
                    <div className="space-y-1 overflow-y-auto max-h-[80px] scrollbar-none">
                        {dayTasks.map(task => (
                            <div key={task.id} className={cn(
                                "text-[10px] px-1.5 py-1 rounded border truncate cursor-pointer transition-all hover:scale-105",
                                task.priority === 'high' ? "bg-red-50 border-red-100 text-red-700" :
                                task.type === 'ai_recovery' ? "bg-purple-50 border-purple-100 text-purple-700" :
                                "bg-gray-100 border-gray-200 text-gray-600"
                            )}
                            title={`${task.contactName} - ${task.aiReason || task.notes || 'Follow-up'}`}
                            >
                                {task.type === 'ai_recovery' && '🤖 '}{task.contactName.split(' ')[0]}
                            </div>
                        ))}
                    </div>
                    
                    {/* Add Button on Hover */}
                    <button 
                      className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 bg-emerald-500 text-white w-5 h-5 rounded flex items-center justify-center text-xs shadow-sm transition-opacity"
                      title="Adicionar tarefa"
                    >
                        +
                    </button>
                </div>
            );
        })}
      </div>
    </div>
  );
}
