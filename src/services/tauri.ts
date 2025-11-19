/**
 * Tauri IPC service for calling Rust backend commands
 */

import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import type {
  ParseResult,
  ProjectConfig,
  LineageNode,
} from '../types/semantic';

/**
 * Open a directory picker dialog and return the selected path
 */
export async function selectDirectory(): Promise<string | null> {
  const selected = await open({
    directory: true,
    multiple: false,
    title: 'Select dbt Project Directory',
  });

  return selected as string | null;
}

/**
 * Open a file picker dialog for semantic layer config
 */
export async function selectSemanticLayerFile(): Promise<string | null> {
  const selected = await open({
    directory: false,
    multiple: false,
    title: 'Select Semantic Layer Config File',
    filters: [
      {
        name: 'YAML Files',
        extensions: ['yml', 'yaml'],
      },
    ],
  });

  return selected as string | null;
}

/**
 * Parse a dbt project and its semantic layer
 */
export async function parseProject(
  config: ProjectConfig
): Promise<ParseResult> {
  return invoke<ParseResult>('parse_project', { config });
}

/**
 * Get lineage for a specific metric (upstream dependencies)
 */
export async function getMetricLineage(
  parseResult: ParseResult,
  metricName: string
): Promise<ParseResult> {
  return invoke<ParseResult>('get_metric_lineage', {
    parseResult,
    metricName,
  });
}

/**
 * Get impact analysis for a node (downstream dependencies)
 */
export async function getImpactAnalysis(
  parseResult: ParseResult,
  nodeName: string
): Promise<ParseResult> {
  return invoke<ParseResult>('get_impact_analysis', {
    parseResult,
    nodeName,
  });
}

/**
 * Search for nodes by name or description
 */
export async function searchNodes(
  parseResult: ParseResult,
  query: string
): Promise<LineageNode[]> {
  return invoke<LineageNode[]>('search_nodes', {
    parseResult,
    query,
  });
}
