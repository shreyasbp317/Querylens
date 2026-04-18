import React from 'react';
import { Database, Zap, Table2, Clock } from 'lucide-react';

interface StatsBarProps {
  tableCount: number;
  queryCount: number;
  avgExecTime: number;
}

export const StatsBar: React.FC<StatsBarProps> = ({ tableCount, queryCount, avgExecTime }) => {
  const stats = [
    { icon: Database, label: 'Tables Introspected', value: tableCount, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { icon: Zap, label: 'Queries Run', value: queryCount, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { icon: Clock, label: 'Avg Exec Time', value: `${avgExecTime}ms`, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { icon: Table2, label: 'OpenAI Model', value: 'GPT-4o', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  ];

  return (
    <div className="flex-shrink-0 grid grid-cols-4 gap-px bg-gray-800 border-b border-gray-800">
      {stats.map(({ icon: Icon, label, value, color, bg }) => (
        <div key={label} className="flex items-center gap-3 px-5 py-3 bg-gray-900">
          <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
            <Icon size={15} className={color} />
          </div>
          <div>
            <p className="text-gray-500 text-[10px] uppercase tracking-wider">{label}</p>
            <p className="text-white text-sm font-semibold">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
