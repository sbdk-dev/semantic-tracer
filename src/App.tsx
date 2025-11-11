import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';

function App() {
  return (
    <ReactFlowProvider>
      <div className="w-full h-full flex flex-col">
        <header className="bg-white border-b px-6 py-4">
          <h1 className="text-2xl font-bold">LawDraw</h1>
          <p className="text-sm text-gray-600">Legal Entity Diagrams</p>
        </header>
        <main className="flex-1 bg-gray-50">
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            Canvas will be rendered here
          </div>
        </main>
      </div>
    </ReactFlowProvider>
  );
}

export default App;
