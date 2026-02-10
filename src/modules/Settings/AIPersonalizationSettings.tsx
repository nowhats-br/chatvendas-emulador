import React from 'react';
import { AIConfigService, AIPersonalizationRules } from '../../services/AIConfigService';

// Ícones customizados
const Settings = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('circle', { cx: '12', cy: '12', r: '3' }),
  React.createElement('path', { d: 'M12 1v6m0 6v6m11-7h-6m-6 0H1m17-4a4 4 0 0 1-8 0 4 4 0 0 1 8 0zM7 21a4 4 0 0 1-8 0 4 4 0 0 1 8 0z' }));

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

const Save = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('path', { d: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z' }),
  React.createElement('polyline', { points: '17,21 17,13 7,13 7,21' }),
  React.createElement('polyline', { points: '7,3 7,8 15,8' }));

export function AIPersonalizationSettings() {
  const [personalization, setPersonalization] = React.useState<AIPersonalizationRules>({
    useFirstName: true,
    greetingByTime: true,
    emojiLevel: 'medium',
    toneOfVoice: 'friendly',
    maxMessageLength: 300,
    includeCompanyName: false,
    companyName: ''
  });
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveMessage, setSaveMessage] = React.useState('');

  React.useEffect(() => {
    const current = AIConfigService.getPersonalization();
    setPersonalization(current);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      AIConfigService.updatePersonalization(personalization);
      setSaveMessage('✅ Configurações salvas com sucesso!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('❌ Erro ao salvar configurações');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof AIPersonalizationRules, value: any) => {
    setPersonalization(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-purple-100 p-2 rounded-lg">
          <Sparkles className="text-purple-600" size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">Personalização da IA</h2>
          <p className="text-sm text-gray-500">Configure como a IA gera mensagens automáticas</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Nome e Saudações */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium text-gray-800 flex items-center gap-2">
              <Settings size={16} />
              Personalização de Nome
            </h3>
            
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={personalization.useFirstName}
                onChange={(e) => updateField('useFirstName', e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Usar apenas primeiro nome</span>
                <p className="text-xs text-gray-500">Ex: "João" ao invés de "João Silva"</p>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={personalization.greetingByTime}
                onChange={(e) => updateField('greetingByTime', e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Saudação por horário</span>
                <p className="text-xs text-gray-500">Bom dia, boa tarde, boa noite</p>
              </div>
            </label>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-gray-800">Tom de Voz</h3>
            <select
              value={personalization.toneOfVoice}
              onChange={(e) => updateField('toneOfVoice', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="formal">Formal</option>
              <option value="casual">Casual</option>
              <option value="friendly">Amigável</option>
              <option value="professional">Profissional</option>
            </select>
            <p className="text-xs text-gray-500">Define o estilo de comunicação da IA</p>
          </div>
        </div>

        {/* Emojis e Tamanho */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium text-gray-800">Nível de Emojis</h3>
            <select
              value={personalization.emojiLevel}
              onChange={(e) => updateField('emojiLevel', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="none">Nenhum 😐</option>
              <option value="low">Baixo 🙂</option>
              <option value="medium">Médio 😊</option>
              <option value="high">Alto 🎉😍🚀</option>
            </select>
            <p className="text-xs text-gray-500">Quantidade de emojis nas mensagens</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-gray-800">Tamanho da Mensagem</h3>
            <div className="space-y-2">
              <input
                type="range"
                min="100"
                max="500"
                value={personalization.maxMessageLength}
                onChange={(e) => updateField('maxMessageLength', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>100 chars</span>
                <span className="font-medium">{personalization.maxMessageLength} caracteres</span>
                <span>500 chars</span>
              </div>
            </div>
            <p className="text-xs text-gray-500">Limite máximo de caracteres por mensagem</p>
          </div>
        </div>

        {/* Empresa */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-800">Informações da Empresa</h3>
          
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={personalization.includeCompanyName}
              onChange={(e) => updateField('includeCompanyName', e.target.checked)}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <span className="text-sm font-medium text-gray-700">Incluir nome da empresa nas mensagens</span>
          </label>

          {personalization.includeCompanyName && (
            <input
              type="text"
              value={personalization.companyName || ''}
              onChange={(e) => updateField('companyName', e.target.value)}
              placeholder="Nome da sua empresa"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          )}
        </div>

        {/* Preview */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
          <h3 className="font-medium text-purple-800 mb-3">Preview da Mensagem</h3>
          <div className="bg-white p-3 rounded-lg border border-purple-200 text-sm">
            <p className="text-gray-700">
              {personalization.greetingByTime ? 'Boa tarde ' : ''}
              {personalization.useFirstName ? 'João' : 'João Silva'}! 
              {personalization.emojiLevel === 'high' ? ' 🎉' : personalization.emojiLevel === 'medium' ? ' 😊' : personalization.emojiLevel === 'low' ? ' 🙂' : ''}
              {' '}
              {personalization.toneOfVoice === 'formal' ? 'Esperamos que esteja bem.' : 
               personalization.toneOfVoice === 'casual' ? 'Tudo certo por aí?' :
               personalization.toneOfVoice === 'friendly' ? 'Como você está?' :
               'Espero que esteja tendo um ótimo dia.'}
              {personalization.includeCompanyName && personalization.companyName ? ` Aqui é da ${personalization.companyName}!` : ''}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Exemplo baseado nas suas configurações • {personalization.maxMessageLength} chars máx.
            </p>
          </div>
        </div>

        {/* Botão Salvar */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          {saveMessage && (
            <span className="text-sm font-medium text-green-600">{saveMessage}</span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="ml-auto px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-2"
          >
            <Save size={16} />
            {isSaving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </div>
    </div>
  );
}