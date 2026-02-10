import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Switch } from '../../../components/ui/switch';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { AutoFollowUpDemo } from './AutoFollowUpDemo';
import { useAutoFollowUp } from '../hooks/useAutoFollowUp';
import { 
  Settings, 
  Zap, 
  Clock, 
  MessageSquare
} from 'lucide-react';

interface AutoSequenceConfig {
  id: string;
  name: string;
  description: string;
  active: boolean;
  steps: number;
  totalDays: number;
}

export function AutoFollowUpSettings() {
  const [sequences, setSequences] = useState<AutoSequenceConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Usar o hook para integração
  const { stats, getStats, toggleSequence, triggerSale } = useAutoFollowUp();

  useEffect(() => {
    loadSequences();
  }, []);

  const loadSequences = () => {
    // Configurações das sequências automáticas
    setSequences([
      {
        id: 'post_sale_complete',
        name: 'Pós-venda Completa',
        description: 'Confirmação (1 dia) + Satisfação (7 dias)',
        active: true,
        steps: 2,
        totalDays: 7
      },
      {
        id: 'future_purchase_nurturing',
        name: 'Nutrição para Compras Futuras',
        description: 'Mensagens sutis em 30, 60 e 120 dias',
        active: true,
        steps: 3,
        totalDays: 120
      }
    ]);
  };

  const handleToggleSequence = async (sequenceId: string, active: boolean) => {
    setIsLoading(true);
    try {
      toggleSequence(sequenceId, active);
      
      setSequences(prev => prev.map(seq => 
        seq.id === sequenceId ? { ...seq, active } : seq
      ));
    } catch (error) {
      console.error('Erro ao alterar sequência:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSale = () => {
    // Simular uma venda para teste
    const testContactId = 'test_contact_' + Date.now();
    const testOrderId = 'ORDER_' + Date.now();
    
    triggerSale(
      testContactId,
      testOrderId,
      299.90,
      ['Produto Teste', 'Acessório']
    );

    alert('Venda de teste disparada! Verifique as tarefas agendadas.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded
    alert('Venda de teste disparada! Verifique as tarefas agendadas.');
    loadStats();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Zap className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Follow-up Automático
            </h2>
            <p className="text-sm text-gray-600">
              Sistema inteligente que gera sequências baseadas no histórico do cliente
            </p>
          </div>
        </div>
        
        <Button 
          onClick={handleTestSale}
          variant="outline"
          size="sm"
          className="text-blue-600 border-blue-200 hover:bg-blue-50"
        >
          <Zap className="h-4 w-4 mr-2" />
          Testar Venda
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
          <TabsTrigger value="demo">Demo & Testes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Vendas Ativas</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeSales || 0}</p>
                  </div>
                  <Settings className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Sequências</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalSequences || 0}</p>
                  </div>
                  <Settings className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pós-venda</p>
                    <div className="flex items-center gap-2">
                      {stats.postSaleActive ? (
                        <Zap className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm font-medium">
                        {stats.postSaleActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                  <MessageSquare className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Nutrição</p>
                    <div className="flex items-center gap-2">
                      {stats.futureNurturingActive ? (
                        <Zap className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm font-medium">
                        {stats.futureNurturingActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Como Funciona */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-500" />
                Como Funciona o Sistema Automático
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">🎯 Detecção Automática</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Sistema monitora vendas finalizadas</li>
                    <li>• Captura produto, valor e dados do cliente</li>
                    <li>• IA analisa histórico para personalizar mensagens</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">📦 Sequência Pós-venda</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>1 dia:</strong> Confirmação do pedido</li>
                    <li>• <strong>7 dias:</strong> Pesquisa de satisfação</li>
                    <li>• Mensagens objetivas e personalizadas</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">🌱 Nutrição Saudável</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>30 dias:</strong> Lembrete sutil</li>
                    <li>• <strong>60 dias:</strong> Recomendação de produto</li>
                    <li>• <strong>120 dias:</strong> Nutrição gentil</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">🤖 IA Personalizada</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Mensagens baseadas no histórico</li>
                    <li>• Tom amigável mas não invasivo</li>
                    <li>• Máximo 150 caracteres por mensagem</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exemplo de Mensagens */}
          <Card>
            <CardHeader>
              <CardTitle>Exemplos de Mensagens Geradas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-2">📦 Confirmação (1 dia)</h5>
                  <p className="text-sm text-blue-800 italic">
                    "Oi João! 🎉 Seu pedido #12345 foi confirmado! Em breve você receberá o rastreamento. Obrigado!"
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h5 className="font-medium text-green-900 mb-2">⭐ Satisfação (7 dias)</h5>
                  <p className="text-sm text-green-800 italic">
                    "Oi João! Como foi sua experiência com o produto? Sua opinião é importante! ⭐"
                  </p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h5 className="font-medium text-purple-900 mb-2">🌱 Nutrição (30 dias)</h5>
                  <p className="text-sm text-purple-800 italic">
                    "Oi João! Tudo bem? Temos algumas novidades que podem te interessar! 😊"
                  </p>
                </div>
                
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h5 className="font-medium text-orange-900 mb-2">💎 Recomendação (60 dias)</h5>
                  <p className="text-sm text-orange-800 italic">
                    "João, que tal conhecer nossos lançamentos? Temos produtos incríveis para você! ✨"
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {/* Configuração das Sequências */}
          <Card>
            <CardHeader>
              <CardTitle>Configuração das Sequências</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sequences.map((sequence) => (
                <div 
                  key={sequence.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-gray-900">{sequence.name}</h4>
                      <Badge 
                        variant={sequence.active ? "default" : "secondary"}
                        className={sequence.active ? "bg-green-100 text-green-800" : ""}
                      >
                        {sequence.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{sequence.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {sequence.steps} mensagens
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {sequence.totalDays} dias
                      </span>
                    </div>
                  </div>
                  
                  <Switch
                    checked={sequence.active}
                    onCheckedChange={(checked) => handleToggleSequence(sequence.id, checked)}
                    disabled={isLoading}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demo" className="space-y-6">
          <AutoFollowUpDemo />
        </TabsContent>
      </Tabs>
    </div>
  );
}