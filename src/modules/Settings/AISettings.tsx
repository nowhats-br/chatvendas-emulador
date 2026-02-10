import React from 'react';
import { AIConfigService, AIConfig, AIProvider } from '../../services/AIConfigService';

// Ícones customizados
const Settings = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('circle', { cx: '12', cy: '12', r: '3' }),
  React.createElement('path', { d: 'M12 1v6m0 6v6m11-7h-6m-6 0H1m17-4a4 4 0 0 1-8 0 4 4 0 0 1 8 0zM7 21a4 4 0 0 1-8 0 4 4 0 0 1 8 0z' }));

const Brain = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('path', { d: 'M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z' }),
  React.createElement('path', { d: 'M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z' }),
  React.createElement('path', { d: 'M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4' }),
  React.createElement('path', { d: 'M17.599 6.5a3 3 0 0 0 .399-1.375' }),
  React.createElement('path', { d: 'M6.003 5.125A3 3 0 0 0 6.401 6.5' }),
  React.createElement('path', { d: 'M3.477 10.896a4 4 0 0 1 .585-.396' }),
  React.createElement('path', { d: 'M19.938 10.5a4 4 0 0 1 .585.396' }),
  React.createElement('path', { d: 'M6 18a4 4 0 0 1-1.967-.516' }),
  React.createElement('path', { d: 'M19.967 17.484A4 4 0 0 1 18 18' }));

const CheckCircle = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('path', { d: 'M9 11l3 3l8-8' }),
  React.createElement('path', { d: 'm21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.12 0 4.07.74 5.61 1.98' }));

const AlertCircle = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('circle', { cx: '12', cy: '12', r: '10' }),
  React.createElement('line', { x1: '12', y1: '8', x2: '12', y2: '12' }),
  React.createElement('line', { x1: '12', y1: '16', x2: '12.01', y2: '16' }));

const Eye = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('path', { d: 'M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z' }),
  React.createElement('circle', { cx: '12', cy: '12', r: '3' }));

const EyeOff = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('path', { d: 'M9.88 9.88a3 3 0 1 0 4.24 4.24' }),
  React.createElement('path', { d: 'M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68' }),
  React.createElement('path', { d: 'M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61' }),
  React.createElement('line', { x1: '2', y1: '2', x2: '22', y2: '22' }));

export default function AISettings() {
  const [config, setConfig] = React.useState<AIConfig>({
    provider: 'openai',
    apiKey: '',
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 150,
    enabled: false
  });

  const [showApiKey, setShowApiKey] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [testResult, setTestResult] = React.useState<{ success: boolean; message: string } | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  const providers = AIConfigService.getProviders();

  React.useEffect(() => {
    const existingConfig = AIConfigService.getConfig();
    if (existingConfig) {
      setConfig(existingConfig);
    }
  }, []);

  const selectedProvider = providers.find(p => p.id === config.provider);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      AIConfigService.updateConfig(config);
      setTestResult({ success: true, message: 'Configurações salvas com sucesso!' });
      setTimeout(() => setTestResult(null), 3000);
    } catch (error) {
      setTestResult({ success: false, message: 'Erro ao salvar configurações' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!config.apiKey) {
      setTestResult({ success: false, message: 'Insira uma API Key primeiro' });
      return;
    }

    setIsLoading(true);
    setTestResult(null);

    try {
      // Salvar temporariamente para testar
      AIConfigService.updateConfig({ ...config, enabled: true });
      const result = await AIConfigService.testConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro ao testar conexão' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    if (confirm('Tem certeza que deseja limpar todas as configurações de IA?')) {
      AIConfigService.clearConfig();
      setConfig({
        provider: 'openai',
        apiKey: '',
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 150,
        enabled: false
      });
      setTestResult(null);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="p-8 pb-4 shrink-0">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Brain className="text-purple-600" />
              Configurações de IA
            </h1>
            <p className="text-gray-500 mt-1">Configure as APIs de inteligência artificial para follow-ups automáticos</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            
            {/* Status */}
            <div className="mb-6 p-4 rounded-lg border-2 border-dashed border-gray-200">
              <div className="flex items-center gap-3">
                {AIConfigService.isConfigured() ? (
                  <>
                    <CheckCircle className="text-green-600" size={20} />
                    <div>
                      <p className="font-medium text-green-800">IA Configurada</p>
                      <p className="text-sm text-green-600">Sistema pronto para gerar follow-ups inteligentes</p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="text-orange-500" size={20} />
                    <div>
                      <p className="font-medium text-orange-800">IA Não Configurada</p>
                      <p className="text-sm text-orange-600">Configure uma API key para ativar as funcionalidades de IA</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Provider Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Provedor de IA
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {providers.map((provider) => (
                  <div
                    key={provider.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      config.provider === provider.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setConfig(prev => ({ 
                      ...prev, 
                      provider: provider.id,
                      model: provider.defaultModel 
                    }))}
                  >
                    <h3 className="font-medium text-gray-800">{provider.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{provider.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* API Key */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {selectedProvider?.apiKeyLabel}
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={config.apiKey}
                  onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="Insira sua API key..."
                  className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKey ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {config.provider === 'openai' 
                  ? 'Obtenha sua API key em: https://platform.openai.com/api-keys'
                  : 'Obtenha sua API key em: https://makersuite.google.com/app/apikey'
                }
              </p>
            </div>

            {/* Model Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modelo
              </label>
              <select
                value={config.model}
                onChange={(e) => setConfig(prev => ({ ...prev, model: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              >
                {selectedProvider?.modelOptions.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>

            {/* Advanced Settings */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-4">Configurações Avançadas</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temperatura ({config.temperature})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={config.temperature}
                    onChange={(e) => setConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">Controla a criatividade das respostas</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Tokens
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="500"
                    value={config.maxTokens}
                    onChange={(e) => setConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Tamanho máximo das respostas</p>
                </div>
              </div>
            </div>

            {/* Enable/Disable */}
            <div className="mb-6">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => setConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Ativar IA para follow-ups automáticos
                </span>
              </label>
            </div>

            {/* Test Result */}
            {testResult && (
              <div className={`mb-6 p-4 rounded-lg border ${
                testResult.success 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center gap-2">
                  {testResult.success ? (
                    <CheckCircle className="text-green-600" size={16} />
                  ) : (
                    <AlertCircle className="text-red-600" size={16} />
                  )}
                  <span className="text-sm font-medium">{testResult.message}</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleTest}
                disabled={isLoading || !config.apiKey}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Settings size={16} className="animate-spin" />
                    Testando...
                  </>
                ) : (
                  'Testar Conexão'
                )}
              </button>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Settings size={16} className="animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Configurações'
                )}
              </button>

              <button
                onClick={handleClear}
                className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}