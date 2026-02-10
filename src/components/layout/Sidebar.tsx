import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, MessageSquare, Smartphone, ShoppingBag,
  Users, Megaphone, Package, DollarSign, KanbanSquare,
  Settings, LogOut, Bike, ChevronRight, Bot, Zap,
  Moon, Sun, CalendarClock, FileText, TrendingUp, Monitor
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

interface MenuItem {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  path: string;
  label: string;
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, path: '/', label: 'Dashboard' },
  { icon: Smartphone, path: '/instancias', label: 'Instâncias' },
  { icon: Monitor, path: '/android-emulator', label: 'Emulador Android' },
  { icon: MessageSquare, path: '/atendimentos', label: 'Atendimentos' },
  { icon: CalendarClock, path: '/follow-up', label: 'Follow-up' },
  { icon: KanbanSquare, path: '/kanban', label: 'Kanban' },
  { icon: Bot, path: '/chatbots', label: 'Chatbots' },
  { icon: Zap, path: '/respostas-rapidas', label: 'Respostas Rápidas' },
  { icon: FileText, path: '/modelos', label: 'Modelos' },
  { icon: ShoppingBag, path: '/pedidos', label: 'Pedidos' },
  { icon: Bike, path: '/entregadores', label: 'Entregadores' },
  { icon: Users, path: '/contatos', label: 'Contatos' },
  { icon: Megaphone, path: '/campanhas', label: 'Campanhas' },
  { icon: TrendingUp, path: '/relatorios', label: 'Relatórios' },
  { icon: Package, path: '/produtos', label: 'Produtos' },
  { icon: DollarSign, path: '/financeiro', label: 'Financeiro' },
  { icon: Settings, path: '/configuracoes', label: 'Configurações' },
];

export function Sidebar() {
  const [isHovered, setIsHovered] = React.useState(false);
  const { theme, toggleTheme } = useTheme();

  return React.createElement(
    motion.aside,
    {
      initial: { width: 80 },
      animate: { width: isHovered ? 260 : 80 },
      transition: { type: "spring", stiffness: 300, damping: 30 },
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
      className: "h-screen bg-slate-800 dark:bg-[#111] border-r border-slate-700 dark:border-[#222] flex flex-col py-6 z-50 shadow-xl relative overflow-hidden transition-colors duration-300"
    },

    // Logo Area
    React.createElement(
      'div',
      { className: "flex items-center gap-3 px-5 mb-8 overflow-hidden whitespace-nowrap" },
      React.createElement(
        'div',
        { className: "w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0" },
        'C'
      ),
      React.createElement(
        motion.div,
        {
          animate: { opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -10 },
          className: "font-bold text-xl text-white tracking-tight"
        },
        'Chat',
        React.createElement('span', { className: "text-emerald-400" }, 'Vendas')
      )
    ),

    // Navigation
    React.createElement(
      'nav',
      { className: "flex-1 flex flex-col gap-3 w-full px-3 overflow-y-auto scrollbar-none" },
      menuItems.map((item) =>
        React.createElement(
          NavLink,
          {
            key: item.path,
            to: item.path,
            className: ({ isActive }: { isActive: boolean }) => cn(
              "flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
              isActive
                ? "bg-white/10 dark:bg-[#1c1c1c] shadow-sm text-white"
                : "text-slate-400 dark:text-gray-500 hover:bg-white/5 dark:hover:bg-[#1c1c1c] hover:text-white"
            )
          },
          ((({ isActive }: { isActive: boolean }) => [
            // Active Indicator Line
            isActive && React.createElement(
              motion.div,
              {
                key: "indicator",
                layoutId: "activeIndicator",
                className: "absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-emerald-400"
              }
            ),

            // Icon Container
            React.createElement(
              'div',
              {
                key: "icon",
                className: cn(
                  "w-6 h-6 flex items-center justify-center shrink-0 transition-all duration-300",
                  isActive ? "text-emerald-400" : "text-current"
                )
              },
              React.createElement(item.icon, { size: 20, strokeWidth: isActive ? 2.5 : 2 })
            ),

            // Label (UPPERCASE)
            React.createElement(
              motion.span,
              {
                key: "label",
                animate: { opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -10 },
                className: cn(
                  "font-bold text-xs uppercase tracking-wide whitespace-nowrap transition-colors",
                  isActive ? "text-white" : "text-current"
                )
              },
              item.label
            ),

            // Chevron
            isHovered && isActive && React.createElement(
              motion.div,
              {
                key: "chevron",
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                className: "ml-auto text-emerald-400"
              },
              React.createElement(ChevronRight, { size: 14 })
            )
          ]) as any)
        )
      )
    ),

    React.createElement(
      'div',
      { className: "mt-auto pt-2 border-t border-slate-700 dark:border-[#222] w-full px-3 flex flex-col gap-1" },

      // Theme Toggle Button
      React.createElement(
        'button',
        {
          onClick: toggleTheme,
          className: "w-full flex items-center gap-4 px-3 py-1.5 rounded-xl text-slate-400 dark:text-gray-400 hover:bg-white/5 dark:hover:bg-[#1c1c1c] hover:text-white transition-all group overflow-hidden"
        },
        React.createElement(
          'div',
          { className: "w-6 h-6 flex items-center justify-center shrink-0 group-hover:text-yellow-400 transition-colors" },
          React.createElement(theme === 'light' ? Moon : Sun, { size: 20 })
        ),
        React.createElement(
          motion.span,
          {
            animate: { opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -10 },
            className: "font-bold text-xs uppercase tracking-wide whitespace-nowrap"
          },
          theme === 'light' ? 'Modo Escuro' : 'Modo Claro'
        )
      ),

      // Logout Button
      React.createElement(
        'button',
        {
          className: cn(
            "w-full flex items-center gap-4 px-3 py-1.5 rounded-xl text-slate-400 dark:text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-all group overflow-hidden"
          )
        },
        React.createElement(
          'div',
          { className: "w-6 h-6 flex items-center justify-center shrink-0 transition-colors" },
          React.createElement(LogOut, { size: 20 })
        ),
        React.createElement(
          motion.span,
          {
            animate: { opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -10 },
            className: "font-bold text-xs uppercase tracking-wide whitespace-nowrap"
          },
          'Sair'
        )
      )
    )
  );
}