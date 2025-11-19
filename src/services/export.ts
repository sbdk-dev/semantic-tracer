/**
 * Export service for lineage diagrams
 */

import { toPng, toJpeg } from 'html-to-image';
import type { ParseResult } from '../types/semantic';

/**
 * Export the current lineage canvas to PNG
 */
export async function exportToPng(elementId: string = 'lineage-canvas'): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  try {
    // Get the React Flow viewport element
    const viewport = element.querySelector('.react-flow__viewport');
    if (!viewport) {
      throw new Error('React Flow viewport not found');
    }

    // Generate PNG
    const dataUrl = await toPng(viewport as HTMLElement, {
      backgroundColor: '#ffffff',
      quality: 1.0,
      pixelRatio: 2, // Higher resolution
    });

    // Download
    const link = document.createElement('a');
    link.download = `lineage-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Failed to export PNG:', error);
    throw error;
  }
}

/**
 * Export the current lineage canvas to JPEG
 */
export async function exportToJpeg(elementId: string = 'lineage-canvas'): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  try {
    const viewport = element.querySelector('.react-flow__viewport');
    if (!viewport) {
      throw new Error('React Flow viewport not found');
    }

    const dataUrl = await toJpeg(viewport as HTMLElement, {
      backgroundColor: '#ffffff',
      quality: 0.95,
      pixelRatio: 2,
    });

    const link = document.createElement('a');
    link.download = `lineage-${Date.now()}.jpg`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Failed to export JPEG:', error);
    throw error;
  }
}

/**
 * Export audit report as JSON
 */
export function exportAuditJson(parseResult: ParseResult): void {
  const data = {
    project: parseResult.dbt_project?.name,
    timestamp: new Date().toISOString(),
    audit: parseResult.audit,
    summary: {
      total_nodes: parseResult.lineage.nodes.length,
      total_edges: parseResult.lineage.edges.length,
      metrics: parseResult.metrics.length,
      models: parseResult.models.length,
      sources: parseResult.sources.length,
    },
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.download = `audit-${parseResult.dbt_project?.name || 'report'}-${Date.now()}.json`;
  link.href = url;
  link.click();

  URL.revokeObjectURL(url);
}

/**
 * Export lineage data as JSON
 */
export function exportLineageJson(parseResult: ParseResult): void {
  const data = {
    project: parseResult.dbt_project?.name,
    timestamp: new Date().toISOString(),
    nodes: parseResult.lineage.nodes,
    edges: parseResult.lineage.edges,
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.download = `lineage-${parseResult.dbt_project?.name || 'data'}-${Date.now()}.json`;
  link.href = url;
  link.click();

  URL.revokeObjectURL(url);
}

/**
 * Copy lineage as Mermaid diagram syntax
 */
export function copyAsMermaid(parseResult: ParseResult): string {
  let mermaid = 'graph TD\n';

  // Add nodes
  parseResult.lineage.nodes.forEach((node) => {
    const nodeId = node.id.replace(/[^a-zA-Z0-9]/g, '_');
    const label = node.name.replace(/"/g, '\\"');
    mermaid += `  ${nodeId}["${label}"]\n`;
  });

  mermaid += '\n';

  // Add edges
  parseResult.lineage.edges.forEach((edge) => {
    const sourceId = edge.source.replace(/[^a-zA-Z0-9]/g, '_');
    const targetId = edge.target.replace(/[^a-zA-Z0-9]/g, '_');
    const label = edge.label ? `|${edge.label}|` : '';
    mermaid += `  ${sourceId} --${label}--> ${targetId}\n`;
  });

  // Copy to clipboard
  navigator.clipboard.writeText(mermaid);

  return mermaid;
}
