import React from 'react';
import { cn } from '../../../lib/utils';

interface QuickRepliesPanelProps {
    onClose: () => void;
    onInsertMessage: (text: string) => void;
    onSendMessage: (content: string, type?: string) => void;
}

// Icons
const Search = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
    React.createElement('svg', {
        width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
        strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
    },
        React.createElement('circle', { cx: '11', cy: '11', r: '8' }),
        React.createElement('path', { d: 'm21 21-4.35-4.35' }));

const Flame = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
    React.createElement('svg', {
        width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
        strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
    }, React.createElement('path', { d: 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z' }));

const Hand = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
    React.createElement('svg', {
        width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
        strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
    },
        React.createElement('path', { d: 'M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0' }),
        React.createElement('path', { d: 'M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2' }),
        React.createElement('path', { d: 'M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8' }),
        React.createElement('path', { d: 'M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15' }));

const Truck = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
    React.createElement('svg', {
        width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
        strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
    },
        React.createElement('path', { d: 'M14 18V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2' }),
        React.createElement('path', { d: 'M15 18H9' }),
        React.createElement('path', { d: 'M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14' }),
        React.createElement('circle', { cx: '17', cy: '18', r: '2' }),
        React.createElement('circle', { cx: '7', cy: '18', r: '2' }));

const CreditCard = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
    React.createElement('svg', {
        width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
        strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
    },
        React.createElement('rect', { width: '20', height: '14', x: '2', y: '5', rx: '2' }),
        React.createElement('line', { x1: '2', x2: '22', y1: '10', y2: '10' }));

const X = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
    React.createElement('svg', {
        width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
        strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
    },
        React.createElement('path', { d: 'M18 6 6 18' }),
        React.createElement('path', { d: 'm6 6 12 12' }));

const GripVertical = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
    React.createElement('svg', {
        width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
        strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
    },
        React.createElement('circle', { cx: '9', cy: '12', r: '1' }),
        React.createElement('circle', { cx: '9', cy: '5', r: '1' }),
        React.createElement('circle', { cx: '9', cy: '19', r: '1' }),
        React.createElement('circle', { cx: '15', cy: '12', r: '1' }),
        React.createElement('circle', { cx: '15', cy: '5', r: '1' }),
        React.createElement('circle', { cx: '15', cy: '19', r: '1' }));

const StickyNote = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
    React.createElement('svg', {
        width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
        strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
    },
        React.createElement('path', { d: 'M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z' }),
        React.createElement('path', { d: 'M15 3v4a2 2 0 0 0 2 2h4' }));

const QuickReplyItem = ({ icon: Icon, title, command, description, onInsert, onSend }: any) => {
    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('text/plain', description);
        e.dataTransfer.effectAllowed = 'copy';
    };

    return React.createElement(
        'div',
        {
            draggable: true,
            onDragStart: handleDragStart,
            onClick: () => onSend(description),
            className: "p-4 bg-white dark:bg-[#252525] rounded-xl border border-gray-100 dark:border-[#333] hover:bg-emerald-50 dark:hover:bg-emerald-900/10 hover:border-emerald-200 dark:hover:border-emerald-800 cursor-grab active:cursor-grabbing transition-all mb-3 group relative shadow-sm hover:shadow-md"
        },
        React.createElement(
            'div',
            { className: "absolute right-3 top-4 opacity-0 group-hover:opacity-100 text-gray-400" },
            React.createElement(GripVertical, { size: 16 })
        ),
        React.createElement(
            'div',
            { className: "flex justify-between items-start mb-2" },
            React.createElement(
                'div',
                { className: "flex items-center gap-2" },
                React.createElement(Icon, { size: 20, className: "text-emerald-500" }),
                React.createElement('span', { className: "font-bold text-gray-800 dark:text-gray-100 text-sm" }, title)
            ),
            React.createElement('span', { className: "text-[10px] bg-gray-100 dark:bg-[#333] text-gray-500 px-2 py-0.5 rounded-full font-mono mr-5" }, command)
        ),
        React.createElement('p', { className: "text-xs text-gray-500 dark:text-gray-400 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-300" }, description)
    );
};

export function QuickRepliesPanel({ onClose, onInsertMessage, onSendMessage }: QuickRepliesPanelProps) {
    const [searchTerm, setSearchTerm] = React.useState('');

    const replies = [
        { icon: Flame, title: "Promoção Exclusiva!", command: "/promo", description: "🎉 Grande oferta! [Produto] com [X]% de desconto por tempo limitado!" },
        { icon: Hand, title: "Boas-vindas!", command: "/ola", description: "Seja bem-vindo(a) ao nosso suporte! Como podemos tornar seu dia melhor?" },
        { icon: Truck, title: "Rastrear Pedido", command: "/rastrear", description: "Para consultar seu pedido, por favor, insira o código de rastreamento." },
        { icon: CreditCard, title: "Opções de Pagamento", command: "/pagar", description: "Aceitamos Cartão, Pix e Boleto. Qual prefere? Parcelamos em até 12x!" }
    ];

    const filteredReplies = replies.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.command.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full h-full bg-white dark:bg-[#1c1c1c] flex flex-col transition-colors duration-300">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-[#222] flex items-center justify-between bg-gray-50/50 dark:bg-[#1c1c1c]">
                <div className="flex items-center gap-2">
                    <StickyNote size={20} className="text-emerald-500" />
                    <h2 className="font-bold text-gray-800 dark:text-gray-100">Respostas Rápidas</h2>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-[#252525] rounded-full transition-colors text-gray-400"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Search */}
            <div className="p-4">
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar respostas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-[#252525] rounded-xl text-sm border-none focus:ring-2 focus:ring-emerald-500/50 outline-none text-gray-900 dark:text-gray-100 transition-all"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
                <div className="mb-4">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-3">
                        Dica: Clique ou arraste para o chat
                    </p>
                    <div className="space-y-1">
                        {filteredReplies.map((reply, idx) => (
                            <QuickReplyItem
                                key={idx}
                                {...reply}
                                onInsert={onInsertMessage}
                                onSend={onSendMessage}
                            />
                        ))}
                        {filteredReplies.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-400 text-sm">Nenhuma resposta encontrada.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer / Create New (Placeholder) */}
            <div className="p-4 border-t border-gray-100 dark:border-[#222]">
                <button className="w-full py-3 bg-gray-50 dark:bg-[#252525] text-gray-600 dark:text-gray-400 rounded-xl text-sm font-bold border border-dashed border-gray-300 dark:border-[#333] hover:bg-gray-100 dark:hover:bg-[#333] transition-all">
                    + Configurar Respostas
                </button>
            </div>
        </div>
    );
}
