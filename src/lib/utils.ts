import clsx from "clsx";
import { twMerge } from "tailwind-merge";

// Tipo para valores de classe CSS
type ClassValue = string | number | boolean | undefined | null | ClassValue[] | Record<string, any>;

/**
 * Combina classes CSS usando clsx e tailwind-merge
 * @param inputs - Classes CSS para combinar
 * @returns String com classes combinadas e otimizadas
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata números para moeda brasileira
 * @param value - Valor numérico
 * @returns String formatada como moeda (R$ 0,00)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

/**
 * Formata números para porcentagem
 * @param value - Valor numérico (0-1 ou 0-100)
 * @param decimals - Número de casas decimais (padrão: 1)
 * @returns String formatada como porcentagem
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  const percentage = value > 1 ? value : value * 100;
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * Formata data para formato brasileiro
 * @param date - Data para formatar
 * @param includeTime - Se deve incluir horário (padrão: false)
 * @returns String formatada (dd/mm/aaaa ou dd/mm/aaaa hh:mm)
 */
export function formatDate(date: Date | string, includeTime: boolean = false): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (includeTime) {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  }
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(dateObj);
}

/**
 * Formata número de telefone brasileiro
 * @param phone - Número de telefone
 * @returns String formatada (+55 11 99999-9999)
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return `+55 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    return `+55 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
}

/**
 * Trunca texto com reticências
 * @param text - Texto para truncar
 * @param maxLength - Comprimento máximo (padrão: 50)
 * @returns Texto truncado
 */
export function truncateText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Gera ID único simples
 * @returns String com ID único
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Debounce para funções
 * @param func - Função para fazer debounce
 * @param wait - Tempo de espera em ms
 * @returns Função com debounce aplicado
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait) as any;
  };
}

/**
 * Valida email
 * @param email - Email para validar
 * @returns true se válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida telefone brasileiro
 * @param phone - Telefone para validar
 * @returns true se válido
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 || cleaned.length === 11;
}

/**
 * Capitaliza primeira letra de cada palavra
 * @param text - Texto para capitalizar
 * @returns Texto capitalizado
 */
export function capitalize(text: string): string {
  return text.replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Remove acentos de texto
 * @param text - Texto com acentos
 * @returns Texto sem acentos
 */
export function removeAccents(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Calcula diferença em dias entre duas datas
 * @param date1 - Primeira data
 * @param date2 - Segunda data (padrão: hoje)
 * @returns Número de dias de diferença
 */
export function daysDifference(date1: Date | string, date2: Date | string = new Date()): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Converte bytes para formato legível
 * @param bytes - Número de bytes
 * @returns String formatada (1.2 MB, 500 KB, etc.)
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
