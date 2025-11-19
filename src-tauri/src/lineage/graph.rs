//! Lineage graph construction from parsed dbt and semantic layer data

use crate::types::{
    DbtModel, DbtSource, LineageEdge, LineageEdgeType, LineageGraph, LineageNode, LineageNodeType,
    Measure, Metric, SemanticModel,
};
use std::collections::{HashMap, HashSet};
use uuid::Uuid;

pub struct LineageBuilder {
    nodes: Vec<LineageNode>,
    edges: Vec<LineageEdge>,
    node_ids: HashMap<String, String>, // name -> id mapping
}

impl LineageBuilder {
    pub fn new() -> Self {
        Self {
            nodes: Vec::new(),
            edges: Vec::new(),
            node_ids: HashMap::new(),
        }
    }

    /// Build a complete lineage graph from all parsed data
    pub fn build(
        mut self,
        models: &[DbtModel],
        sources: &[DbtSource],
        semantic_models: &[SemanticModel],
        metrics: &[Metric],
    ) -> LineageGraph {
        // 1. Add source nodes first (bottom of the graph)
        for source in sources {
            self.add_source_node(source);
        }

        // 2. Add model nodes and their dependencies
        for model in models {
            self.add_model_node(model);
        }

        // 3. Add model-to-model and model-to-source edges
        for model in models {
            self.add_model_edges(model);
        }

        // 4. Add semantic model entities and measures
        for sm in semantic_models {
            self.add_semantic_model_nodes(sm);
        }

        // 5. Add metric nodes
        for metric in metrics {
            self.add_metric_node(metric);
        }

        // 6. Add metric edges
        for metric in metrics {
            self.add_metric_edges(metric, semantic_models);
        }

        LineageGraph {
            nodes: self.nodes,
            edges: self.edges,
        }
    }

    fn add_source_node(&mut self, source: &DbtSource) {
        let id = Uuid::new_v4().to_string();
        let key = format!("source.{}.{}", source.source_name, source.name);

        let mut metadata = HashMap::new();
        if let Some(ref schema) = source.schema {
            metadata.insert("schema".to_string(), serde_json::json!(schema));
        }
        if let Some(ref database) = source.database {
            metadata.insert("database".to_string(), serde_json::json!(database));
        }
        metadata.insert("source_name".to_string(), serde_json::json!(source.source_name));
        metadata.insert("columns".to_string(), serde_json::json!(source.columns.len()));

        self.nodes.push(LineageNode {
            id: id.clone(),
            node_type: LineageNodeType::Source,
            name: source.name.clone(),
            description: source.description.clone(),
            metadata,
        });

        self.node_ids.insert(key, id);
    }

    fn add_model_node(&mut self, model: &DbtModel) {
        let id = Uuid::new_v4().to_string();
        let key = format!("model.{}", model.name);

        let mut metadata = HashMap::new();
        if let Some(ref mat) = model.materialization {
            metadata.insert("materialization".to_string(), serde_json::json!(mat));
        }
        metadata.insert("file_path".to_string(), serde_json::json!(model.file_path));
        metadata.insert("columns".to_string(), serde_json::json!(model.columns.len()));
        metadata.insert("tags".to_string(), serde_json::json!(model.tags));

        self.nodes.push(LineageNode {
            id: id.clone(),
            node_type: LineageNodeType::Model,
            name: model.name.clone(),
            description: model.description.clone(),
            metadata,
        });

        self.node_ids.insert(key, id);
    }

    fn add_model_edges(&mut self, model: &DbtModel) {
        let model_key = format!("model.{}", model.name);
        let Some(model_id) = self.node_ids.get(&model_key).cloned() else {
            return;
        };

        // Add edges to referenced models
        for ref_name in &model.refs {
            let ref_key = format!("model.{}", ref_name);
            if let Some(ref_id) = self.node_ids.get(&ref_key).cloned() {
                self.edges.push(LineageEdge {
                    id: Uuid::new_v4().to_string(),
                    source: model_id.clone(),
                    target: ref_id,
                    edge_type: LineageEdgeType::ModelToModel,
                    label: Some("ref".to_string()),
                });
            }
        }

        // Add edges to sources
        for source_ref in &model.sources {
            let source_key = format!("source.{}.{}", source_ref.source_name, source_ref.table_name);
            if let Some(source_id) = self.node_ids.get(&source_key).cloned() {
                self.edges.push(LineageEdge {
                    id: Uuid::new_v4().to_string(),
                    source: model_id.clone(),
                    target: source_id,
                    edge_type: LineageEdgeType::ModelToSource,
                    label: Some("source".to_string()),
                });
            }
        }
    }

    fn add_semantic_model_nodes(&mut self, sm: &SemanticModel) {
        // Add entity nodes
        for entity in &sm.entities {
            let id = Uuid::new_v4().to_string();
            let key = format!("entity.{}.{}", sm.name, entity.name);

            let mut metadata = HashMap::new();
            metadata.insert("entity_type".to_string(), serde_json::json!(entity.entity_type));
            metadata.insert("semantic_model".to_string(), serde_json::json!(sm.name));
            if let Some(ref expr) = entity.expr {
                metadata.insert("expr".to_string(), serde_json::json!(expr));
            }

            self.nodes.push(LineageNode {
                id: id.clone(),
                node_type: LineageNodeType::Entity,
                name: entity.name.clone(),
                description: entity.description.clone(),
                metadata,
            });

            self.node_ids.insert(key.clone(), id.clone());

            // Add edge from entity to model
            let model_key = format!("model.{}", sm.model);
            if let Some(model_id) = self.node_ids.get(&model_key).cloned() {
                self.edges.push(LineageEdge {
                    id: Uuid::new_v4().to_string(),
                    source: id,
                    target: model_id,
                    edge_type: LineageEdgeType::EntityToModel,
                    label: None,
                });
            }
        }

        // Add measure nodes
        for measure in &sm.measures {
            let id = Uuid::new_v4().to_string();
            let key = format!("measure.{}.{}", sm.name, measure.name);

            let mut metadata = HashMap::new();
            metadata.insert("agg".to_string(), serde_json::json!(measure.agg));
            metadata.insert("semantic_model".to_string(), serde_json::json!(sm.name));
            if let Some(ref expr) = measure.expr {
                metadata.insert("expr".to_string(), serde_json::json!(expr));
            }
            if let Some(create_metric) = measure.create_metric {
                metadata.insert("create_metric".to_string(), serde_json::json!(create_metric));
            }

            self.nodes.push(LineageNode {
                id: id.clone(),
                node_type: LineageNodeType::Measure,
                name: measure.name.clone(),
                description: measure.description.clone(),
                metadata,
            });

            self.node_ids.insert(key.clone(), id.clone());

            // Add edge from measure to primary entity
            let primary_entity = sm.entities.iter().find(|e| e.entity_type == "primary");
            if let Some(entity) = primary_entity {
                let entity_key = format!("entity.{}.{}", sm.name, entity.name);
                if let Some(entity_id) = self.node_ids.get(&entity_key).cloned() {
                    self.edges.push(LineageEdge {
                        id: Uuid::new_v4().to_string(),
                        source: id,
                        target: entity_id,
                        edge_type: LineageEdgeType::MeasureToEntity,
                        label: None,
                    });
                }
            }
        }

        // Add dimension nodes
        for dim in &sm.dimensions {
            let id = Uuid::new_v4().to_string();
            let key = format!("dimension.{}.{}", sm.name, dim.name);

            let mut metadata = HashMap::new();
            metadata.insert("dimension_type".to_string(), serde_json::json!(dim.dimension_type));
            metadata.insert("semantic_model".to_string(), serde_json::json!(sm.name));
            if let Some(ref expr) = dim.expr {
                metadata.insert("expr".to_string(), serde_json::json!(expr));
            }

            self.nodes.push(LineageNode {
                id: id.clone(),
                node_type: LineageNodeType::Dimension,
                name: dim.name.clone(),
                description: dim.description.clone(),
                metadata,
            });

            self.node_ids.insert(key, id.clone());

            // Add edge from dimension to primary entity
            let primary_entity = sm.entities.iter().find(|e| e.entity_type == "primary");
            if let Some(entity) = primary_entity {
                let entity_key = format!("entity.{}.{}", sm.name, entity.name);
                if let Some(entity_id) = self.node_ids.get(&entity_key).cloned() {
                    self.edges.push(LineageEdge {
                        id: Uuid::new_v4().to_string(),
                        source: id,
                        target: entity_id,
                        edge_type: LineageEdgeType::DimensionToEntity,
                        label: None,
                    });
                }
            }
        }
    }

    fn add_metric_node(&mut self, metric: &Metric) {
        let id = Uuid::new_v4().to_string();
        let key = format!("metric.{}", metric.name);

        let mut metadata = HashMap::new();
        metadata.insert("metric_type".to_string(), serde_json::json!(metric.metric_type));
        if let Some(ref filter) = metric.filter {
            metadata.insert("filter".to_string(), serde_json::json!(filter));
        }
        if let Some(ref label) = metric.label {
            metadata.insert("label".to_string(), serde_json::json!(label));
        }

        self.nodes.push(LineageNode {
            id: id.clone(),
            node_type: LineageNodeType::Metric,
            name: metric.name.clone(),
            description: metric.description.clone(),
            metadata,
        });

        self.node_ids.insert(key, id);
    }

    fn add_metric_edges(&mut self, metric: &Metric, semantic_models: &[SemanticModel]) {
        let metric_key = format!("metric.{}", metric.name);
        let Some(metric_id) = self.node_ids.get(&metric_key).cloned() else {
            return;
        };

        match metric.metric_type.as_str() {
            "simple" | "cumulative" => {
                // Link to measure
                if let Some(ref measure_ref) = metric.type_params.measure {
                    // Find which semantic model has this measure
                    for sm in semantic_models {
                        let measure_key = format!("measure.{}.{}", sm.name, measure_ref.name);
                        if let Some(measure_id) = self.node_ids.get(&measure_key).cloned() {
                            self.edges.push(LineageEdge {
                                id: Uuid::new_v4().to_string(),
                                source: metric_id.clone(),
                                target: measure_id,
                                edge_type: LineageEdgeType::MetricToMeasure,
                                label: None,
                            });
                            break;
                        }
                    }
                }
            }
            "derived" => {
                // Link to other metrics
                if let Some(ref metric_refs) = metric.type_params.metrics {
                    for metric_ref in metric_refs {
                        let ref_key = format!("metric.{}", metric_ref.name);
                        if let Some(ref_id) = self.node_ids.get(&ref_key).cloned() {
                            self.edges.push(LineageEdge {
                                id: Uuid::new_v4().to_string(),
                                source: metric_id.clone(),
                                target: ref_id,
                                edge_type: LineageEdgeType::MetricToMetric,
                                label: metric_ref.offset_window.clone(),
                            });
                        }
                    }
                }
            }
            _ => {}
        }
    }
}

impl Default for LineageBuilder {
    fn default() -> Self {
        Self::new()
    }
}
