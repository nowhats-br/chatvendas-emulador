import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, Bot, Sparkles, Trash2, Edit, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ChatbotService, ChatbotFlow } from '../services/ChatbotService';
import { AIConfigService } from '../../../services/AIConfigService';
import { cn } from '../../../lib/utils';

export default function FlowListPage() {
  const navigate = useNavigate();
  const [flows, setFlows] = useState<ChatbotFlow[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);
  const [isAiConfigured, setIsAiConfigured] = useState(false);

  useEffect(() => {
    setFlows(ChatbotService.getAll());
    setIsAiConfigured(AIConfigService.isConfigured());
  }, []);

  const handleCreateNew = () => {
    const newFlow = ChatbotService.create({ name: 'Novo Fluxo', description: 'Sem descrição' });
    navigate(`/chatbot-builder/${newFlow.id}`);
  };

  const handleGenerateAi = async () => {
    if (!prompt.trim()) return;
    
    if (!isAiConfigured) {
      alert('Configure a IA primeiro nas configurações do sistema.');
      navigate('/configuracoes?tab=ai');
      return;
    }

    setIsGenerating(true);
    try {
      const newFlow = await ChatbotService.generateFlowFromPrompt(prompt);
      setIsGenerating(false);
      setShowAiModal(false);
      setPrompt('');
      setFlows(ChatbotService.getAll());
      navigate(`/chatbot-builder/${newFlow.id}`);
    } catch (error) {
      setIsGenerating(false);
      alert(error instanceof Error ? error.message : 'Erro ao gerar fluxo com IA');
    }
  };

  const handleOpenAiModal = () => {
    if (!isAiConfigured) {
      const shouldConfigure = confirm('A IA não está configurada. Deseja ir para as configurações agora?');
      if (shouldConfigure) {
        navigate('/configuracoes?tab=ai');
      }
      return;
    }
    setShowAiModal(true);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir este fluxo?')) {
        ChatbotService.delete(id);
        setFlows(ChatbotService.getAll());
    }
  };

  return (
    <div className="h-full bg-gray-50 overflow-y-auto p-8">
      
      {/* AI Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-in zoom-in-95">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl text-white">
                        <Sparkles size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Gerar Fluxo com IA</h2>
                </div>
                <p className="text-gray-500 mb-4">Descreva como você quer que o bot funcione e nós criaremos a estrutura para você.</p>
                
                <textarea 
                    className="w-full border border-gray-300 rounded-xl p-4 h-32 focus:ring-2 focus:ring-purple-500 outline-none resize-none mb-4"
                    placeholder="Ex: Crie um bot para uma pizzaria que mostre o cardápio, pegue o pedido e pergunte o endereço de entrega."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                />

                <div className="flex justify-end gap-3">
                    <button onClick={() => setShowAiModal(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Cancelar</button>
                    <button 
                        onClick={handleGenerateAi}
                        disabled={isGenerating || !prompt}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isGenerating ? 'Gerando...' : <><Sparkles size={18} /> Criar Mágica</>}
                    </button>
                </div>
            </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Meus Chatbots</h1>
                <p className="text-gray-500 mt-1">Gerencie seus fluxos de conversa automatizados.</p>
            </div>
            <div className="flex gap-3">
                <button 
                    onClick={handleOpenAiModal}
                    className={cn(
                      "px-5 py-3 rounded-xl flex items-center gap-2 transition shadow-sm font-bold",
                      isAiConfigured 
                        ? "bg-white border border-purple-200 text-purple-700 hover:bg-purple-50"
                        : "bg-orange-50 border border-orange-200 text-orange-700 hover:bg-orange-100"
                    )}
                >
                    {isAiConfigured ? <Sparkles size={20} /> : <Settings size={20} />}
                    {isAiConfigured ? 'Gerar com IA' : 'Configurar IA'}
                </button>
                <button 
                    onClick={handleCreateNew}
                    className="bg-emerald-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 font-bold"
                >
                    <Plus size={20} />
                    Criar do Zero
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flows.map(flow => (
                <div 
                    key={flow.id} 
                    onClick={() => navigate(`/chatbot-builder/${flow.id}`)}
                    className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={(e) => handleDelete(flow.id, e)} className="p-2 text-gray-400 hover:text-red-500 bg-white rounded-full shadow-sm border border-gray-100">
                            <Trash2 size={18} />
                         </button>
                    </div>

                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
                        <Bot size={24} />
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-800 mb-1">{flow.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 h-10 mb-4">{flow.description}</p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            <span className={cn("w-2 h-2 rounded-full", flow.isActive ? "bg-green-500" : "bg-gray-300")} />
                            <span className="text-xs font-medium text-gray-600">{flow.isActive ? 'Ativo' : 'Inativo'}</span>
                        </div>
                        <span className="text-xs text-gray-400">
                            {new Date(flow.updatedAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
