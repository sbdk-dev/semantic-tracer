//! Core data types for the Semantic Layer Metrics Lineage Tracer

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// =============================================================================
// Project Configuration
// =============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectConfig {
    pub dbt_project_path: String,
    pub semantic_layer_path: Option<String>,
    pub semantic_layer_type: SemanticLayerType,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum SemanticLayerType {
    DbtSemanticLayer,
    Snowflake,
    None,
}

// =============================================================================
// dbt Project Types
// =============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DbtProject {
    pub name: String,
    pub version: Option<String>,
    pub config_version: Option<i32>,
    pub profile: Option<String>,
    pub model_paths: Vec<String>,
    pub seed_paths: Vec<String>,
    pub test_paths: Vec<String>,
    pub analysis_paths: Vec<String>,
    pub macro_paths: Vec<String>,
    pub target_path: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DbtModel {
    pub unique_id: String,
    pub name: String,
    pub schema: Option<String>,
    pub database: Option<String>,
    pub description: Option<String>,
    pub columns: Vec<DbtColumn>,
    pub depends_on: Vec<String>,
    pub refs: Vec<String>,
    pub sources: Vec<DbtSourceRef>,
    pub file_path: String,
    pub raw_sql: Option<String>,
    pub materialization: Option<String>,
    pub tags: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DbtColumn {
    pub name: String,
    pub description: Option<String>,
    pub data_type: Option<String>,
    pub meta: HashMap<String, serde_json::Value>,
    pub tests: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DbtSource {
    pub unique_id: String,
    pub source_name: String,
    pub name: String,
    pub schema: Option<String>,
    pub database: Option<String>,
    pub description: Option<String>,
    pub columns: Vec<DbtColumn>,
    pub loader: Option<String>,
    pub freshness: Option<DbtFreshness>,
    pub tags: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DbtSourceRef {
    pub source_name: String,
    pub table_name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DbtFreshness {
    pub warn_after: Option<DbtFreshnessRule>,
    pub error_after: Option<DbtFreshnessRule>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DbtFreshnessRule {
    pub count: i32,
    pub period: String,
}

// =============================================================================
// dbt Semantic Layer Types (MetricFlow)
// =============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SemanticModel {
    pub name: String,
    pub description: Option<String>,
    pub model: String, // ref to dbt model
    pub defaults: Option<SemanticModelDefaults>,
    pub entities: Vec<SemanticEntity>,
    pub measures: Vec<Measure>,
    pub dimensions: Vec<Dimension>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SemanticModelDefaults {
    pub agg_time_dimension: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SemanticEntity {
    pub name: String,
    pub entity_type: String, // primary, foreign, unique
    pub expr: Option<String>,
    pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Measure {
    pub name: String,
    pub agg: String, // sum, count, avg, min, max, count_distinct
    pub expr: Option<String>,
    pub description: Option<String>,
    pub create_metric: Option<bool>,
    pub non_additive_dimension: Option<NonAdditiveDimension>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NonAdditiveDimension {
    pub name: String,
    pub window_choice: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Dimension {
    pub name: String,
    pub dimension_type: String, // categorical, time
    pub expr: Option<String>,
    pub description: Option<String>,
    pub type_params: Option<DimensionTypeParams>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DimensionTypeParams {
    pub time_granularity: Option<String>,
    pub validity_params: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Metric {
    pub name: String,
    pub description: Option<String>,
    pub metric_type: String, // simple, derived, cumulative, conversion
    pub type_params: MetricTypeParams,
    pub filter: Option<String>,
    pub label: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricTypeParams {
    pub measure: Option<MeasureRef>,
    pub expr: Option<String>,
    pub metrics: Option<Vec<MetricRef>>,
    pub window: Option<String>,
    pub grain_to_date: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MeasureRef {
    pub name: String,
    pub filter: Option<String>,
    pub alias: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricRef {
    pub name: String,
    pub offset_window: Option<String>,
    pub offset_to_grain: Option<String>,
}

// =============================================================================
// Snowflake Semantic Layer Types
// =============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SnowflakeSemanticLayer {
    pub tables: Vec<SnowflakeTable>,
    pub metrics: Vec<SnowflakeMetric>,
    pub dimensions: Vec<SnowflakeDimension>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SnowflakeTable {
    pub name: String,
    pub database: String,
    pub schema: String,
    pub table_name: String,
    pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SnowflakeMetric {
    pub name: String,
    pub table: String,
    pub expression: String,
    pub description: Option<String>,
    pub label: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SnowflakeDimension {
    pub name: String,
    pub table: String,
    pub expression: String,
    pub description: Option<String>,
    pub dimension_type: Option<String>,
}

// =============================================================================
// Lineage Graph Types
// =============================================================================

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum LineageNodeType {
    Metric,
    Measure,
    Dimension,
    Entity,
    Model,
    Source,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LineageNode {
    pub id: String,
    pub node_type: LineageNodeType,
    pub name: String,
    pub description: Option<String>,
    pub metadata: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum LineageEdgeType {
    MetricToMeasure,
    MeasureToEntity,
    EntityToModel,
    ModelToModel,
    ModelToSource,
    DimensionToEntity,
    MetricToMetric, // for derived metrics
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LineageEdge {
    pub id: String,
    pub source: String,
    pub target: String,
    pub edge_type: LineageEdgeType,
    pub label: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LineageGraph {
    pub nodes: Vec<LineageNode>,
    pub edges: Vec<LineageEdge>,
}

// =============================================================================
// Audit Types
// =============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditResult {
    pub completeness_score: f64,
    pub documentation_coverage: f64,
    pub model_coverage: f64,
    pub issues: Vec<AuditIssue>,
    pub summary: AuditSummary,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditIssue {
    pub severity: IssueSeverity,
    pub issue_type: IssueType,
    pub message: String,
    pub node_id: Option<String>,
    pub suggestion: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum IssueSeverity {
    Error,
    Warning,
    Info,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum IssueType {
    MissingDescription,
    OrphanedModel,
    OrphanedMetric,
    MissingSource,
    CircularDependency,
    MissingMeasure,
    UndocumentedColumn,
    NoTests,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditSummary {
    pub total_metrics: usize,
    pub total_measures: usize,
    pub total_models: usize,
    pub total_sources: usize,
    pub documented_metrics: usize,
    pub documented_models: usize,
    pub tested_models: usize,
    pub orphaned_models: usize,
}

// =============================================================================
// API Response Types
// =============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParseResult {
    pub success: bool,
    pub dbt_project: Option<DbtProject>,
    pub models: Vec<DbtModel>,
    pub sources: Vec<DbtSource>,
    pub semantic_models: Vec<SemanticModel>,
    pub metrics: Vec<Metric>,
    pub lineage: LineageGraph,
    pub audit: AuditResult,
    pub errors: Vec<String>,
    pub warnings: Vec<String>,
}

impl Default for ParseResult {
    fn default() -> Self {
        Self {
            success: false,
            dbt_project: None,
            models: Vec::new(),
            sources: Vec::new(),
            semantic_models: Vec::new(),
            metrics: Vec::new(),
            lineage: LineageGraph {
                nodes: Vec::new(),
                edges: Vec::new(),
            },
            audit: AuditResult {
                completeness_score: 0.0,
                documentation_coverage: 0.0,
                model_coverage: 0.0,
                issues: Vec::new(),
                summary: AuditSummary {
                    total_metrics: 0,
                    total_measures: 0,
                    total_models: 0,
                    total_sources: 0,
                    documented_metrics: 0,
                    documented_models: 0,
                    tested_models: 0,
                    orphaned_models: 0,
                },
            },
            errors: Vec::new(),
            warnings: Vec::new(),
        }
    }
}
