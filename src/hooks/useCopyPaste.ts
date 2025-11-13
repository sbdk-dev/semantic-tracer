/**
 * Copy/Paste Hook
 *
 * Handles copying, pasting, and duplicating nodes with their connections.
 * Integrates with Zustand store to manage diagram state.
 */

import { useCallback, useRef } from 'react';
import { Node, Edge } from 'reactflow';
import { useDiagramState, EntityNodeData } from './useDiagramState';

interface ClipboardData {
  nodes: Node<EntityNodeData>[];
  edges: Edge[];
}

const PASTE_OFFSET = 30; // px offset when pasting

export function useCopyPaste() {
  const nodes = useDiagramState((state) => state.nodes);
  const edges = useDiagramState((state) => state.edges);
  const setNodes = useDiagramState((state) => state.setNodes);
  const setEdges = useDiagramState((state) => state.setEdges);

  const clipboardRef = useRef<ClipboardData | null>(null);

  // Get currently selected nodes and edges
  const getSelectedElements = useCallback(() => {
    const selectedNodes = nodes.filter((n) => n.selected);
    const selectedNodeIds = new Set(selectedNodes.map((n) => n.id));

    // Only include edges where both source and target are selected
    const selectedEdges = edges.filter(
      (e) => selectedNodeIds.has(e.source) && selectedNodeIds.has(e.target)
    );

    return { nodes: selectedNodes, edges: selectedEdges };
  }, [nodes, edges]);

  // Copy selected nodes and edges
  const copy = useCallback(() => {
    const selected = getSelectedElements();

    if (selected.nodes.length === 0) {
      console.log('Nothing to copy');
      return false;
    }

    // Deep clone the nodes and edges
    clipboardRef.current = {
      nodes: JSON.parse(JSON.stringify(selected.nodes)),
      edges: JSON.parse(JSON.stringify(selected.edges)),
    };

    console.log(`Copied ${selected.nodes.length} nodes and ${selected.edges.length} edges`);
    return true;
  }, [getSelectedElements]);

  // Paste copied nodes and edges with offset
  const paste = useCallback(
    (offset: { x: number; y: number } = { x: PASTE_OFFSET, y: PASTE_OFFSET }) => {
      if (!clipboardRef.current || clipboardRef.current.nodes.length === 0) {
        console.log('Nothing to paste');
        return false;
      }

      const { nodes: copiedNodes, edges: copiedEdges } = clipboardRef.current;

      // Create ID mapping for the new nodes
      const idMap = new Map<string, string>();
      const newNodes: Node<EntityNodeData>[] = [];

      // Clone nodes with new IDs and offset positions
      copiedNodes.forEach((node) => {
        const newId = `${node.type}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        idMap.set(node.id, newId);

        const newNode: Node<EntityNodeData> = {
          ...node,
          id: newId,
          position: {
            x: node.position.x + offset.x,
            y: node.position.y + offset.y,
          },
          selected: true, // Select the newly pasted nodes
        };

        newNodes.push(newNode);
      });

      // Clone edges with updated source/target IDs
      const newEdges: Edge[] = [];
      copiedEdges.forEach((edge) => {
        const newSourceId = idMap.get(edge.source);
        const newTargetId = idMap.get(edge.target);

        if (newSourceId && newTargetId) {
          const newEdge: Edge = {
            ...edge,
            id: `edge-${newSourceId}-${newTargetId}-${Date.now()}`,
            source: newSourceId,
            target: newTargetId,
            selected: false,
          };
          newEdges.push(newEdge);
        }
      });

      // Deselect all existing nodes and edges
      setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
      setEdges((eds) => eds.map((e) => ({ ...e, selected: false })));

      // Add new nodes and edges
      setNodes((nds) => [...nds, ...newNodes]);
      setEdges((eds) => [...eds, ...newEdges]);

      console.log(`Pasted ${newNodes.length} nodes and ${newEdges.length} edges`);
      return true;
    },
    [setNodes, setEdges]
  );

  // Duplicate selected nodes (copy + paste in one action)
  const duplicate = useCallback(() => {
    const copied = copy();
    if (copied) {
      paste();
    }
    return copied;
  }, [copy, paste]);

  // Cut selected nodes and edges (copy + delete)
  const cut = useCallback(() => {
    const copied = copy();
    if (copied) {
      // Delete selected nodes and edges
      setNodes((nds) => nds.filter((n) => !n.selected));
      setEdges((eds) => eds.filter((e) => !e.selected));
    }
    return copied;
  }, [copy, setNodes, setEdges]);

  const hasClipboard = clipboardRef.current !== null && clipboardRef.current.nodes.length > 0;

  return {
    copy,
    paste,
    duplicate,
    cut,
    hasClipboard,
  };
}
