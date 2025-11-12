/**
 * DiagramCanvas Component
 *
 * Main React Flow canvas component for legal entity diagrams.
 * Handles rendering, interactions, and state management with Zustand.
 */

import { useCallback, useState } from 'react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';

import { EntityNode } from './EntityNode';
import { OwnershipEdge } from './OwnershipEdge';
import { ToolPanel } from './ToolPanel';
import { PropertyPanel } from './PropertyPanel';
import { EdgePropertyPanel } from './EdgePropertyPanel';
import { SaveIndicator } from './SaveIndicator';
import { getLayoutedElements } from '../../services/layout';
import { useDiagramState, EntityType, EntityNodeData } from '../../hooks/useDiagramState';
import { useAutoSave } from '../../hooks/useAutoSave';

// Define custom node types
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

// Define custom edge types
const edgeTypes: EdgeTypes = {
  ownership: OwnershipEdge,
};

export function DiagramCanvas() {
  // Zustand state
  const nodes = useDiagramState((state) => state.nodes);
  const edges = useDiagramState((state) => state.edges);
  const setNodes = useDiagramState((state) => state.setNodes);
  const setEdges = useDiagramState((state) => state.setEdges);
  const addNode = useDiagramState((state) => state.addNode);

  // Local state for selected node/edge
  const [selectedNode, setSelectedNode] = useState<Node<EntityNodeData> | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);

  // Auto-save hook
  const autoSaveStatus = useAutoSave({
    interval: 30000, // 30 seconds
    debounceDelay: 2000, // 2 seconds
    enabled: true,
  });

  // React Flow instance for viewport calculations
  const { project, screenToFlowPosition, fitView } = useReactFlow();

  // Handle node changes
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => {
        // Apply React Flow's internal node changes
        const updated = changes.reduce((acc, change) => {
          if (change.type === 'position' && change.position) {
            return acc.map((n) =>
              n.id === change.id ? { ...n, position: change.position! } : n
            );
          }
          if (change.type === 'remove') {
            return acc.filter((n) => n.id !== change.id);
          }
          return acc;
        }, nds);
        return updated;
      });
    },
    [setNodes]
  );

  // Handle edge changes
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      setEdges((eds) => {
        const updated = changes.reduce((acc, change) => {
          if (change.type === 'remove') {
            return acc.filter((e) => e.id !== change.id);
          }
          return acc;
        }, eds);
        return updated;
      });
    },
    [setEdges]
  );

  // Handle new connections
  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      const newEdge = {
        ...connection,
        id: `edge-${connection.source}-${connection.target}`,
        type: 'ownership',
        label: '100%',
        markerEnd: undefined, // No arrowheads - vertical position shows hierarchy
        data: {
          ownershipType: 'both',
          votingPercentage: 100,
          economicPercentage: 100,
        },
      };
      setEdges((eds) => addEdge(newEdge as any, eds));
    },
    [setEdges]
  );

  // Handle adding nodes from palette
  const handleAddNode = useCallback(
    (type: EntityType) => {
      // Add node at viewport center
      // Use viewport dimensions to calculate center
      const viewportCenter = {
        x: window.innerWidth / 2 - 320, // Account for tool panel width
        y: window.innerHeight / 2,
      };

      // Convert to flow coordinates
      const position = project(viewportCenter);

      addNode(type, position);
    },
    [addNode, project]
  );

  // Apply auto-layout
  const handleAutoLayout = useCallback(() => {
    const layouted = getLayoutedElements(nodes, edges);
    setNodes(layouted.nodes);
    setEdges(layouted.edges);

    // Center and zoom to fit all nodes after layout
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 400 });
    }, 0);
  }, [nodes, edges, setNodes, setEdges, fitView]);

  // Handle drag over (allow drop)
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow/type') as EntityType;
      if (!type) return;

      // Convert screen coordinates to flow coordinates
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type, position);
    },
    [screenToFlowPosition, addNode]
  );

  // Handle node/edge selection
  const onSelectionChange = useCallback(
    (params: { nodes: Node[]; edges: Edge[] }) => {
      // Prioritize node selection
      if (params.nodes.length === 1 && params.nodes[0]) {
        setSelectedNode(params.nodes[0] as Node<EntityNodeData>);
        setSelectedEdge(null);
      } else if (params.edges.length === 1 && params.edges[0]) {
        setSelectedEdge(params.edges[0]);
        setSelectedNode(null);
      } else {
        setSelectedNode(null);
        setSelectedEdge(null);
      }
    },
    []
  );

  return (
    <div className="flex h-full w-full">
      {/* Entity Palette */}
      <ToolPanel onAddNode={handleAddNode} />

      {/* Main Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onSelectionChange={onSelectionChange}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={{
            type: 'ownership',
            markerEnd: undefined, // No arrowheads - vertical position shows hierarchy
          }}
          // Enable multi-select
          selectionOnDrag={true}
          panOnDrag={[1, 2]} // Pan with middle or right mouse button
          multiSelectionKeyCode="Shift" // Hold Shift to add to selection
          deleteKeyCode={["Backspace", "Delete"]} // Delete selected items
          selectNodesOnDrag={false} // Don't select when dragging single node
          fitView
          attributionPosition="bottom-left"
        >
          <Background />
          <Controls showInteractive={false} />
          <MiniMap />
          <Panel position="top-right">
            <button
              onClick={handleAutoLayout}
              data-testid="auto-layout-button"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 shadow-lg"
            >
              Auto Layout
            </button>
          </Panel>
        </ReactFlow>

        {/* Save Status Indicator */}
        <SaveIndicator status={autoSaveStatus} />
      </div>

      {/* Property Panels */}
      {selectedNode && (
        <PropertyPanel
          selectedNode={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      )}
      {selectedEdge && (
        <EdgePropertyPanel
          selectedEdge={selectedEdge}
          onClose={() => setSelectedEdge(null)}
        />
      )}
    </div>
  );
}
