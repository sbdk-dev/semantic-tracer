/**
 * Edge Property Panel Component
 *
 * Side panel for editing selected edge properties.
 * Shows when an edge is selected and allows styling customization.
 */

import { useEffect, useState } from 'react';
import { Edge } from 'reactflow';
import { useDiagramState } from '../../hooks/useDiagramState';

interface EdgePropertyPanelProps {
  selectedEdge: Edge | null;
  onClose: () => void;
}

export function EdgePropertyPanel({ selectedEdge, onClose }: EdgePropertyPanelProps) {
  const updateEdge = useDiagramState((state) => state.updateEdge);
  const setEdges = useDiagramState((state) => state.setEdges);

  const [label, setLabel] = useState('');
  const [edgeType, setEdgeType] = useState<'default' | 'straight' | 'step' | 'smoothstep'>('default');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [strokeColor, setStrokeColor] = useState('#b1b1b7');
  const [lineStyle, setLineStyle] = useState<'solid' | 'dashed' | 'dotted'>('solid');
  const [animated, setAnimated] = useState(false);

  // Load data when selectedEdge changes
  useEffect(() => {
    if (selectedEdge) {
      setLabel((selectedEdge.label as string) || '100%');
      setEdgeType((selectedEdge.type as any) || 'default');
      setStrokeWidth(selectedEdge.style?.strokeWidth as number || 2);
      setStrokeColor(selectedEdge.style?.stroke as string || '#b1b1b7');

      // Detect line style from strokeDasharray
      const dasharray = selectedEdge.style?.strokeDasharray as string;
      if (dasharray === '5,5') setLineStyle('dashed');
      else if (dasharray === '2,2') setLineStyle('dotted');
      else setLineStyle('solid');

      setAnimated(selectedEdge.animated || false);
    }
  }, [selectedEdge]);

  // Live preview - update edge on canvas as user edits
  useEffect(() => {
    if (!selectedEdge) return;

    // Map line style to strokeDasharray
    let strokeDasharray: string | undefined;
    if (lineStyle === 'dashed') strokeDasharray = '5,5';
    else if (lineStyle === 'dotted') strokeDasharray = '2,2';
    else strokeDasharray = undefined;

    // Update edge in real-time for live preview
    updateEdge(selectedEdge.id, {
      label,
      type: edgeType,
      style: {
        strokeWidth,
        stroke: strokeColor,
        strokeDasharray,
      },
      animated,
    });
  }, [label, edgeType, strokeWidth, strokeColor, lineStyle, animated, selectedEdge, updateEdge]);

  if (!selectedEdge) {
    return null;
  }

  const handleClose = () => {
    // Changes are already applied via live preview useEffect
    // Just close the panel
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Delete this connection?')) {
      setEdges((eds) => eds.filter((e) => e.id !== selectedEdge.id));
      onClose();
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Edit Connection</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
          title="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Label (Ownership %) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ownership %
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 100%, 51%, 25%"
          />
        </div>

        {/* Edge Type (Routing) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Line Routing
          </label>
          <select
            value={edgeType}
            onChange={(e) => setEdgeType(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="default">Curved (Bezier)</option>
            <option value="straight">Straight</option>
            <option value="smoothstep">Orthogonal (90° angles)</option>
            <option value="step">Step</option>
          </select>
        </div>

        {/* Line Style */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Line Style
          </label>
          <select
            value={lineStyle}
            onChange={(e) => setLineStyle(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Use dashed for uncertain relationships, dotted for indirect ownership
          </p>
        </div>

        {/* Line Thickness */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Line Thickness
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="6"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm text-gray-600 w-8">{strokeWidth}px</span>
          </div>
        </div>

        {/* Line Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Line Color
          </label>
          <input
            type="color"
            value={strokeColor}
            onChange={(e) => setStrokeColor(e.target.value)}
            className="w-full h-10 border border-gray-300 rounded cursor-pointer"
          />
        </div>

        {/* Animated */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="animated"
            checked={animated}
            onChange={(e) => setAnimated(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="animated" className="text-sm text-gray-700">
            Animated (emphasis)
          </label>
        </div>
      </div>

      {/* Preview */}
      <div className="mt-6 p-4 bg-gray-50 rounded border border-gray-200">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          Preview
        </div>
        <svg width="100%" height="40">
          <line
            x1="0"
            y1="20"
            x2="100%"
            y2="20"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={
              lineStyle === 'dashed' ? '5,5' :
              lineStyle === 'dotted' ? '2,2' :
              undefined
            }
            className={animated ? 'animate-pulse' : ''}
          />
        </svg>
      </div>

      {/* Actions */}
      <div className="mt-6 space-y-2">
        <button
          onClick={handleClose}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
        >
          Done
        </button>
        <button
          onClick={handleDelete}
          className="w-full bg-red-50 text-red-600 px-4 py-2 rounded-md hover:bg-red-100 font-medium border border-red-200"
        >
          Delete Connection
        </button>
      </div>

      {/* Help Text */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 leading-relaxed">
          <strong>Tip:</strong> Double-click the ownership percentage on the canvas to quickly edit it inline.
        </p>
      </div>
    </div>
  );
}
