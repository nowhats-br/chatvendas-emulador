import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { AndroidEmulatorManager } from './components/AndroidEmulatorManager';
import { EmulatorSettings } from './components/EmulatorSettings';
import { EmulatorMonitor } from './components/EmulatorMonitor';

const CLOUD_API_BASE = 'http://127.0.0.1:3010/api/android-cloud';

export default function AndroidEmulatorPage() {
  const [activeTab, setActiveTab] = useState("manager");
  const [cloudReady, setCloudReady] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkCloudStatus();
  }, []);

  const checkCloudStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${CLOUD_API_BASE}/setup/status`);
      const data = await response.json();
      
      // Modo cloud sempre pronto se a API responder
      setCloudReady(data.cloudMode && data.ready);
    } catch (error) {
      console.error('Erro ao verificar status da nuvem:', error);
      setCloudReady(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 font-medium">Conectando ao Android Cloud...</p>
        </div>
      </div>
    );
  }

  // Se a API não estiver disponível, mostrar erro
  if (!cloudReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-4xl">⚠️</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">API Cloud Não Disponível</h2>
            <p className="text-gray-600">
              Não foi possível conectar à API Android na nuvem.
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
            <p className="text-sm font-bold text-gray-700">Verifique:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Servidor na nuvem está rodando</li>
              <li>• Porta 3011 está acessível</li>
              <li>• CLOUD_ANDROID_API configurado no .env</li>
            </ul>
          </div>
          <button
            onClick={checkCloudStatus}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-h-screen overflow-y-auto bg-gray-50/30">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">☁️ Android Cloud</h1>
          <p className="text-sm text-gray-500">Emuladores Android 13 rodando na nuvem</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white p-1 shadow-sm border border-gray-100 rounded-xl">
          <TabsTrigger value="manager" className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
            🎮 Gerenciador
          </TabsTrigger>

          <TabsTrigger value="monitor" className="rounded-lg transition-all">
            📊 Saúde
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-lg transition-all">
            ⚙️ Ajustes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manager" className="border-none p-0 outline-none">
          <AndroidEmulatorManager />
        </TabsContent>

        <TabsContent value="monitor" className="border-none p-0 outline-none">
          <EmulatorMonitor />
        </TabsContent>

        <TabsContent value="settings" className="border-none p-0 outline-none">
          <EmulatorSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
