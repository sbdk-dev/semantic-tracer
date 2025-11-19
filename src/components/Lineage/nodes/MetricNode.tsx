/**
 * Custom React Flow node for Metric entities
 */

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import type { LineageNodeData } from '../../../types/semantic';

export const MetricNode = memo(({ data, selected }: NodeProps<LineageNodeData>) => {
  return (
    <div
      className={`
        px-4 py-3 rounded-lg shadow-md border-2 min-w-[160px]
        bg-purple-50 border-purple-400
        ${selected ? 'ring-2 ring-purple-600 ring-offset-2' : ''}
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-purple-500"
      />

      <div className="flex items-center gap-2 mb-1">
        <span className="text-purple-600 text-lg">📊</span>
        <span className="text-xs font-semibold text-purple-600 uppercase">
          Metric
        </span>
      </div>

      <div className="font-medium text-gray-900 text-sm">{data.label}</div>

      {data.description && (
        <div className="text-xs text-gray-500 mt-1 truncate max-w-[200px]">
          {data.description}
        </div>
      )}

      {data.metadata?.metric_type && (
        <div className="text-xs text-purple-600 mt-1">
          {String(data.metadata.metric_type)}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-purple-500"
      />
    </div>
  );
});

MetricNode.displayName = 'MetricNode';
