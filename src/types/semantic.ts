/**
 * TypeScript types for Semantic Layer Metrics Lineage Tracer
 * These mirror the Rust types in src-tauri/src/types.rs
 */

// =============================================================================
// Project Configuration
// =============================================================================

export interface ProjectConfig {
  dbt_project_path: string;
  semantic_layer_path?: string;
  semantic_layer_type: SemanticLayerType;
}

export type SemanticLayerType = 'DbtSemanticLayer' | 'Snowflake' | 'None';

// =============================================================================
// dbt Project Types
// =============================================================================

export interface DbtProject {
  name: string;
  version?: string;
  config_version?: number;
  profile?: string;
  model_paths: string[];
  seed_paths: string[];
  test_paths: string[];
  analysis_paths: string[];
  macro_paths: string[];
  target_path?: string;
}

export interface DbtModel {
  unique_id: string;
  name: string;
  schema?: string;
  database?: string;
  description?: string;
  columns: DbtColumn[];
  depends_on: string[];
  refs: string[];
  sources: DbtSourceRef[];
  file_path: string;
  raw_sql?: string;
  materialization?: string;
  tags: string[];
}

export interface DbtColumn {
  name: string;
  description?: string;
  data_type?: string;
  meta: Record<string, unknown>;
  tests: string[];
}

export interface DbtSource {
  unique_id: string;
  source_name: string;
  name: string;
  schema?: string;
  database?: string;
  description?: string;
  columns: DbtColumn[];
  loader?: string;
  freshness?: DbtFreshness;
  tags: string[];
}

export interface DbtSourceRef {
  source_name: string;
  table_name: string;
}

export interface DbtFreshness {
  warn_after?: DbtFreshnessRule;
  error_after?: DbtFreshnessRule;
}

export interface DbtFreshnessRule {
  count: number;
  period: string;
}

// =============================================================================
// dbt Semantic Layer Types (MetricFlow)
// =============================================================================

export interface SemanticModel {
  name: string;
  description?: string;
  model: string;
  defaults?: SemanticModelDefaults;
  entities: SemanticEntity[];
  measures: Measure[];
  dimensions: Dimension[];
}

export interface SemanticModelDefaults {
  agg_time_dimension?: string;
}

export interface SemanticEntity {
  name: string;
  entity_type: string;
  expr?: string;
  description?: string;
}

export interface Measure {
  name: string;
  agg: string;
  expr?: string;
  description?: string;
  create_metric?: boolean;
  non_additive_dimension?: NonAdditiveDimension;
}

export interface NonAdditiveDimension {
  name: string;
  window_choice?: string;
}

export interface Dimension {
  name: string;
  dimension_type: string;
  expr?: string;
  description?: string;
  type_params?: DimensionTypeParams;
}

export interface DimensionTypeParams {
  time_granularity?: string;
  validity_params?: unknown;
}

export interface Metric {
  name: string;
  description?: string;
  metric_type: string;
  type_params: MetricTypeParams;
  filter?: string;
  label?: string;
}

export interface MetricTypeParams {
  measure?: MeasureRef;
  expr?: string;
  metrics?: MetricRef[];
  window?: string;
  grain_to_date?: string;
}

export interface MeasureRef {
  name: string;
  filter?: string;
  alias?: string;
}

export interface MetricRef {
  name: string;
  offset_window?: string;
  offset_to_grain?: string;
}

// =============================================================================
// Lineage Graph Types
// =============================================================================

export type LineageNodeType =
  | 'Metric'
  | 'Measure'
  | 'Dimension'
  | 'Entity'
  | 'Model'
  | 'Source';

export interface LineageNode {
  id: string;
  node_type: LineageNodeType;
  name: string;
  description?: string;
  metadata: Record<string, unknown>;
}

export type LineageEdgeType =
  | 'MetricToMeasure'
  | 'MeasureToEntity'
  | 'EntityToModel'
  | 'ModelToModel'
  | 'ModelToSource'
  | 'DimensionToEntity'
  | 'MetricToMetric';

export interface LineageEdge {
  id: string;
  source: string;
  target: string;
  edge_type: LineageEdgeType;
  label?: string;
}

export interface LineageGraph {
  nodes: LineageNode[];
  edges: LineageEdge[];
}

// =============================================================================
// Audit Types
// =============================================================================

export interface AuditResult {
  completeness_score: number;
  documentation_coverage: number;
  model_coverage: number;
  issues: AuditIssue[];
  summary: AuditSummary;
}

export interface AuditIssue {
  severity: IssueSeverity;
  issue_type: IssueType;
  message: string;
  node_id?: string;
  suggestion?: string;
}

export type IssueSeverity = 'Error' | 'Warning' | 'Info';

export type IssueType =
  | 'MissingDescription'
  | 'OrphanedModel'
  | 'OrphanedMetric'
  | 'MissingSource'
  | 'CircularDependency'
  | 'MissingMeasure'
  | 'UndocumentedColumn'
  | 'NoTests';

export interface AuditSummary {
  total_metrics: number;
  total_measures: number;
  total_models: number;
  total_sources: number;
  documented_metrics: number;
  documented_models: number;
  tested_models: number;
  orphaned_models: number;
}

// =============================================================================
// API Response Types
// =============================================================================

export interface ParseResult {
  success: boolean;
  dbt_project?: DbtProject;
  models: DbtModel[];
  sources: DbtSource[];
  semantic_models: SemanticModel[];
  metrics: Metric[];
  lineage: LineageGraph;
  audit: AuditResult;
  errors: string[];
  warnings: string[];
}

// =============================================================================
// React Flow Node Types (for visualization)
// =============================================================================

export interface LineageNodeData {
  label: string;
  nodeType: LineageNodeType;
  description?: string;
  metadata: Record<string, unknown>;
}
