import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { FollowUpService } from '../services/FollowUpService';
import { 
  Shield, 
  Clock, 
  Users, 
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

export function AntiSpamSettings() {
  const [cooldownDays, setCooldownDays] = useState(7);
  const [stats, setStats] = useState({
    totalContacts: 0,
    contactsInCooldown: 0,
    contactsAvailable: 0,
    cooldownDays: 7
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSettings();
    loadStats();
  }, []);

  const loadSettings = () => {
    try {
      const currentCooldown = FollowUpService.getCooldownDays();
      setCooldownDays(currentCooldown);
    } catch (error) {
      console.warn('Erro ao carregar configurações:', error);
    }
  };

  const loadStats = () => {
    try {
      const currentStats = FollowUpService.getCooldownStats();
      setStats(currentStats);
    } catch (error) {
      console.warn('Erro ao carregar estatísticas:', error);
    }
  };

  const handleSaveCooldown = async () => {
    setIsLoading(true);
    try {
      FollowUpService.setCooldownDays(cooldownDays);
      loadStats();
      console.log(`✅ Cooldown configurado para ${cooldownDays} dias`);
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckContact = () => {
    const contactId = prompt('Digite o ID do contato para verificar:');
    if (contactId) {
      const isInCooldown = FollowUpService.isContactInCooldown(contactId);
      alert(
        isInCooldown 
          ? `❌ Contato ${contactId} está em cooldown (recebeu mensagens nos últimos ${cooldownDays} dias)`
          : `✅ Contato ${contactId} está disponível para receber mensagens`
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 rounded-lg">
          <Shield className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Configurações Anti-Spam
          </h3>
          <p className="text-sm text-gray-600">
            Evita envio excessivo de mensagens para os mesmos contatos
          </p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Contatos</p>
                <p className="text-xl font-bold text-gray-900">{stats.totalContacts}</p>
              </div>
              <Users className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Em Cooldown</p>
                <p className="text-xl font-bold text-gray-900">{stats.contactsInCooldown}</p>
              </div>
              <AlertTriangle className="h-6 w-6 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Disponíveis</p>
                <p className="text-xl font-bold text-gray-900">{stats.contactsAvailable}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuração de Cooldown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            Período de Cooldown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dias entre mensagens IA
              </label>
              <Input
                type="number"
                min="1"
                max="30"
                value={cooldownDays}
                onChange={(e) => setCooldownDays(parseInt(e.target.value) || 7)}
                className="w-32"
              />
              <p className="text-xs text-gray-500 mt-1">
                Mínimo: 1 dia, Máximo: 30 dias
              </p>
            </div>
            
            <Button
              onClick={handleSaveCooldown}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>

          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <Info className="h-4 w-4 text-blue-600" />
            <p className="text-sm text-blue-800">
              Contatos que receberam mensagens nos últimos <strong>{cooldownDays} dias</strong> não receberão novas oportunidades de IA
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Como Funciona */}
      <Card>
        <CardHeader>
          <CardTitle>Como Funciona o Anti-Spam</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-1 bg-green-100 rounded">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Verificação Automática</h4>
                <p className="text-sm text-gray-600">
                  Antes de gerar oportunidades de IA, o sistema verifica se o contato recebeu mensagens recentemente
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1 bg-orange-100 rounded">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Período de Cooldown</h4>
                <p className="text-sm text-gray-600">
                  Contatos em cooldown são automaticamente pulados na análise da IA
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1 bg-blue-100 rounded">
                <Shield className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Proteção Inteligente</h4>
                <p className="text-sm text-gray-600">
                  Evita spam e melhora a experiência do cliente, mantendo relacionamento saudável
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ferramentas */}
      <Card>
        <CardHeader>
          <CardTitle>Ferramentas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={handleCheckContact}
              variant="outline"
              size="sm"
            >
              Verificar Contato
            </Button>
            
            <Button
              onClick={loadStats}
              variant="outline"
              size="sm"
            >
              Atualizar Estatísticas
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}