/**
 * Undo/Redo Hook
 *
 * Maintains history of diagram state changes for undo/redo operations.
 * Integrates with Zustand store to track node/edge changes.
 */

import { useCallback, useEffect, useRef } from 'react';
import { Node, Edge } from 'reactflow';
import { useDiagramState } from './useDiagramState';

interface HistoryState {
  nodes: Node[];
  edges: Edge[];
  timestamp: number;
}

const MAX_HISTORY_SIZE = 50;

export function useUndoRedo() {
  const nodes = useDiagramState((state) => state.nodes);
  const edges = useDiagramState((state) => state.edges);
  const setNodes = useDiagramState((state) => state.setNodes);
  const setEdges = useDiagramState((state) => state.setEdges);

  const historyRef = useRef<HistoryState[]>([]);
  const currentIndexRef = useRef(-1);
  const isApplyingHistoryRef = useRef(false);

  // Add current state to history when nodes/edges change
  useEffect(() => {
    // Skip if we're currently applying a history state
    if (isApplyingHistoryRef.current) {
      isApplyingHistoryRef.current = false;
      return;
    }

    // Skip if no nodes and edges (initial state)
    if (nodes.length === 0 && edges.length === 0 && historyRef.current.length === 0) {
      return;
    }

    const newState: HistoryState = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
      timestamp: Date.now(),
    };

    // Check if state actually changed
    const lastState = historyRef.current[currentIndexRef.current];
    if (lastState &&
        JSON.stringify(lastState.nodes) === JSON.stringify(newState.nodes) &&
        JSON.stringify(lastState.edges) === JSON.stringify(newState.edges)) {
      return;
    }

    // Remove any states after current index (when user made changes after undo)
    const newHistory = historyRef.current.slice(0, currentIndexRef.current + 1);

    // Add new state
    newHistory.push(newState);

    // Limit history size
    if (newHistory.length > MAX_HISTORY_SIZE) {
      newHistory.shift();
    } else {
      currentIndexRef.current++;
    }

    historyRef.current = newHistory;
  }, [nodes, edges]);

  const undo = useCallback(() => {
    if (currentIndexRef.current <= 0) {
      console.log('Nothing to undo');
      return false;
    }

    currentIndexRef.current--;
    const prevState = historyRef.current[currentIndexRef.current];

    if (!prevState) {
      console.warn('Invalid history state');
      return false;
    }

    isApplyingHistoryRef.current = true;
    setNodes(prevState.nodes);
    setEdges(prevState.edges);

    return true;
  }, [setNodes, setEdges]);

  const redo = useCallback(() => {
    if (currentIndexRef.current >= historyRef.current.length - 1) {
      console.log('Nothing to redo');
      return false;
    }

    currentIndexRef.current++;
    const nextState = historyRef.current[currentIndexRef.current];

    if (!nextState) {
      console.warn('Invalid history state');
      return false;
    }

    isApplyingHistoryRef.current = true;
    setNodes(nextState.nodes);
    setEdges(nextState.edges);

    return true;
  }, [setNodes, setEdges]);

  const canUndo = currentIndexRef.current > 0;
  const canRedo = currentIndexRef.current < historyRef.current.length - 1;

  return {
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
