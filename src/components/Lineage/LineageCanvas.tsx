/**
 * Main lineage visualization canvas using React Flow
 */

import { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { MetricNode } from './nodes/MetricNode';
import { MeasureNode } from './nodes/MeasureNode';
import { ModelNode } from './nodes/ModelNode';
import { SourceNode } from './nodes/SourceNode';
import { EntityNode } from './nodes/EntityNode';
import { DimensionNode } from './nodes/DimensionNode';
import { getLayoutedElements } from '../../services/layout';
import type {
  ParseResult,
  LineageNode as LineageNodeType,
  LineageNodeData,
} from '../../types/semantic';

// Register custom node types
const nodeTypes = {
  metric: MetricNode,
  measure: MeasureNode,
  model: ModelNode,
  source: SourceNode,
  entity: EntityNode,
  dimension: DimensionNode,
};

interface LineageCanvasProps {
  parseResult: ParseResult;
  onNodeClick?: (node: LineageNodeType) => void;
}

export function LineageCanvas({
  parseResult,
  onNodeClick,
}: LineageCanvasProps) {
  // Convert lineage data to React Flow format
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node<LineageNodeData>[] = parseResult.lineage.nodes.map(
      (node) => ({
        id: node.id,
        type: node.node_type.toLowerCase(),
        position: { x: 0, y: 0 }, // Will be set by layout
        data: {
          label: node.name,
          nodeType: node.node_type,
          description: node.description,
          metadata: node.metadata,
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      })
    );

    const edges: Edge[] = parseResult.lineage.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      type: 'smoothstep',
      animated: false,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 15,
        height: 15,
      },
      style: {
        strokeWidth: 2,
      },
    }));

    // Apply automatic layout
    const layouted = getLayoutedElements(nodes, edges, { direction: 'TB' });

    return {
      initialNodes: layouted.nodes,
      initialEdges: layouted.edges,
    };
  }, [parseResult]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  // Handle node click
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (onNodeClick) {
        const lineageNode = parseResult.lineage.nodes.find(
          (n) => n.id === node.id
        );
        if (lineageNode) {
          onNodeClick(lineageNode);
        }
      }
    },
    [onNodeClick, parseResult]
  );

  // Color function for minimap
  const nodeColor = (node: Node<LineageNodeData>) => {
    switch (node.data.nodeType) {
      case 'Metric':
        return '#8b5cf6'; // purple
      case 'Measure':
        return '#3b82f6'; // blue
      case 'Model':
        return '#10b981'; // green
      case 'Source':
        return '#f59e0b'; // amber
      case 'Entity':
        return '#6366f1'; // indigo
      case 'Dimension':
        return '#ec4899'; // pink
      default:
        return '#6b7280'; // gray
    }
  };

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'smoothstep',
        }}
      >
        <Background color="#e5e7eb" gap={16} />
        <Controls />
        <MiniMap
          nodeColor={nodeColor}
          nodeStrokeWidth={3}
          zoomable
          pannable
        />
      </ReactFlow>
    </div>
  );
}
