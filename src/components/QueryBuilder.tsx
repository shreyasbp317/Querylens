import React, { useState, useRef } from 'react';
import { Send, Sparkles, Copy, BookmarkPlus, RotateCcw, CheckCheck, Loader2, ChevronDown } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { QueryResult } from '../types';
import { ResultsTable } from './ResultsTable';
import { cn } from '../utils/cn';

interface QueryBuilderProps {
  isLoading: boolean;
  generatedSQL: string;
  queryResult: QueryResult | null;
  onRunQuery: (nl: string) => void;
  onSaveQuery: (name: string, tags: string[]) => void;
}

const EXAMPLE_PROMPTS = [
  'Show me top 10 best-selling products by revenue',
  'Monthly revenue breakdown for this year',
  'Users who signed up in the last 30 days',
  'Top 20 customers by lifetime value',
  'Orders with more than 3 failed payments',
];

export const QueryBuilder: React.FC<QueryBuilderProps> = ({
  isLoading,
  generatedSQL,
  queryResult,
  onRunQuery,
  onSaveQuery,
}) => {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveTags, setSaveTags] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) onRunQuery(input.trim());
  };

  const handleExampleClick = (prompt: string) => {
    setInput(prompt);
    textareaRef.current?.focus();
  };

  const handleCopySQL = async () => {
    await navigator.clipboard.writeText(generatedSQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!saveName.trim()) return;
    onSaveQuery(saveName.trim(), saveTags.split(',').map((t) => t.trim()).filter(Boolean));
    setShowSaveModal(false);
    setSaveName('');
    setSaveTags('');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-800 bg-gray-900">
        <h2 className="text-white font-semibold text-lg flex items-center gap-2">
          <Sparkles size={18} className="text-violet-400" />
          Natural Language Query Builder
        </h2>
        <p className="text-gray-500 text-sm mt-0.5">Ask a question in plain English — powered by OpenAI GPT-4</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e);
              }}
              rows={3}
              placeholder="e.g. Show me all active users who placed more than 5 orders in the last 90 days..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 pr-14 text-gray-100 placeholder-gray-600 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40 resize-none transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={cn(
                'absolute bottom-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                input.trim() && !isLoading
                  ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              )}
            >
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </div>
          <p className="text-gray-600 text-xs">Press <kbd className="bg-gray-800 border border-gray-700 text-gray-400 px-1 py-0.5 rounded text-[10px]">⌘ Enter</kbd> to run</p>
        </form>

        {/* Example prompts */}
        {!generatedSQL && !isLoading && (
          <div>
            <p className="text-gray-500 text-xs font-medium mb-2 flex items-center gap-1">
              <ChevronDown size={12} /> Try an example
            </p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => handleExampleClick(p)}
                  className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 text-gray-300 px-3 py-1.5 rounded-lg transition-all"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6 text-center space-y-3">
            <div className="flex items-center justify-center gap-3">
              <Loader2 size={20} className="text-violet-400 animate-spin" />
              <span className="text-gray-300 text-sm font-medium">Generating SQL with GPT-4...</span>
            </div>
            <div className="flex justify-center gap-1 mt-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-violet-500"
                  style={{ animation: `bounce 1s ease-in-out ${i * 0.2}s infinite` }}
                />
              ))}
            </div>
            <p className="text-gray-600 text-xs">Introspecting schema → building query → executing against PostgreSQL</p>
          </div>
        )}

        {/* Generated SQL */}
        {generatedSQL && !isLoading && (
          <div className="rounded-xl border border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-800 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                </div>
                <span className="text-gray-400 text-xs font-mono">generated_query.sql</span>
              </div>
              <div className="flex items-center gap-2">
                {queryResult && (
                  <span className="text-emerald-400 text-xs">
                    {queryResult.rowCount} rows · {queryResult.executionTime}ms
                  </span>
                )}
                <button
                  onClick={handleCopySQL}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 bg-gray-700 hover:bg-gray-600 px-2.5 py-1 rounded-md transition-all"
                >
                  {copied ? <CheckCheck size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-300 bg-gray-700 hover:bg-gray-600 px-2.5 py-1 rounded-md transition-all"
                >
                  <BookmarkPlus size={12} />
                  Save
                </button>
                <button
                  onClick={() => setInput('')}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 bg-gray-700 hover:bg-gray-600 px-2.5 py-1 rounded-md transition-all"
                >
                  <RotateCcw size={12} />
                  Reset
                </button>
              </div>
            </div>
            <div className="text-sm leading-relaxed">
              <SyntaxHighlighter
                language="sql"
                style={vscDarkPlus}
                customStyle={{ margin: 0, background: '#111827', padding: '16px', fontSize: '13px' }}
                showLineNumbers
              >
                {generatedSQL}
              </SyntaxHighlighter>
            </div>
          </div>
        )}

        {/* Results Table */}
        {queryResult && !isLoading && (
          <ResultsTable result={queryResult} />
        )}
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-white font-semibold text-base mb-4">Save Query</h3>
            <div className="space-y-3">
              <div>
                <label className="text-gray-400 text-xs font-medium mb-1 block">Query name *</label>
                <input
                  autoFocus
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="e.g. Monthly Revenue Report"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-violet-500 placeholder-gray-600"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs font-medium mb-1 block">Tags (comma-separated)</label>
                <input
                  value={saveTags}
                  onChange={(e) => setSaveTags(e.target.value)}
                  placeholder="e.g. revenue, reporting, monthly"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-violet-500 placeholder-gray-600"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm py-2 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!saveName.trim()}
                className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm py-2 rounded-lg font-medium transition-all"
              >
                Save Query
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
