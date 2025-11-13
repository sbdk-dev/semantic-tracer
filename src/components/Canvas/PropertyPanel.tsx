/**
 * Property Panel Component
 *
 * Side panel for editing selected entity properties.
 * Shows when a node is selected and allows editing all fields.
 */

import { useEffect, useState } from 'react';
import { Node } from 'reactflow';
import { useDiagramState, EntityNodeData, EntityType } from '../../hooks/useDiagramState';

interface PropertyPanelProps {
  selectedNode: Node<EntityNodeData> | null;
  onClose: () => void;
}

export function PropertyPanel({ selectedNode, onClose }: PropertyPanelProps) {
  const updateNode = useDiagramState((state) => state.updateNode);
  const deleteNode = useDiagramState((state) => state.deleteNode);
  const setNodes = useDiagramState((state) => state.setNodes);

  const [label, setLabel] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [taxStatus, setTaxStatus] = useState<'us' | 'foreign' | 'passthrough'>('us');
  const [notes, setNotes] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [borderColor, setBorderColor] = useState('#000000');

  // Load data when selectedNode changes
  useEffect(() => {
    if (selectedNode) {
      setLabel(selectedNode.data.label || '');
      setJurisdiction(selectedNode.data.jurisdiction || '');
      setTaxStatus(selectedNode.data.taxStatus || 'us');
      setNotes(selectedNode.data.notes || '');
      setBackgroundColor(selectedNode.data.backgroundColor || '#ffffff');
      setBorderColor(selectedNode.data.borderColor || '#000000');
    }
  }, [selectedNode]);

  if (!selectedNode) {
    return null;
  }

  const handleSave = () => {
    updateNode(selectedNode.id, {
      label,
      jurisdiction,
      taxStatus,
      notes,
      backgroundColor,
      borderColor,
    });
    onClose();
  };

  const handleChangeType = (newType: EntityType) => {
    // Change the node type
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedNode.id
          ? { ...n, type: newType }
          : n
      )
    );
  };

  const handleDelete = () => {
    if (confirm(`Delete ${label}?`)) {
      deleteNode(selectedNode.id);
      onClose();
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Edit Entity</h3>
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

      {/* Entity Type */}
      <div className="mb-6">
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          Entity Type
        </label>
        <select
          value={selectedNode.type || 'corporation'}
          onChange={(e) => handleChangeType(e.target.value as EntityType)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="corporation">Corporation</option>
          <option value="llc">LLC</option>
          <option value="partnership">Partnership</option>
          <option value="individual">Individual</option>
          <option value="trust">Trust</option>
          <option value="disregarded">Disregarded Entity</option>
          <option value="foreign">Foreign Entity</option>
          <option value="asset">Asset</option>
        </select>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Entity Name *
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter entity name"
          />
        </div>

        {/* Jurisdiction */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Jurisdiction
          </label>
          <input
            type="text"
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Delaware, Nevada, Cayman Islands"
          />
        </div>

        {/* Tax Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tax Status
          </label>
          <select
            value={taxStatus}
            onChange={(e) => setTaxStatus(e.target.value as 'us' | 'foreign' | 'passthrough')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="us">US Taxpayer</option>
            <option value="foreign">Foreign Entity</option>
            <option value="passthrough">Pass-through Entity</option>
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Add compliance notes, ownership details, etc."
          />
        </div>

        {/* Colors */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Background Color
            </label>
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="w-full h-10 border border-gray-300 rounded cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Border Color
            </label>
            <input
              type="color"
              value={borderColor}
              onChange={(e) => setBorderColor(e.target.value)}
              className="w-full h-10 border border-gray-300 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 space-y-2">
        <button
          onClick={handleSave}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
        >
          Save Changes
        </button>
        <button
          onClick={onClose}
          className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          className="w-full bg-red-50 text-red-600 px-4 py-2 rounded-md hover:bg-red-100 font-medium border border-red-200"
        >
          Delete Entity
        </button>
      </div>

      {/* Help Text */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 leading-relaxed">
          <strong>Tip:</strong> You can also double-click the entity name on the canvas to quickly edit it inline.
        </p>
      </div>
    </div>
  );
}
