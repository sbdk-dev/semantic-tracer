/**
 * Layout Service
 *
 * Provides automatic layout for legal entity diagrams using Dagre.
 * Optimized for hierarchical structures (parent → child ownership).
 */

import dagre from 'dagre';
import { Node, Edge, Position } from 'reactflow';

export type LayoutDirection = 'TB' | 'LR' | 'BT' | 'RL';

export interface LayoutOptions {
  direction?: LayoutDirection;
  nodeWidth?: number;
  nodeHeight?: number;
  rankSep?: number;
  nodeSep?: number;
}

const DEFAULT_OPTIONS: Required<LayoutOptions> = {
  direction: 'TB',
  nodeWidth: 250,
  nodeHeight: 100,
  rankSep: 100,
  nodeSep: 150,
};

/**
 * Apply automatic layout to nodes and edges using Dagre algorithm
 */
export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {}
): { nodes: Node[]; edges: Edge[] } {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Handle edge cases
  if (nodes.length === 0) {
    return { nodes: [], edges: [] };
  }

  if (nodes.length === 1) {
    return {
      nodes: [{ ...nodes[0], position: { x: 0, y: 0 } } as Node],
      edges,
    };
  }

  // Create a new directed graph
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Configure graph
  dagreGraph.setGraph({
    rankdir: opts.direction,
    ranksep: opts.rankSep,
    nodesep: opts.nodeSep,
  });

  // Add nodes to graph
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: opts.nodeWidth,
      height: opts.nodeHeight,
    });
  });

  // Add edges to graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calculate layout
  dagre.layout(dagreGraph);

  // Apply layout to nodes
  const layoutedNodes: Node[] = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);

    return {
      ...node,
      id: node.id,
      position: {
        x: nodeWithPosition.x - opts.nodeWidth / 2,
        y: nodeWithPosition.y - opts.nodeHeight / 2,
      },
      // Set handle positions based on layout direction
      sourcePosition: getSourcePosition(opts.direction),
      targetPosition: getTargetPosition(opts.direction),
    } as Node;
  });

  return {
    nodes: layoutedNodes,
    edges,
  };
}

/**
 * Get source handle position based on layout direction
 */
function getSourcePosition(direction: LayoutDirection): Position {
  switch (direction) {
    case 'TB':
      return Position.Bottom;
    case 'LR':
      return Position.Right;
    case 'BT':
      return Position.Top;
    case 'RL':
      return Position.Left;
    default:
      return Position.Bottom;
  }
}

/**
 * Get target handle position based on layout direction
 */
function getTargetPosition(direction: LayoutDirection): Position {
  switch (direction) {
    case 'TB':
      return Position.Top;
    case 'LR':
      return Position.Left;
    case 'BT':
      return Position.Bottom;
    case 'RL':
      return Position.Right;
    default:
      return Position.Top;
  }
}

/**
 * Calculate bounding box for a set of nodes
 */
export function calculateBoundingBox(nodes: Node[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
} {
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }

  const xs = nodes.map((n) => n.position.x);
  const ys = nodes.map((n) => n.position.y);

  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Check if there are circular references in the graph
 */
export function hasCircularReferences(edges: Edge[]): boolean {
  const graph = new Map<string, Set<string>>();

  // Build adjacency list
  edges.forEach((edge) => {
    if (!graph.has(edge.source)) {
      graph.set(edge.source, new Set());
    }
    graph.get(edge.source)!.add(edge.target);
  });

  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function hasCycle(nodeId: string): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const neighbors = graph.get(nodeId);
    if (neighbors) {
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycle(neighbor)) {
            return true;
          }
        } else if (recursionStack.has(neighbor)) {
          return true;
        }
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  // Check each node
  for (const nodeId of graph.keys()) {
    if (!visited.has(nodeId)) {
      if (hasCycle(nodeId)) {
        return true;
      }
    }
  }

  return false;
}
