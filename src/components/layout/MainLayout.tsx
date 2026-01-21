import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 antialiased">
      {/* Sidebar - Fixed width, high contrast */}
      <Sidebar />

      {/* Main column - Flexible, scrollable */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header - Sticky with glassmorphism */}
        <Header />

        {/* Page content - Centered with maximum width and subtle entry animation */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1600px] px-8 py-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="space-y-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
