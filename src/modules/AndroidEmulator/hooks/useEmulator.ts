import { useState, useCallback, useEffect } from 'react';

const API_BASE = 'http://127.0.0.1:3010/api/wsl2-android';

export interface AndroidEmulatorInstance {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'starting' | 'error';
  vncPort: number;
  adbPort: number;
  vncUrl?: string;
  profile?: string;
}

export function useEmulator() {
  const [instances, setInstances] = useState<AndroidEmulatorInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const resp = await fetch(`${API_BASE}/instance/list`);
      if (!resp.ok) {
        throw new Error(`Erro ao carregar instâncias (${resp.status})`);
      }

      const data = await resp.json();
      if (data.success) {
        setInstances(data.instances || []);
      }

      setError(null);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(`Erro de conexão: ${err.message}. Verifique o backend.`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  const createInstance = useCallback(async (name: string, instanceConfig?: any) => {
    try {
      setLoading(true);
      const payload = {
        name,
        profile: instanceConfig?.profile || 'med'
      };

      const response = await fetch(`${API_BASE}/instance/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok) {
        await loadData();
        return data.name;
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadData]);

  const startInstance = useCallback(async (id: string, profile = 'med') => {
    try {
      // No WSL, o start é similar ao create (ele garante que está rodando)
      setError(null);
      const response = await fetch(`${API_BASE}/instance/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: id, profile })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro HTTP ${response.status}`);
      }

      await loadData();
    } catch (err: any) {
      console.error('Error starting instance:', err);
      setError(`Erro ao iniciar: ${err.message}`);
      throw err;
    }
  }, [loadData]);

  const stopInstance = useCallback(async (id: string) => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE}/instance/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: id })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro HTTP ${response.status}`);
      }

      await loadData();
    } catch (err: any) {
      setError(`Erro ao parar: ${err.message}`);
      throw err;
    }
  }, [loadData]);

  const deleteInstance = useCallback(async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/instance/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao deletar');
      }
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  }, [loadData]);

  return {
    instances,
    loading,
    error,
    createInstance,
    startInstance,
    stopInstance,
    deleteInstance,
    refresh: loadData,
    clearError: () => setError(null)
  };
}
