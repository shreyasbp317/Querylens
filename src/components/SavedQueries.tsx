import React, { useState } from 'react';
import { Bookmark, Play, Trash2, Search, Tag, Calendar } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { SavedQuery } from '../types';

interface SavedQueriesProps {
  savedQueries: SavedQuery[];
  onLoadQuery: (sql: string, nl: string) => void;
  onDeleteSaved: (id: string) => void;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const TAG_COLORS: Record<string, string> = {
  revenue: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  monthly: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  reporting: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  customers: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  ltv: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  retention: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  inventory: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  alerts: 'bg-red-500/10 text-red-400 border-red-500/20',
  products: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  churn: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  users: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  engagement: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
};

const getTagStyle = (tag: string) => TAG_COLORS[tag] || 'bg-gray-700 text-gray-400 border-gray-600';

export const SavedQueries: React.FC<SavedQueriesProps> = ({ savedQueries, onLoadQuery, onDeleteSaved }) => {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = Array.from(new Set(savedQueries.flatMap((q) => q.tags)));

  const filtered = savedQueries.filter((q) => {
    const matchesSearch = q.name.toLowerCase().includes(search.toLowerCase()) ||
      q.naturalLanguage.toLowerCase().includes(search.toLowerCase());
    const matchesTag = !activeTag || q.tags.includes(activeTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-800 bg-gray-900">
        <h2 className="text-white font-semibold text-lg flex items-center gap-2">
          <Bookmark size={18} className="text-violet-400" />
          Saved Queries
        </h2>
        <p className="text-gray-500 text-sm mt-0.5">{savedQueries.length} saved queries</p>
      </div>

      <div className="flex-shrink-0 px-6 py-3 border-b border-gray-800 space-y-2">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved queries..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-violet-500 placeholder-gray-600"
          />
        </div>
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveTag(null)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                !activeTag ? 'bg-violet-600/20 text-violet-300 border-violet-500/30' : 'bg-gray-800 text-gray-500 border-gray-700 hover:text-gray-300'
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                  activeTag === tag ? 'bg-violet-600/20 text-violet-300 border-violet-500/30' : `${getTagStyle(tag)} hover:opacity-80`
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-600 py-20">
            <Bookmark size={40} className="mb-3 opacity-30" />
            <p className="text-sm">No saved queries found</p>
          </div>
        ) : (
          <div className="p-4 grid gap-3">
            {filtered.map((query) => (
              <div
                key={query.id}
                className="bg-gray-800/40 border border-gray-700 hover:border-gray-600 rounded-xl overflow-hidden transition-all group"
              >
                <div
                  className="px-4 py-3.5 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === query.id ? null : query.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Bookmark size={13} className="text-violet-400 flex-shrink-0" />
                        <h3 className="text-gray-100 text-sm font-semibold">{query.name}</h3>
                      </div>
                      <p className="text-gray-500 text-xs mt-1.5 line-clamp-2">{query.naturalLanguage}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1 text-gray-600 text-xs">
                          <Calendar size={11} />
                          <span>{formatDate(query.createdAt)}</span>
                        </div>
                        {query.tags.length > 0 && (
                          <div className="flex items-center gap-1 text-gray-600 text-xs">
                            <Tag size={11} />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); onLoadQuery(query.sql, query.naturalLanguage); }}
                        className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs text-gray-400 hover:text-violet-300 bg-gray-700 hover:bg-gray-600 px-2.5 py-1.5 rounded-lg transition-all"
                      >
                        <Play size={11} />
                        Load
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteSaved(query.id); }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-400 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {query.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {query.tags.map((tag) => (
                        <span key={tag} className={`text-[10px] px-2 py-0.5 rounded-full border ${getTagStyle(tag)}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {expandedId === query.id && (
                  <div className="border-t border-gray-700">
                    <SyntaxHighlighter
                      language="sql"
                      style={vscDarkPlus}
                      customStyle={{ margin: 0, background: '#0d1117', padding: '12px', fontSize: '12px' }}
                      showLineNumbers
                    >
                      {query.sql}
                    </SyntaxHighlighter>
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
