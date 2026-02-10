import React from 'react';
import { WhatsAppInstance } from '../types';
import { WhatsAppService } from '../../../services/WhatsAppService';
import { useToast } from '../../../hooks/useToast';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { useErrorHandler } from '../../../hooks/useErrorHandler';
import { LogService } from '../../../services/LogService';
import { Metrics } from '../../../services/MetricsService';

// Ícones usando React.createElement
const X = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'm18 6-12 12' }),
    React.createElement('path', { d: 'm6 6 12 12' }));

const Settings = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z' }),
    React.createElement('circle', { cx: '12', cy: '12', r: '3' }));

const Webhook = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6' }),
    React.createElement('polyline', { points: '15,3 21,3 21,9' }),
    React.createElement('line', { x1: '10', x2: '21', y1: '14', y2: '3' }));

const MessageSquare = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' }));



interface InstanceConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  instance: WhatsAppInstance | null;
  onUpdate: () => void;
}

interface InstanceSettings {
  autoReply: {
    enabled: boolean;
    message: string;
    onlyOutOfHours: boolean;
  };
}

const defaultSettings: InstanceSettings = {
  autoReply: { enabled: false, message: '', onlyOutOfHours: false }
};

export function InstanceConfigModal({ isOpen, onClose, instance, onUpdate }: InstanceConfigModalProps) {
  const [activeTab, setActiveTab] = React.useState<'basic' | 'auto-reply' | 'webhooks'>('basic');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  
  const { success, error: showError } = useToast();
  const { handleError, executeWithRetry } = useErrorHandler();

  // Form validation
  const { values, errors, setValue, setTouched, validateAll, reset } = useFormValidation(
    {
      name: '',
      webhookUrl: '',
      autoReplyEnabled: false,
      autoReplyMessage: '',
      autoReplyOnlyOutOfHours: false
    },
    {
      name: { required: true, minLength: 2, maxLength: 50 },
      webhookUrl: { 
        pattern: /^https?:\/\/.+/,
        custom: (value) => {
          if (value && !value.startsWith('http')) {
            return 'URL deve começar com http:// ou https://';
          }
          return null;
        }
      },
      autoReplyMessage: {
        custom: (value) => {
          if (values.autoReplyEnabled && (!value || value.trim() === '')) {
            return 'Mensagem de auto-resposta é obrigatória quando ativada';
          }
          return null;
        }
      }
    }
  );

  // Carregar dados da instância quando o modal abrir
  React.useEffect(() => {
    if (isOpen && instance) {
      LogService.info('Opening instance config modal', 'InstanceConfigModal', { instanceId: instance.id });
      Metrics.userAction('open_config_modal', 'InstanceConfigModal');
      
      setValue('name', instance.name);
      setValue('webhookUrl', instance.webhookUrl || '');
      
      // Carregar configurações detalhadas da instância
      loadInstanceSettings();
    }
  }, [isOpen, instance]);

  const loadInstanceSettings = async () => {
    if (!instance) return;
    
    try {
      setIsLoading(true);
      
      await executeWithRetry(async () => {
        // Simular carregamento de configurações
        const settings = instance.settings || defaultSettings;
        setValue('autoReplyEnabled', settings.autoReply?.enabled || false);
        setValue('autoReplyMessage', settings.autoReply?.message || '');
        setValue('autoReplyOnlyOutOfHours', settings.autoReply?.onlyOutOfHours || false);
      }, { maxAttempts: 2 }, 'LoadInstanceSettings');
      
    } catch (error) {
      LogService.error('Failed to load instance settings', 'InstanceConfigModal', { error, instanceId: instance.id });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!instance) return;

    // Validate form
    if (!validateAll()) {
      showError('Erro de Validação', 'Por favor, corrija os erros no formulário');
      return;
    }

    try {
      setIsSaving(true);
      LogService.info('Saving instance configuration', 'InstanceConfigModal', { instanceId: instance.id });
      
      const settings = {
        autoReply: {
          enabled: values.autoReplyEnabled,
          message: values.autoReplyMessage,
          onlyOutOfHours: values.autoReplyOnlyOutOfHours
        }
      };

      await executeWithRetry(async () => {
        await WhatsAppService.updateInstance(instance.id, {
          name: values.name,
          webhookUrl: values.webhookUrl || undefined,
          settings
        });
      }, { maxAttempts: 3 }, 'SaveInstanceConfig');

      success('Configurações Salvas', 'As configurações da instância foram atualizadas com sucesso');
      Metrics.userAction('save_config', 'InstanceConfigModal');
      
      onUpdate();
      onClose();
      
    } catch (error) {
      LogService.error('Failed to save instance configuration', 'InstanceConfigModal', { error, instanceId: instance.id });
      // Error toast is handled by useErrorHandler
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !instance) return null;

  const tabs = [
    { id: 'basic', label: 'Básico', icon: Settings },
    { id: 'auto-reply', label: 'Auto-resposta', icon: MessageSquare },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Settings className="text-emerald-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Configurações da Instância</h2>
              <p className="text-sm text-gray-500">{instance.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex h-[600px]">
          {/* Sidebar com Tabs */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
                    activeTab === tab.id
                      ? 'bg-emerald-100 text-emerald-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Conteúdo */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-500">Carregando configurações...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Tab: Básico */}
                  {activeTab === 'basic' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Configurações Básicas</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nome da Instância
                            </label>
                            <input
                              type="text"
                              value={values.name}
                              onChange={(e) => setValue('name', e.target.value)}
                              onBlur={() => setTouched('name')}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none ${
                                errors.name ? 'border-red-300' : 'border-gray-300'
                              }`}
                              placeholder="Digite o nome da instância"
                            />
                            {errors.name && (
                              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Número do WhatsApp
                            </label>
                            <input
                              type="text"
                              value={instance.phoneNumber || ''}
                              disabled
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                              placeholder="Conecte a instância para ver o número"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              O número é definido automaticamente quando você conecta a instância
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Provider
                            </label>
                            <input
                              type="text"
                              value={instance.provider === 'whaileys' ? '🚀 Whaileys' : '⚡ Baileys'}
                              disabled
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab: Auto-resposta */}
                  {activeTab === 'auto-reply' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Configurações de Auto-resposta</h3>
                        
                        <div className="space-y-6">
                          {/* Auto-resposta */}
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-gray-800">Auto-resposta</h4>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={values.autoReplyEnabled}
                                  onChange={(e) => setValue('autoReplyEnabled', e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                              </label>
                            </div>
                            
                            {values.autoReplyEnabled && (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm text-gray-600 mb-2">Mensagem de Auto-resposta</label>
                                  <textarea
                                    value={values.autoReplyMessage}
                                    onChange={(e) => setValue('autoReplyMessage', e.target.value)}
                                    onBlur={() => setTouched('autoReplyMessage')}
                                    rows={4}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none ${
                                      errors.autoReplyMessage ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder="Digite a mensagem de auto-resposta..."
                                  />
                                  {errors.autoReplyMessage && (
                                    <p className="text-xs text-red-500 mt-1">{errors.autoReplyMessage}</p>
                                  )}
                                  <p className="text-xs text-gray-500 mt-1">
                                    Esta mensagem será enviada automaticamente para novos contatos
                                  </p>
                                </div>
                                
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={values.autoReplyOnlyOutOfHours}
                                    onChange={(e) => setValue('autoReplyOnlyOutOfHours', e.target.checked)}
                                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                  />
                                  <span className="text-sm text-gray-600">Apenas fora do horário comercial</span>
                                </label>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab: Webhooks */}
                  {activeTab === 'webhooks' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Configurações de Webhook</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              URL do Webhook
                            </label>
                            <input
                              type="url"
                              value={values.webhookUrl}
                              onChange={(e) => setValue('webhookUrl', e.target.value)}
                              onBlur={() => setTouched('webhookUrl')}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none ${
                                errors.webhookUrl ? 'border-red-300' : 'border-gray-300'
                              }`}
                              placeholder="https://seu-servidor.com/webhook"
                            />
                            {errors.webhookUrl && (
                              <p className="text-xs text-red-500 mt-1">{errors.webhookUrl}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              URL para receber eventos de mensagens, status e outros eventos da instância
                            </p>
                          </div>

                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-medium text-blue-800 mb-2">Eventos Enviados</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                              <li>• Mensagens recebidas</li>
                              <li>• Status de mensagens enviadas</li>
                              <li>• Mudanças de status da instância</li>
                              <li>• Eventos de grupos</li>
                              <li>• Atualizações de contatos</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-6 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {isSaving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </div>
    </div>
  );
}