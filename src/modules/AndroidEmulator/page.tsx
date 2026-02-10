import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { AndroidEmulatorManager } from './components/AndroidEmulatorManager';
import { EmulatorSettings } from './components/EmulatorSettings';
import { EmulatorMonitor } from './components/EmulatorMonitor';
import { WSL2SetupWizard } from './components/WSL2SetupWizard';

const WSL2_API_BASE = 'http://127.0.0.1:3010/api/wsl2-android';

export default function AndroidEmulatorPage() {
  const [activeTab, setActiveTab] = useState("manager");
  const [wsl2Ready, setWsl2Ready] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkWSL2Status();
  }, []);

  const checkWSL2Status = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${WSL2_API_BASE}/setup/status`);
      const data = await response.json();
      setWsl2Ready(data.ready);
    } catch (error) {
      console.error('Erro ao verificar status WSL2:', error);
      setWsl2Ready(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 font-medium">Carregando ambiente Android (WSL2)...</p>
        </div>
      </div>
    );
  }

  // Se o WSL2 não estiver pronto, mostrar wizard obrigatoriamente
  if (!wsl2Ready) {
    return <WSL2SetupWizard onComplete={() => {
      setWsl2Ready(true);
    }} />;
  }

  return (
    <div className="p-6 space-y-6 max-h-screen overflow-y-auto bg-gray-50/30">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">🤖 Emulador Android Real</h1>
          <p className="text-sm text-gray-500">Acesse WhatsApp e Play Store real via WSL2</p>
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
