/**
 * Metric catalog - searchable list of all metrics with grouping
 */

import { useState, useMemo } from 'react';
import type { Metric, ParseResult } from '../../types/semantic';

interface MetricCatalogProps {
  parseResult: ParseResult;
  onMetricClick: (metricName: string) => void;
  selectedMetric?: string;
}

export function MetricCatalog({
  parseResult,
  onMetricClick,
  selectedMetric,
}: MetricCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState<'type' | 'none'>('type');

  // Filter metrics by search query
  const filteredMetrics = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return parseResult.metrics.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.description?.toLowerCase().includes(query) ||
        m.label?.toLowerCase().includes(query)
    );
  }, [parseResult.metrics, searchQuery]);

  // Group metrics by type
  const groupedMetrics = useMemo(() => {
    if (groupBy === 'none') {
      return { All: filteredMetrics };
    }

    const groups: Record<string, Metric[]> = {};
    filteredMetrics.forEach((metric) => {
      const type = metric.metric_type || 'unknown';
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(metric);
    });
    return groups;
  }, [filteredMetrics, groupBy]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'simple':
        return 'bg-blue-100 text-blue-800';
      case 'derived':
        return 'bg-purple-100 text-purple-800';
      case 'cumulative':
        return 'bg-green-100 text-green-800';
      case 'conversion':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Metric Catalog
        </h2>

        {/* Search */}
        <input
          type="text"
          placeholder="Search metrics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md mb-2"
        />

        {/* Group By */}
        <select
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value as 'type' | 'none')}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
        >
          <option value="type">Group by Type</option>
          <option value="none">No Grouping</option>
        </select>

        {/* Count */}
        <div className="mt-2 text-xs text-gray-500">
          {filteredMetrics.length} of {parseResult.metrics.length} metrics
        </div>
      </div>

      {/* Metrics List */}
      <div className="flex-1 overflow-y-auto">
        {Object.entries(groupedMetrics).map(([group, metrics]) => (
          <div key={group}>
            {groupBy !== 'none' && (
              <div className="sticky top-0 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-700 uppercase border-b border-gray-200">
                {group} ({metrics.length})
              </div>
            )}

            <div className="divide-y divide-gray-100">
              {metrics.map((metric) => (
                <button
                  key={metric.name}
                  onClick={() => onMetricClick(metric.name)}
                  className={`
                    w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors
                    ${selectedMetric === metric.name ? 'bg-blue-50 border-l-4 border-blue-600' : ''}
                  `}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 truncate">
                        {metric.label || metric.name}
                      </div>
                      {metric.label && metric.name !== metric.label && (
                        <div className="text-xs text-gray-500 font-mono truncate">
                          {metric.name}
                        </div>
                      )}
                      {metric.description && (
                        <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {metric.description}
                        </div>
                      )}
                    </div>

                    <span
                      className={`
                        inline-block px-2 py-0.5 rounded text-xs font-medium shrink-0
                        ${getTypeColor(metric.metric_type)}
                      `}
                    >
                      {metric.metric_type}
                    </span>
                  </div>

                  {/* Measure info */}
                  {metric.type_params.measure && (
                    <div className="mt-1 text-xs text-blue-600">
                      → {metric.type_params.measure.name}
                    </div>
                  )}

                  {/* Derived metrics */}
                  {metric.type_params.metrics && (
                    <div className="mt-1 text-xs text-purple-600">
                      Uses: {metric.type_params.metrics.map((m) => m.name).join(', ')}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}

        {filteredMetrics.length === 0 && (
          <div className="p-8 text-center text-gray-500 text-sm">
            No metrics found
          </div>
        )}
      </div>
    </div>
  );
}
