import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { useEmulator, EmulatorConfig } from '../hooks/useEmulator';

export function EmulatorSettings() {
  const { config, updateConfig, loading, error, systemMetrics } = useEmulator();
  const [localConfig, setLocalConfig] = useState<EmulatorConfig | null>(null);
  const [saving, setSaving] = useState(false);

  // Sincronizar config local com o global
  useEffect(() => {
    if (config) {
      setLocalConfig({ ...config });
    }
  }, [config]);

  const handleSave = async () => {
    if (!localConfig) return;

    setSaving(true);
    try {
      await updateConfig(localConfig);
    } catch (err) {
      console.error('Erro ao salvar configurações:', err);
    } finally {
      setSaving(false);
    }
  };

  const updateLocalConfig = (updates: Partial<EmulatorConfig>) => {
    if (localConfig) {
      setLocalConfig({ ...localConfig, ...updates });
    }
  };

  if (loading || !localConfig) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-h-screen overflow-y-auto pr-2">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Configurações do Emulador</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Engine Selection - Removido LDPlayer */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Engine de Virtualização
            </label>
            <div className="w-full p-3 border rounded-md bg-gray-50">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium">QEMU (Otimizado)</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Engine leve e eficiente para automação WhatsApp
              </p>
            </div>
          </div>

          {/* Memory Configuration */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Memória RAM Padrão (MB)
            </label>
            <input
              type="range"
              min="256"
              max="2048"
              step="256"
              value={localConfig.defaultMemory}
              onChange={(e) => updateLocalConfig({ defaultMemory: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>256MB</span>
              <span className="font-medium">{localConfig.defaultMemory}MB</span>
              <span>2048MB</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Disponível: {systemMetrics.availableMemory}MB de {systemMetrics.totalMemory}MB
            </p>
          </div>

          {/* CPU Cores */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Núcleos de CPU Padrão
            </label>
            <select
              value={localConfig.defaultCpuCores}
              onChange={(e) => updateLocalConfig({ defaultCpuCores: parseInt(e.target.value) })}
              className="w-full p-2 border rounded-md"
            >
              <option value={1}>1 Núcleo</option>
              <option value={2}>2 Núcleos</option>
              <option value={4}>4 Núcleos</option>
            </select>
            <p className="text-xs text-gray-600 mt-1">
              Sistema tem {systemMetrics.cpuCores} núcleos disponíveis
            </p>
          </div>

          {/* Resolution */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Resolução Padrão
            </label>
            <select
              value={localConfig.defaultResolution}
              onChange={(e) => updateLocalConfig({ defaultResolution: e.target.value })}
              className="w-full p-2 border rounded-md"
            >
              <option value="480x854">480x854 (Baixa)</option>
              <option value="720x1280">720x1280 (HD)</option>
              <option value="1080x1920">1080x1920 (Full HD)</option>
            </select>
          </div>

          {/* Headless Mode - Agora controla se mostra frame do celular */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="headless"
              checked={localConfig.headless}
              onChange={(e) => updateLocalConfig({ headless: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="headless" className="text-sm font-medium">
              Modo Headless (Ocultar Frame do Smartphone)
            </label>
          </div>

          {/* Auto Start */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoStart"
              checked={localConfig.autoStart}
              onChange={(e) => updateLocalConfig({ autoStart: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="autoStart" className="text-sm font-medium">
              Iniciar Automaticamente com o Sistema
            </label>
          </div>

          {/* Max Instances */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Máximo de Instâncias Simultâneas
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={localConfig.maxInstances}
              onChange={(e) => updateLocalConfig({ maxInstances: parseInt(e.target.value) })}
              className="w-full p-2 border rounded-md"
            />
            <p className="text-xs text-gray-600 mt-1">
              Atualmente executando: {systemMetrics.runningInstances} instâncias
            </p>
          </div>

          {/* Scroll Settings */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Configurações de Scroll
            </label>
            <div className="space-y-3 p-3 border rounded-md bg-gray-50">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="smoothScroll"
                  checked={localConfig.smoothScroll}
                  onChange={(e) => updateLocalConfig({ smoothScroll: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="smoothScroll" className="text-sm">
                  Scroll suave na tela do smartphone
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="touchScroll"
                  checked={localConfig.touchScroll}
                  onChange={(e) => updateLocalConfig({ touchScroll: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="touchScroll" className="text-sm">
                  Habilitar scroll por toque/mouse
                </label>
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Velocidade do Scroll ({localConfig.scrollSpeed})
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={localConfig.scrollSpeed}
                  onChange={(e) => updateLocalConfig({ scrollSpeed: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Lento</span>
                  <span>Rápido</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${saving
                ? 'bg-gray-100 text-gray-400'
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 shadow-blue-500/20'
                }`}
            >
              {saving ? <span className="animate-spin">🔄</span> : '💾'}
              {saving ? 'Salvando Alterações...' : 'Salvar Todas as Configurações'}
            </button>

            {saving === false && !error && config && (
              <p className="text-center text-xs text-green-600 font-medium animate-fade-in">
                ✅ Configurações sincronizadas com sucesso.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Dicas de Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>• Use QEMU para melhor performance em automação</p>
            <p>• Modo headless reduz uso de GPU em 60-80%</p>
            <p>• 512MB RAM é suficiente para WhatsApp Business</p>
            <p>• Limite instâncias baseado na RAM disponível</p>
            <p>• Resolução baixa melhora performance significativamente</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}