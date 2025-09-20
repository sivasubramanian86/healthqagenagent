import React from 'react';
import { NavLink } from 'react-router-dom';
import * as Icons from '@heroicons/react/24/outline';

// Use icon names as strings to avoid hard-binding to named exports that may
// differ between heroicons versions. Resolve at render time and fall back to
// a simple placeholder SVG if the requested icon isn't available.
const items = [
  { to: '/dashboard', label: 'Dashboard', icon: 'HomeIcon' },
  { to: '/generate', label: 'Generate Tests', icon: 'SparklesIcon' },
  { to: '/explorer', label: 'FHIR Data Explorer', icon: 'DatabaseIcon' },
  { to: '/results', label: 'Test Results', icon: 'ClipboardListIcon' },
  { to: '/settings', label: 'Settings', icon: 'Cog6ToothIcon' }
];

const DefaultIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <circle cx="12" cy="12" r="9" strokeWidth={1.5} />
    <path d="M8 12h8" strokeWidth={1.5} strokeLinecap="round" />
  </svg>
);

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 p-4 hidden md:block">
      <div className="flex items-center justify-between mb-6">
        <div className="text-xl font-semibold">HealthQAGenAgent</div>
        <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden">
          {(Icons as any).Bars3Icon ? React.createElement((Icons as any).Bars3Icon, { className: 'w-6 h-6' }) : <DefaultIcon className="w-6 h-6" />}
        </button>
      </div>

      <nav className="space-y-2">
        {items.map((it) => {
          const IconComp = (Icons as any)[it.icon] as React.ComponentType<any> | undefined;
          return (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) =>
                `flex items-center gap-3 p-2 rounded ${isActive ? 'bg-gray-100 dark:bg-gray-700 font-medium' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`
              }
            >
              {IconComp ? <IconComp className="w-5 h-5" /> : <DefaultIcon className="w-5 h-5" />}
              <span>{it.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
