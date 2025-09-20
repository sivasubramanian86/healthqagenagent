import React from 'react';
import { BellIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

export default function Topbar() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    if (dark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [dark]);

  return (
    <header className="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-center gap-3">
        <div className="text-lg font-semibold">HealthQAGenAgent</div>
        <div className="text-sm text-gray-500">Dashboard</div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Toggle theme" onClick={() => setDark((d) => !d)}>
          {dark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
        </button>

        <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Notifications">
          <BellIcon className="w-5 h-5" />
        </button>

        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full flex items-center justify-center text-white">K</div>
      </div>
    </header>
  );
}
