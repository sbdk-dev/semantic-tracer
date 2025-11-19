//! Lineage analysis and audit functionality

use crate::types::{
    AuditIssue, AuditResult, AuditSummary, DbtModel, DbtSource, IssueSeverity, IssueType,
    LineageGraph, LineageNodeType, Metric, SemanticModel,
};
use std::collections::HashSet;

pub struct LineageAnalyzer;

impl LineageAnalyzer {
    pub fn new() -> Self {
        Self
    }

    /// Analyze the lineage graph and generate audit results
    pub fn analyze(
        &self,
        graph: &LineageGraph,
        models: &[DbtModel],
        sources: &[DbtSource],
        semantic_models: &[SemanticModel],
        metrics: &[Metric],
    ) -> AuditResult {
        let mut issues = Vec::new();

        // Check for missing descriptions
        issues.extend(self.check_missing_descriptions(graph));

        // Check for orphaned models
        issues.extend(self.check_orphaned_models(graph, models));

        // Check for orphaned metrics
        issues.extend(self.check_orphaned_metrics(graph, metrics));

        // Check for missing sources
        issues.extend(self.check_missing_sources(models, sources));

        // Check for undocumented columns
        issues.extend(self.check_undocumented_columns(models));

        // Check for models without tests
        issues.extend(self.check_models_without_tests(models));

        // Calculate summary
        let summary = self.calculate_summary(models, sources, semantic_models, metrics, &issues);

        // Calculate scores
        let completeness_score = self.calculate_completeness_score(graph, metrics, semantic_models);
        let documentation_coverage = self.calculate_documentation_coverage(graph);
        let model_coverage = self.calculate_model_coverage(models, semantic_models);

        AuditResult {
            completeness_score,
            documentation_coverage,
            model_coverage,
            issues,
            summary,
        }
    }

    fn check_missing_descriptions(&self, graph: &LineageGraph) -> Vec<AuditIssue> {
        graph
            .nodes
            .iter()
            .filter(|node| node.description.is_none())
            .map(|node| AuditIssue {
                severity: match node.node_type {
                    LineageNodeType::Metric => IssueSeverity::Warning,
                    LineageNodeType::Model => IssueSeverity::Warning,
                    _ => IssueSeverity::Info,
                },
                issue_type: IssueType::MissingDescription,
                message: format!("{:?} '{}' is missing a description", node.node_type, node.name),
                node_id: Some(node.id.clone()),
                suggestion: Some(format!(
                    "Add a description to help users understand what '{}' represents",
                    node.name
                )),
            })
            .collect()
    }

    fn check_orphaned_models(&self, graph: &LineageGraph, models: &[DbtModel]) -> Vec<AuditIssue> {
        // Find models that are not referenced by any semantic model
        let model_nodes: HashSet<_> = graph
            .nodes
            .iter()
            .filter(|n| n.node_type == LineageNodeType::Model)
            .map(|n| n.name.as_str())
            .collect();

        let referenced_models: HashSet<_> = graph
            .edges
            .iter()
            .filter_map(|e| {
                graph
                    .nodes
                    .iter()
                    .find(|n| n.id == e.target && n.node_type == LineageNodeType::Model)
                    .map(|n| n.name.as_str())
            })
            .collect();

        models
            .iter()
            .filter(|m| !referenced_models.contains(m.name.as_str()))
            .map(|m| AuditIssue {
                severity: IssueSeverity::Info,
                issue_type: IssueType::OrphanedModel,
                message: format!("Model '{}' is not used by any semantic model or other model", m.name),
                node_id: graph
                    .nodes
                    .iter()
                    .find(|n| n.name == m.name && n.node_type == LineageNodeType::Model)
                    .map(|n| n.id.clone()),
                suggestion: Some("Consider removing unused models or documenting their purpose".to_string()),
            })
            .collect()
    }

    fn check_orphaned_metrics(&self, graph: &LineageGraph, metrics: &[Metric]) -> Vec<AuditIssue> {
        // Find metrics without connections
        let metric_node_ids: HashSet<_> = graph
            .nodes
            .iter()
            .filter(|n| n.node_type == LineageNodeType::Metric)
            .map(|n| &n.id)
            .collect();

        let connected_metrics: HashSet<_> = graph
            .edges
            .iter()
            .filter(|e| metric_node_ids.contains(&e.source))
            .map(|e| &e.source)
            .collect();

        graph
            .nodes
            .iter()
            .filter(|n| n.node_type == LineageNodeType::Metric && !connected_metrics.contains(&n.id))
            .map(|n| AuditIssue {
                severity: IssueSeverity::Error,
                issue_type: IssueType::OrphanedMetric,
                message: format!("Metric '{}' has no connection to any measure", n.name),
                node_id: Some(n.id.clone()),
                suggestion: Some("Check the metric definition - it may be missing a measure reference".to_string()),
            })
            .collect()
    }

    fn check_missing_sources(&self, models: &[DbtModel], sources: &[DbtSource]) -> Vec<AuditIssue> {
        let source_names: HashSet<_> = sources
            .iter()
            .map(|s| format!("{}.{}", s.source_name, s.name))
            .collect();

        let mut issues = Vec::new();

        for model in models {
            for source_ref in &model.sources {
                let key = format!("{}.{}", source_ref.source_name, source_ref.table_name);
                if !source_names.contains(&key) {
                    issues.push(AuditIssue {
                        severity: IssueSeverity::Error,
                        issue_type: IssueType::MissingSource,
                        message: format!(
                            "Model '{}' references undefined source '{}'",
                            model.name, key
                        ),
                        node_id: None,
                        suggestion: Some(format!(
                            "Define source '{}' in a schema.yml file",
                            key
                        )),
                    });
                }
            }
        }

        issues
    }

    fn check_undocumented_columns(&self, models: &[DbtModel]) -> Vec<AuditIssue> {
        models
            .iter()
            .flat_map(|model| {
                model
                    .columns
                    .iter()
                    .filter(|col| col.description.is_none())
                    .map(move |col| AuditIssue {
                        severity: IssueSeverity::Info,
                        issue_type: IssueType::UndocumentedColumn,
                        message: format!(
                            "Column '{}' in model '{}' is not documented",
                            col.name, model.name
                        ),
                        node_id: None,
                        suggestion: Some("Add a description to help users understand this column".to_string()),
                    })
            })
            .collect()
    }

    fn check_models_without_tests(&self, models: &[DbtModel]) -> Vec<AuditIssue> {
        models
            .iter()
            .filter(|m| {
                m.columns.iter().all(|c| c.tests.is_empty())
            })
            .map(|m| AuditIssue {
                severity: IssueSeverity::Warning,
                issue_type: IssueType::NoTests,
                message: format!("Model '{}' has no tests defined", m.name),
                node_id: None,
                suggestion: Some("Add tests for key columns (unique, not_null, accepted_values)".to_string()),
            })
            .collect()
    }

    fn calculate_summary(
        &self,
        models: &[DbtModel],
        sources: &[DbtSource],
        semantic_models: &[SemanticModel],
        metrics: &[Metric],
        issues: &[AuditIssue],
    ) -> AuditSummary {
        let total_measures: usize = semantic_models.iter().map(|sm| sm.measures.len()).sum();

        let documented_metrics = metrics
            .iter()
            .filter(|m| m.description.is_some())
            .count();

        let documented_models = models
            .iter()
            .filter(|m| m.description.is_some())
            .count();

        let tested_models = models
            .iter()
            .filter(|m| m.columns.iter().any(|c| !c.tests.is_empty()))
            .count();

        let orphaned_models = issues
            .iter()
            .filter(|i| matches!(i.issue_type, IssueType::OrphanedModel))
            .count();

        AuditSummary {
            total_metrics: metrics.len(),
            total_measures,
            total_models: models.len(),
            total_sources: sources.len(),
            documented_metrics,
            documented_models,
            tested_models,
            orphaned_models,
        }
    }

    fn calculate_completeness_score(
        &self,
        graph: &LineageGraph,
        metrics: &[Metric],
        semantic_models: &[SemanticModel],
    ) -> f64 {
        if metrics.is_empty() {
            return 100.0;
        }

        // A metric is complete if it has a full lineage path to a source
        let metric_nodes: Vec<_> = graph
            .nodes
            .iter()
            .filter(|n| n.node_type == LineageNodeType::Metric)
            .collect();

        let complete_metrics = metric_nodes
            .iter()
            .filter(|m| self.has_complete_lineage(graph, &m.id))
            .count();

        (complete_metrics as f64 / metric_nodes.len() as f64) * 100.0
    }

    fn has_complete_lineage(&self, graph: &LineageGraph, start_id: &str) -> bool {
        // BFS to find if there's a path to a source
        let mut visited = HashSet::new();
        let mut queue = vec![start_id.to_string()];

        while let Some(current) = queue.pop() {
            if visited.contains(&current) {
                continue;
            }
            visited.insert(current.clone());

            // Check if current node is a source
            if let Some(node) = graph.nodes.iter().find(|n| n.id == current) {
                if node.node_type == LineageNodeType::Source {
                    return true;
                }
            }

            // Add connected nodes
            for edge in &graph.edges {
                if edge.source == current && !visited.contains(&edge.target) {
                    queue.push(edge.target.clone());
                }
            }
        }

        false
    }

    fn calculate_documentation_coverage(&self, graph: &LineageGraph) -> f64 {
        if graph.nodes.is_empty() {
            return 100.0;
        }

        let documented = graph
            .nodes
            .iter()
            .filter(|n| n.description.is_some())
            .count();

        (documented as f64 / graph.nodes.len() as f64) * 100.0
    }

    fn calculate_model_coverage(&self, models: &[DbtModel], semantic_models: &[SemanticModel]) -> f64 {
        if models.is_empty() {
            return 100.0;
        }

        let referenced_models: HashSet<_> = semantic_models
            .iter()
            .map(|sm| sm.model.as_str())
            .collect();

        let used_models = models
            .iter()
            .filter(|m| referenced_models.contains(m.name.as_str()))
            .count();

        (used_models as f64 / models.len() as f64) * 100.0
    }
}

impl Default for LineageAnalyzer {
    fn default() -> Self {
        Self::new()
    }
}
