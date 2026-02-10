// ============================================
// INTERACTIVE MESSAGES TYPES
// Preparado para múltiplas APIs (WhatsApp, Telegram, etc)
// ============================================

export type MessageProvider = 'whatsapp' | 'telegram' | 'custom';

export interface BaseInteractiveMessage {
  provider: MessageProvider;
  type: 'carousel' | 'buttons' | 'list' | 'payment';
}

// ============================================
// CAROUSEL (Carrossel de Produtos)
// ============================================
export interface InteractiveCarouselCard {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price?: number;
  buttons?: InteractiveButton[];
}

export interface CarouselMessage extends BaseInteractiveMessage {
  type: 'carousel';
  cards: InteractiveCarouselCard[];
  headerText?: string;
  footerText?: string;
}

// ============================================
// BUTTONS (Botões de Ação)
// ============================================
export interface InteractiveButton {
  id: string;
  text: string;
  type: 'reply' | 'url' | 'call' | 'payment';
  payload?: string;
  url?: string;
  phoneNumber?: string;
}

export interface ButtonsMessage extends BaseInteractiveMessage {
  type: 'buttons';
  text: string;
  buttons: InteractiveButton[];
  footer?: string;
}

// ============================================
// LIST (Lista de Opções)
// ============================================
export interface ListSection {
  title: string;
  rows: ListRow[];
}

export interface ListRow {
  id: string;
  title: string;
  description?: string;
}

export interface ListMessage extends BaseInteractiveMessage {
  type: 'list';
  text: string;
  buttonText: string;
  sections: ListSection[];
  footer?: string;
}

// ============================================
// PAYMENT (Pagamento)
// ============================================
export interface PaymentMessage extends BaseInteractiveMessage {
  type: 'payment';
  productId: string;
  productName: string;
  amount: number;
  currency: string;
  description?: string;
  imageUrl?: string;
  paymentMethods: PaymentMethod[];
}

export type PaymentMethod = 'pix' | 'credit_card' | 'debit_card' | 'boleto' | 'whatsapp_pay';

// ============================================
// UNIFIED MESSAGE TYPE
// ============================================
export type InteractiveMessage = 
  | CarouselMessage 
  | ButtonsMessage 
  | ListMessage 
  | PaymentMessage;

// ============================================
// PRODUCT SALE CONTEXT
// ============================================
export interface ProductSaleContext {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  images: string[];
  description: string;
  stock: number;
}

// ============================================
// MESSAGE BUILDER OPTIONS
// ============================================
export interface MessageBuilderOptions {
  provider: MessageProvider;
  enablePayment?: boolean;
  enableCarousel?: boolean;
  maxButtons?: number; // WhatsApp = 3, Telegram = 8
  maxCarouselCards?: number; // WhatsApp = 10
}