/**
 * OwnershipEdge Component
 *
 * Custom React Flow edge with editable ownership percentage labels.
 * Allows inline editing of ownership percentages by double-clicking.
 */

import { memo, useState, useCallback } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from 'reactflow';
import { useDiagramState } from '../../hooks/useDiagramState';

export interface OwnershipEdgeData {
  ownershipType?: 'voting' | 'economic' | 'both';
  votingPercentage?: number;
  economicPercentage?: number;
}

export const OwnershipEdge = memo(
  ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    label,
    selected,
  }: EdgeProps<OwnershipEdgeData>) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(label?.toString() || '100%');
    const updateEdge = useDiagramState((state) => state.updateEdge);

    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });

    const handleDoubleClick = useCallback(() => {
      setIsEditing(true);
    }, []);

    const handleSave = useCallback(() => {
      setIsEditing(false);
      // Update edge label
      if (updateEdge) {
        updateEdge(id, { label: editValue });
      }
    }, [id, editValue, updateEdge]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
          handleSave();
        } else if (e.key === 'Escape') {
          setEditValue(label?.toString() || '100%');
          setIsEditing(false);
        }
      },
      [label, handleSave]
    );

    return (
      <>
        {/* Invisible wider path for easier clicking */}
        <path
          d={edgePath}
          fill="none"
          stroke="transparent"
          strokeWidth={20}
          className="react-flow__edge-interaction"
        />

        {/* Visible edge path */}
        <BaseEdge
          id={id}
          path={edgePath}
          style={{
            strokeWidth: selected ? 3 : 2,
            stroke: selected ? '#2563eb' : '#b1b1b7',
          }}
        />
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            {isEditing ? (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                autoFocus
                className="w-20 px-2 py-1 text-sm font-semibold text-center bg-white border-2 border-blue-500 rounded shadow-lg focus:outline-none"
              />
            ) : (
              <div
                onDoubleClick={handleDoubleClick}
                className="px-3 py-1 text-sm font-semibold bg-white border border-gray-300 rounded shadow cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors"
                title="Double-click to edit ownership percentage"
              >
                {label || '100%'}
              </div>
            )}
          </div>
        </EdgeLabelRenderer>
      </>
    );
  }
);

OwnershipEdge.displayName = 'OwnershipEdge';
