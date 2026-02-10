import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';

// Custom icon components
const TrendingUpIcon = ({ size = 14 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('polyline', { points: '22,7 13.5,15.5 8.5,10.5 2,17' }), React.createElement('polyline', { points: '16,7 22,7 22,13' }));
const TrendingDownIcon = ({ size = 14 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('polyline', { points: '22,17 13.5,8.5 8.5,13.5 2,7' }), React.createElement('polyline', { points: '16,17 22,17 22,11' }));
const MinusIcon = ({ size = 14 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d: 'M5 12h14' }));

interface StatCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: React.ComponentType<{ size?: number }>;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color: 'blue' | 'emerald' | 'purple' | 'orange' | 'pink';
  delay?: number;
}

const colorMap = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-100', gradient: 'from-blue-500 to-blue-600' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', iconBg: 'bg-emerald-100', gradient: 'from-emerald-500 to-emerald-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', iconBg: 'bg-purple-100', gradient: 'from-purple-500 to-purple-600' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', iconBg: 'bg-orange-100', gradient: 'from-orange-500 to-orange-600' },
  pink: { bg: 'bg-pink-50', text: 'text-pink-600', iconBg: 'bg-pink-100', gradient: 'from-pink-500 to-pink-600' },
};

export function StatCard({ title, value, subValue, icon: Icon, trend, trendValue, color, delay = 0 }: StatCardProps) {
  const theme = colorMap[color];

  return (
    React.createElement(motion.div, {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.4, delay },
      className: "bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
    },
      // Background Decoration
      React.createElement('div', { 
        className: cn("absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 group-hover:scale-110 transition-transform duration-500", theme.iconBg) 
      }),
      
      React.createElement('div', { className: "flex justify-between items-start mb-4 relative z-10" },
        React.createElement('div', { 
          className: cn("p-3 rounded-xl shadow-sm", theme.iconBg, theme.text) 
        },
          React.createElement(Icon, { size: 24 })
        ),
        
        trend && React.createElement('div', {
          className: cn(
            "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
            trend === 'up' ? "bg-green-100 text-green-700" : 
            trend === 'down' ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"
          )
        },
          trend === 'up' && React.createElement(TrendingUpIcon, { size: 14 }),
          trend === 'down' && React.createElement(TrendingDownIcon, { size: 14 }),
          trend === 'neutral' && React.createElement(MinusIcon, { size: 14 }),
          trendValue
        )
      ),

      React.createElement('div', { className: "relative z-10" },
        React.createElement('h3', { className: "text-gray-500 text-sm font-medium mb-1" }, title),
        React.createElement('div', { className: "flex items-baseline gap-2" },
          React.createElement('h2', { className: "text-3xl font-bold text-gray-800 tracking-tight" }, value),
          subValue && React.createElement('span', { className: "text-sm text-gray-400 font-medium" }, subValue)
        )
      )
    )
  );
}
