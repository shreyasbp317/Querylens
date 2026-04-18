import React, { useState } from 'react';
import { LayoutGrid, ChevronRight, ChevronDown, Search, Key, Link, Hash, Type, ToggleLeft, FileText, Calendar } from 'lucide-react';
import { TableSchema, Column } from '../types';
import { cn } from '../utils/cn';

interface SchemaExplorerProps {
  schemas: TableSchema[];
}

function getTypeIcon(type: string) {
  const t = type.toUpperCase();
  if (t.includes('INT') || t.includes('SERIAL') || t.includes('DECIMAL') || t.includes('NUMERIC')) {
    return <Hash size={11} className="text-yellow-400" />;
  }
  if (t.includes('VARCHAR') || t.includes('TEXT') || t.includes('CHAR')) {
    return <Type size={11} className="text-blue-400" />;
  }
  if (t.includes('BOOL')) {
    return <ToggleLeft size={11} className="text-green-400" />;
  }
  if (t.includes('TIMESTAMP') || t.includes('DATE') || t.includes('TIME')) {
    return <Calendar size={11} className="text-purple-400" />;
  }
  if (t.includes('JSON')) {
    return <FileText size={11} className="text-orange-400" />;
  }
  return <Type size={11} className="text-gray-500" />;
}

function getTypeColor(type: string) {
  const t = type.toUpperCase();
  if (t.includes('INT') || t.includes('SERIAL') || t.includes('DECIMAL') || t.includes('NUMERIC')) {
    return 'text-yellow-500';
  }
  if (t.includes('VARCHAR') || t.includes('TEXT') || t.includes('CHAR')) return 'text-blue-400';
  if (t.includes('BOOL')) return 'text-green-400';
  if (t.includes('TIMESTAMP') || t.includes('DATE')) return 'text-purple-400';
  if (t.includes('JSON')) return 'text-orange-400';
  return 'text-gray-500';
}

function formatRowCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

const ColumnRow: React.FC<{ col: Column }> = ({ col }) => (
  <div className="flex items-center gap-2 px-4 py-1.5 hover:bg-gray-800/40 transition-colors">
    <div className="flex items-center gap-1 w-5">
      {col.isPrimary && <Key size={11} className="text-yellow-400" />}
      {col.isForeign && !col.isPrimary && <Link size={11} className="text-blue-400" />}
    </div>
    <span className={cn('text-xs font-mono font-medium', col.isPrimary ? 'text-yellow-300' : col.isForeign ? 'text-blue-300' : 'text-gray-300')}>
      {col.name}
    </span>
    <div className="flex items-center gap-1 ml-auto">
      {getTypeIcon(col.type)}
      <span className={cn('text-[10px] font-mono', getTypeColor(col.type))}>{col.type}</span>
    </div>
    {col.nullable && <span className="text-gray-600 text-[10px]">null</span>}
    {col.references && (
      <span className="text-blue-500/70 text-[10px] font-mono">→ {col.references}</span>
    )}
  </div>
);

export const SchemaExplorer: React.FC<SchemaExplorerProps> = ({ schemas }) => {
  const [search, setSearch] = useState('');
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set(['users', 'orders']));
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  const toggleTable = (name: string) => {
    setExpandedTables((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
    setSelectedTable(name);
  };

  const filtered = schemas.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.columns.some((c) => c.name.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedSchema = schemas.find((s) => s.name === selectedTable);

  return (
    <div className="flex h-full">
      {/* Left: table list */}
      <div className="w-72 flex-shrink-0 border-r border-gray-800 flex flex-col">
        <div className="flex-shrink-0 px-4 py-4 border-b border-gray-800 bg-gray-900">
          <h2 className="text-white font-semibold text-base flex items-center gap-2">
            <LayoutGrid size={16} className="text-violet-400" />
            Schema Explorer
          </h2>
          <p className="text-gray-600 text-xs mt-0.5">{schemas.length} tables introspected</p>
        </div>
        <div className="px-3 py-2 border-b border-gray-800">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tables..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-3 py-1.5 text-gray-200 text-xs focus:outline-none focus:border-violet-500 placeholder-gray-600"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {filtered.map((schema) => (
            <div key={schema.name}>
              <button
                onClick={() => toggleTable(schema.name)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors',
                  selectedTable === schema.name ? 'bg-violet-600/10 border-r-2 border-violet-500' : 'hover:bg-gray-800/50'
                )}
              >
                {expandedTables.has(schema.name) ? (
                  <ChevronDown size={13} className="text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronRight size={13} className="text-gray-500 flex-shrink-0" />
                )}
                <div className="w-5 h-5 rounded bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <LayoutGrid size={10} className="text-gray-400" />
                </div>
                <span className={cn('text-sm font-mono font-medium flex-1 truncate', selectedTable === schema.name ? 'text-violet-300' : 'text-gray-300')}>
                  {schema.name}
                </span>
                <span className="text-gray-600 text-[10px] flex-shrink-0">{formatRowCount(schema.rowCount)}</span>
              </button>

              {expandedTables.has(schema.name) && (
                <div className="bg-gray-900/50 border-b border-gray-800/50 py-1">
                  {schema.columns.map((col) => (
                    <ColumnRow key={col.name} col={col} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right: detail panel */}
      <div className="flex-1 overflow-y-auto">
        {selectedSchema ? (
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-white font-bold text-xl font-mono">{selectedSchema.name}</h3>
                <p className="text-gray-400 text-sm mt-1">{selectedSchema.description}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{formatRowCount(selectedSchema.rowCount)}</div>
                <div className="text-gray-500 text-xs">rows</div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Columns', value: selectedSchema.columns.length },
                { label: 'Primary Keys', value: selectedSchema.columns.filter((c) => c.isPrimary).length },
                { label: 'Foreign Keys', value: selectedSchema.columns.filter((c) => c.isForeign).length },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-800/50 border border-gray-700 rounded-xl p-3 text-center">
                  <div className="text-white font-bold text-lg">{value}</div>
                  <div className="text-gray-500 text-xs">{label}</div>
                </div>
              ))}
            </div>

            {/* Column list */}
            <div className="border border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-gray-800 px-4 py-2.5 border-b border-gray-700">
                <div className="grid grid-cols-12 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <div className="col-span-1" />
                  <div className="col-span-4">Column</div>
                  <div className="col-span-3">Type</div>
                  <div className="col-span-2">Nullable</div>
                  <div className="col-span-2">References</div>
                </div>
              </div>
              <div>
                {selectedSchema.columns.map((col, i) => (
                  <div
                    key={col.name}
                    className={cn(
                      'grid grid-cols-12 items-center px-4 py-2.5 text-xs border-b border-gray-800 last:border-b-0',
                      i % 2 === 0 ? 'bg-transparent' : 'bg-gray-800/20'
                    )}
                  >
                    <div className="col-span-1 flex gap-1">
                      {col.isPrimary && <Key size={11} className="text-yellow-400" />}
                      {col.isForeign && <Link size={11} className="text-blue-400" />}
                    </div>
                    <div className={cn('col-span-4 font-mono font-medium', col.isPrimary ? 'text-yellow-300' : col.isForeign ? 'text-blue-300' : 'text-gray-200')}>
                      {col.name}
                    </div>
                    <div className={cn('col-span-3 font-mono', getTypeColor(col.type))}>
                      {col.type}
                    </div>
                    <div className="col-span-2">
                      {col.nullable ? (
                        <span className="text-yellow-500/70 text-[10px] bg-yellow-500/10 px-1.5 py-0.5 rounded">YES</span>
                      ) : (
                        <span className="text-gray-600 text-[10px]">NO</span>
                      )}
                    </div>
                    <div className="col-span-2 text-blue-400/70 font-mono">
                      {col.references || '—'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Relationships */}
            {selectedSchema.columns.filter((c) => c.isForeign).length > 0 && (
              <div className="mt-6">
                <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Relationships</h4>
                <div className="space-y-2">
                  {selectedSchema.columns.filter((c) => c.isForeign).map((col) => (
                    <div key={col.name} className="flex items-center gap-2 bg-gray-800/30 border border-gray-700 rounded-lg px-3 py-2">
                      <span className="text-blue-300 font-mono text-xs">{selectedSchema.name}.{col.name}</span>
                      <span className="text-gray-600">→</span>
                      <span className="text-emerald-300 font-mono text-xs">{col.references}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-600 py-20">
            <LayoutGrid size={48} className="mb-4 opacity-20" />
            <p className="text-sm font-medium">Select a table to view its schema</p>
            <p className="text-xs mt-1">{schemas.length} tables available</p>
          </div>
        )}
      </div>
    </div>
  );
};
