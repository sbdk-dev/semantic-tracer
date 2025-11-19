//! Tauri IPC commands for the Semantic Layer Metrics Lineage Tracer

use crate::lineage::{LineageAnalyzer, LineageBuilder};
use crate::parsers::{DbtProjectParser, DbtSemanticLayerParser};
use crate::types::{ParseResult, ProjectConfig, SemanticLayerType};
use std::path::Path;

/// Load and parse a dbt project with its semantic layer
#[tauri::command]
pub async fn parse_project(config: ProjectConfig) -> Result<ParseResult, String> {
    let mut result = ParseResult::default();

    // Validate project path exists
    let project_path = Path::new(&config.dbt_project_path);
    if !project_path.exists() {
        return Err(format!("Project path does not exist: {}", config.dbt_project_path));
    }

    // Parse dbt project
    let dbt_parser = DbtProjectParser::new(&config.dbt_project_path);

    let project = match dbt_parser.parse_project() {
        Ok(p) => {
            result.dbt_project = Some(p.clone());
            p
        }
        Err(e) => {
            result.errors.push(format!("Failed to parse dbt_project.yml: {}", e));
            return Ok(result);
        }
    };

    // Parse models
    match dbt_parser.parse_models(&project) {
        Ok(models) => {
            log::info!("Parsed {} models", models.len());
            result.models = models;
        }
        Err(e) => {
            result.warnings.push(format!("Failed to parse some models: {}", e));
        }
    }

    // Parse sources
    match dbt_parser.parse_sources(&project) {
        Ok(sources) => {
            log::info!("Parsed {} sources", sources.len());
            result.sources = sources;
        }
        Err(e) => {
            result.warnings.push(format!("Failed to parse some sources: {}", e));
        }
    }

    // Parse semantic layer based on type
    match config.semantic_layer_type {
        SemanticLayerType::DbtSemanticLayer => {
            let semantic_parser = DbtSemanticLayerParser::new(&config.dbt_project_path);
            match semantic_parser.parse() {
                Ok((semantic_models, metrics)) => {
                    log::info!(
                        "Parsed {} semantic models and {} metrics",
                        semantic_models.len(),
                        metrics.len()
                    );
                    result.semantic_models = semantic_models;
                    result.metrics = metrics;
                }
                Err(e) => {
                    result.warnings.push(format!("Failed to parse semantic layer: {}", e));
                }
            }
        }
        SemanticLayerType::Snowflake => {
            if let Some(ref semantic_path) = config.semantic_layer_path {
                let snowflake_parser = crate::parsers::SnowflakeSemanticLayerParser::new();
                match snowflake_parser.parse(semantic_path) {
                    Ok(snowflake_layer) => {
                        // Convert Snowflake types to common types
                        // For now, just log success
                        log::info!(
                            "Parsed Snowflake semantic layer: {} tables, {} metrics",
                            snowflake_layer.tables.len(),
                            snowflake_layer.metrics.len()
                        );
                        result.warnings.push(
                            "Snowflake semantic layer parsing is basic - full support coming soon".to_string()
                        );
                    }
                    Err(e) => {
                        result.warnings.push(format!("Failed to parse Snowflake semantic layer: {}", e));
                    }
                }
            } else {
                result.warnings.push("Snowflake semantic layer path not provided".to_string());
            }
        }
        SemanticLayerType::None => {
            log::info!("No semantic layer type specified, skipping semantic layer parsing");
        }
    }

    // Build lineage graph
    let lineage_builder = LineageBuilder::new();
    result.lineage = lineage_builder.build(
        &result.models,
        &result.sources,
        &result.semantic_models,
        &result.metrics,
    );
    log::info!(
        "Built lineage graph with {} nodes and {} edges",
        result.lineage.nodes.len(),
        result.lineage.edges.len()
    );

    // Run audit analysis
    let analyzer = LineageAnalyzer::new();
    result.audit = analyzer.analyze(
        &result.lineage,
        &result.models,
        &result.sources,
        &result.semantic_models,
        &result.metrics,
    );
    log::info!(
        "Audit complete: {:.1}% completeness, {} issues found",
        result.audit.completeness_score,
        result.audit.issues.len()
    );

    result.success = result.errors.is_empty();
    Ok(result)
}

/// Get lineage for a specific metric (upstream dependencies)
#[tauri::command]
pub async fn get_metric_lineage(
    parse_result: ParseResult,
    metric_name: String,
) -> Result<ParseResult, String> {
    // Find the metric node
    let metric_node = parse_result
        .lineage
        .nodes
        .iter()
        .find(|n| n.name == metric_name && n.node_type == crate::types::LineageNodeType::Metric)
        .ok_or_else(|| format!("Metric '{}' not found", metric_name))?;

    // BFS to find all upstream nodes
    let mut visited = std::collections::HashSet::new();
    let mut queue = vec![metric_node.id.clone()];
    let mut relevant_node_ids = std::collections::HashSet::new();

    while let Some(current) = queue.pop() {
        if visited.contains(&current) {
            continue;
        }
        visited.insert(current.clone());
        relevant_node_ids.insert(current.clone());

        // Find edges where this node is the source
        for edge in &parse_result.lineage.edges {
            if edge.source == current && !visited.contains(&edge.target) {
                queue.push(edge.target.clone());
            }
        }
    }

    // Filter graph to only include relevant nodes and edges
    let mut filtered_result = ParseResult::default();
    filtered_result.success = true;
    filtered_result.lineage.nodes = parse_result
        .lineage
        .nodes
        .into_iter()
        .filter(|n| relevant_node_ids.contains(&n.id))
        .collect();

    filtered_result.lineage.edges = parse_result
        .lineage
        .edges
        .into_iter()
        .filter(|e| relevant_node_ids.contains(&e.source) && relevant_node_ids.contains(&e.target))
        .collect();

    Ok(filtered_result)
}

/// Get impact analysis for a model or source (downstream dependencies)
#[tauri::command]
pub async fn get_impact_analysis(
    parse_result: ParseResult,
    node_name: String,
) -> Result<ParseResult, String> {
    // Find the node
    let target_node = parse_result
        .lineage
        .nodes
        .iter()
        .find(|n| n.name == node_name)
        .ok_or_else(|| format!("Node '{}' not found", node_name))?;

    // Reverse BFS to find all downstream nodes (nodes that depend on this one)
    let mut visited = std::collections::HashSet::new();
    let mut queue = vec![target_node.id.clone()];
    let mut relevant_node_ids = std::collections::HashSet::new();

    while let Some(current) = queue.pop() {
        if visited.contains(&current) {
            continue;
        }
        visited.insert(current.clone());
        relevant_node_ids.insert(current.clone());

        // Find edges where this node is the target (reverse direction)
        for edge in &parse_result.lineage.edges {
            if edge.target == current && !visited.contains(&edge.source) {
                queue.push(edge.source.clone());
            }
        }
    }

    // Filter graph to only include relevant nodes and edges
    let mut filtered_result = ParseResult::default();
    filtered_result.success = true;
    filtered_result.lineage.nodes = parse_result
        .lineage
        .nodes
        .into_iter()
        .filter(|n| relevant_node_ids.contains(&n.id))
        .collect();

    filtered_result.lineage.edges = parse_result
        .lineage
        .edges
        .into_iter()
        .filter(|e| relevant_node_ids.contains(&e.source) && relevant_node_ids.contains(&e.target))
        .collect();

    Ok(filtered_result)
}

/// Search for nodes by name
#[tauri::command]
pub fn search_nodes(
    parse_result: ParseResult,
    query: String,
) -> Vec<crate::types::LineageNode> {
    let query_lower = query.to_lowercase();

    parse_result
        .lineage
        .nodes
        .into_iter()
        .filter(|n| {
            n.name.to_lowercase().contains(&query_lower)
                || n.description
                    .as_ref()
                    .map(|d| d.to_lowercase().contains(&query_lower))
                    .unwrap_or(false)
        })
        .collect()
}
