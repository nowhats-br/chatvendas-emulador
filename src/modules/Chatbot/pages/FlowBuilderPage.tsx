import React, { useState, useCallback, useRef, useEffect } from 'react';
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

// Corrigindo imports para apontar para ../components
import { SidebarPalette } from '../components/SidebarPalette';
import { ConfigPanel } from '../components/ConfigPanel';
import { StartNode } from '../components/nodes/StartNode';
import { MessageNode } from '../components/nodes/MessageNode';
import { ButtonsNode, ListNode, CarouselNode, AiNode, DelayNode, ApiNode, TagNode } from '../components/nodes/AdvancedNodes';
import { SetVariableNode, RandomizerNode, HandoffNode, TypingNode } from '../components/nodes/LogicNodes';
import { BotSimulator } from '../components/BotSimulator';
import { ChatbotService } from '../services/ChatbotService';

import { Settings, Play, Save, ArrowLeft, User, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '../../../lib/utils';

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
  typingNode: TypingNode
};

const initialNodes: Node[] = [
  {
    id: 'start_1',
    type: 'startNode',
    position: { x: 250, y: 100 },
    data: { label: 'Start' },
  }
];

export default function ChatbotBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Estados de UI
  const [flowName, setFlowName] = useState('Novo Fluxo');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  // Carregar Fluxo
  useEffect(() => {
      if (id) {
          const flow = ChatbotService.getById(id);
          if (flow) {
              setFlowName(flow.name);
              setNodes(flow.nodes || initialNodes);
              setEdges(flow.edges || []);
          }
      }
  }, [id, setNodes, setEdges]);

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

  const handleSave = () => {
      if (!id) return;
      setIsSaving(true);
      
      // Simula delay de rede
      setTimeout(() => {
          ChatbotService.update(id, {
              nodes,
              edges,
              name: flowName
          });
          setLastSaved(new Date());
          setIsSaving(false);
      }, 800);
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  return (
    <div className="h-screen w-full flex flex-col bg-[#0a0a0a] text-gray-100 font-sans overflow-hidden">
      <BotSimulator 
        isOpen={isSimulatorOpen} 
        onClose={() => setIsSimulatorOpen(false)}
        nodes={nodes}
        edges={edges}
      />

      {/* Top Bar */}
      <header className="h-16 border-b border-[#222] bg-[#111] flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate('/chatbots')} className="p-2 hover:bg-[#222] rounded-lg text-gray-400 transition-colors">
                <ArrowLeft size={20} />
            </button>
            <div>
                <input 
                    type="text" 
                    value={flowName}
                    onChange={(e) => setFlowName(e.target.value)}
                    className="font-bold text-lg text-white bg-transparent border-none outline-none focus:ring-0 w-[300px]"
                />
                <p className="text-xs text-gray-500 flex items-center gap-1">
                   <span className={`w-2 h-2 rounded-full inline-block ${isSaving ? "bg-yellow-500" : "bg-green-500"}`} />
                   {isSaving ? 'Salvando...' : lastSaved ? `Salvo às ${lastSaved.toLocaleTimeString()}` : 'Não salvo'}
                </p>
            </div>
        </div>

        <div className="flex items-center gap-3">
            <button 
                onClick={() => setIsSimulatorOpen(true)}
                className="px-4 py-2 bg-[#222] hover:bg-[#333] text-white rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
            >
                <Play size={16} className="fill-white" /> Testar Bot
            </button>
            <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all flex items-center gap-2"
            >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Salvar
            </button>
            <div className="h-6 w-px bg-[#333] mx-2" />
            <button className="p-2 hover:bg-[#222] rounded-lg text-gray-400"><Settings size={20} /></button>
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
