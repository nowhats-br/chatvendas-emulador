import React from 'react';
import { MessageSquare, ShoppingBag, Wallet, Clock, MoreHorizontal } from 'lucide-react';
import { Contact } from '../../../services/ContactService';

// Ícones manuais para compatibilidade
const TagIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z' }),
    React.createElement('circle', { cx: '7.5', cy: '7.5', r: '.5', fill: 'currentColor' }));

const StickyNoteIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z' }),
    React.createElement('path', { d: 'M15 3v4a2 2 0 0 0 2 2h4' }));

const TagIconIndicator = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z' }),
    React.createElement('line', { x1: '7', y1: '7', x2: '7.01', y2: '7' }));

interface KanbanCardProps {
  contact: Contact;
  onOpenChat: (contact: Contact) => void;
  onOpenHistory: (contact: Contact) => void;
  onOpenFollowUp: (contact: Contact) => void;
  onMenuAction?: (contact: Contact, action: 'edit' | 'delete' | 'archive') => void;
}

export function KanbanCard({ contact, onOpenChat, onOpenHistory, onOpenFollowUp, onMenuAction }: KanbanCardProps) {
  const [showMenu, setShowMenu] = React.useState(false);

  const handleMenuAction = (action: 'edit' | 'delete' | 'archive') => {
    if (onMenuAction) {
      onMenuAction(contact, action);
    }
    setShowMenu(false);
  };

  const formatLastPurchase = (date: string) => {
    const now = new Date();
    const purchaseDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - purchaseDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} sem`;
    return purchaseDate.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
  };
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('contactId', contact.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group relative"
    >
      {/* Header: Avatar e Nome */}
      <div className="flex items-center gap-2 mb-2">
        <div className="relative shrink-0">
          <img
            src={contact.avatar || 'https://via.placeholder.com/32'}
            alt={contact.name}
            className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm"
          />
          {/* Status indicator */}
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-bold text-gray-800 text-xs truncate leading-tight">{contact.name}</h4>
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className="text-[10px] text-gray-500 truncate leading-tight flex-1">{contact.phoneNumber}</p>
            <div className="flex gap-1.5 shrink-0 px-1.5 py-0.5 bg-gray-50 rounded border border-gray-100 shadow-sm">
              {contact.tags && contact.tags.length > 0 && (
                <TagIconIndicator size={14} className="text-purple-600" />
              )}
              {contact.notes && contact.notes.length > 0 && (
                <StickyNoteIcon size={14} className="text-amber-500" />
              )}
            </div>
          </div>
        </div>
        <div className="relative" onMouseDown={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <MoreHorizontal size={14} />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div
              className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 min-w-[120px]"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => { e.stopPropagation(); handleMenuAction('edit'); }}
                className="w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Editar
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleMenuAction('archive'); }}
                className="w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Arquivar
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleMenuAction('delete'); }}
                className="w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 transition-colors"
              >
                Excluir
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      {contact.tags && contact.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {contact.tags.slice(0, 4).map((tag: any, index) => {
            const tagName = typeof tag === 'string' ? tag : (tag.name || '');
            const tagColor = typeof tag === 'object' && tag.color ? tag.color : '#6B7280';

            return (
              <span
                key={`${tagName}-${index}`}
                className="text-[9px] px-1.5 py-0.5 rounded font-bold border flex items-center gap-1"
                style={{
                  backgroundColor: `${tagColor}30`, // Aumentado de 15 para 30
                  color: tagColor,
                  borderColor: `${tagColor}40` // Aumentado de 25 para 40
                }}
              >
                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: tagColor }} />
                {tagName}
              </span>
            );
          })}
        </div>
      )}

      {/* Info Stats */}
      <div className="flex items-center justify-between bg-gray-50 p-1.5 rounded mb-2">
        <div className="flex items-center gap-1.5" title={`LTV: R$ ${contact.ltv?.toFixed(2) || '0.00'}`}>
          <Wallet size={10} className="text-emerald-600" />
          <span className="text-[10px] font-bold text-gray-700">
            R$ {contact.ltv ? (contact.ltv >= 1000 ? `${(contact.ltv / 1000).toFixed(1)}k` : contact.ltv.toFixed(0)) : '0'}
          </span>
        </div>
        {contact.lastPurchaseDate && (
          <div className="text-[9px] text-gray-400" title={`Última compra: ${new Date(contact.lastPurchaseDate).toLocaleDateString('pt-BR')}`}>
            {formatLastPurchase(contact.lastPurchaseDate)}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex border-t border-gray-100 pt-1.5 gap-1">
        <button
          onClick={() => onOpenChat(contact)}
          className="flex-1 py-1 flex items-center justify-center gap-1 text-[10px] font-medium text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 rounded transition-colors"
          title="Abrir Chat"
        >
          <MessageSquare size={10} /> Chat
        </button>
        <button
          onClick={() => onOpenHistory(contact)}
          className="flex-1 py-1 flex items-center justify-center gap-1 text-[10px] font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors"
          title="Ver Histórico de Compras"
        >
          <ShoppingBag size={10} /> Histórico
        </button>
        <button
          onClick={() => onOpenFollowUp(contact)}
          className="flex-1 py-1 flex items-center justify-center gap-1 text-[10px] font-medium text-gray-600 hover:bg-orange-50 hover:text-orange-600 rounded transition-colors"
          title="Agendar Follow-up"
        >
          <Clock size={10} /> Follow
        </button>
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}
