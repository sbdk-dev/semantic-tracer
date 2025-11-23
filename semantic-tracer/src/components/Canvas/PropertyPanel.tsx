import React from 'react';

export const PropertyPanel: React.FC = () => {
  return (
    <div className="p-2 bg-white border rounded shadow-sm">
      <div className="text-sm font-semibold">Properties</div>
      <div className="mt-2 text-sm text-gray-600">Select a node to edit properties.</div>
    </div>
  );
};

export default PropertyPanel;
