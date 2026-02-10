/**
 * Configuração inicial do sistema automático de follow-up
 * 
 * Execute este arquivo uma vez para configurar o sistema em sua aplicação
 */

import { SaleIntegration } from './utils/SaleIntegration';
import { AutoFollowUpService } from './services/AutoFollowUpService';
import { FollowUpService } from './services/FollowUpService';

/**
 * Inicializa o sistema automático de follow-up
 */
export function initializeAutoFollowUp() {
  console.log('🚀 Inicializando sistema automático de follow-up...');
  
  try {
    // 1. Verificar se os serviços estão funcionando
    const stats = AutoFollowUpService.getStats();
    console.log('📊 Estatísticas do sistema:', stats);
    
    // 2. Configurar listeners globais
    setupGlobalListeners();
    
    // 3. Configurar interceptadores de API (opcional)
    setupAPIInterceptors();
    
    console.log('✅ Sistema automático de follow-up inicializado com sucesso!');
    
    return {
      success: true,
      message: 'Sistema inicializado com sucesso',
      stats
    };
  } catch (error) {
    console.error('❌ Erro ao inicializar sistema automático:', error);
    return {
      success: false,
      message: 'Erro na inicialização',
      error
    };
  }
}

/**
 * Configura listeners globais para detectar vendas automaticamente
 */
function setupGlobalListeners() {
  // Listener para mudanças no localStorage que podem indicar vendas
  window.addEventListener('storage', (event) => {
    if (event.key === 'recent_sale' || event.key === 'sale_completed') {
      try {
        const saleData = JSON.parse(event.newValue || '{}');
        if (saleData.contactId && saleData.orderId) {
          console.log('💾 Venda detectada via localStorage:', saleData);
          SaleIntegration.notifySaleCompleted(saleData);
        }
      } catch (error) {
        console.warn('Erro ao processar venda do localStorage:', error);
      }
    }
  });

  // Listener para eventos customizados de outros módulos
  window.addEventListener('order_completed', (event: any) => {
    console.log('🛒 Pedido completado detectado:', event.detail);
    const saleData = SaleIntegration.extractSaleData(event.detail);
    if (saleData) {
      SaleIntegration.notifySaleCompleted(saleData);
    }
  });

  // Listener para fechamento de tickets
  window.addEventListener('ticket_closed', (event: any) => {
    console.log('🎫 Ticket fechado detectado:', event.detail);
    const { ticketId, contactId, saleValue, products } = event.detail;
    
    if (saleValue && saleValue > 0) {
      SaleIntegration.onTicketClosed(ticketId, contactId, saleValue, products);
    }
  });

  console.log('👂 Listeners globais configurados');
}

/**
 * Configura interceptadores de API para detectar vendas automaticamente
 */
function setupAPIInterceptors() {
  // Interceptar chamadas fetch para APIs de venda
  const originalFetch = window.fetch;
  
  window.fetch = async function(...args) {
    const response = await originalFetch.apply(this, args);
    
    // Verificar se é uma API de venda
    const url = args[0] as string;
    if (typeof url === 'string') {
      // Interceptar APIs de tickets
      if (url.includes('/api/tickets') && url.includes('/close')) {
        try {
          const clonedResponse = response.clone();
          const data = await clonedResponse.json();
          
          if (data.saleValue && data.saleValue > 0) {
            console.log('🔗 Venda detectada via API de tickets:', data);
            SaleIntegration.onTicketClosed(
              data.id,
              data.contactId,
              data.saleValue,
              data.products || []
            );
          }
        } catch (error) {
          // Ignorar erros de parsing
        }
      }
      
      // Interceptar APIs de pedidos
      if (url.includes('/api/orders') && (url.includes('/complete') || url.includes('/confirm'))) {
        try {
          const clonedResponse = response.clone();
          const data = await clonedResponse.json();
          
          if (data.status === 'completed' && data.total > 0) {
            console.log('🔗 Venda detectada via API de pedidos:', data);
            SaleIntegration.notifySaleCompleted({
              contactId: data.customerId || data.contactId,
              orderId: data.id,
              value: data.total,
              products: data.items?.map((item: any) => item.name) || []
            });
          }
        } catch (error) {
          // Ignorar erros de parsing
        }
      }
    }
    
    return response;
  };

  console.log('🔗 Interceptadores de API configurados');
}

/**
 * Testa o sistema com uma venda simulada
 */
export function testAutoFollowUp() {
  console.log('🧪 Testando sistema automático...');
  
  const testSale = SaleIntegration.simulateSale(
    'test_contact_' + Date.now(),
    299.90,
    ['Produto Teste', 'Acessório']
  );
  
  console.log('✅ Venda de teste criada:', testSale);
  
  // Verificar se as tarefas foram criadas
  setTimeout(() => {
    const tasks = FollowUpService.getAll();
    const testTasks = tasks.filter(task => task.contactId === testSale.contactId);
    
    console.log(`📋 ${testTasks.length} tarefas criadas para o teste:`, testTasks);
  }, 1000);
  
  return testSale;
}

/**
 * Configurações recomendadas para produção
 */
export function setupProductionConfig() {
  console.log('⚙️ Configurando para produção...');
  
  // Ativar limpeza automática de tarefas antigas
  setInterval(() => {
    FollowUpService.cleanupOldTasks();
  }, 24 * 60 * 60 * 1000); // Diário
  
  // Configurar logs menos verbosos
  const originalLog = console.log;
  console.log = function(...args) {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('🤖')) {
      // Manter apenas logs importantes do sistema automático
      if (args[0].includes('Venda detectada') || args[0].includes('Erro')) {
        originalLog.apply(console, args);
      }
    } else {
      originalLog.apply(console, args);
    }
  };
  
  console.log('✅ Configuração de produção aplicada');
}

/**
 * Utilitário para debug - mostra estatísticas detalhadas
 */
export function debugAutoFollowUp() {
  console.log('🔍 Debug do sistema automático:');
  
  const stats = AutoFollowUpService.getStats();
  const tasks = FollowUpService.getAll();
  const autoTasks = tasks.filter(task => task.sequenceId?.startsWith('auto_'));
  
  console.log('📊 Estatísticas:', stats);
  console.log('📋 Total de tarefas:', tasks.length);
  console.log('🤖 Tarefas automáticas:', autoTasks.length);
  console.log('⏰ Tarefas agendadas:', tasks.filter(t => t.status === 'scheduled').length);
  console.log('✅ Tarefas completadas hoje:', tasks.filter(t => 
    t.status === 'completed' && 
    t.completedAt && 
    new Date(t.completedAt).toDateString() === new Date().toDateString()
  ).length);
  
  return {
    stats,
    totalTasks: tasks.length,
    autoTasks: autoTasks.length,
    scheduledTasks: tasks.filter(t => t.status === 'scheduled').length
  };
}

// Auto-inicializar se estiver no browser
if (typeof window !== 'undefined') {
  // Aguardar DOM carregar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAutoFollowUp);
  } else {
    // DOM já carregado
    setTimeout(initializeAutoFollowUp, 100);
  }
}