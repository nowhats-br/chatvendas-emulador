/// <reference types="react" />
/// <reference types="react-dom" />

// Remover declaração conflitante do React - usar tipos nativos

// Remover declaração conflitante do ReactDOM - usar tipos nativos

declare module 'react-router-dom' {
  export const NavLink: any;
  export const Outlet: any;
  export const useNavigate: any;
  export const useLocation: any;
  export const Routes: any;
  export const Route: any;
  export const BrowserRouter: any;
  export * from 'react-router-dom';
}

declare module 'lucide-react' {
  export const LayoutDashboard: any;
  export const MessageSquare: any;
  export const Smartphone: any;
  export const ShoppingBag: any;
  export const Users: any;
  export const Megaphone: any;
  export const Package: any;
  export const DollarSign: any;
  export const KanbanSquare: any;
  export const Settings: any;
  export const LogOut: any;
  export const Bike: any;
  export const ChevronRight: any;
  export const Bot: any;
  export const Zap: any;
  export const Moon: any;
  export const Sun: any;
  export const CalendarClock: any;
  export const FileText: any;
  export const Calendar: any;
  export const ArrowRight: any;
  export const Bell: any;
  export const RefreshCw: any;
  export const X: any;
  export const Save: any;
  export const User: any;
  export const Phone: any;
  export const Plus: any;
  export const Wallet: any;
  export const Clock: any;
  export const MoreHorizontal: any;
  export const Trash2: any;
  export const GripVertical: any;
  export * from 'lucide-react';
}

declare module 'framer-motion' {
  export const motion: any;
  export const AnimatePresence: any;
  export * from 'framer-motion';
}

declare module 'clsx' {
  export default function clsx(...args: any[]): string;
  export * from 'clsx';
}

declare module 'tailwind-merge' {
  export function twMerge(...args: string[]): string;
  export * from 'tailwind-merge';
}