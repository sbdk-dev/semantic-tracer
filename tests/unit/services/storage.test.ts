/**
 * Storage Service Tests
 *
 * Tests localStorage persistence for diagrams (zero data loss requirement).
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Node, Edge } from 'reactflow';
import { holdingCompanyStructure } from '@tests/fixtures/legalEntities';

interface DiagramState {
  nodes: Node[];
  edges: Edge[];
  metadata?: {
    createdAt: number;
    updatedAt: number;
    version: string;
  };
}

// Storage service implementation (to be created in src/services/storage.ts)
const STORAGE_KEY = 'lawdraw_diagram';

class StorageService {
  saveDiagram(state: DiagramState): void {
    try {
      const serialized = JSON.stringify({
        ...state,
        metadata: {
          ...state.metadata,
          updatedAt: Date.now(),
          version: '1.0',
        },
      });
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch (error) {
      throw new Error(`Failed to save diagram: ${error}`);
    }
  }

  loadDiagram(): DiagramState | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to load diagram:', error);
      return null;
    }
  }

  clearDiagram(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  exportDiagram(state: DiagramState): string {
    return JSON.stringify(state, null, 2);
  }

  importDiagram(jsonString: string): DiagramState {
    const parsed = JSON.parse(jsonString);
    if (!parsed.nodes || !Array.isArray(parsed.nodes)) {
      throw new Error('Invalid diagram format: missing nodes array');
    }
    if (!parsed.edges || !Array.isArray(parsed.edges)) {
      throw new Error('Invalid diagram format: missing edges array');
    }
    return parsed;
  }
}

describe('Storage Service', () => {
  let storageService: StorageService;

  beforeEach(() => {
    storageService = new StorageService();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('saveDiagram', () => {
    it('should save diagram to localStorage', () => {
      const state: DiagramState = {
        nodes: holdingCompanyStructure.nodes,
        edges: holdingCompanyStructure.edges,
      };

      storageService.saveDiagram(state);

      const saved = localStorage.getItem(STORAGE_KEY);
      expect(saved).toBeTruthy();

      const parsed = JSON.parse(saved!);
      expect(parsed.nodes).toHaveLength(holdingCompanyStructure.nodes.length);
      expect(parsed.edges).toHaveLength(holdingCompanyStructure.edges.length);
    });

    it('should add metadata on save', () => {
      const state: DiagramState = {
        nodes: [
          {
            id: 'test',
            type: 'corporation',
            position: { x: 0, y: 0 },
            data: { label: 'Test' },
          },
        ],
        edges: [],
      };

      storageService.saveDiagram(state);

      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(saved.metadata).toBeDefined();
      expect(saved.metadata.updatedAt).toBeGreaterThan(0);
      expect(saved.metadata.version).toBe('1.0');
    });

    it('should handle empty diagram', () => {
      const state: DiagramState = { nodes: [], edges: [] };

      expect(() => {
        storageService.saveDiagram(state);
      }).not.toThrow();

      const saved = storageService.loadDiagram();
      expect(saved?.nodes).toHaveLength(0);
      expect(saved?.edges).toHaveLength(0);
    });

    it('should preserve all node data', () => {
      const complexNode: Node = {
        id: 'complex',
        type: 'corporation',
        position: { x: 100, y: 200 },
        data: {
          label: 'Complex Corp',
          jurisdiction: 'Delaware',
          taxStatus: 'us',
          notes: 'Important notes here',
        },
      };

      storageService.saveDiagram({ nodes: [complexNode], edges: [] });

      const loaded = storageService.loadDiagram();
      expect(loaded?.nodes[0]).toEqual(complexNode);
    });

    it('should preserve all edge data', () => {
      const complexEdge: Edge = {
        id: 'e1',
        source: 'parent',
        target: 'child',
        label: '75%',
        data: {
          ownershipType: 'both',
          votingPercentage: 75,
          economicPercentage: 75,
        },
      };

      const nodes: Node[] = [
        {
          id: 'parent',
          type: 'corporation',
          position: { x: 0, y: 0 },
          data: { label: 'Parent' },
        },
        {
          id: 'child',
          type: 'llc',
          position: { x: 0, y: 100 },
          data: { label: 'Child' },
        },
      ];

      storageService.saveDiagram({ nodes, edges: [complexEdge] });

      const loaded = storageService.loadDiagram();
      expect(loaded?.edges[0]).toEqual(complexEdge);
    });

    it('should handle quota exceeded error', () => {
      // Mock localStorage.setItem to throw quota exceeded
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError');
      });

      expect(() => {
        storageService.saveDiagram({ nodes: [], edges: [] });
      }).toThrow('Failed to save diagram');

      localStorage.setItem = originalSetItem;
    });
  });

  describe('loadDiagram', () => {
    it('should load saved diagram', () => {
      const state: DiagramState = {
        nodes: holdingCompanyStructure.nodes,
        edges: holdingCompanyStructure.edges,
      };

      storageService.saveDiagram(state);
      const loaded = storageService.loadDiagram();

      expect(loaded).toBeTruthy();
      expect(loaded?.nodes).toHaveLength(state.nodes.length);
      expect(loaded?.edges).toHaveLength(state.edges.length);
    });

    it('should return null if no diagram saved', () => {
      const loaded = storageService.loadDiagram();
      expect(loaded).toBeNull();
    });

    it('should return null if corrupted data', () => {
      localStorage.setItem(STORAGE_KEY, 'invalid json {[}');

      const loaded = storageService.loadDiagram();
      expect(loaded).toBeNull();
    });

    it('should preserve metadata', () => {
      const state: DiagramState = {
        nodes: [],
        edges: [],
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
          version: '1.0',
        },
      };

      storageService.saveDiagram(state);
      const loaded = storageService.loadDiagram();

      expect(loaded?.metadata).toBeDefined();
      expect(loaded?.metadata?.version).toBe('1.0');
    });
  });

  describe('clearDiagram', () => {
    it('should remove diagram from localStorage', () => {
      storageService.saveDiagram({ nodes: [], edges: [] });
      expect(localStorage.getItem(STORAGE_KEY)).toBeTruthy();

      storageService.clearDiagram();
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('should not throw if no diagram exists', () => {
      expect(() => {
        storageService.clearDiagram();
      }).not.toThrow();
    });
  });

  describe('exportDiagram', () => {
    it('should export diagram as formatted JSON', () => {
      const state: DiagramState = {
        nodes: [
          {
            id: 'test',
            type: 'corporation',
            position: { x: 0, y: 0 },
            data: { label: 'Test' },
          },
        ],
        edges: [],
      };

      const exported = storageService.exportDiagram(state);

      expect(typeof exported).toBe('string');
      expect(exported).toContain('"nodes"');
      expect(exported).toContain('"edges"');

      // Should be pretty-printed
      expect(exported).toContain('\n');
    });

    it('should create valid JSON that can be re-imported', () => {
      const state: DiagramState = {
        nodes: holdingCompanyStructure.nodes,
        edges: holdingCompanyStructure.edges,
      };

      const exported = storageService.exportDiagram(state);
      const reimported = JSON.parse(exported);

      expect(reimported.nodes).toEqual(state.nodes);
      expect(reimported.edges).toEqual(state.edges);
    });
  });

  describe('importDiagram', () => {
    it('should import valid JSON diagram', () => {
      const validJson = JSON.stringify({
        nodes: holdingCompanyStructure.nodes,
        edges: holdingCompanyStructure.edges,
      });

      const imported = storageService.importDiagram(validJson);

      expect(imported.nodes).toHaveLength(holdingCompanyStructure.nodes.length);
      expect(imported.edges).toHaveLength(holdingCompanyStructure.edges.length);
    });

    it('should throw on invalid JSON', () => {
      expect(() => {
        storageService.importDiagram('invalid json');
      }).toThrow();
    });

    it('should throw on missing nodes array', () => {
      const invalidJson = JSON.stringify({ edges: [] });

      expect(() => {
        storageService.importDiagram(invalidJson);
      }).toThrow('Invalid diagram format: missing nodes array');
    });

    it('should throw on missing edges array', () => {
      const invalidJson = JSON.stringify({ nodes: [] });

      expect(() => {
        storageService.importDiagram(invalidJson);
      }).toThrow('Invalid diagram format: missing edges array');
    });

    it('should preserve all node properties', () => {
      const complexDiagram = {
        nodes: [
          {
            id: 'complex',
            type: 'corporation',
            position: { x: 100, y: 200 },
            data: {
              label: 'Complex Corp',
              jurisdiction: 'Delaware',
              taxStatus: 'us',
              notes: 'Test notes',
            },
          },
        ],
        edges: [],
      };

      const imported = storageService.importDiagram(JSON.stringify(complexDiagram));

      expect(imported.nodes[0]).toEqual(complexDiagram.nodes[0]);
    });
  });

  describe('Data Integrity', () => {
    it('should handle special characters in labels', () => {
      const state: DiagramState = {
        nodes: [
          {
            id: 'special',
            type: 'corporation',
            position: { x: 0, y: 0 },
            data: {
              label: 'Test & Co. "Special" <Corp>',
              notes: "Line 1\nLine 2\tTabbed",
            },
          },
        ],
        edges: [],
      };

      storageService.saveDiagram(state);
      const loaded = storageService.loadDiagram();

      expect(loaded?.nodes[0].data.label).toBe(state.nodes[0].data.label);
      expect(loaded?.nodes[0].data.notes).toBe(state.nodes[0].data.notes);
    });

    it('should handle unicode characters', () => {
      const state: DiagramState = {
        nodes: [
          {
            id: 'unicode',
            type: 'corporation',
            position: { x: 0, y: 0 },
            data: { label: 'Société Française 中文 🏢' },
          },
        ],
        edges: [],
      };

      storageService.saveDiagram(state);
      const loaded = storageService.loadDiagram();

      expect(loaded?.nodes[0].data.label).toBe(state.nodes[0].data.label);
    });

    it('should handle large diagrams (100+ nodes)', () => {
      const largeState: DiagramState = {
        nodes: Array.from({ length: 100 }, (_, i) => ({
          id: `node-${i}`,
          type: 'corporation',
          position: { x: i * 10, y: i * 10 },
          data: { label: `Corp ${i}`, jurisdiction: 'Delaware' },
        })) as Node[],
        edges: Array.from({ length: 99 }, (_, i) => ({
          id: `e-${i}`,
          source: `node-${i}`,
          target: `node-${i + 1}`,
          label: '100%',
        })) as Edge[],
      };

      expect(() => {
        storageService.saveDiagram(largeState);
      }).not.toThrow();

      const loaded = storageService.loadDiagram();
      expect(loaded?.nodes).toHaveLength(100);
      expect(loaded?.edges).toHaveLength(99);
    });
  });
});
