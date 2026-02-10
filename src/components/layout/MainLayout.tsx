import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function MainLayout() {
  return React.createElement(
    'div',
    { className: "flex h-screen w-full bg-gray-100 dark:bg-black overflow-hidden font-sans transition-colors duration-300" },
    React.createElement(Sidebar),
    React.createElement(
      'main',
      { className: "flex-1 h-full relative overflow-hidden" },
      React.createElement(Outlet)
    )
  );
}
