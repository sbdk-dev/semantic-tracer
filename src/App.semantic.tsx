/**
 * Main application component for Semantic Layer Lineage Tracer
 */

import { useCallback, useState, useEffect } from 'react';
import { ProjectPicker } from './components/Setup/ProjectPicker';
import { LineageCanvas } from './components/Lineage/LineageCanvas';
import { AuditPanel } from './components/Audit/AuditPanel';
import { NodeDetail } from './components/Lineage/NodeDetail';
import { MetricCatalog } from './components/Catalog/MetricCatalog';
import { SearchResults } from './components/Search/SearchResults';
import { useLineageState } from './hooks/useLineageState';
import { parseProject, getMetricLineage, getImpactAnalysis } from './services/tauri';
import { exportToPng, exportAuditJson, exportLineageJson, copyAsMermaid } from './services/export';
import type { ProjectConfig, LineageNode, AuditIssue } from './types/semantic';

type ViewMode = 'full' | 'metric' | 'impact';
type SidebarMode = 'catalog' | 'audit' | 'detail' | 'none';

function App() {
  const {
    parseResult,
    isLoading,
    error,
    selectedNode,
    setParseResult,
    setLoading,
    setError,
    setSelectedNode,
  } = useLineageState();

  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('catalog');
  const [viewMode, setViewMode] = useState<ViewMode>('full');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string | undefined>();
  const [showExportMenu, setShowExportMenu] = useState(false);

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
        setSidebarMode('catalog');
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
      setSidebarMode('detail');
    },
    [setSelectedNode]
  );

  // Handle metric click from catalog
  const handleMetricClick = useCallback(
    async (metricName: string) => {
      if (!parseResult) return;

      setSelectedMetric(metricName);
      setLoading(true);

      try {
        const filtered = await getMetricLineage(parseResult, metricName);
        setParseResult(filtered);
        setViewMode('metric');
      } catch (err) {
        console.error('Failed to get metric lineage:', err);
      } finally {
        setLoading(false);
      }
    },
    [parseResult, setParseResult, setLoading]
  );

  // Handle show upstream lineage
  const handleShowUpstream = useCallback(
    async (nodeName: string) => {
      if (!parseResult) return;

      // For metrics, use metric lineage
      const node = parseResult.lineage.nodes.find((n) => n.name === nodeName);
      if (node?.node_type === 'Metric') {
        await handleMetricClick(nodeName);
      }
    },
    [parseResult, handleMetricClick]
  );

  // Handle show impact analysis
  const handleShowImpact = useCallback(
    async (nodeName: string) => {
      if (!parseResult) return;

      setLoading(true);
      try {
        const filtered = await getImpactAnalysis(parseResult, nodeName);
        setParseResult(filtered);
        setViewMode('impact');
      } catch (err) {
        console.error('Failed to get impact analysis:', err);
      } finally {
        setLoading(false);
      }
    },
    [parseResult, setParseResult, setLoading]
  );

  // Handle issue click in audit panel
  const handleIssueClick = useCallback(
    (issue: AuditIssue) => {
      if (issue.node_id && parseResult) {
        const node = parseResult.lineage.nodes.find((n) => n.id === issue.node_id);
        if (node) {
          setSelectedNode(node);
          setSidebarMode('detail');
        }
      }
    },
    [parseResult, setSelectedNode]
  );

  // Reset to full view
  const handleResetView = useCallback(async () => {
    if (!parseResult) return;

    // Re-parse to get full graph
    const config = parseResult.dbt_project
      ? {
          dbt_project_path: parseResult.dbt_project.name,
          semantic_layer_type: 'DbtSemanticLayer' as const,
        }
      : null;

    if (!config) {
      window.location.reload();
      return;
    }

    setLoading(true);
    try {
      const result = await parseProject(config);
      setParseResult(result);
      setViewMode('full');
      setSelectedMetric(undefined);
    } catch (err) {
      console.error('Failed to reset view:', err);
    } finally {
      setLoading(false);
    }
  }, [parseResult, setParseResult, setLoading]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Search: Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search') as HTMLInputElement;
        searchInput?.focus();
      }

      // Escape: Close search/panels
      if (e.key === 'Escape') {
        setShowSearchResults(false);
        if (sidebarMode === 'detail') {
          setSidebarMode('catalog');
          setSelectedNode(null);
        }
      }

      // Cmd/Ctrl + E: Export
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        setShowExportMenu((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarMode, setSelectedNode]);

  // Show project picker if no project loaded
  if (!parseResult) {
    return (
      <div className="h-screen">
        <ProjectPicker onProjectSelected={handleProjectSelected} isLoading={isLoading} />
        {error && (
          <div className="fixed bottom-4 left-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-2xl mx-auto">
            <strong className="font-bold">Error: </strong>
            <span className="whitespace-pre-wrap">{error}</span>
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
          <h1 className="font-semibold text-gray-900">Semantic Lineage Tracer</h1>
          {parseResult.dbt_project && (
            <span className="text-sm text-gray-500">{parseResult.dbt_project.name}</span>
          )}
          {viewMode !== 'full' && (
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
              {viewMode === 'metric' ? `Metric: ${selectedMetric}` : 'Impact Analysis'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <input
              id="global-search"
              type="text"
              placeholder="Search... (⌘K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearchResults(true)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md w-64"
            />
            {showSearchResults && searchQuery && (
              <SearchResults
                parseResult={parseResult}
                query={searchQuery}
                onNodeClick={handleNodeClick}
                onClose={() => {
                  setShowSearchResults(false);
                  setSearchQuery('');
                }}
              />
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-md p-1">
            <button
              onClick={() => {
                handleResetView();
              }}
              className={`px-3 py-1 text-xs rounded ${
                viewMode === 'full'
                  ? 'bg-white shadow text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Full
            </button>
            <button
              onClick={() => setSidebarMode(sidebarMode === 'catalog' ? 'audit' : 'catalog')}
              className="px-3 py-1 text-xs text-gray-600 hover:text-gray-900"
            >
              {sidebarMode === 'catalog' ? 'Audit' : 'Catalog'}
            </button>
          </div>

          {/* Export Menu */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Export
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                <button
                  onClick={() => {
                    exportToPng('lineage-canvas');
                    setShowExportMenu(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50"
                >
                  Export as PNG
                </button>
                <button
                  onClick={() => {
                    exportAuditJson(parseResult);
                    setShowExportMenu(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50"
                >
                  Export Audit (JSON)
                </button>
                <button
                  onClick={() => {
                    exportLineageJson(parseResult);
                    setShowExportMenu(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50"
                >
                  Export Lineage (JSON)
                </button>
                <button
                  onClick={() => {
                    copyAsMermaid(parseResult);
                    setShowExportMenu(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50"
                >
                  Copy as Mermaid
                </button>
              </div>
            )}
          </div>

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
        {/* Metric Catalog Sidebar (left) */}
        {sidebarMode === 'catalog' && parseResult.metrics.length > 0 && (
          <div className="w-80 flex-shrink-0">
            <MetricCatalog
              parseResult={parseResult}
              onMetricClick={handleMetricClick}
              selectedMetric={selectedMetric}
            />
          </div>
        )}

        {/* Lineage canvas */}
        <div id="lineage-canvas" className="flex-1">
          <LineageCanvas
            parseResult={parseResult}
            onNodeClick={handleNodeClick}
          />
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
              <div className="text-center">
                <svg
                  className="animate-spin h-8 w-8 text-blue-600 mx-auto"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-600">Loading...</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar (Audit or Detail) */}
        {(sidebarMode === 'audit' || sidebarMode === 'detail') && (
          <div className="w-80 flex-shrink-0">
            {sidebarMode === 'detail' && selectedNode ? (
              <NodeDetail
                node={selectedNode}
                parseResult={parseResult}
                onClose={() => {
                  setSelectedNode(null);
                  setSidebarMode('catalog');
                }}
                onShowUpstream={handleShowUpstream}
                onShowImpact={handleShowImpact}
              />
            ) : (
              <AuditPanel audit={parseResult.audit} onIssueClick={handleIssueClick} />
            )}
          </div>
        )}
      </div>

      {/* Status bar */}
      <footer className="h-8 border-t border-gray-200 bg-gray-50 flex items-center px-4 text-xs text-gray-500 flex-shrink-0">
        <div className="flex items-center gap-4">
          <span>{parseResult.lineage.nodes.length} nodes</span>
          <span>{parseResult.lineage.edges.length} edges</span>
          <span>{parseResult.metrics.length} metrics</span>
          <span>{parseResult.models.length} models</span>
          <span>{parseResult.sources.length} sources</span>
          {parseResult.warnings.length > 0 && (
            <span className="text-yellow-600">{parseResult.warnings.length} warnings</span>
          )}
        </div>
      </footer>
    </div>
  );
}

export default App;
