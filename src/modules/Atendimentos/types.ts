import { Product as GlobalProduct } from '../../types/global';

export type TicketStatus = 'pending' | 'open' | 'resolved';

export type TicketOrigin = 'chatbot' | 'campaign' | 'followup' | 'organic';

export interface Ticket {
  id: string;
  name: string;
  avatar: string;
  phoneNumber: string;
  lastMessage: string;
  time: string;
  unread: number;
  status: TicketStatus;
  onlineStatus: 'online' | 'offline';
  department: string;
  tags: string[];
  origin: TicketOrigin;
  instanceName?: string;
  provider?: string;
  hasWallet?: boolean;
  hasKanban?: boolean;
  hasCrm?: boolean;
  // Novos campos para CRM no RightPanel
  notes?: string;
  walletBalance?: number;
  // Campos de vínculo com Contato
  contact_id?: string;
  contact_stage?: string;
  lastSeen?: string;
}

export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'buttons' | 'list' | 'carousel';

export interface MessageButton {
  id: string;
  text: string;
  type: 'reply' | 'url' | 'call';
  value?: string;
}

export interface CarouselCard {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  price?: number;
  buttons?: MessageButton[];
}

export interface ListSection {
  title: string;
  rows: {
    id: string;
    title: string;
    description?: string;
  }[];
}

export interface MessageContent {
  text?: string;
  footer?: string;
  url?: string;
  caption?: string;
  latitude?: number;
  longitude?: number;
  fileName?: string;
  buttons?: MessageButton[];
  buttonText?: string;
  sections?: ListSection[];
  cards?: CarouselCard[];
}

export interface ChatMessage {
  id: string;
  ticketId: string;
  sender: 'me' | 'contact' | 'system';
  senderName?: string;
  type: MessageType;
  content: MessageContent;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
}

export interface Product extends GlobalProduct { }

export interface CartItem extends Product {
  qty: number;
  selectedVariation?: string;
}
