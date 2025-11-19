/**
 * Custom React Flow node for dbt Model entities
 */

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import type { LineageNodeData } from '../../../types/semantic';

const toStr = (val: unknown): string => String(val || '');

export const ModelNode = memo(({ data, selected }: NodeProps<LineageNodeData>) => {
  return (
    <div
      className={`
        px-4 py-3 rounded-lg shadow-md border-2 min-w-[160px]
        bg-emerald-50 border-emerald-400
        ${selected ? 'ring-2 ring-emerald-600 ring-offset-2' : ''}
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-emerald-500"
      />

      <div className="flex items-center gap-2 mb-1">
        <span className="text-emerald-600 text-lg">🔷</span>
        <span className="text-xs font-semibold text-emerald-600 uppercase">
          Model
        </span>
      </div>

      <div className="font-medium text-gray-900 text-sm">{data.label}</div>

      {data.metadata?.materialization ? (
        <div className="text-xs text-emerald-600 mt-1">
          {toStr(data.metadata.materialization)}
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
        className="w-3 h-3 bg-emerald-500"
      />
    </div>
  );
});

ModelNode.displayName = 'ModelNode';
