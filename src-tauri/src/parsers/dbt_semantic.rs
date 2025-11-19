//! Parser for dbt Semantic Layer (MetricFlow) configurations

use crate::types::{
    Dimension, DimensionTypeParams, Measure, MeasureRef, Metric, MetricRef, MetricTypeParams,
    NonAdditiveDimension, SemanticEntity, SemanticModel, SemanticModelDefaults,
};
use anyhow::{Context, Result};
use std::fs;
use std::path::{Path, PathBuf};
use walkdir::WalkDir;

pub struct DbtSemanticLayerParser {
    project_path: PathBuf,
}

impl DbtSemanticLayerParser {
    pub fn new(project_path: impl AsRef<Path>) -> Self {
        Self {
            project_path: project_path.as_ref().to_path_buf(),
        }
    }

    /// Parse all semantic models and metrics from the project
    pub fn parse(&self) -> Result<(Vec<SemanticModel>, Vec<Metric>)> {
        let mut semantic_models = Vec::new();
        let mut metrics = Vec::new();

        // Look for semantic layer files in models directory
        let models_path = self.project_path.join("models");
        if models_path.exists() {
            self.scan_directory(&models_path, &mut semantic_models, &mut metrics)?;
        }

        // Also check for dedicated semantic_models directory
        let semantic_path = self.project_path.join("semantic_models");
        if semantic_path.exists() {
            self.scan_directory(&semantic_path, &mut semantic_models, &mut metrics)?;
        }

        // Check for metrics directory
        let metrics_path = self.project_path.join("metrics");
        if metrics_path.exists() {
            self.scan_directory(&metrics_path, &mut semantic_models, &mut metrics)?;
        }

        Ok((semantic_models, metrics))
    }

    fn scan_directory(
        &self,
        path: &Path,
        semantic_models: &mut Vec<SemanticModel>,
        metrics: &mut Vec<Metric>,
    ) -> Result<()> {
        for entry in WalkDir::new(path)
            .into_iter()
            .filter_map(|e| e.ok())
            .filter(|e| {
                e.path()
                    .extension()
                    .map_or(false, |ext| ext == "yml" || ext == "yaml")
            })
        {
            let content = fs::read_to_string(entry.path())
                .with_context(|| format!("Failed to read {:?}", entry.path()))?;

            if let Ok(yaml) = serde_yaml::from_str::<serde_yaml::Value>(&content) {
                // Parse semantic_models section
                if let Some(models) = yaml["semantic_models"].as_sequence() {
                    for model in models {
                        if let Ok(sm) = self.parse_semantic_model(model) {
                            semantic_models.push(sm);
                        }
                    }
                }

                // Parse metrics section
                if let Some(metric_list) = yaml["metrics"].as_sequence() {
                    for metric in metric_list {
                        if let Ok(m) = self.parse_metric(metric) {
                            metrics.push(m);
                        }
                    }
                }
            }
        }

        Ok(())
    }

    fn parse_semantic_model(&self, yaml: &serde_yaml::Value) -> Result<SemanticModel> {
        let name = yaml["name"]
            .as_str()
            .context("Semantic model missing name")?
            .to_string();

        let model = yaml["model"]
            .as_str()
            .map(|s| {
                // Strip ref() if present
                if s.starts_with("ref(") && s.ends_with(")") {
                    s[4..s.len() - 1]
                        .trim()
                        .trim_matches('\'')
                        .trim_matches('"')
                        .to_string()
                } else {
                    s.to_string()
                }
            })
            .context("Semantic model missing model reference")?;

        Ok(SemanticModel {
            name,
            description: yaml["description"].as_str().map(|s| s.to_string()),
            model,
            defaults: self.parse_defaults(&yaml["defaults"]),
            entities: self.parse_entities(&yaml["entities"]),
            measures: self.parse_measures(&yaml["measures"]),
            dimensions: self.parse_dimensions(&yaml["dimensions"]),
        })
    }

    fn parse_defaults(&self, yaml: &serde_yaml::Value) -> Option<SemanticModelDefaults> {
        if yaml.is_null() {
            return None;
        }

        Some(SemanticModelDefaults {
            agg_time_dimension: yaml["agg_time_dimension"].as_str().map(|s| s.to_string()),
        })
    }

    fn parse_entities(&self, yaml: &serde_yaml::Value) -> Vec<SemanticEntity> {
        yaml.as_sequence()
            .map(|entities| {
                entities
                    .iter()
                    .filter_map(|e| {
                        Some(SemanticEntity {
                            name: e["name"].as_str()?.to_string(),
                            entity_type: e["type"].as_str().unwrap_or("primary").to_string(),
                            expr: e["expr"].as_str().map(|s| s.to_string()),
                            description: e["description"].as_str().map(|s| s.to_string()),
                        })
                    })
                    .collect()
            })
            .unwrap_or_default()
    }

    fn parse_measures(&self, yaml: &serde_yaml::Value) -> Vec<Measure> {
        yaml.as_sequence()
            .map(|measures| {
                measures
                    .iter()
                    .filter_map(|m| {
                        Some(Measure {
                            name: m["name"].as_str()?.to_string(),
                            agg: m["agg"].as_str().unwrap_or("sum").to_string(),
                            expr: m["expr"].as_str().map(|s| s.to_string()),
                            description: m["description"].as_str().map(|s| s.to_string()),
                            create_metric: m["create_metric"].as_bool(),
                            non_additive_dimension: self.parse_non_additive(&m["non_additive_dimension"]),
                        })
                    })
                    .collect()
            })
            .unwrap_or_default()
    }

    fn parse_non_additive(&self, yaml: &serde_yaml::Value) -> Option<NonAdditiveDimension> {
        if yaml.is_null() {
            return None;
        }

        Some(NonAdditiveDimension {
            name: yaml["name"].as_str()?.to_string(),
            window_choice: yaml["window_choice"].as_str().map(|s| s.to_string()),
        })
    }

    fn parse_dimensions(&self, yaml: &serde_yaml::Value) -> Vec<Dimension> {
        yaml.as_sequence()
            .map(|dims| {
                dims.iter()
                    .filter_map(|d| {
                        Some(Dimension {
                            name: d["name"].as_str()?.to_string(),
                            dimension_type: d["type"].as_str().unwrap_or("categorical").to_string(),
                            expr: d["expr"].as_str().map(|s| s.to_string()),
                            description: d["description"].as_str().map(|s| s.to_string()),
                            type_params: self.parse_dimension_type_params(&d["type_params"]),
                        })
                    })
                    .collect()
            })
            .unwrap_or_default()
    }

    fn parse_dimension_type_params(&self, yaml: &serde_yaml::Value) -> Option<DimensionTypeParams> {
        if yaml.is_null() {
            return None;
        }

        Some(DimensionTypeParams {
            time_granularity: yaml["time_granularity"].as_str().map(|s| s.to_string()),
            validity_params: if yaml["validity_params"].is_null() {
                None
            } else {
                serde_json::to_value(&yaml["validity_params"]).ok()
            },
        })
    }

    fn parse_metric(&self, yaml: &serde_yaml::Value) -> Result<Metric> {
        let name = yaml["name"]
            .as_str()
            .context("Metric missing name")?
            .to_string();

        let metric_type = yaml["type"].as_str().unwrap_or("simple").to_string();

        Ok(Metric {
            name,
            description: yaml["description"].as_str().map(|s| s.to_string()),
            metric_type: metric_type.clone(),
            type_params: self.parse_metric_type_params(&yaml["type_params"], &metric_type),
            filter: yaml["filter"].as_str().map(|s| s.to_string()),
            label: yaml["label"].as_str().map(|s| s.to_string()),
        })
    }

    fn parse_metric_type_params(&self, yaml: &serde_yaml::Value, metric_type: &str) -> MetricTypeParams {
        match metric_type {
            "simple" | "cumulative" => MetricTypeParams {
                measure: self.parse_measure_ref(&yaml["measure"]),
                expr: None,
                metrics: None,
                window: yaml["window"].as_str().map(|s| s.to_string()),
                grain_to_date: yaml["grain_to_date"].as_str().map(|s| s.to_string()),
            },
            "derived" => MetricTypeParams {
                measure: None,
                expr: yaml["expr"].as_str().map(|s| s.to_string()),
                metrics: self.parse_metric_refs(&yaml["metrics"]),
                window: None,
                grain_to_date: None,
            },
            _ => MetricTypeParams {
                measure: self.parse_measure_ref(&yaml["measure"]),
                expr: yaml["expr"].as_str().map(|s| s.to_string()),
                metrics: self.parse_metric_refs(&yaml["metrics"]),
                window: yaml["window"].as_str().map(|s| s.to_string()),
                grain_to_date: yaml["grain_to_date"].as_str().map(|s| s.to_string()),
            },
        }
    }

    fn parse_measure_ref(&self, yaml: &serde_yaml::Value) -> Option<MeasureRef> {
        if yaml.is_null() {
            return None;
        }

        // Can be just a string or an object
        if let Some(name) = yaml.as_str() {
            return Some(MeasureRef {
                name: name.to_string(),
                filter: None,
                alias: None,
            });
        }

        Some(MeasureRef {
            name: yaml["name"].as_str()?.to_string(),
            filter: yaml["filter"].as_str().map(|s| s.to_string()),
            alias: yaml["alias"].as_str().map(|s| s.to_string()),
        })
    }

    fn parse_metric_refs(&self, yaml: &serde_yaml::Value) -> Option<Vec<MetricRef>> {
        yaml.as_sequence().map(|refs| {
            refs.iter()
                .filter_map(|r| {
                    // Can be just a string or an object
                    if let Some(name) = r.as_str() {
                        return Some(MetricRef {
                            name: name.to_string(),
                            offset_window: None,
                            offset_to_grain: None,
                        });
                    }

                    Some(MetricRef {
                        name: r["name"].as_str()?.to_string(),
                        offset_window: r["offset_window"].as_str().map(|s| s.to_string()),
                        offset_to_grain: r["offset_to_grain"].as_str().map(|s| s.to_string()),
                    })
                })
                .collect()
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_strip_ref() {
        let yaml_str = r#"
        semantic_models:
          - name: orders
            model: ref('stg_orders')
            entities:
              - name: order_id
                type: primary
            measures:
              - name: order_total
                agg: sum
                expr: amount
        "#;

        let yaml: serde_yaml::Value = serde_yaml::from_str(yaml_str).unwrap();
        let parser = DbtSemanticLayerParser::new("/tmp");
        let model = parser.parse_semantic_model(&yaml["semantic_models"][0]).unwrap();

        assert_eq!(model.name, "orders");
        assert_eq!(model.model, "stg_orders");
    }
}
