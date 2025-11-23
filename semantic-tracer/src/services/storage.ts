/**
 * Storage Service
 *
 * Handles diagram persistence to localStorage with metadata tracking.
 * Supports save/load, export/import, and auto-save functionality.
 */

import { Node, Edge } from 'reactflow';

export interface DiagramData {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
  metadata: DiagramMetadata;
}

export interface DiagramMetadata {
  createdAt: string;
  updatedAt: string;
  version: string;
  author?: string;
  description?: string;
}

const STORAGE_KEY_PREFIX = 'lawdraw_diagram_';
const CURRENT_VERSION = '1.0.0';

/**
 * Save diagram to localStorage
 */
export function saveDiagram(
  diagramId: string,
  name: string,
  nodes: Node[],
  edges: Edge[],
  existingMetadata?: DiagramMetadata
): DiagramData {
  const now = new Date().toISOString();

  const metadata: DiagramMetadata = existingMetadata
    ? { ...existingMetadata, updatedAt: now }
    : {
        createdAt: now,
        updatedAt: now,
        version: CURRENT_VERSION,
      };

  const diagramData: DiagramData = {
    id: diagramId,
    name,
    nodes,
    edges,
    metadata,
  };

  try {
    const serialized = JSON.stringify(diagramData);
    localStorage.setItem(STORAGE_KEY_PREFIX + diagramId, serialized);
    return diagramData;
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new Error('Storage quota exceeded. Please delete some diagrams.');
    }
    throw new Error(`Failed to save diagram: ${error}`);
  }
}

/**
 * Load diagram from localStorage
 */
export function loadDiagram(diagramId: string): DiagramData | null {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY_PREFIX + diagramId);
    if (!serialized) {
      return null;
    }

    const data = JSON.parse(serialized) as DiagramData;

    // Validate data structure
    if (
      !data ||
      !data.nodes ||
      !Array.isArray(data.nodes) ||
      !data.edges ||
      !Array.isArray(data.edges)
    ) {
      console.error('Invalid diagram data found in localStorage');
      return null;
    }

    return data;
  } catch (error) {
    console.error(`Failed to load diagram: ${error}`);
    return null;
  }
}

/**
 * Delete diagram from localStorage
 */
export function deleteDiagram(diagramId: string): void {
  localStorage.removeItem(STORAGE_KEY_PREFIX + diagramId);
}

/**
 * List all saved diagrams
 */
export function listDiagrams(): Array<{
  id: string;
  name: string;
  metadata: DiagramMetadata;
}> {
  const diagrams: Array<{
    id: string;
    name: string;
    metadata: DiagramMetadata;
  }> = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
      try {
        const serialized = localStorage.getItem(key);
        if (serialized) {
          const data = JSON.parse(serialized) as DiagramData;
          diagrams.push({
            id: data.id,
            name: data.name,
            metadata: data.metadata,
          });
        }
      } catch (error) {
        console.error(`Failed to parse diagram ${key}:`, error);
      }
    }
  }

  // Sort by most recently updated
  return diagrams.sort(
    (a, b) =>
      new Date(b.metadata.updatedAt).getTime() -
      new Date(a.metadata.updatedAt).getTime()
  );
}

/**
 * Export diagram to JSON file
 */
export function exportDiagram(diagramData: DiagramData): string {
  return JSON.stringify(diagramData, null, 2);
}

/**
 * Import diagram from JSON string
 */
export function importDiagram(jsonString: string): DiagramData {
  try {
    const data = JSON.parse(jsonString) as DiagramData;

    // Validate structure
    if (!data.id || typeof data.id !== 'string') {
      throw new Error('Invalid diagram: missing or invalid id');
    }

    if (!data.name || typeof data.name !== 'string') {
      throw new Error('Invalid diagram: missing or invalid name');
    }

    if (!Array.isArray(data.nodes)) {
      throw new Error('Invalid diagram: nodes must be an array');
    }

    if (!Array.isArray(data.edges)) {
      throw new Error('Invalid diagram: edges must be an array');
    }

    if (!data.metadata || typeof data.metadata !== 'object') {
      throw new Error('Invalid diagram: missing or invalid metadata');
    }

    return data;
  } catch (error) {
    throw new Error(`Failed to import diagram: ${error}`);
  }
}

/**
 * Check if storage is available and has space
 */
export function checkStorageAvailability(): {
  available: boolean;
  used: number;
  total: number;
  percentUsed: number;
} {
  try {
    // Estimate used space
    let used = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          used += key.length + value.length;
        }
      }
    }

    // Convert to KB
    used = Math.round(used / 1024);

    // Typical localStorage limit is 5-10 MB, assume 5 MB
    const total = 5 * 1024; // 5 MB in KB
    const percentUsed = Math.round((used / total) * 100);

    return {
      available: percentUsed < 90,
      used,
      total,
      percentUsed,
    };
  } catch {
    return {
      available: false,
      used: 0,
      total: 0,
      percentUsed: 100,
    };
  }
}

/**
 * Clear all diagrams from storage (use with caution!)
 */
export function clearAllDiagrams(): number {
  let cleared = 0;
  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => {
    localStorage.removeItem(key);
    cleared++;
  });

  return cleared;
}

/**
 * Generate a unique diagram ID
 */
export function generateDiagramId(): string {
  return `diagram_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
