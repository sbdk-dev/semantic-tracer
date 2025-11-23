import React from 'react';

export const ToolPanel: React.FC = () => {
  return (
    <div className="p-2 bg-white border rounded shadow-sm">
      <button className="px-3 py-1 mr-2 text-sm font-medium text-white bg-blue-600 rounded">Add Entity</button>
      <button className="px-3 py-1 mr-2 text-sm font-medium text-gray-700 bg-gray-100 rounded">Auto Layout</button>
      <button className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded">Export</button>
    </div>
  );
};

export default ToolPanel;
