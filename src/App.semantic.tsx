/**
 * Main application component for Semantic Layer Lineage Tracer
 */

import { useCallback } from 'react';
import { ProjectPicker } from './components/Setup/ProjectPicker';
import { LineageCanvas } from './components/Lineage/LineageCanvas';
import { AuditPanel } from './components/Audit/AuditPanel';
import { NodeDetail } from './components/Lineage/NodeDetail';
import { useLineageState } from './hooks/useLineageState';
import { parseProject } from './services/tauri';
import type { ProjectConfig, LineageNode, AuditIssue } from './types/semantic';

function App() {
  const {
    parseResult,
    isLoading,
    error,
    selectedNode,
    showAuditPanel,
    setParseResult,
    setLoading,
    setError,
    setSelectedNode,
    toggleAuditPanel,
  } = useLineageState();

  // Handle project selection
  const handleProjectSelected = useCallback(
    async (config: ProjectConfig) => {
      setLoading(true);
      setError(null);

      try {
        const result = await parseProject(config);

        if (result.errors.length > 0) {
          setError(result.errors.join('\n'));
        }

        setParseResult(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse project');
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, setParseResult]
  );

  // Handle node click in graph
  const handleNodeClick = useCallback(
    (node: LineageNode) => {
      setSelectedNode(node);
    },
    [setSelectedNode]
  );

  // Handle issue click in audit panel
  const handleIssueClick = useCallback(
    (issue: AuditIssue) => {
      if (issue.node_id && parseResult) {
        const node = parseResult.lineage.nodes.find(
          (n) => n.id === issue.node_id
        );
        if (node) {
          setSelectedNode(node);
        }
      }
    },
    [parseResult, setSelectedNode]
  );

  // Show project picker if no project loaded
  if (!parseResult) {
    return (
      <div className="h-screen">
        <ProjectPicker
          onProjectSelected={handleProjectSelected}
          isLoading={isLoading}
        />
        {error && (
          <div className="fixed bottom-4 left-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error: </strong>
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="font-semibold text-gray-900">
            Semantic Lineage Tracer
          </h1>
          {parseResult.dbt_project && (
            <span className="text-sm text-gray-500">
              {parseResult.dbt_project.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <input
            type="text"
            placeholder="Search nodes..."
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md w-64"
          />

          {/* Toggle audit panel */}
          <button
            onClick={toggleAuditPanel}
            className={`
              px-3 py-1.5 text-sm rounded-md
              ${showAuditPanel
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700'}
            `}
          >
            Audit
          </button>

          {/* Reset button */}
          <button
            onClick={() => {
              setParseResult(null as any);
              setSelectedNode(null);
            }}
            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            New Project
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Lineage canvas */}
        <div className="flex-1">
          <LineageCanvas
            parseResult={parseResult}
            onNodeClick={handleNodeClick}
            selectedNodeId={selectedNode?.id}
          />
        </div>

        {/* Side panels */}
        {(showAuditPanel || selectedNode) && (
          <div className="w-80 flex-shrink-0 flex flex-col">
            {selectedNode ? (
              <NodeDetail
                node={selectedNode}
                onClose={() => setSelectedNode(null)}
              />
            ) : showAuditPanel ? (
              <AuditPanel
                audit={parseResult.audit}
                onIssueClick={handleIssueClick}
              />
            ) : null}
          </div>
        )}
      </div>

      {/* Status bar */}
      <footer className="h-8 border-t border-gray-200 bg-gray-50 flex items-center px-4 text-xs text-gray-500 flex-shrink-0">
        <div className="flex items-center gap-4">
          <span>
            {parseResult.lineage.nodes.length} nodes
          </span>
          <span>
            {parseResult.lineage.edges.length} edges
          </span>
          {parseResult.warnings.length > 0 && (
            <span className="text-yellow-600">
              {parseResult.warnings.length} warnings
            </span>
          )}
        </div>
      </footer>
    </div>
  );
}

export default App;
