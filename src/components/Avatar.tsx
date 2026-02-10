import React from 'react';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ name, size = 'md', className = '' }: AvatarProps) {
  const getInitials = (fullName: string): string => {
    return fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getSize = () => {
    switch (size) {
      case 'sm': return 'w-8 h-8 text-xs';
      case 'md': return 'w-10 h-10 text-sm';
      case 'lg': return 'w-12 h-12 text-base';
      default: return 'w-10 h-10 text-sm';
    }
  };

  const getGradient = (name: string) => {
    const gradients = [
      'from-blue-500 to-purple-600',
      'from-green-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-purple-500 to-pink-600',
      'from-indigo-500 to-blue-600',
      'from-teal-500 to-cyan-600',
      'from-red-500 to-pink-600',
      'from-yellow-500 to-orange-600',
    ];
    
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
  };

  return (
    <div 
      className={`
        ${getSize()} 
        rounded-full 
        bg-gradient-to-br ${getGradient(name)}
        flex items-center justify-center 
        text-white font-bold 
        border-2 border-white shadow-sm
        ${className}
      `}
    >
      {getInitials(name)}
    </div>
  );
}