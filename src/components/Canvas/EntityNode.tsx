/**
 * EntityNode Component
 *
 * Custom React Flow node for legal entities.
 * Supports 8 entity types with proper styling and inline editing.
 */

import { memo, useState, useCallback, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { useDiagramState } from '../../hooks/useDiagramState';

export interface EntityNodeData {
  label: string;
  jurisdiction?: string;
  taxStatus?: 'us' | 'foreign' | 'passthrough';
  notes?: string;
}

export const EntityNode = memo(({ data, id, type }: NodeProps<EntityNodeData>) => {
  const updateNode = useDiagramState((state) => state.updateNode);

  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);

  // Update local state when data changes
  useEffect(() => {
    setLabel(data.label);
  }, [data.label]);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleSave = useCallback(() => {
    setIsEditing(false);
    if (label.trim() !== data.label) {
      updateNode(id, { label: label.trim() });
    }
  }, [id, label, data.label, updateNode]);

  const handleBlur = useCallback(() => {
    handleSave();
  }, [handleSave]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleSave();
      } else if (e.key === 'Escape') {
        setLabel(data.label);
        setIsEditing(false);
      }
    },
    [handleSave, data.label]
  );

  // Get entity-specific styling
  const getNodeClassName = () => {
    const baseClasses = 'px-4 py-3 shadow-md border-2 bg-white min-w-[200px]';

    switch (type) {
      case 'corporation':
        return `${baseClasses} rounded-sm border-gray-800`;

      case 'llc':
        return `${baseClasses} rounded-lg border-blue-600`;

      case 'partnership':
        return `${baseClasses} border-green-600`;

      case 'individual':
        return `${baseClasses} rounded-full border-purple-600`;

      case 'trust':
        return `${baseClasses} border-orange-600`;

      case 'disregarded':
        return `${baseClasses} rounded-sm border-dashed border-gray-600`;

      case 'foreign':
        return `${baseClasses} rounded-sm border-blue-800 bg-blue-50`;

      case 'asset':
        return `${baseClasses} border-teal-600`;

      default:
        return `${baseClasses} rounded-sm border-gray-600`;
    }
  };

  const getEntityTypeLabel = () => {
    switch (type) {
      case 'corporation':
        return 'Corporation';
      case 'llc':
        return 'LLC';
      case 'partnership':
        return 'Partnership';
      case 'individual':
        return 'Individual';
      case 'trust':
        return 'Trust';
      case 'disregarded':
        return 'Disregarded Entity';
      case 'foreign':
        return 'Foreign Entity';
      case 'asset':
        return 'Asset';
      default:
        return 'Entity';
    }
  };

  return (
    <div className={getNodeClassName()} data-node-id={id}>
      {/* Connection handles on all sides */}
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="source" position={Position.Top} id="top-source" />

      <Handle type="target" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" />

      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Left} id="left-source" />

      <Handle type="target" position={Position.Right} id="right" />
      <Handle type="source" position={Position.Right} id="right-source" />

      <div className="text-xs text-gray-500 mb-1">{getEntityTypeLabel()}</div>

      {isEditing ? (
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <div
          onDoubleClick={handleDoubleClick}
          className="font-semibold text-gray-900 cursor-text"
        >
          {label}
        </div>
      )}

      {data.jurisdiction && (
        <div className="text-xs text-gray-600 mt-1">{data.jurisdiction}</div>
      )}

      {data.notes && (
        <div className="text-xs text-gray-500 mt-1 italic">{data.notes}</div>
      )}
    </div>
  );
});

EntityNode.displayName = 'EntityNode';
