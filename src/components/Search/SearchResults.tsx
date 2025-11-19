/**
 * Search results panel showing matching nodes
 */

import { useMemo } from 'react';
import type { LineageNode, ParseResult } from '../../types/semantic';

interface SearchResultsProps {
  parseResult: ParseResult;
  query: string;
  onNodeClick: (node: LineageNode) => void;
  onClose: () => void;
}

export function SearchResults({
  parseResult,
  query,
  onNodeClick,
  onClose,
}: SearchResultsProps) {
  const results = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase();
    return parseResult.lineage.nodes.filter(
      (node) =>
        node.name.toLowerCase().includes(q) ||
        node.description?.toLowerCase().includes(q) ||
        Object.values(node.metadata).some((v) =>
          String(v).toLowerCase().includes(q)
        )
    );
  }, [parseResult, query]);

  const getNodeTypeIcon = (type: string) => {
    switch (type) {
      case 'Metric':
        return '📊';
      case 'Measure':
        return '📐';
      case 'Model':
        return '🔷';
      case 'Source':
        return '🗄️';
      case 'Entity':
        return '🔑';
      case 'Dimension':
        return '📋';
      default:
        return '📄';
    }
  };

  const getNodeTypeColor = (type: string) => {
    switch (type) {
      case 'Metric':
        return 'text-purple-600 bg-purple-50';
      case 'Measure':
        return 'text-blue-600 bg-blue-50';
      case 'Model':
        return 'text-emerald-600 bg-emerald-50';
      case 'Source':
        return 'text-amber-600 bg-amber-50';
      case 'Entity':
        return 'text-indigo-600 bg-indigo-50';
      case 'Dimension':
        return 'text-pink-600 bg-pink-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (!query.trim()) {
    return null;
  }

  return (
    <div className="absolute top-14 left-4 right-4 max-w-2xl bg-white rounded-lg shadow-xl border border-gray-200 z-50">
      <div className="p-3 border-b border-gray-200 flex items-center justify-between">
        <div className="text-sm font-medium text-gray-900">
          Search Results ({results.length})
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {results.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No results found for "{query}"
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {results.map((node) => (
              <button
                key={node.id}
                onClick={() => {
                  onNodeClick(node);
                  onClose();
                }}
                className="w-full p-3 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getNodeTypeIcon(node.node_type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{node.name}</span>
                      <span
                        className={`
                          px-2 py-0.5 rounded text-xs font-medium
                          ${getNodeTypeColor(node.node_type)}
                        `}
                      >
                        {node.node_type}
                      </span>
                    </div>
                    {node.description && (
                      <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {node.description}
                      </div>
                    )}
                    {/* Show matching metadata */}
                    {Object.entries(node.metadata).some(([_, v]) =>
                      String(v).toLowerCase().includes(query.toLowerCase())
                    ) && (
                      <div className="text-xs text-gray-500 mt-1">
                        Matches in properties
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-2 border-t border-gray-200 text-xs text-gray-500 text-center">
        Press Enter to select first result • Esc to close
      </div>
    </div>
  );
}
