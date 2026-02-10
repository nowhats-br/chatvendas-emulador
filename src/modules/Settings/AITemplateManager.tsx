import React from 'react';
import { AIConfigService, AIMessageTemplate, AISequenceConfig } from '../../services/AIConfigService';

// Ícones customizados
const MessageSquare = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('path', { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' }));

const Layers = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('polygon', { points: '12,2 2,7 12,12 22,7 12,2' }),
  React.createElement('polyline', { points: '2,17 12,22 22,17' }),
  React.createElement('polyline', { points: '2,12 12,17 22,12' }));

const Edit = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('path', { d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }),
  React.createElement('path', { d: 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' }));

const Toggle = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('rect', { width: '20', height: '12', x: '2', y: '6', rx: '6', ry: '6' }),
  React.createElement('circle', { cx: '8', cy: '12', r: '2' }));

const Sparkles = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('path', { d: 'm12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z' }),
  React.createElement('path', { d: 'M5 3v4' }),
  React.createElement('path', { d: 'M19 17v4' }),
  React.createElement('path', { d: 'M3 5h4' }),
  React.createElement('path', { d: 'M17 19h4' }));

export function AITemplateManager() {
  const [templates, setTemplates] = React.useState<AIMessageTemplate[]>([]);
  const [sequences, setSequences] = React.useState<AISequenceConfig[]>([]);
  const [activeTab, setActiveTab] = React.useState<'templates' | 'sequences'>('templates');
  const [editingTemplate, setEditingTemplate] = React.useState<AIMessageTemplate | null>(null);

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTemplates(AIConfigService.getTemplates());
    setSequences(AIConfigService.getSequences());
  };

  const toggleTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      AIConfigService.updateTemplate(templateId, { active: !template.active });
      loadData();
    }
  };

  const toggleSequence = (sequenceId: string) => {
    const sequence = sequences.find(s => s.id === sequenceId);
    if (sequence) {
      AIConfigService.updateSequence(sequenceId, { active: !sequence.active });
      loadData();
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'buttons':
        return '🔘';
      case 'list':
        return '📋';
      case 'image':
        return '🖼️';
      case 'video':
        return '🎥';
      default:
        return '💬';
    }
  };

  const getContextLabel = (context: string) => {
    const labels: Record<string, string> = {
      'sale_completed': 'Venda Finalizada',
      'sale_completed_7days': 'Pós-venda (7 dias)',
      'cart_abandoned': 'Carrinho Abandonado',
      'vip_inactive': 'Cliente VIP Inativo',
      'lead_cold': 'Lead Frio',
      'birthday': 'Aniversário'
    };
    return labels[context] || context;
  };

  const getTriggerLabel = (trigger: string) => {
    const labels: Record<string, string> = {
      'sale_completed': 'Venda Finalizada',
      'cart_abandoned': 'Carrinho Abandonado',
      'lead_cold': 'Lead Frio',
      'vip_inactive': 'Cliente VIP Inativo',
      'birthday': 'Aniversário',
      'follow_up': 'Follow-up Geral'
    };
    return labels[trigger] || trigger;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-2 rounded-lg">
          <Sparkles className="text-blue-600" size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">Templates e Sequências IA</h2>
          <p className="text-sm text-gray-500">Gerencie como a IA cria mensagens automáticas</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit">
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'templates' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <MessageSquare size={16} className="inline mr-2" />
          Templates ({templates.length})
        </button>
        <button
          onClick={() => setActiveTab('sequences')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'sequences' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Layers size={16} className="inline mr-2" />
          Sequências ({sequences.length})
        </button>
      </div>

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-800">Templates de Mensagem</h3>
            <span className="text-sm text-gray-500">
              {templates.filter(t => t.active).length} de {templates.length} ativos
            </span>
          </div>

          <div className="grid gap-4">
            {templates.map((template) => (
              <div key={template.id} className={`border rounded-lg p-4 transition-all ${
                template.active ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg">{getTypeIcon(template.type)}</span>
                      <h4 className="font-medium text-gray-800">{template.name}</h4>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {getContextLabel(template.context)}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {template.type}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {template.prompt.substring(0, 150)}...
                    </p>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.variables.map((variable) => (
                        <span key={variable} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          {`{{${variable}}}`}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => setEditingTemplate(template)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar template"
                    >
                      <Edit size={16} />
                    </button>
                    
                    <button
                      onClick={() => toggleTemplate(template.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        template.active 
                          ? 'text-green-600 hover:bg-green-100' 
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={template.active ? 'Desativar' : 'Ativar'}
                    >
                      <Toggle size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sequences Tab */}
      {activeTab === 'sequences' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-800">Sequências Automáticas</h3>
            <span className="text-sm text-gray-500">
              {sequences.filter(s => s.active).length} de {sequences.length} ativas
            </span>
          </div>

          <div className="grid gap-4">
            {sequences.map((sequence) => (
              <div key={sequence.id} className={`border rounded-lg p-4 transition-all ${
                sequence.active ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg">🔄</span>
                      <h4 className="font-medium text-gray-800">{sequence.name}</h4>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        {getTriggerLabel(sequence.trigger)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-sm text-gray-600">
                        {sequence.templates.length} mensagens
                      </span>
                      <span className="text-sm text-gray-600">
                        Delays: {sequence.delays.join(', ')} dias
                      </span>
                    </div>

                    <div className="space-y-2">
                      {sequence.templates.map((template, index) => (
                        <div key={template.id} className="flex items-center gap-2 text-sm">
                          <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </span>
                          <span className="text-gray-600">{template.name}</span>
                          <span className="text-xs text-gray-400">
                            ({sequence.delays[index] === 0 ? 'imediato' : `+${sequence.delays[index]} dias`})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => toggleSequence(sequence.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        sequence.active 
                          ? 'text-green-600 hover:bg-green-100' 
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={sequence.active ? 'Desativar' : 'Ativar'}
                    >
                      <Toggle size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Como Funciona</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• <strong>Templates:</strong> Definem como a IA gera mensagens para cada contexto</p>
          <p>• <strong>Sequências:</strong> Combinam templates com delays para automação completa</p>
          <p>• <strong>Variáveis:</strong> Dados do cliente inseridos automaticamente (nome, LTV, produtos, etc.)</p>
          <p>• <strong>Tipos:</strong> text (simples), buttons (interativo), list (opções), image/video (mídia)</p>
        </div>
      </div>
    </div>
  );
}