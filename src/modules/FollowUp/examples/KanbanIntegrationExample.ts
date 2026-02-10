/**
 * EXEMPLO DE INTEGRAÇÃO - Módulo Kanban
 * 
 * Este arquivo mostra como integrar o sistema automático de follow-up
 * com o módulo Kanban/CRM do sistema.
 * 
 * Copie e adapte este código para seus módulos existentes.
 */

import { SaleIntegration } from '../utils/SaleIntegration';

// Exemplo 1: Quando um contato é movido entre estágios do funil
export function onContactStageChanged(contactId: string, oldStage: string, newStage: string, contactData: any) {
  console.log(`📊 Contato ${contactId} movido de "${oldStage}" para "${newStage}"`);
  
  // Detectar quando contato é movido para estágio de venda
  if (['sold', 'closed_won', 'payment_confirmed', 'delivered'].includes(newStage)) {
    console.log('🎉 Venda detectada via mudança de estágio Kanban');
    
    SaleIntegration.notifyKanbanStageChange({
      contactId,
      oldStage,
      newStage,
      saleData: {
        contactId,
        orderId: `KANBAN_${Date.now()}`,
        value: contactData.dealValue || contactData.estimatedValue || 0,
        products: contactData.interestedProducts || contactData.products || [],
        saleDate: new Date().toISOString()
      }
    });
  }
  
  // Detectar quando contato fica travado no funil (para follow-up de nutrição)
  if (['negotiation', 'proposal', 'quote_sent'].includes(newStage) && oldStage !== newStage) {
    // O sistema de IA já detecta isso automaticamente, mas podemos forçar
    console.log('⏳ Contato pode estar travado no funil');
  }
}

// Exemplo 2: Quando um deal/oportunidade é fechada
export function onDealClosed(dealData: any) {
  if (dealData.status === 'won' && dealData.value > 0) {
    console.log('💰 Deal fechado com sucesso');
    
    SaleIntegration.notifySaleCompleted({
      contactId: dealData.contactId,
      orderId: dealData.dealId || `DEAL_${Date.now()}`,
      value: dealData.value,
      products: dealData.products || [],
      saleDate: dealData.closedAt || new Date().toISOString()
    });
  }
}

// Exemplo 3: Integração com drag & drop do Kanban
export function handleKanbanDrop(contactId: string, fromColumn: string, toColumn: string, contactData: any) {
  // Mapear colunas para estágios padronizados
  const stageMapping: Record<string, string> = {
    'leads': 'lead',
    'qualificados': 'qualified',
    'proposta': 'proposal',
    'negociacao': 'negotiation',
    'fechados': 'sold',
    'perdidos': 'lost'
  };
  
  const oldStage = stageMapping[fromColumn] || fromColumn;
  const newStage = stageMapping[toColumn] || toColumn;
  
  onContactStageChanged(contactId, oldStage, newStage, contactData);
}

// Exemplo 4: Listener para mudanças no Kanban
export function setupKanbanListeners() {
  // Escutar mudanças de estágio
  window.addEventListener('kanban_stage_changed', (event: any) => {
    const { contactId, oldStage, newStage, contactData } = event.detail;
    onContactStageChanged(contactId, oldStage, newStage, contactData);
  });
  
  // Escutar fechamento de deals
  window.addEventListener('deal_closed', (event: any) => {
    onDealClosed(event.detail);
  });
  
  // Escutar drag & drop
  window.addEventListener('kanban_card_moved', (event: any) => {
    const { contactId, fromColumn, toColumn, contactData } = event.detail;
    handleKanbanDrop(contactId, fromColumn, toColumn, contactData);
  });
}

// Exemplo 5: Serviço para atualizar estágio do contato
export class KanbanService {
  static async updateContactStage(contactId: string, newStage: string, additionalData?: any) {
    try {
      const response = await fetch(`/api/contacts/${contactId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage, ...additionalData })
      });
      
      if (response.ok) {
        const contact = await response.json();
        
        // Notificar mudança de estágio
        onContactStageChanged(contactId, contact.oldStage, newStage, contact);
        
        return contact;
      }
    } catch (error) {
      console.error('Erro ao atualizar estágio do contato:', error);
    }
  }
  
  static async closeDeal(dealId: string, dealData: any) {
    try {
      const response = await fetch(`/api/deals/${dealId}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dealData)
      });
      
      if (response.ok) {
        const deal = await response.json();
        
        // Notificar fechamento do deal
        onDealClosed(deal);
        
        return deal;
      }
    } catch (error) {
      console.error('Erro ao fechar deal:', error);
    }
  }
}

// Exemplo 6: Componente React para card do Kanban
/*
import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { SaleIntegration } from '../FollowUp/utils/SaleIntegration';

export function KanbanCard({ contact, onMove }) {
  const [{ isDragging }, drag] = useDrag({
    type: 'contact',
    item: { id: contact.id, contact },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleQuickSale = () => {
    // Botão para marcar venda rápida
    const saleValue = prompt('Valor da venda:');
    const products = prompt('Produtos vendidos (separados por vírgula):');
    
    if (saleValue && parseFloat(saleValue) > 0) {
      SaleIntegration.notifySaleCompleted({
        contactId: contact.id,
        orderId: `QUICK_${Date.now()}`,
        value: parseFloat(saleValue),
        products: products ? products.split(',').map(p => p.trim()) : [],
      });
      
      // Mover para coluna "Fechados"
      onMove(contact.id, 'fechados');
    }
  };

  return (
    <div ref={drag} className={`kanban-card ${isDragging ? 'dragging' : ''}`}>
      <h4>{contact.name}</h4>
      <p>LTV: R$ {contact.ltv?.toLocaleString()}</p>
      <p>Estágio: {contact.kanbanStage}</p>
      
      <div className="card-actions">
        <button onClick={handleQuickSale}>
          💰 Marcar Venda
        </button>
      </div>
    </div>
  );
}

export function KanbanColumn({ title, contacts, onDrop }) {
  const [{ isOver }, drop] = useDrop({
    accept: 'contact',
    drop: (item) => {
      onDrop(item.id, title, item.contact);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div ref={drop} className={`kanban-column ${isOver ? 'drag-over' : ''}`}>
      <h3>{title}</h3>
      {contacts.map(contact => (
        <KanbanCard 
          key={contact.id} 
          contact={contact} 
          onMove={(contactId, newColumn) => onDrop(contactId, newColumn, contact)}
        />
      ))}
    </div>
  );
}
*/

// Exemplo 7: Hook personalizado para Kanban
/*
export function useKanbanIntegration() {
  const moveContact = useCallback(async (contactId: string, newStage: string, contactData: any) => {
    try {
      await KanbanService.updateContactStage(contactId, newStage, contactData);
    } catch (error) {
      console.error('Erro ao mover contato:', error);
    }
  }, []);

  const markAsSold = useCallback(async (contactId: string, saleValue: number, products: string[]) => {
    try {
      // Atualizar estágio para "sold"
      await KanbanService.updateContactStage(contactId, 'sold', {
        saleValue,
        products,
        soldAt: new Date().toISOString()
      });
      
      // Notificar venda diretamente também
      SaleIntegration.notifySaleCompleted({
        contactId,
        orderId: `KANBAN_${Date.now()}`,
        value: saleValue,
        products,
      });
    } catch (error) {
      console.error('Erro ao marcar como vendido:', error);
    }
  }, []);

  return {
    moveContact,
    markAsSold
  };
}
*/

// Inicializar listeners quando o módulo for carregado
if (typeof window !== 'undefined') {
  setupKanbanListeners();
}