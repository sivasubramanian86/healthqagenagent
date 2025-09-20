import React from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { useLocation } from 'react-router-dom';

// A helper to format the title from the pathname
const formatTitle = (pathname: string) => {
  if (pathname === '/dashboard') return 'Dashboard Overview';
  const title = pathname.replace(/^\//, '').replace(/-/g, ' ');
  return title.charAt(0).toUpperCase() + title.slice(1);
};

export default function Topbar() {
  const location = useLocation();
  const pageTitle = formatTitle(location.pathname);

  return (
    <header className="flex items-center justify-between p-6 bg-transparent">
      {/* Page Title */}
      <div>
          <h1 className="text-2xl font-bold text-white">{pageTitle}</h1>
          <p className="text-sm text-gray-400">Your central hub for healthcare AI tools</p>
      </div>

      {/* Right-side controls */}
      <div className="flex items-center gap-6">
        <button className="relative p-2 text-gray-400 hover:text-white transition-colors" title="Notifications">
          <BellIcon className="w-6 h-6" />
          {/* Notification badge */}
          <span className="absolute top-1 right-1 block w-2 h-2 bg-indigo-500 rounded-full"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center font-bold text-white">K</div>
          <div>
            <div className="font-medium text-white">Kimberly</div>
            <div className="text-xs text-gray-400">Administrator</div>
          </div>
        </div>
      </div>
    </header>
  );
}
