import { useEffect, useState } from 'react';
import { AutoFollowUpService } from '../services/AutoFollowUpService';

/**
 * Hook simplificado para o sistema automático de follow-up
 */
export function useAutoFollowUp() {
  const [stats, setStats] = useState({
    activeSales: 0,
    totalSequences: 2,
    postSaleActive: true,
    futureNurturingActive: true
  });

  useEffect(() => {
    // Atualizar estatísticas
    try {
      const currentStats = AutoFollowUpService.getStats();
      setStats(currentStats);
    } catch (error) {
      console.warn('Erro ao carregar estatísticas:', error);
    }

    // Listener para quando tarefas automáticas são criadas
    const handleAutoTasksCreated = (event: CustomEvent) => {
      const { tasks } = event.detail;
      console.log(`✅ ${tasks.length} tarefas automáticas criadas`);

      // Notificar o sistema principal via evento
      window.dispatchEvent(new CustomEvent('followup-update'));
    };

    // Listener para cancelar sequências automáticas
    const handleCancelAutoSequences = (event: CustomEvent) => {
      const { contactId } = event.detail;
      console.log(`🚫 Cancelando sequências para ${contactId}`);

      // Notificar o sistema principal via evento
      window.dispatchEvent(new CustomEvent('followup-update'));
    };

    // Registrar listeners
    window.addEventListener('auto_tasks_created', handleAutoTasksCreated as EventListener);
    window.addEventListener('cancel_auto_sequences', handleCancelAutoSequences as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('auto_tasks_created', handleAutoTasksCreated as EventListener);
      window.removeEventListener('cancel_auto_sequences', handleCancelAutoSequences as EventListener);
    };
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const [sequences, setSequences] = useState<any[]>([]);

  const loadSequences = () => {
    try {
      const currentSequences = AutoFollowUpService.getSequences();
      setSequences(currentSequences);
    } catch (error) {
      console.warn('Erro ao carregar sequências:', error);
    }
  };

  useEffect(() => {
    loadSequences();
  }, []);

  return {
    stats,
    sequences,
    isLoading,
    refreshSequences: loadSequences,
    triggerSale: async (contactId: string, orderId: string, value: number, products: string[]) => {
      setIsLoading(true);
      try {
        await AutoFollowUpService.triggerSale(contactId, orderId, value, products);
        const newStats = AutoFollowUpService.getStats();
        setStats(newStats);
      } catch (error) {
        console.error('Erro ao disparar venda:', error);
      } finally {
        setIsLoading(false);
      }
    },
    getStats: () => {
      try {
        const currentStats = AutoFollowUpService.getStats();
        setStats(currentStats);
        return currentStats;
      } catch (error) {
        console.warn('Erro ao obter estatísticas:', error);
        return stats;
      }
    },
    toggleSequence: async (sequenceId: string, active: boolean) => {
      setIsLoading(true);
      try {
        await AutoFollowUpService.toggleSequence(sequenceId, active);
        const newStats = AutoFollowUpService.getStats();
        setStats(newStats);
        loadSequences();
      } catch (error) {
        console.error('Erro ao alterar sequência:', error);
      } finally {
        setIsLoading(false);
      }
    },
    updateSequence: async (sequenceId: string, updates: any) => {
      setIsLoading(true);
      try {
        await AutoFollowUpService.updateSequence(sequenceId, updates);
        loadSequences();
      } catch (error) {
        console.error('Erro ao atualizar sequência:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };
}