import React from 'react';
import { cn } from '../../../lib/utils';

/**
 * InstanceSelector - Componente para seleção de instâncias WhatsApp
 * 
 * Permite selecionar múltiplas instâncias conectadas para uso em campanhas.
 * Cada instância é exibida como um card pequeno (1cm x 2cm) com informações
 * sobre o provider (Baileys/Whaileys) e status de conexão.
 * 
 * Features:
 * - Seleção múltipla com checkboxes visuais
 * - Filtro automático para instâncias conectadas
 * - Botões "Todas" e "Limpar" para controle rápido
 * - Indicadores visuais de provider e status
 * - Responsivo com grid adaptativo
 */

// Ícones usando React.createElement
const Smartphone = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('rect', { width: '14', height: '20', x: '5', y: '2', rx: '2', ry: '2' }),
  React.createElement('path', { d: 'm12 18 0 0' }));

const CheckCircle = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('path', { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }),
  React.createElement('path', { d: 'm9 11 3 3L22 4' }));

const Wifi = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('path', { d: 'm1 9 4-4 4 4' }),
  React.createElement('path', { d: 'm1 9 4-4 4 4' }),
  React.createElement('path', { d: 'M20 3h-8.5a4 4 0 1 0 0 8h8.5Z' }),
  React.createElement('path', { d: 'M12 19v-8.5' }));

interface Instance {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'connecting';
  provider: 'baileys' | 'whaileys';
  phone?: string;
}

interface InstanceSelectorProps {
  instances: Instance[];
  selectedInstances: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  messagesPerInstance: number;
  onMessagesPerInstanceChange: (value: number) => void;
  className?: string;
}

export function InstanceSelector({ 
  instances, 
  selectedInstances, 
  onSelectionChange,
  messagesPerInstance,
  onMessagesPerInstanceChange,
  className 
}: InstanceSelectorProps) {
  // Filtrar apenas instâncias conectadas
  const connectedInstances = instances.filter(instance => instance.status === 'connected');

  const handleInstanceToggle = (instanceId: string) => {
    if (selectedInstances.includes(instanceId)) {
      // Remover da seleção
      onSelectionChange(selectedInstances.filter(id => id !== instanceId));
    } else {
      // Adicionar à seleção
      onSelectionChange([...selectedInstances, instanceId]);
    }
  };

  const selectAll = () => {
    onSelectionChange(connectedInstances.map(i => i.id));
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  if (connectedInstances.length === 0) {
    return (
      <div className={cn("bg-red-50 border border-red-200 rounded-lg p-6 text-center", className)}>
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <Smartphone size={24} />
        </div>
        <h3 className="font-bold text-red-800 mb-2">Nenhuma Instância Conectada</h3>
        <p className="text-red-600 text-sm">
          Conecte pelo menos uma instância do WhatsApp para criar campanhas.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header com controles */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Smartphone className="text-emerald-600" size={18} />
            Selecionar Instâncias ({selectedInstances.length}/{connectedInstances.length})
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Escolha as instâncias que serão usadas na rotação de envios
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            disabled={selectedInstances.length === connectedInstances.length}
            className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-md hover:bg-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Todas
          </button>
          <button
            onClick={clearAll}
            disabled={selectedInstances.length === 0}
            className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Limpar
          </button>
        </div>
      </div>

      {/* Grid de instâncias - Cards 1cm x 2cm (aproximadamente 40px x 80px) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
        {connectedInstances.map((instance) => {
          const isSelected = selectedInstances.includes(instance.id);
          
          return (
            <div
              key={instance.id}
              onClick={() => handleInstanceToggle(instance.id)}
              className={cn(
                "relative w-20 h-16 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md",
                "flex flex-col items-center justify-center p-1 text-center",
                isSelected 
                  ? "border-emerald-500 bg-emerald-50 shadow-md" 
                  : "border-gray-200 bg-white hover:border-emerald-300"
              )}
            >
              {/* Indicador de seleção */}
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle size={10} className="text-white" />
                </div>
              )}

              {/* Ícone da instância */}
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center mb-1",
                instance.provider === 'baileys' 
                  ? "bg-blue-100 text-blue-600" 
                  : "bg-purple-100 text-purple-600"
              )}>
                <Smartphone size={12} />
              </div>

              {/* Nome da instância */}
              <div className="text-[10px] font-medium text-gray-700 leading-tight truncate w-full px-1">
                {instance.name}
              </div>

              {/* Status indicator */}
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span className={cn(
                  "text-[8px] uppercase font-bold",
                  instance.provider === 'baileys' ? "text-blue-600" : "text-purple-600"
                )}>
                  {instance.provider === 'baileys' ? 'BAI' : 'WHA'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Informações adicionais */}
      {selectedInstances.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
              <Wifi size={16} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-emerald-800 text-sm mb-1">
                {selectedInstances.length === 1 ? 'Instância Selecionada' : 'Rotação Configurada'}
              </h4>
              <p className="text-emerald-700 text-xs leading-relaxed mb-3">
                {selectedInstances.length === 1 
                  ? "Todos os envios serão feitos pela instância selecionada."
                  : `Os envios serão distribuídos entre ${selectedInstances.length} instâncias para melhor performance e segurança.`
                }
              </p>
              
              {/* Campo de rotação - só aparece quando há múltiplas instâncias */}
              {selectedInstances.length > 1 && (
                <div className="bg-white border border-emerald-200 rounded-lg p-3 mb-3">
                  <label className="block text-xs font-bold text-emerald-700 uppercase mb-2">
                    Mensagens por Instância (Rotação)
                  </label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="number" 
                      min="1"
                      max="1000"
                      className="w-20 p-2 border border-emerald-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none text-center font-bold"
                      value={messagesPerInstance}
                      onChange={(e) => onMessagesPerInstanceChange(parseInt(e.target.value) || 1)}
                    />
                    <span className="text-xs text-emerald-600">
                      mensagens → trocar instância
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-600 mt-1">
                    Recomendado: 2-50 mensagens para melhor distribuição
                  </p>
                </div>
              )}
              
              <div className="flex flex-wrap gap-1">
                {selectedInstances.map(id => {
                  const instance = connectedInstances.find(i => i.id === id);
                  return instance ? (
                    <span 
                      key={id}
                      className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-medium"
                    >
                      <Smartphone size={10} />
                      {instance.name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}