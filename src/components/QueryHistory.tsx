import React, { useState } from 'react';
import { Clock, CheckCircle2, XCircle, Trash2, Play, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { QueryHistoryItem } from '../types';


interface QueryHistoryProps {
  history: QueryHistoryItem[];
  onLoadQuery: (sql: string, nl: string) => void;
  onDeleteHistory: (id: string) => void;
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export const QueryHistory: React.FC<QueryHistoryProps> = ({ history, onLoadQuery, onDeleteHistory }) => {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = history.filter((h) =>
    h.naturalLanguage.toLowerCase().includes(search.toLowerCase()) ||
    h.sql.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-800 bg-gray-900">
        <h2 className="text-white font-semibold text-lg flex items-center gap-2">
          <Clock size={18} className="text-violet-400" />
          Query History
        </h2>
        <p className="text-gray-500 text-sm mt-0.5">{history.length} queries executed this session</p>
      </div>

      <div className="flex-shrink-0 px-6 py-3 border-b border-gray-800">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search history..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-violet-500 placeholder-gray-600"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-600 py-20">
            <Clock size={40} className="mb-3 opacity-30" />
            <p className="text-sm">No queries found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {filtered.map((item) => (
              <div key={item.id} className="group">
                <div
                  className="px-6 py-4 hover:bg-gray-800/50 cursor-pointer transition-colors"
                  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      {item.status === 'success' ? (
                        <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-gray-200 text-sm font-medium truncate">{item.naturalLanguage}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-gray-600 text-xs">{timeAgo(item.timestamp)}</span>
                          {item.status === 'success' && (
                            <>
                              <span className="text-gray-600 text-xs">{item.rowCount} rows</span>
                              <span className="text-gray-600 text-xs">{item.executionTime}ms</span>
                            </>
                          )}
                          {item.status === 'error' && (
                            <span className="text-red-400 text-xs">Error</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {item.status === 'success' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onLoadQuery(item.sql, item.naturalLanguage); }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-violet-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
                          title="Load query"
                        >
                          <Play size={12} />
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteHistory(item.id); }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-400 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                      {expandedId === item.id ? (
                        <ChevronDown size={14} className="text-gray-500" />
                      ) : (
                        <ChevronRight size={14} className="text-gray-500" />
                      )}
                    </div>
                  </div>
                </div>

                {expandedId === item.id && (
                  <div className="px-6 pb-4">
                    {item.status === 'error' ? (
                      <div className="bg-red-950/30 border border-red-900/40 rounded-lg p-3">
                        <p className="text-red-400 text-xs font-mono">{item.error}</p>
                      </div>
                    ) : (
                      <div className="rounded-lg overflow-hidden border border-gray-700">
                        <SyntaxHighlighter
                          language="sql"
                          style={vscDarkPlus}
                          customStyle={{ margin: 0, background: '#111827', padding: '12px', fontSize: '12px' }}
                          showLineNumbers
                        >
                          {item.sql}
                        </SyntaxHighlighter>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
