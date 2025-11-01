import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      {/* Static Sidebar */}
      <div className="w-64 fixed inset-y-0 left-0">
          <Sidebar />
      </div>
      
      {/* Content Area */}
      <div className="flex-1 flex flex-col ml-64">
          <header className="w-full">
              <Topbar />
          </header>

          {/* Main content with theme-aware background */}
          <main className="flex-1 p-8 bg-gray-50 dark:bg-gray-900">
              <div className="max-w-7xl mx-auto w-full">
                {children}
              </div>
          </main>
      </div>
    </div>
  );
};

export default Layout;
