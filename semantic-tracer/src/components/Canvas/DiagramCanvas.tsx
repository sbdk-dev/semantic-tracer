/**
 * DiagramCanvas Component (archived LawDraw copy)
 */

import { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  NodeTypes,
  EdgeTypes,
  addEdge,
  Connection,
  OnConnect,
  OnNodesChange,
  OnEdgesChange,
  Panel,
  Node,
  Edge,
  useReactFlow,
  SelectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './DiagramCanvas.css';

import { EntityNode } from './EntityNode';
import { OwnershipEdge } from './OwnershipEdge';
import { ToolPanel } from './ToolPanel';
import { PropertyPanel } from './PropertyPanel';
import { EdgePropertyPanel } from './EdgePropertyPanel';
import { SaveIndicator } from './SaveIndicator';
import { getLayoutedElements } from '../../../src/services/layout';
import { useDiagramState, EntityType, EntityNodeData } from '../../hooks/useDiagramState';
import { useAutoSave } from '../../hooks/useAutoSave';
import { useUndoRedo } from '../../hooks/useUndoRedo';
import { useCopyPaste } from '../../hooks/useCopyPaste';
import { useAlignment } from '../../hooks/useAlignment';

const nodeTypes: NodeTypes = {
  corporation: EntityNode,
  llc: EntityNode,
  partnership: EntityNode,
  individual: EntityNode,
  trust: EntityNode,
  disregarded: EntityNode,
  foreign: EntityNode,
  asset: EntityNode,
};

const edgeTypes: EdgeTypes = {
  ownership: OwnershipEdge,
};

export function DiagramCanvas() {
  const nodes = useDiagramState((state) => state.nodes);
  const edges = useDiagramState((state) => state.edges);
  const setNodes = useDiagramState((state) => state.setNodes);
  const setEdges = useDiagramState((state) => state.setEdges);
  const addNode = useDiagramState((state) => state.addNode);

  const [selectedNode, setSelectedNode] = useState<Node<EntityNodeData> | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);

  const autoSaveStatus = useAutoSave({ interval: 30000, debounceDelay: 2000, enabled: true });
  const { undo, redo, canUndo, canRedo } = useUndoRedo();
  const { copy, paste, duplicate, cut } = useCopyPaste();
  const { align, hasSelection } = useAlignment();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
      }
      if ((event.ctrlKey || event.metaKey) && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
        event.preventDefault();
        redo();
      }
      if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
        event.preventDefault();
        copy();
      }
      if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
        event.preventDefault();
        paste();
      }
      if ((event.ctrlKey || event.metaKey) && event.key === 'x') {
        event.preventDefault();
        cut();
      }
      if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
        event.preventDefault();
        duplicate();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, copy, paste, cut, duplicate]);

  const { project, screenToFlowPosition, fitView } = useReactFlow();

  const onNodesChange: OnNodesChange = useCallback((changes) => {
    setNodes((nds) => {
      const updated = changes.reduce((acc, change) => {
        if (change.type === 'position' && change.position) {
          return acc.map((n) => (n.id === change.id ? { ...n, position: change.position! } : n));
        }
        if (change.type === 'remove') {
          return acc.filter((n) => n.id !== change.id);
        }
        return acc;
      }, nds);
      return updated;
    });
  }, [setNodes]);

  const onEdgesChange: OnEdgesChange = useCallback((changes) => {
    setEdges((eds) => {
      const updated = changes.reduce((acc, change) => {
        if (change.type === 'remove') return acc.filter((e) => e.id !== change.id);
        return acc;
      }, eds);
      return updated;
    });
  }, [setEdges]);

  const isValidConnection = useCallback((connection: Connection) => {
    if (connection.source === connection.target) return false;

    const isDuplicate = edges.some((edge) =>
      edge.source === connection.source && edge.target === connection.target &&
      edge.sourceHandle === connection.sourceHandle && edge.targetHandle === connection.targetHandle
    );

    return !isDuplicate;
  }, [edges]);

  const onConnect: OnConnect = useCallback((connection: Connection) => {
    if (!isValidConnection(connection)) return;

    const newEdge = {
      ...connection,
      id: `edge-${connection.source}-${connection.target}`,
      type: 'ownership',
      label: '100%',
      markerEnd: undefined,
      data: { ownershipType: 'both', votingPercentage: 100, economicPercentage: 100 },
    };
    setEdges((eds) => addEdge(newEdge as any, eds));
  }, [setEdges, isValidConnection]);

  const handleAddNode = useCallback((type: EntityType) => {
    const viewportCenter = { x: window.innerWidth / 2 - 320, y: window.innerHeight / 2 };
    const position = project(viewportCenter);
    addNode(type, position);
  }, [addNode, project]);

  const handleAutoLayout = useCallback(() => {
    const layouted = getLayoutedElements(nodes, edges);
    setNodes(layouted.nodes);
    setEdges(layouted.edges);
    setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 0);
  }, [nodes, edges, setNodes, setEdges, fitView]);

  const onDragOver = useCallback((event: React.DragEvent) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow/type') as EntityType;
    if (!type) return;
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    addNode(type, position);
  }, [screenToFlowPosition, addNode]);

  const [selectionInfo, setSelectionInfo] = useState({ nodeCount: 0, edgeCount: 0 });

  const onSelectionChange = useCallback((params: { nodes: Node[]; edges: Edge[] }) => {
    setSelectionInfo({ nodeCount: params.nodes.length, edgeCount: params.edges.length });
    if (params.nodes.length === 1 && params.nodes[0]) { setSelectedNode(params.nodes[0] as Node<EntityNodeData>); setSelectedEdge(null); }
    else if (params.edges.length === 1 && params.edges[0]) { setSelectedEdge(params.edges[0]); setSelectedNode(null); }
    else { setSelectedNode(null); setSelectedEdge(null); }
  }, []);

  return (
    <div className="flex h-full w-full">
      <ToolPanel onAddNode={handleAddNode} />
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          isValidConnection={isValidConnection}
          onSelectionChange={onSelectionChange}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={{ type: 'ownership', markerEnd: undefined }}
          selectionOnDrag={true}
          selectionMode={SelectionMode.Partial}
          selectionKeyCode="Shift"
          multiSelectionKeyCode="Shift"
          panOnDrag={[1,2] as any}
          selectNodesOnDrag={false}
          deleteKeyCode={["Backspace","Delete"]}
          fitView
          attributionPosition="bottom-left"
        >
          <Background />
          <Controls showInteractive={false} />
          <MiniMap />
          {(selectionInfo.nodeCount > 0 || selectionInfo.edgeCount > 0) && (
            <Panel position="top-center">
              <div className="bg-blue-50 border border-blue-300 rounded-md px-4 py-2 shadow-lg">
                <div className="text-sm font-medium text-blue-900">
                  {selectionInfo.nodeCount > 0 && (<span>{selectionInfo.nodeCount} node{selectionInfo.nodeCount > 1 ? 's' : ''} selected</span>)}
                  {selectionInfo.nodeCount > 0 && selectionInfo.edgeCount > 0 && <span> • </span>}
                  {selectionInfo.edgeCount > 0 && (<span>{selectionInfo.edgeCount} edge{selectionInfo.edgeCount > 1 ? 's' : ''} selected</span>)}
                </div>
                <div className="text-xs text-blue-700 mt-1">
                  {selectionInfo.nodeCount >= 2 ? (<span>Use alignment tools (left) • Ctrl+C to copy • Ctrl+D to duplicate</span>) : (<span>Shift+click for multi-select • Drag to box select • Double-click to edit</span>)}
                </div>
              </div>
            </Panel>
          )}

          <Panel position="top-left">{/* Alignment Tools omitted for brevity in archived copy */}
            <div className="bg-white rounded-md shadow-lg border border-gray-300 p-2">
              <div className="text-xs font-medium text-gray-600 mb-2">Align</div>
              <div className="flex gap-1 mb-2">
                <button onClick={() => align('left')} disabled={!hasSelection} className="p-2 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed" title="Align Left">L</button>
                <button onClick={() => align('center-horizontal')} disabled={!hasSelection} className="p-2 hover:bg-gray-100 rounded" title="Center Horizontally">CH</button>
                <button onClick={() => align('right')} disabled={!hasSelection} className="p-2 hover:bg-gray-100 rounded" title="Align Right">R</button>
              </div>
            </div>
          </Panel>

          <Panel position="top-right">
            <div className="flex gap-2">
              <button onClick={() => undo()} disabled={!canUndo} data-testid="undo-button" className="bg-white text-gray-700 px-3 py-2 rounded-md">↶ Undo</button>
              <button onClick={() => redo()} disabled={!canRedo} data-testid="redo-button" className="bg-white text-gray-700 px-3 py-2 rounded-md">↷ Redo</button>
              <button onClick={handleAutoLayout} data-testid="auto-layout-button" className="bg-blue-600 text-white px-4 py-2 rounded-md">Auto Layout</button>
            </div>
          </Panel>
        </ReactFlow>

        <SaveIndicator status={autoSaveStatus} />
      </div>

      {selectedNode && (<PropertyPanel selectedNode={selectedNode} onClose={() => setSelectedNode(null)} />)}
      {selectedEdge && (<EdgePropertyPanel selectedEdge={selectedEdge} onClose={() => setSelectedEdge(null)} />)}
    </div>
  );
}
