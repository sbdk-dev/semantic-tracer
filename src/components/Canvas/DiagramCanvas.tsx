/**
 * DiagramCanvas Component
 *
 * Main React Flow canvas component for legal entity diagrams.
 * Handles rendering, interactions, and state management.
 */

import { useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  NodeTypes,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  OnConnect,
  OnNodesChange,
  OnEdgesChange,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { EntityNode } from './EntityNode';
import { getLayoutedElements } from '../../services/layout';

interface DiagramCanvasProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
}

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

export function DiagramCanvas({
  initialNodes = [],
  initialEdges = [],
  onNodesChange: onNodesChangeProp,
  onEdgesChange: onEdgesChangeProp,
}: DiagramCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Handle node changes and notify parent
  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      if (onNodesChangeProp) {
        // Get updated nodes after change
        setTimeout(() => {
          onNodesChangeProp(nodes);
        }, 0);
      }
    },
    [onNodesChange, onNodesChangeProp, nodes]
  );

  // Handle edge changes and notify parent
  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);
      if (onEdgesChangeProp) {
        setTimeout(() => {
          onEdgesChangeProp(edges);
        }, 0);
      }
    },
    [onEdgesChange, onEdgesChangeProp, edges]
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

  // Apply auto-layout
  const handleAutoLayout = useCallback(() => {
    const layouted = getLayoutedElements(nodes, edges);
    setNodes(layouted.nodes);
    setEdges(layouted.edges);
  }, [nodes, edges, setNodes, setEdges]);

  return (
    <div className="w-full h-full" style={{ height: '600px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
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
    </div>
  );
}
