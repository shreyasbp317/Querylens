import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { QueryBuilder } from './components/QueryBuilder';
import { QueryHistory } from './components/QueryHistory';
import { SavedQueries } from './components/SavedQueries';
import { SchemaExplorer } from './components/SchemaExplorer';
import { StatsBar } from './components/StatsBar';
import { useQueryEngine } from './hooks/useQueryEngine';
import { mockSchemas } from './data/mockData';
import { ActiveTab } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('query');

  const {
    history,
    savedQueries,
    isLoading,
    generatedSQL,
    queryResult,
    runQuery,
    saveQuery,
    deleteHistory,
    deleteSaved,
    loadQuery,
  } = useQueryEngine();

  const avgExecTime = history.filter((h) => h.status === 'success').length > 0
    ? Math.round(
        history.filter((h) => h.status === 'success').reduce((acc, h) => acc + h.executionTime, 0) /
          history.filter((h) => h.status === 'success').length
      )
    : 0;

  const handleLoadQuery = (sql: string, nl: string) => {
    loadQuery(sql, nl);
    setActiveTab('query');
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        historyCount={history.length}
        savedCount={savedQueries.length}
        schemaCount={mockSchemas.length}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <StatsBar
          tableCount={mockSchemas.length}
          queryCount={history.filter((h) => h.status === 'success').length}
          avgExecTime={avgExecTime}
        />

        <main className="flex-1 overflow-hidden">
          {activeTab === 'query' && (
            <QueryBuilder
              isLoading={isLoading}
              generatedSQL={generatedSQL}
              queryResult={queryResult}
              onRunQuery={runQuery}
              onSaveQuery={saveQuery}
            />
          )}
          {activeTab === 'history' && (
            <QueryHistory
              history={history}
              onLoadQuery={handleLoadQuery}
              onDeleteHistory={deleteHistory}
            />
          )}
          {activeTab === 'saved' && (
            <SavedQueries
              savedQueries={savedQueries}
              onLoadQuery={handleLoadQuery}
              onDeleteSaved={deleteSaved}
            />
          )}
          {activeTab === 'schema' && (
            <SchemaExplorer schemas={mockSchemas} />
          )}
        </main>
      </div>
    </div>
  );
}
