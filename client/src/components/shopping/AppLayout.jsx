import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-ink-50 font-sans text-ink-900 flex flex-col">
      <Header />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
