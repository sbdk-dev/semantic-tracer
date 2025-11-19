/**
 * Detail panel for selected lineage node
 */

import type { LineageNode } from '../../types/semantic';

interface NodeDetailProps {
  node: LineageNode;
  onClose: () => void;
}

export function NodeDetail({ node, onClose }: NodeDetailProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Metric':
        return 'bg-purple-100 text-purple-800';
      case 'Measure':
        return 'bg-blue-100 text-blue-800';
      case 'Model':
        return 'bg-emerald-100 text-emerald-800';
      case 'Source':
        return 'bg-amber-100 text-amber-800';
      case 'Entity':
        return 'bg-indigo-100 text-indigo-800';
      case 'Dimension':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-white border-l border-gray-200">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Node Details</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-4">
        {/* Type Badge */}
        <div className="mb-4">
          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getTypeColor(node.node_type)}`}>
            {node.node_type}
          </span>
        </div>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
            Name
          </label>
          <div className="text-lg font-semibold text-gray-900">{node.name}</div>
        </div>

        {/* Description */}
        {node.description && (
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
              Description
            </label>
            <div className="text-sm text-gray-700">{node.description}</div>
          </div>
        )}

        {/* Metadata */}
        {Object.keys(node.metadata).length > 0 && (
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 uppercase mb-2">
              Properties
            </label>
            <div className="space-y-2">
              {Object.entries(node.metadata).map(([key, value]) => (
                <div key={key} className="bg-gray-50 p-2 rounded">
                  <div className="text-xs text-gray-500">{key}</div>
                  <div className="text-sm text-gray-900 font-mono">
                    {typeof value === 'object'
                      ? JSON.stringify(value, null, 2)
                      : String(value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 space-y-2">
          <button className="w-full px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100">
            View Upstream Lineage
          </button>
          <button className="w-full px-3 py-2 text-sm bg-amber-50 text-amber-700 rounded hover:bg-amber-100">
            Impact Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
