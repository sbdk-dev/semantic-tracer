import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import { useEffect } from 'react';

import { DiagramCanvas } from './components/Canvas/DiagramCanvas';
import { initializePostHog } from './hooks/usePostHog';

function App() {
  useEffect(() => {
    // Initialize PostHog on app load
    initializePostHog();
  }, []);

  return (
    <ReactFlowProvider>
      <div className="w-full h-screen flex flex-col">
        <header className="bg-white border-b px-6 py-4 flex-shrink-0">
          <h1 className="text-2xl font-bold">LawDraw</h1>
          <p className="text-sm text-gray-600">Legal Entity Diagrams - Performance Testing Build</p>
        </header>
        <main className="flex-1 bg-gray-50 overflow-hidden">
          <DiagramCanvas />
        </main>
      </div>
    </ReactFlowProvider>
  );
}

export default App;
