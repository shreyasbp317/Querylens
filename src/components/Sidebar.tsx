import React from 'react';
import { Database, History, Bookmark, LayoutGrid, Zap, ExternalLink } from 'lucide-react';
import { ActiveTab } from '../types';
import { cn } from '../utils/cn';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  historyCount: number;
  savedCount: number;
  schemaCount: number;
}

const navItems: { id: ActiveTab; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
  { id: 'query', label: 'Query Builder', icon: Zap },
  { id: 'history', label: 'Query History', icon: History },
  { id: 'saved', label: 'Saved Queries', icon: Bookmark },
  { id: 'schema', label: 'Schema Explorer', icon: LayoutGrid },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, historyCount, savedCount, schemaCount }) => {
  const badges: Record<ActiveTab, number> = {
    query: 0,
    history: historyCount,
    saved: savedCount,
    schema: schemaCount,
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <Database size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-none">QueryLens</h1>
            <p className="text-gray-500 text-[10px] mt-0.5">NL → SQL Builder</p>
          </div>
        </div>
      </div>

      {/* Connection badge */}
      <div className="px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <div className="min-w-0">
            <p className="text-gray-300 text-xs font-medium truncate">prod-db.internal</p>
            <p className="text-gray-500 text-[10px]">PostgreSQL 15.2</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
              activeTab === id
                ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            )}
          >
            <div className="flex items-center gap-2.5">
              <Icon size={16} className={activeTab === id ? 'text-violet-400' : ''} />
              <span>{label}</span>
            </div>
            {badges[id] > 0 && (
              <span className={cn(
                'text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
                activeTab === id ? 'bg-violet-500/30 text-violet-300' : 'bg-gray-700 text-gray-400'
              )}>
                {badges[id]}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-800 space-y-2">
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-300 text-xs transition-colors"
        >
          <ExternalLink size={13} />
          <span>View on GitHub</span>
          <ExternalLink size={11} className="ml-auto" />
        </a>
        <div className="flex items-center gap-2 px-0.5">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">
            JD
          </div>
          <div>
            <p className="text-gray-300 text-xs font-medium">Jane Doe</p>
            <p className="text-gray-600 text-[10px]">Portfolio Project</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
