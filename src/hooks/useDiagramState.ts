/**
 * Diagram State Management with Zustand
 *
 * Centralized state store for the legal entity diagram.
 * Handles nodes, edges, persistence, and dirty tracking.
 */

import { create } from 'zustand';
import { Node, Edge } from 'reactflow';
import {
  saveDiagram as saveToStorage,
  loadDiagram as loadFromStorage,
  generateDiagramId
} from '../services/storage';
import { trackDiagramEvent } from './usePostHog';

export type EntityType =
  | 'corporation'
  | 'llc'
  | 'partnership'
  | 'individual'
  | 'trust'
  | 'disregarded'
  | 'foreign'
  | 'asset';

export interface EntityNodeData {
  label: string;
  jurisdiction?: string;
  taxStatus?: 'us' | 'foreign' | 'passthrough';
  notes?: string;
}

interface DiagramState {
  // State
  diagramId: string;
  diagramName: string;
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  isDirty: boolean;
  lastSaved: Date | null;

  // Node actions
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  addNode: (type: EntityType, position: { x: number; y: number }) => void;
  updateNode: (id: string, data: Partial<EntityNodeData>) => void;
  updateEdge: (id: string, updates: Partial<Edge>) => void;
  deleteNode: (id: string) => void;
  selectNode: (id: string | null) => void;

  // Persistence
  saveDiagram: () => Promise<void>;
  loadDiagram: (id: string) => Promise<void>;
  markClean: () => void;
  markDirty: () => void;

  // Diagram management
  newDiagram: () => void;
  setDiagramName: (name: string) => void;
}

const getDefaultLabel = (type: EntityType): string => {
  const labels: Record<EntityType, string> = {
    corporation: 'New Corporation',
    llc: 'New LLC',
    partnership: 'New Partnership',
    individual: 'New Individual',
    trust: 'New Trust',
    disregarded: 'New Disregarded Entity',
    foreign: 'New Foreign Entity',
    asset: 'New Asset',
  };
  return labels[type];
};

const getDefaultJurisdiction = (type: EntityType): string => {
  const jurisdictions: Record<EntityType, string> = {
    corporation: 'Delaware',
    llc: 'Delaware',
    partnership: 'Delaware',
    individual: 'N/A',
    trust: 'N/A',
    disregarded: 'Delaware',
    foreign: 'Cayman Islands',
    asset: 'N/A',
  };
  return jurisdictions[type];
};

export const useDiagramState = create<DiagramState>((set, get) => ({
  // Initial state
  diagramId: generateDiagramId(),
  diagramName: 'Untitled Diagram',
  nodes: [],
  edges: [],
  selectedNodeId: null,
  isDirty: false,
  lastSaved: null,

  // Node setters
  setNodes: (nodes) => {
    set((state) => ({
      nodes: typeof nodes === 'function' ? nodes(state.nodes) : nodes,
      isDirty: true,
    }));
  },

  setEdges: (edges) => {
    set((state) => ({
      edges: typeof edges === 'function' ? edges(state.edges) : edges,
      isDirty: true,
    }));
  },

  // Add node
  addNode: (type, position) => {
    const newNode: Node = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      position,
      data: {
        label: getDefaultLabel(type),
        jurisdiction: getDefaultJurisdiction(type),
        taxStatus: type === 'foreign' ? 'foreign' : 'us',
      },
    };

    set((state) => ({
      nodes: [...state.nodes, newNode],
      isDirty: true,
    }));

    trackDiagramEvent('entity_added_manual', {
      entityType: type,
      method: 'palette',
      totalNodes: get().nodes.length,
    });
  },

  // Update node
  updateNode: (id, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, ...data } }
          : node
      ),
      isDirty: true,
    }));

    trackDiagramEvent('diagram_modified', {
      action: 'update_node',
      nodeId: id,
    });
  },

  // Update edge
  updateEdge: (id, updates) => {
    set((state) => ({
      edges: state.edges.map((edge) =>
        edge.id === id
          ? { ...edge, ...updates }
          : edge
      ),
      isDirty: true,
    }));

    trackDiagramEvent('diagram_modified', {
      action: 'update_edge',
      edgeId: id,
    });
  },

  // Delete node
  deleteNode: (id) => {
    const { nodes, edges } = get();

    set({
      nodes: nodes.filter((node) => node.id !== id),
      edges: edges.filter((edge) => edge.source !== id && edge.target !== id),
      selectedNodeId: null,
      isDirty: true,
    });

    trackDiagramEvent('diagram_modified', {
      action: 'delete_node',
      nodeId: id,
      remainingNodes: get().nodes.length,
    });
  },

  // Select node
  selectNode: (id) => {
    set({ selectedNodeId: id });
  },

  // Save diagram
  saveDiagram: async () => {
    const { diagramId, diagramName, nodes, edges, lastSaved } = get();

    try {
      const startTime = performance.now();

      await saveToStorage(
        diagramId,
        diagramName,
        nodes,
        edges,
        lastSaved ? {
          createdAt: lastSaved.toISOString(),
          updatedAt: new Date().toISOString(),
          version: '1.0.0'
        } : undefined
      );

      const saveTime = performance.now() - startTime;

      set({
        isDirty: false,
        lastSaved: new Date(),
      });

      trackDiagramEvent('diagram_saved', {
        method: 'auto',
        nodeCount: nodes.length,
        edgeCount: edges.length,
        saveTimeMs: Math.round(saveTime),
      });
    } catch (error) {
      console.error('Failed to save diagram:', error);

      trackDiagramEvent('diagram_save_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  },

  // Load diagram
  loadDiagram: async (id) => {
    try {
      const data = await loadFromStorage(id);

      if (!data) {
        throw new Error(`Diagram ${id} not found`);
      }

      set({
        diagramId: data.id,
        diagramName: data.name,
        nodes: data.nodes,
        edges: data.edges,
        isDirty: false,
        lastSaved: new Date(data.metadata.updatedAt),
      });

      trackDiagramEvent('diagram_loaded', {
        diagramId: id,
        nodeCount: data.nodes.length,
        edgeCount: data.edges.length,
      });
    } catch (error) {
      console.error('Failed to load diagram:', error);

      trackDiagramEvent('diagram_load_failed', {
        diagramId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  },

  // Mark clean
  markClean: () => {
    set({ isDirty: false });
  },

  // Mark dirty
  markDirty: () => {
    set({ isDirty: true });
  },

  // New diagram
  newDiagram: () => {
    set({
      diagramId: generateDiagramId(),
      diagramName: 'Untitled Diagram',
      nodes: [],
      edges: [],
      selectedNodeId: null,
      isDirty: false,
      lastSaved: null,
    });

    trackDiagramEvent('diagram_created', {
      method: 'manual',
    });
  },

  // Set diagram name
  setDiagramName: (name) => {
    set({
      diagramName: name,
      isDirty: true,
    });
  },
}));
