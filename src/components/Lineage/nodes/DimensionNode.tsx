/**
 * Custom React Flow node for Dimension entities
 */

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import type { LineageNodeData } from '../../../types/semantic';

export const DimensionNode = memo(({ data, selected }: NodeProps<LineageNodeData>) => {
  return (
    <div
      className={`
        px-4 py-3 rounded-lg shadow-md border-2 min-w-[160px]
        bg-pink-50 border-pink-400
        ${selected ? 'ring-2 ring-pink-600 ring-offset-2' : ''}
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-pink-500"
      />

      <div className="flex items-center gap-2 mb-1">
        <span className="text-pink-600 text-lg">📋</span>
        <span className="text-xs font-semibold text-pink-600 uppercase">
          Dimension
        </span>
      </div>

      <div className="font-medium text-gray-900 text-sm">{data.label}</div>

      {data.metadata?.dimension_type && (
        <div className="text-xs text-pink-600 mt-1">
          {String(data.metadata.dimension_type)}
        </div>
      )}

      {data.description && (
        <div className="text-xs text-gray-500 mt-1 truncate max-w-[200px]">
          {data.description}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-pink-500"
      />
    </div>
  );
});

DimensionNode.displayName = 'DimensionNode';
