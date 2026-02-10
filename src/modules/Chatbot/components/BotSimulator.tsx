import React from 'react';
import { Node, Edge } from '@xyflow/react';
import { cn } from '../../../lib/utils';

// Custom icon components
const XIcon = () => React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('line', { x1: '18', y1: '6', x2: '6', y2: '18' }), React.createElement('line', { x1: '6', y1: '6', x2: '18', y2: '18' }));
const SendIcon = () => React.createElement('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('line', { x1: '22', y1: '2', x2: '11', y2: '13' }), React.createElement('polygon', { points: '22,2 15,22 11,13 2,9 22,2' }));
const RefreshCwIcon = () => React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d: 'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8' }), React.createElement('path', { d: 'M21 3v5h-5' }), React.createElement('path', { d: 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16' }), React.createElement('path', { d: 'M8 16H3v5' }));
const SmartphoneIcon = () => React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('rect', { x: '5', y: '2', width: '14', height: '20', rx: '2', ry: '2' }), React.createElement('line', { x1: '12', y1: '18', x2: '12.01', y2: '18' }));

interface BotSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: Node[];
  edges: Edge[];
}

interface SimMessage {
  id: string;
  text?: string;
  sender: 'bot' | 'user';
  type: 'text' | 'image' | 'buttons' | 'carousel';
  options?: any[]; // Para botões ou cards
  image?: string;
}

export function BotSimulator({ isOpen, onClose, nodes, edges }: BotSimulatorProps) {
  const [messages, setMessages] = React.useState<SimMessage[]>([]);
  const [currentNodeId, setCurrentNodeId] = React.useState<string | null>(null);
  const [userInput, setUserInput] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Reinicia o simulador quando abre
  React.useEffect(() => {
    if (isOpen) {
      restartSimulation();
    }
  }, [isOpen]);

  // Scroll automático
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const restartSimulation = () => {
    setMessages([]);
    const startNode = nodes.find(n => n.type === 'startNode');
    if (startNode) {
      processNode(startNode.id);
    } else {
      addSystemMessage('Erro: Nó de Início não encontrado.');
    }
  };

  const addSystemMessage = (text: string) => {
    setMessages((prev: SimMessage[]) => [...prev, { id: Date.now().toString(), text, sender: 'bot', type: 'text' }]);
  };

  const processNode = async (nodeId: string) => {
    setCurrentNodeId(nodeId);
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    // Simula "Digitando..."
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsTyping(false);

    // Processa o conteúdo do nó
    switch (node.type) {
      case 'startNode':
        // Passa direto para o próximo
        nextNode(nodeId);
        break;

      case 'messageNode':
        setMessages((prev: SimMessage[]) => [...prev, {
          id: Date.now().toString(),
          text: node.data.content as string,
          sender: 'bot',
          type: (node.data.mediaType as any) === 'image' ? 'image' : 'text',
          image: node.data.mediaUrl as string
        }]);
        nextNode(nodeId);
        break;

      case 'buttonsNode':
        setMessages((prev: SimMessage[]) => [...prev, {
          id: Date.now().toString(),
          text: node.data.content as string,
          sender: 'bot',
          type: 'buttons',
          options: node.data.buttons as any[]
        }]);
        // Não chama nextNode automaticamente, espera clique
        break;
      
      case 'carouselNode':
        setMessages((prev: SimMessage[]) => [...prev, {
            id: Date.now().toString(),
            sender: 'bot',
            type: 'carousel',
            options: node.data.cards as any[]
        }]);
        break;

      case 'inputNode':
        setMessages((prev: SimMessage[]) => [...prev, {
            id: Date.now().toString(),
            text: node.data.content as string,
            sender: 'bot',
            type: 'text'
        }]);
        // Espera input do usuário
        break;

      default:
        addSystemMessage(`[Simulador] Nó tipo "${node.type}" processado.`);
        nextNode(nodeId);
    }
  };

  const nextNode = (currentNodeId: string, handleId?: string) => {
    // Encontra a aresta que sai deste nó
    const outgoingEdges = edges.filter(e => e.source === currentNodeId);
    
    let edge;
    if (handleId) {
        edge = outgoingEdges.find(e => e.sourceHandle === handleId);
    } else {
        edge = outgoingEdges[0];
    }

    if (edge) {
      processNode(edge.target);
    } else {
        // Fim do fluxo
    }
  };

  const handleUserResponse = (text: string, nextHandleId?: string) => {
    setMessages((prev: SimMessage[]) => [...prev, { id: Date.now().toString(), text, sender: 'user', type: 'text' }]);
    
    if (currentNodeId) {
        nextNode(currentNodeId, nextHandleId);
    }
  };

  const handleSendInput = () => {
      if(!userInput.trim()) return;
      handleUserResponse(userInput);
      setUserInput('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-[#111] w-full max-w-sm h-[600px] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border-4 border-gray-800 relative">
        
        {/* Mock Phone Header */}
        <div className="bg-[#075e54] text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <SmartphoneIcon />
                </div>
                <div>
                    <h3 className="font-bold text-sm">Bot Preview</h3>
                    <p className="text-[10px] opacity-80">Online</p>
                </div>
            </div>
            <div className="flex gap-2">
                <button onClick={restartSimulation} className="p-1 hover:bg-white/10 rounded" title="Reiniciar">
                    <RefreshCwIcon />
                </button>
                <button onClick={onClose} className="p-1 hover:bg-white/10 rounded">
                    <XIcon />
                </button>
            </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-[#e5ddd5] dark:bg-[#0a0a0a] overflow-y-auto p-4 space-y-3" style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", backgroundBlendMode: 'overlay' }}>
            {messages.map((msg: SimMessage) => (
                <div key={msg.id} className={cn("flex flex-col max-w-[85%]", msg.sender === 'user' ? "ml-auto items-end" : "mr-auto items-start")}>
                    {msg.type === 'text' && msg.text && (
                        <div className={cn(
                            "px-3 py-2 rounded-lg text-sm shadow-sm relative",
                            msg.sender === 'user' ? "bg-[#d9fdd3] text-gray-800 rounded-tr-none" : "bg-white text-gray-800 rounded-tl-none"
                        )}>
                            {msg.text}
                            <span className="text-[9px] text-gray-400 block text-right mt-1">10:00</span>
                        </div>
                    )}

                    {msg.type === 'image' && (
                        <div className="bg-white p-1 rounded-lg shadow-sm rounded-tl-none">
                            {msg.image && <img src={msg.image} className="rounded-lg w-full h-auto mb-1" />}
                            {msg.text && <p className="text-sm text-gray-800 px-2 pb-1">{msg.text}</p>}
                        </div>
                    )}

                    {msg.type === 'buttons' && (
                        <div className="space-y-2 w-full">
                            <div className="bg-white px-3 py-2 rounded-lg text-sm shadow-sm rounded-tl-none text-gray-800">
                                {msg.text}
                            </div>
                            <div className="flex flex-col gap-1">
                                {msg.options?.map((btn: any, idx: number) => (
                                    <button 
                                        key={idx}
                                        onClick={() => handleUserResponse(btn.text, `handle-${idx}`)}
                                        className="bg-white text-emerald-600 font-bold text-sm py-2 rounded-lg shadow-sm hover:bg-gray-50 transition"
                                    >
                                        {btn.text}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {msg.type === 'carousel' && (
                        <div className="flex gap-2 overflow-x-auto pb-2 w-full snap-x">
                            {msg.options?.map((card: any, idx: number) => (
                                <div key={idx} className="min-w-[180px] w-[180px] bg-white rounded-lg shadow-sm overflow-hidden snap-start shrink-0">
                                    {card.imageUrl ? (
                                        <img src={card.imageUrl} className="w-full h-24 object-cover" />
                                    ) : (
                                        <div className="w-full h-24 bg-gray-200 flex items-center justify-center text-gray-400 text-xs">Sem Imagem</div>
                                    )}
                                    <div className="p-2">
                                        <h4 className="font-bold text-gray-800 text-xs truncate">{card.title}</h4>
                                        <p className="text-[10px] text-gray-500 line-clamp-2 mb-2">{card.description}</p>
                                        {card.buttons?.map((btn: any, bIdx: number) => (
                                            <button key={bIdx} className="w-full text-[10px] bg-gray-100 text-gray-700 py-1 rounded mb-1 font-medium hover:bg-gray-200">
                                                {btn.text}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
            
            {isTyping && (
                <div className="bg-white px-3 py-2 rounded-lg rounded-tl-none w-fit shadow-sm">
                    <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75" />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150" />
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-[#f0f2f5] dark:bg-[#1c1c1c] p-2 flex items-center gap-2">
            <input 
                type="text" 
                className="flex-1 bg-white dark:bg-[#2a2a2a] rounded-full px-4 py-2 text-sm outline-none border-none dark:text-white"
                placeholder="Digite uma mensagem..."
                value={userInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserInput(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSendInput()}
            />
            <button 
                onClick={handleSendInput}
                className="bg-[#075e54] text-white p-2 rounded-full hover:bg-[#054c44] transition"
            >
                <SendIcon />
            </button>
        </div>

      </div>
    </div>
  );
}
