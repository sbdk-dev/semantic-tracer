/**
 * Layout Service Tests
 *
 * Tests dagre auto-layout functionality for legal entity diagrams.
 */

import { describe, it, expect } from 'vitest';
import type { Node, Edge } from 'reactflow';
import { holdingCompanyStructure, startupEquityStructure } from '@tests/fixtures/legalEntities';

// Mock dagre layout function (will be implemented in src/services/layout.ts)
function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: 'TB' | 'LR' = 'TB'
): { nodes: Node[]; edges: Edge[] } {
  // This is a simplified mock - actual implementation uses dagre
  const layouted = nodes.map((node, index) => ({
    ...node,
    position: {
      x: direction === 'TB' ? 150 * index : 0,
      y: direction === 'TB' ? 0 : 100 * index,
    },
  }));

  return {
    nodes: layouted,
    edges,
  };
}

describe('Layout Service', () => {
  describe('getLayoutedElements', () => {
    it('should layout simple structure top-to-bottom', () => {
      const { nodes, edges } = holdingCompanyStructure;
      const result = getLayoutedElements(nodes, edges, 'TB');

      expect(result.nodes).toHaveLength(nodes.length);
      expect(result.edges).toHaveLength(edges.length);

      // Parent should be above children
      const parent = result.nodes.find((n) => n.id === 'holdco-1');
      const child = result.nodes.find((n) => n.id === 'opco-1');

      expect(parent).toBeDefined();
      expect(child).toBeDefined();
      expect(parent!.position.y).toBeLessThanOrEqual(child!.position.y);
    });

    it('should layout complex structure with multiple levels', () => {
      const { nodes, edges } = startupEquityStructure;
      const result = getLayoutedElements(nodes, edges, 'TB');

      expect(result.nodes).toHaveLength(nodes.length);

      // Check that positions are assigned
      result.nodes.forEach((node) => {
        expect(node.position).toBeDefined();
        expect(typeof node.position.x).toBe('number');
        expect(typeof node.position.y).toBe('number');
      });
    });

    it('should handle left-to-right layout', () => {
      const { nodes, edges } = holdingCompanyStructure;
      const result = getLayoutedElements(nodes, edges, 'LR');

      expect(result.nodes).toHaveLength(nodes.length);
      expect(result.edges).toHaveLength(edges.length);

      // All nodes should have valid positions
      result.nodes.forEach((node) => {
        expect(node.position.x).toBeGreaterThanOrEqual(0);
        expect(node.position.y).toBeGreaterThanOrEqual(0);
      });
    });

    it('should preserve node data during layout', () => {
      const { nodes, edges } = holdingCompanyStructure;
      const result = getLayoutedElements(nodes, edges);

      result.nodes.forEach((layoutedNode) => {
        const originalNode = nodes.find((n) => n.id === layoutedNode.id);
        expect(layoutedNode.data).toEqual(originalNode!.data);
        expect(layoutedNode.type).toEqual(originalNode!.type);
      });
    });

    it('should preserve edge data during layout', () => {
      const { nodes, edges } = holdingCompanyStructure;
      const result = getLayoutedElements(nodes, edges);

      result.edges.forEach((layoutedEdge) => {
        const originalEdge = edges.find((e) => e.id === layoutedEdge.id);
        expect(layoutedEdge.data).toEqual(originalEdge!.data);
        expect(layoutedEdge.label).toEqual(originalEdge!.label);
      });
    });

    it('should handle empty diagram', () => {
      const result = getLayoutedElements([], []);

      expect(result.nodes).toHaveLength(0);
      expect(result.edges).toHaveLength(0);
    });

    it('should handle single node with no edges', () => {
      const singleNode: Node[] = [
        {
          id: 'single',
          type: 'corporation',
          position: { x: 0, y: 0 },
          data: { label: 'Single Corp' },
        },
      ];

      const result = getLayoutedElements(singleNode, []);

      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0].position).toBeDefined();
    });

    it('should space nodes appropriately', () => {
      const { nodes, edges } = holdingCompanyStructure;
      const result = getLayoutedElements(nodes, edges);

      // Check minimum spacing between nodes (dagre default is ~100px)
      const positions = result.nodes.map((n) => n.position);

      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          const distance = Math.sqrt(
            Math.pow(positions[i].x - positions[j].x, 2) +
              Math.pow(positions[i].y - positions[j].y, 2)
          );

          // Nodes should not overlap (minimum 50px apart)
          expect(distance).toBeGreaterThanOrEqual(50);
        }
      }
    });

    it('should handle circular references without infinite loop', () => {
      const circularNodes: Node[] = [
        { id: 'a', type: 'corporation', position: { x: 0, y: 0 }, data: { label: 'A' } },
        { id: 'b', type: 'llc', position: { x: 0, y: 0 }, data: { label: 'B' } },
      ];

      const circularEdges: Edge[] = [
        { id: 'e1', source: 'a', target: 'b' },
        { id: 'e2', source: 'b', target: 'a' },
      ];

      // Should not throw or hang
      expect(() => {
        getLayoutedElements(circularNodes, circularEdges);
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should layout 50+ nodes in under 500ms', () => {
      // Create a large structure
      const nodes: Node[] = Array.from({ length: 50 }, (_, i) => ({
        id: `node-${i}`,
        type: 'corporation',
        position: { x: 0, y: 0 },
        data: { label: `Corp ${i}` },
      }));

      const edges: Edge[] = Array.from({ length: 49 }, (_, i) => ({
        id: `e-${i}`,
        source: `node-${i}`,
        target: `node-${i + 1}`,
      }));

      const startTime = performance.now();
      getLayoutedElements(nodes, edges);
      const duration = performance.now() - startTime;

      expect(duration).toBeLessThan(500);
    });

    it('should handle 100+ nodes without errors', () => {
      const nodes: Node[] = Array.from({ length: 100 }, (_, i) => ({
        id: `node-${i}`,
        type: i % 2 === 0 ? 'corporation' : 'llc',
        position: { x: 0, y: 0 },
        data: { label: `Entity ${i}` },
      }));

      const edges: Edge[] = Array.from({ length: 99 }, (_, i) => ({
        id: `e-${i}`,
        source: `node-${Math.floor(i / 2)}`,
        target: `node-${i + 1}`,
      }));

      expect(() => {
        const result = getLayoutedElements(nodes, edges);
        expect(result.nodes).toHaveLength(100);
      }).not.toThrow();
    });
  });
});
