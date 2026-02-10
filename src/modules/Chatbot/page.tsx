import React, { useState, useCallback, useRef } from 'react';
import { 
  ReactFlow, 
  addEdge, 
  Background, 
  Controls, 
  Connection, 
  Edge, 
  Node, 
  useNodesState, 
  useEdgesState,
  ReactFlowProvider,
  BackgroundVariant,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { SidebarPalette } from './components/SidebarPalette';
import { ConfigPanel } from './components/ConfigPanel';
import { StartNode } from './components/nodes/StartNode';
import { MessageNode } from './components/nodes/MessageNode';
import { ButtonsNode, ListNode, CarouselNode, AiNode, DelayNode, ApiNode, TagNode } from './components/nodes/AdvancedNodes';
import { SetVariableNode, RandomizerNode, HandoffNode, TypingNode } from './components/nodes/LogicNodes';
import { KeywordNode, AutoReplyNode } from './components/nodes/NewNodes'; // Novos Nodes
import { Settings, Play, Save, ArrowLeft, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const nodeTypes = {
  startNode: StartNode,
  messageNode: MessageNode,
  inputNode: MessageNode,
  conditionNode: MessageNode,
  
  // Advanced Nodes
  buttonsNode: ButtonsNode,
  listNode: ListNode,
  carouselNode: CarouselNode,
  aiNode: AiNode,
  delayNode: DelayNode,
  apiNode: ApiNode,
  tagNode: TagNode,

  // Logic Nodes
  setVariableNode: SetVariableNode,
  randomizerNode: RandomizerNode,
  handoffNode: HandoffNode,
  typingNode: TypingNode,

  // New Nodes
  keywordNode: KeywordNode,
  autoReplyNode: AutoReplyNode
};

const initialNodes: Node[] = [
  {
    id: 'start_1',
    type: 'startNode',
    position: { x: 250, y: 100 },
    data: { label: 'Start' },
  },
  {
    id: 'msg_welcome',
    type: 'messageNode',
    position: { x: 250, y: 200 },
    data: { 
        label: 'Boas-vindas', 
        content: 'Olá! 👋 Bem-vindo ao suporte OmniTech. Como posso ajudar você hoje?',
        quickReplies: ['Falar com Vendas', 'Suporte Técnico']
    },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: 'start_1', target: 'msg_welcome', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
];

export default function ChatbotBuilderPage() {
  const navigate = useNavigate();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#10b981', strokeWidth: 2 } }, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('application/label');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = {
        x: event.clientX - (reactFlowWrapper.current?.getBoundingClientRect().left || 0),
        y: event.clientY - (reactFlowWrapper.current?.getBoundingClientRect().top || 0),
      };

      const newNode: Node = {
        id: `node_${Date.now()}`,
        type,
        position,
        data: { label: label, content: 'Configurar...' },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes],
  );

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  };

  const onPaneClick = () => {
    setSelectedNodeId(null);
  };

  const handleUpdateNode = (id: string, data: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, ...data } };
        }
        return node;
      })
    );
  };

  const handleDeleteNode = (id: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setSelectedNodeId(null);
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  return (
    <div className="h-screen w-full flex flex-col bg-[#0a0a0a] text-gray-100 font-sans overflow-hidden">
      {/* Top Bar */}
      <header className="h-16 border-b border-[#222] bg-[#111] flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate('/chatbots')} className="p-2 hover:bg-[#222] rounded-lg text-gray-400 transition-colors">
                <ArrowLeft size={20} />
            </button>
            <div>
                <h1 className="font-bold text-lg text-white">Fluxo de Suporte ao Cliente</h1>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                    Salvo há 2 minutos
                </p>
            </div>
        </div>

        <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-[#222] hover:bg-[#333] text-white rounded-lg font-medium text-sm flex items-center gap-2 transition-colors">
                <Play size={16} className="fill-white" /> Testar Bot
            </button>
            <button className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all">
                Publicar
            </button>
            <div className="h-6 w-px bg-[#333] mx-2" />
            <button className="p-2 hover:bg-[#222] rounded-lg text-gray-400"><Settings size={20} /></button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 p-[2px]">
                <div className="w-full h-full rounded-full bg-[#111] flex items-center justify-center">
                    <User size={16} className="text-gray-300" />
                </div>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <ReactFlowProvider>
            {/* Left Sidebar */}
            <SidebarPalette />

            {/* Canvas */}
            <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    onPaneClick={onPaneClick}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    nodeTypes={nodeTypes}
                    fitView
                    className="bg-[#0a0a0a]"
                    colorMode="dark"
                >
                    <Background color="#222" gap={20} size={1} variant={BackgroundVariant.Dots} />
                    <Controls className="bg-[#1c1c1c] border border-[#333] text-gray-400 [&>button]:border-b-[#333] hover:[&>button]:bg-[#252525]" />
                    
                    <Panel position="bottom-right" className="m-4">
                        <div className="bg-[#1c1c1c] border border-[#333] px-3 py-1.5 rounded-full flex items-center gap-2 text-xs text-gray-400 shadow-lg">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Auto-saved
                        </div>
                    </Panel>
                </ReactFlow>
            </div>

            {/* Right Config Panel */}
            <ConfigPanel 
                selectedNode={selectedNode} 
                onUpdateNode={handleUpdateNode}
                onDeleteNode={handleDeleteNode}
            />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
