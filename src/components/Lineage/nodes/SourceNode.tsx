/**
 * Custom React Flow node for Source (database table) entities
 */

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import type { LineageNodeData } from '../../../types/semantic';

const toStr = (val: unknown): string => String(val || '');

export const SourceNode = memo(({ data, selected }: NodeProps<LineageNodeData>) => {
  return (
    <div
      className={`
        px-4 py-3 rounded-lg shadow-md border-2 min-w-[160px]
        bg-amber-50 border-amber-400
        ${selected ? 'ring-2 ring-amber-600 ring-offset-2' : ''}
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-amber-500"
      />

      <div className="flex items-center gap-2 mb-1">
        <span className="text-amber-600 text-lg">🗄️</span>
        <span className="text-xs font-semibold text-amber-600 uppercase">
          Source
        </span>
      </div>

      <div className="font-medium text-gray-900 text-sm">{data.label}</div>

      {data.metadata?.source_name ? (
        <div className="text-xs text-amber-600 mt-1">
          {toStr(data.metadata.source_name)}
        </div>
      ) : null}

      {data.metadata?.schema ? (
        <div className="text-xs text-gray-500">
          {toStr(data.metadata.schema)}
        </div>
      ) : null}

      {data.description && (
        <div className="text-xs text-gray-500 mt-1 truncate max-w-[200px]">
          {data.description}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-amber-500"
      />
    </div>
  );
});

SourceNode.displayName = 'SourceNode';
