import React from 'react';

export const EdgePropertyPanel: React.FC = () => {
  return (
    <div className="p-2 bg-white border rounded shadow-sm">
      <div className="text-sm font-semibold">Edge Properties</div>
      <div className="mt-2 text-sm text-gray-600">Select an edge to edit ownership percentages.</div>
    </div>
  );
};

export default EdgePropertyPanel;
