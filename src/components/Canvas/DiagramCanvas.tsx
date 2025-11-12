/**
 * DiagramCanvas Component
 *
 * Main React Flow canvas component for legal entity diagrams.
 * Handles rendering, interactions, and state management with Zustand.
 */

import { useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  NodeTypes,
  addEdge,
  Connection,
  OnConnect,
  OnNodesChange,
  OnEdgesChange,
  Panel,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { EntityNode } from './EntityNode';
import { ToolPanel } from './ToolPanel';
import { SaveIndicator } from './SaveIndicator';
import { getLayoutedElements } from '../../services/layout';
import { useDiagramState, EntityType } from '../../hooks/useDiagramState';
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

export function DiagramCanvas() {
  // Zustand state
  const nodes = useDiagramState((state) => state.nodes);
  const edges = useDiagramState((state) => state.edges);
  const setNodes = useDiagramState((state) => state.setNodes);
  const setEdges = useDiagramState((state) => state.setEdges);
  const addNode = useDiagramState((state) => state.addNode);

  // Auto-save hook
  const autoSaveStatus = useAutoSave({
    interval: 30000, // 30 seconds
    debounceDelay: 2000, // 2 seconds
    enabled: true,
  });

  // React Flow instance for viewport calculations
  const { project } = useReactFlow();

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
        label: '100%',
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
  }, [nodes, edges, setNodes, setEdges]);

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
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
        >
          <Background />
          <Controls />
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
    </div>
  );
}
