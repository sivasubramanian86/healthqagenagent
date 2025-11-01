import React from 'react';
import { NavLink } from 'react-router-dom';
import * as Icons from '@heroicons/react/24/outline';

const items = [
  { to: '/dashboard', label: 'Dashboard', icon: 'HomeIcon' },
  { to: '/generate', label: 'Generate Tests', icon: 'BeakerIcon' },
  { to: '/explorer', label: 'FHIR Explorer', icon: 'CircleStackIcon' },
  { to: '/results', label: 'Test Results', icon: 'ClipboardDocumentCheckIcon' },
  { to: '/settings', label: 'Settings', icon: 'Cog6ToothIcon' }
];

const DefaultIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}><circle cx="12" cy="12" r="9" strokeWidth={1.5} /></svg>
);

export default function Sidebar() {
  return (
    <aside className="h-full w-full bg-white/90 dark:bg-gray-900/70 backdrop-blur-lg border-r border-gray-200 dark:border-gray-700/50 p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-10">
        <div className="p-2 bg-indigo-600/30 rounded-lg">
            <Icons.BoltIcon className="w-6 h-6 text-indigo-400" />
        </div>
        <div className="text-xl font-bold tracking-tighter text-gray-900 dark:text-white">HealthQAGen</div>
      </div>

      <nav className="flex-grow space-y-2">
        {items.map((it) => {
          const IconComp = (Icons as any)[it.icon] as React.ComponentType<any> | undefined;
          return (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) =>
                `flex items-center gap-4 p-3 rounded-lg transition-all duration-200 ${isActive ? 'bg-indigo-600/40 text-white font-semibold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'}`
              }
            >
              {IconComp ? <IconComp className="w-6 h-6" /> : <DefaultIcon className="w-6 h-6" />}
              <span>{it.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto">
          <div className="text-xs text-gray-500 dark:text-gray-500">v1.0.0 - Hackathon Edition</div>
      </div>
    </aside>
  );
}
