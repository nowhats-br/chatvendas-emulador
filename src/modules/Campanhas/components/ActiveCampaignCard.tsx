import React from 'react';
import { motion } from 'framer-motion';
import { Campaign } from '../../../services/CampaignService';

// Componentes de ícones usando React.createElement
const Smartphone = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('rect', { width: '14', height: '20', x: '5', y: '2', rx: '2', ry: '2' }),
  React.createElement('path', { d: 'm12 18 0 0' }));

const Pause = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('rect', { x: '14', y: '4', width: '4', height: '16', rx: '1' }),
  React.createElement('rect', { x: '6', y: '4', width: '4', height: '16', rx: '1' }));

const Play = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, React.createElement('polygon', { points: '6,3 20,12 6,21' }));

const XCircle = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('circle', { cx: '12', cy: '12', r: '10' }),
  React.createElement('path', { d: 'm15 9-6 6' }),
  React.createElement('path', { d: 'm9 9 6 6' }));

const Clock = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('circle', { cx: '12', cy: '12', r: '10' }),
  React.createElement('polyline', { points: '12,6 12,12 16,14' }));

const Shuffle = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('path', { d: 'M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22' }),
  React.createElement('path', { d: 'm18 2 4 4-4 4' }),
  React.createElement('path', { d: 'M2 6h1.9c1.5 0 2.9.9 3.6 2.2' }),
  React.createElement('path', { d: 'M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8' }),
  React.createElement('path', { d: 'm18 14 4 4-4 4' }));

const Send = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('path', { d: 'm22 2-7 20-4-9-9-4Z' }),
  React.createElement('path', { d: 'M22 2 11 13' }));

interface ActiveCampaignCardProps {
  campaign: Campaign;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onStop: (id: string) => void;
}

export function ActiveCampaignCard({ campaign, onPause, onResume, onStop }: ActiveCampaignCardProps) {
  const progress = (campaign.sentCount / campaign.totalLeads) * 100;
  const isPaused = campaign.status === 'paused';

  // Estimativa simples: média de 45s por mensagem restante
  const remainingMsgs = campaign.totalLeads - campaign.sentCount;
  const estimatedSeconds = remainingMsgs * ((campaign.minDelay + campaign.maxDelay) / 2);
  const estimatedTime = estimatedSeconds > 60 
    ? `${Math.ceil(estimatedSeconds / 60)} min` 
    : `${Math.ceil(estimatedSeconds)} seg`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-emerald-100 shadow-lg overflow-hidden relative group"
    >
      {/* Background Gradient Animado */}
      {campaign.status === 'running' && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-400 animate-gradient-x" />
      )}

      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-gray-800 text-lg">{campaign.name}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                    isPaused 
                        ? "bg-yellow-50 text-yellow-700 border-yellow-200" 
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}>
                    {isPaused ? 'Pausada' : 'Enviando'}
                </span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                    <Smartphone size={12} /> 
                    Via: <span className="font-medium text-emerald-600">{campaign.currentInstanceId || 'Rotação Automática'}</span>
                </div>
                {campaign.instances && campaign.instances.length > 1 && (
                    <div className="flex items-center gap-1 text-purple-600">
                        <Shuffle size={12} />
                        <span className="font-medium">{campaign.instances.length} instâncias</span>
                        {campaign.maxMessagesPerInstance && (
                            <span className="text-[10px] bg-purple-100 px-1 rounded">
                                {campaign.maxMessagesPerInstance}/troca
                            </span>
                        )}
                    </div>
                )}
            </div>
          </div>

          <div className="flex gap-2">
            {isPaused ? (
                <button 
                    onClick={() => onResume(campaign.id)}
                    className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                    title="Retomar"
                >
                    <Play size={20} />
                </button>
            ) : (
                <button 
                    onClick={() => onPause(campaign.id)}
                    className="p-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                    title="Pausar"
                >
                    <Pause size={20} />
                </button>
            )}
            <button 
                onClick={() => onStop(campaign.id)}
                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                title="Parar e Excluir Campanha"
            >
                <XCircle size={20} />
            </button>
          </div>
        </div>

        {/* Progress Section */}
        <div className="mb-2 flex justify-between items-end">
            <div className="flex flex-col">
                <span className="text-3xl font-bold text-gray-800 leading-none">
                    {Math.round(progress)}%
                </span>
                <span className="text-xs text-gray-400 mt-1">Concluído</span>
            </div>
            <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-xs text-gray-500 mb-1">
                    <Send size={12} /> {campaign.sentCount} / {campaign.totalLeads}
                </div>
                <div className="flex items-center justify-end gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    <Clock size={12} /> Restam aprox. {estimatedTime}
                </div>
            </div>
        </div>

        {/* Custom Progress Bar */}
        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
            <motion.div 
                className={`h-full ${isPaused ? 'bg-yellow-400' : 'bg-gradient-to-r from-emerald-500 to-teal-400'}`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
            />
        </div>
      </div>
    </motion.div>
  );
}
