import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';

interface SystemMetrics {
  cpu: number;
  memory: number;
  network: number;
  instances: number;
}

export function EmulatorMonitor() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    network: 0,
    instances: 0
  });

  const [logs] = useState<string[]>([
    '[10:30:15] Sistema QEMU Android iniciado',
    '[10:30:16] QEMU engine carregado com sucesso',
    '[10:30:18] Instância Android-1 criada',
    '[10:30:20] VNC server iniciado na porta 5900',
    '[10:30:22] ADB conectado na porta 5555',
    '[10:30:24] Sistema pronto para automação WhatsApp'
  ]);

  // Simular métricas em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        cpu: Math.max(0, Math.min(100, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(0, Math.min(100, prev.memory + (Math.random() - 0.5) * 5)),
        network: Math.random() * 100,
        instances: Math.floor(Math.random() * 3) + 1
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getMetricColor = (value: number) => {
    if (value < 30) return 'text-green-600';
    if (value < 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6 max-h-screen overflow-y-auto pr-2">
      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              ⚡
              <div>
                <p className="text-sm text-gray-600">CPU</p>
                <p className={`text-lg font-semibold ${getMetricColor(metrics.cpu)}`}>
                  {metrics.cpu.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              💾
              <div>
                <p className="text-sm text-gray-600">Memória</p>
                <p className={`text-lg font-semibold ${getMetricColor(metrics.memory)}`}>
                  {metrics.memory.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              📶
              <div>
                <p className="text-sm text-gray-600">Rede</p>
                <p className="text-lg font-semibold text-blue-600">
                  {metrics.network.toFixed(0)} KB/s
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              📱
              <div>
                <p className="text-sm text-gray-600">Instâncias</p>
                <p className="text-lg font-semibold text-green-600">
                  {metrics.instances} ativas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊
            Performance em Tempo Real
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* CPU Usage Bar */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>CPU Usage</span>
                <span>{metrics.cpu.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    metrics.cpu < 30 ? 'bg-green-600' : 
                    metrics.cpu < 70 ? 'bg-yellow-600' : 'bg-red-600'
                  }`}
                  style={{ width: `${metrics.cpu}%` }}
                />
              </div>
            </div>

            {/* Memory Usage Bar */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Memory Usage</span>
                <span>{metrics.memory.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    metrics.memory < 30 ? 'bg-green-600' : 
                    metrics.memory < 70 ? 'bg-yellow-600' : 'bg-red-600'
                  }`}
                  style={{ width: `${metrics.memory}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Logs do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-black text-green-400 p-4 rounded-md font-mono text-sm max-h-64 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}