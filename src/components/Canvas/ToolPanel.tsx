/**
 * Tool Panel Component
 *
 * Entity palette for adding legal entities to the diagram.
 * Displays 8 entity types with click-to-add functionality.
 */

import { EntityType } from '../../hooks/useDiagramState';

interface ToolPanelProps {
  onAddNode: (type: EntityType) => void;
}

interface EntityTool {
  type: EntityType;
  label: string;
  description: string;
  color: string;
  borderStyle: string;
}

const ENTITY_TOOLS: EntityTool[] = [
  {
    type: 'corporation',
    label: 'Corporation',
    description: 'C-Corp or S-Corp entity',
    color: 'bg-white',
    borderStyle: 'border-2 border-gray-800',
  },
  {
    type: 'llc',
    label: 'LLC',
    description: 'Limited Liability Company',
    color: 'bg-white',
    borderStyle: 'border-2 border-blue-600 rounded-lg',
  },
  {
    type: 'partnership',
    label: 'Partnership',
    description: 'General or Limited Partnership',
    color: 'bg-white',
    borderStyle: 'border-2 border-green-600',
  },
  {
    type: 'individual',
    label: 'Individual',
    description: 'Natural person shareholder',
    color: 'bg-white',
    borderStyle: 'border-2 border-purple-600 rounded-full',
  },
  {
    type: 'trust',
    label: 'Trust',
    description: 'Family trust or estate',
    color: 'bg-white',
    borderStyle: 'border-2 border-orange-600',
  },
  {
    type: 'disregarded',
    label: 'Disregarded',
    description: 'Single-member LLC',
    color: 'bg-white',
    borderStyle: 'border-2 border-dashed border-gray-600',
  },
  {
    type: 'foreign',
    label: 'Foreign',
    description: 'Non-US entity',
    color: 'bg-blue-50',
    borderStyle: 'border-2 border-blue-800',
  },
  {
    type: 'asset',
    label: 'Asset',
    description: 'Real estate, IP, equipment',
    color: 'bg-white',
    borderStyle: 'border-2 border-teal-600',
  },
];

export function ToolPanel({ onAddNode }: ToolPanelProps) {
  const handleDragStart = (event: React.DragEvent, type: EntityType) => {
    event.dataTransfer.setData('application/reactflow/type', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto"
      data-testid="tool-panel"
    >
      <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
        Entity Palette
      </h3>

      <div className="space-y-2">
        {ENTITY_TOOLS.map((tool) => (
          <div
            key={tool.type}
            draggable
            onDragStart={(e) => handleDragStart(e, tool.type)}
            onClick={() => onAddNode(tool.type)}
            data-testid={`add-entity-${tool.type}`}
            className="w-full group cursor-grab active:cursor-grabbing"
            title={`${tool.description} (drag or click to add)`}
          >
            <div className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-50 transition-colors">
              {/* Preview box */}
              <div
                className={`w-12 h-12 flex-shrink-0 ${tool.color} ${tool.borderStyle} shadow-sm group-hover:shadow-md transition-shadow flex items-center justify-center`}
              >
                <span className="text-xs font-medium text-gray-600">
                  {tool.type === 'corporation' && 'Corp'}
                  {tool.type === 'llc' && 'LLC'}
                  {tool.type === 'partnership' && 'Part'}
                  {tool.type === 'individual' && '👤'}
                  {tool.type === 'trust' && 'Trust'}
                  {tool.type === 'disregarded' && 'Dis'}
                  {tool.type === 'foreign' && 'For'}
                  {tool.type === 'asset' && 'Asset'}
                </span>
              </div>

              {/* Label and description */}
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {tool.label}
                </div>
                <div className="text-xs text-gray-500">{tool.description}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Help text */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 leading-relaxed">
          <strong>Drag</strong> any entity onto the canvas, or <strong>click</strong> to add at center. Double-click nodes to edit names.
        </p>
      </div>
    </div>
  );
}
