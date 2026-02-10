import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { SaleIntegration } from '../utils/SaleIntegration';
import { useAutoFollowUp } from '../hooks/useAutoFollowUp';
import { 
  PlayCircle as Play, 
  TestTube2 as TestTube, 
  Check as CheckCircle, 
  AlertTriangle as AlertCircle,
  Zap,
  MessageSquare,
  Clock,
  User
} from 'lucide-react';

interface TestSale {
  id: string;
  contactName: string;
  contactId: string;
  value: number;
  products: string[];
  status: 'pending' | 'processing' | 'completed';
  createdAt: string;
}

export function AutoFollowUpDemo() {
  const [testSales, setTestSales] = useState<TestSale[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testForm, setTestForm] = useState({
    contactName: 'João Silva',
    contactId: 'test_contact_' + Date.now(),
    value: 299.90,
    products: 'Produto Premium, Acessório'
  });

  // Usar o hook para integração
  const { getStats } = useAutoFollowUp();

  const handleCreateTestSale = async () => {
    setIsLoading(true);
    
    try {
      const saleId = `test_sale_${Date.now()}`;
      const products = testForm.products.split(',').map(p => p.trim());
      
      // Criar venda de teste
      const testSale: TestSale = {
        id: saleId,
        contactName: testForm.contactName,
        contactId: testForm.contactId,
        value: testForm.value,
        products,
        status: 'processing',
        createdAt: new Date().toISOString()
      };
      
      setTestSales(prev => [testSale, ...prev]);
      
      // Disparar venda completa no sistema (venda + entrega)
      const result = SaleIntegration.simulateCompleteSale(
        testForm.contactId,
        testForm.value,
        products
      );
      
      // Simular processamento
      setTimeout(() => {
        setTestSales(prev => prev.map(sale => 
          sale.id === saleId 
            ? { ...sale, status: 'completed' }
            : sale
        ));
      }, 2000);
      
      // Gerar novo ID para próximo teste
      setTestForm(prev => ({
        ...prev,
        contactId: 'test_contact_' + Date.now()
      }));
      
    } catch (error) {
      console.error('Erro ao criar venda de teste:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickTest = (scenario: string) => {
    const scenarios = {
      'cliente_novo': {
        contactName: 'Maria Santos',
        value: 199.90,
        products: 'Produto Básico'
      },
      'cliente_vip': {
        contactName: 'Carlos VIP',
        value: 899.90,
        products: 'Produto Premium, Produto Deluxe, Acessório VIP'
      },
      'venda_pequena': {
        contactName: 'Ana Costa',
        value: 49.90,
        products: 'Produto Simples'
      },
      'venda_grande': {
        contactName: 'Roberto Empresário',
        value: 1599.90,
        products: 'Pacote Completo, Consultoria, Suporte Premium'
      }
    };

    const scenario_data = scenarios[scenario as keyof typeof scenarios];
    if (scenario_data) {
      setTestForm({
        ...scenario_data,
        contactId: `test_${scenario}_${Date.now()}`
      });
    }
  };

  const getStatusIcon = (status: TestSale['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <Zap className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: TestSale['status']) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'processing':
        return 'Processando...';
      case 'completed':
        return 'Concluído';
      default:
        return 'Desconhecido';
    }
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 rounded-lg">
          <TestTube className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Demo & Testes
          </h3>
          <p className="text-sm text-gray-600">
            Teste o sistema automático com vendas simuladas
          </p>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vendas Ativas</p>
                <p className="text-xl font-bold text-gray-900">{stats.activeSales}</p>
              </div>
              <User className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sequências</p>
                <p className="text-xl font-bold text-gray-900">{stats.totalSequences}</p>
              </div>
              <MessageSquare className="h-6 w-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pós-venda</p>
                <div className="flex items-center gap-1">
                  {stats.postSaleActive ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium">
                    {stats.postSaleActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
              <Clock className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nutrição</p>
                <div className="flex items-center gap-1">
                  {stats.futureNurturingActive ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium">
                    {stats.futureNurturingActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
              <Zap className="h-6 w-6 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formulário de Teste */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-green-500" />
            Simular Venda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Cliente
              </label>
              <Input
                value={testForm.contactName}
                onChange={(e) => setTestForm(prev => ({ ...prev, contactName: e.target.value }))}
                placeholder="João Silva"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor da Venda
              </label>
              <Input
                type="number"
                step="0.01"
                value={testForm.value}
                onChange={(e) => setTestForm(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                placeholder="299.90"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Produtos (separados por vírgula)
            </label>
            <Input
              value={testForm.products}
              onChange={(e) => setTestForm(prev => ({ ...prev, products: e.target.value }))}
              placeholder="Produto A, Produto B, Acessório"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleCreateTestSale}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <Zap className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Simular Venda Completa
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                const products = testForm.products.split(',').map(p => p.trim());
                SaleIntegration.simulateSale(testForm.contactId, testForm.value, products);
                alert('Venda registrada! Aguardando entrega para iniciar follow-up.');
              }}
              size="sm"
            >
              Apenas Venda
            </Button>

            <Button
              variant="outline"
              onClick={() => handleQuickTest('cliente_novo')}
              size="sm"
            >
              Cliente Novo
            </Button>

            <Button
              variant="outline"
              onClick={() => handleQuickTest('cliente_vip')}
              size="sm"
            >
              Cliente VIP
            </Button>

            <Button
              variant="outline"
              onClick={() => handleQuickTest('venda_pequena')}
              size="sm"
            >
              Venda Pequena
            </Button>

            <Button
              variant="outline"
              onClick={() => handleQuickTest('venda_grande')}
              size="sm"
            >
              Venda Grande
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Testes */}
      {testSales.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Testes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testSales.map((sale) => (
                <div 
                  key={sale.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(sale.status)}
                    <div>
                      <h4 className="font-medium text-gray-900">{sale.contactName}</h4>
                      <p className="text-sm text-gray-600">
                        R$ {sale.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} • {sale.products.join(', ')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={sale.status === 'completed' ? 'default' : 'secondary'}
                      className={
                        sale.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : sale.status === 'processing'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }
                    >
                      {getStatusText(sale.status)}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(sale.createdAt).toLocaleTimeString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle>Como Testar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>1.</strong> Preencha os dados da venda simulada acima</p>
            <p><strong>2.</strong> Clique em "Simular Venda Completa" para disparar venda + entrega</p>
            <p><strong>3.</strong> Aguarde 3 segundos para simular a entrega</p>
            <p><strong>4.</strong> Vá para a aba "Lista" para ver as tarefas criadas automaticamente</p>
            <p><strong>5.</strong> As sequências serão:</p>
            <ul className="ml-4 space-y-1">
              <li>• <strong>2 dias após entrega:</strong> Pesquisa de satisfação</li>
              <li>• <strong>30 dias:</strong> Nutrição sutil</li>
              <li>• <strong>60 dias:</strong> Recomendação de produto</li>
              <li>• <strong>120 dias:</strong> Nutrição gentil</li>
            </ul>
            <p className="text-blue-600"><strong>Integração:</strong> O sistema aguarda a entrega real antes de iniciar o follow-up, evitando duplicação com mensagens do módulo pedidos.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}