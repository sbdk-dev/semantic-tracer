//! Parser for Snowflake Semantic Layer configurations

use crate::types::{SnowflakeDimension, SnowflakeMetric, SnowflakeSemanticLayer, SnowflakeTable};
use anyhow::{Context, Result};
use std::fs;
use std::path::Path;

pub struct SnowflakeSemanticLayerParser;

impl SnowflakeSemanticLayerParser {
    pub fn new() -> Self {
        Self
    }

    /// Parse a Snowflake semantic layer YAML file
    pub fn parse(&self, path: impl AsRef<Path>) -> Result<SnowflakeSemanticLayer> {
        let content = fs::read_to_string(path.as_ref())
            .with_context(|| format!("Failed to read Snowflake semantic layer file: {:?}", path.as_ref()))?;

        let yaml: serde_yaml::Value = serde_yaml::from_str(&content)
            .with_context(|| "Failed to parse Snowflake semantic layer YAML")?;

        Ok(SnowflakeSemanticLayer {
            tables: self.parse_tables(&yaml),
            metrics: self.parse_metrics(&yaml),
            dimensions: self.parse_dimensions(&yaml),
        })
    }

    fn parse_tables(&self, yaml: &serde_yaml::Value) -> Vec<SnowflakeTable> {
        yaml["tables"]
            .as_sequence()
            .map(|tables| {
                tables
                    .iter()
                    .filter_map(|t| {
                        Some(SnowflakeTable {
                            name: t["name"].as_str()?.to_string(),
                            database: t["database"].as_str().unwrap_or("").to_string(),
                            schema: t["schema"].as_str().unwrap_or("").to_string(),
                            table_name: t["table"].as_str()?.to_string(),
                            description: t["description"].as_str().map(|s| s.to_string()),
                        })
                    })
                    .collect()
            })
            .unwrap_or_default()
    }

    fn parse_metrics(&self, yaml: &serde_yaml::Value) -> Vec<SnowflakeMetric> {
        yaml["metrics"]
            .as_sequence()
            .map(|metrics| {
                metrics
                    .iter()
                    .filter_map(|m| {
                        Some(SnowflakeMetric {
                            name: m["name"].as_str()?.to_string(),
                            table: m["table"].as_str()?.to_string(),
                            expression: m["expression"].as_str()?.to_string(),
                            description: m["description"].as_str().map(|s| s.to_string()),
                            label: m["label"].as_str().map(|s| s.to_string()),
                        })
                    })
                    .collect()
            })
            .unwrap_or_default()
    }

    fn parse_dimensions(&self, yaml: &serde_yaml::Value) -> Vec<SnowflakeDimension> {
        yaml["dimensions"]
            .as_sequence()
            .map(|dims| {
                dims.iter()
                    .filter_map(|d| {
                        Some(SnowflakeDimension {
                            name: d["name"].as_str()?.to_string(),
                            table: d["table"].as_str()?.to_string(),
                            expression: d["expression"].as_str()?.to_string(),
                            description: d["description"].as_str().map(|s| s.to_string()),
                            dimension_type: d["type"].as_str().map(|s| s.to_string()),
                        })
                    })
                    .collect()
            })
            .unwrap_or_default()
    }
}

impl Default for SnowflakeSemanticLayerParser {
    fn default() -> Self {
        Self::new()
    }
}
