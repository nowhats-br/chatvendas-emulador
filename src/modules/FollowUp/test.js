/**
 * Arquivo de teste para o sistema automático de follow-up
 * Execute no console do navegador para testar
 */

// Função para testar o sistema automático
function testarFollowUpAutomatico() {
  console.log('🧪 Iniciando teste do sistema automático...');
  
  // Verificar se os serviços estão disponíveis
  if (typeof SaleIntegration === 'undefined') {
    console.error('❌ SaleIntegration não está disponível');
    return false;
  }
  
  if (typeof AutoFollowUpService === 'undefined') {
    console.error('❌ AutoFollowUpService não está disponível');
    return false;
  }
  
  console.log('✅ Serviços disponíveis');
  
  // Testar simulação de venda
  try {
    const testSale = SaleIntegration.simulateSale(
      'test_contact_' + Date.now(),
      299.90,
      ['Produto Teste', 'Acessório']
    );
    
    console.log('✅ Venda simulada:', testSale);
    
    // Verificar estatísticas
    const stats = AutoFollowUpService.getStats();
    console.log('📊 Estatísticas:', stats);
    
    console.log('🎉 Teste concluído com sucesso!');
    console.log('💡 Vá para Follow-up → Lista para ver as tarefas criadas');
    
    return true;
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return false;
  }
}

// Disponibilizar globalmente
if (typeof window !== 'undefined') {
  window.testarFollowUpAutomatico = testarFollowUpAutomatico;
  
  console.log('🧪 Teste disponível! Execute: testarFollowUpAutomatico()');
}