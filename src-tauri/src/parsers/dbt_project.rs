//! Parser for dbt project files and models

use crate::types::{DbtColumn, DbtModel, DbtProject, DbtSource, DbtSourceRef};
use anyhow::{Context, Result};
use regex::Regex;
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use walkdir::WalkDir;

pub struct DbtProjectParser {
    project_path: PathBuf,
}

impl DbtProjectParser {
    pub fn new(project_path: impl AsRef<Path>) -> Self {
        Self {
            project_path: project_path.as_ref().to_path_buf(),
        }
    }

    /// Parse the dbt_project.yml file
    pub fn parse_project(&self) -> Result<DbtProject> {
        let project_file = self.project_path.join("dbt_project.yml");
        let content = fs::read_to_string(&project_file)
            .with_context(|| format!("Failed to read dbt_project.yml at {:?}", project_file))?;

        let yaml: serde_yaml::Value = serde_yaml::from_str(&content)
            .with_context(|| "Failed to parse dbt_project.yml as YAML")?;

        Ok(DbtProject {
            name: yaml["name"]
                .as_str()
                .unwrap_or("unknown")
                .to_string(),
            version: yaml["version"].as_str().map(|s| s.to_string()),
            config_version: yaml["config-version"].as_i64().map(|v| v as i32),
            profile: yaml["profile"].as_str().map(|s| s.to_string()),
            model_paths: self.extract_string_array(&yaml, "model-paths")
                .or_else(|| self.extract_string_array(&yaml, "source-paths"))
                .unwrap_or_else(|| vec!["models".to_string()]),
            seed_paths: self.extract_string_array(&yaml, "seed-paths")
                .unwrap_or_else(|| vec!["seeds".to_string()]),
            test_paths: self.extract_string_array(&yaml, "test-paths")
                .unwrap_or_else(|| vec!["tests".to_string()]),
            analysis_paths: self.extract_string_array(&yaml, "analysis-paths")
                .unwrap_or_else(|| vec!["analyses".to_string()]),
            macro_paths: self.extract_string_array(&yaml, "macro-paths")
                .unwrap_or_else(|| vec!["macros".to_string()]),
            target_path: yaml["target-path"].as_str().map(|s| s.to_string()),
        })
    }

    fn extract_string_array(&self, yaml: &serde_yaml::Value, key: &str) -> Option<Vec<String>> {
        yaml[key].as_sequence().map(|seq| {
            seq.iter()
                .filter_map(|v| v.as_str().map(|s| s.to_string()))
                .collect()
        })
    }

    /// Parse all models in the project
    pub fn parse_models(&self, project: &DbtProject) -> Result<Vec<DbtModel>> {
        let mut models = Vec::new();

        for model_path in &project.model_paths {
            let full_path = self.project_path.join(model_path);
            if !full_path.exists() {
                log::warn!("Model path does not exist: {:?}", full_path);
                continue;
            }

            // Find all .sql files
            for entry in WalkDir::new(&full_path)
                .into_iter()
                .filter_map(|e| e.ok())
                .filter(|e| e.path().extension().map_or(false, |ext| ext == "sql"))
            {
                if let Ok(model) = self.parse_model_file(entry.path()) {
                    models.push(model);
                }
            }

            // Find all schema.yml files for metadata
            let schema_metadata = self.parse_schema_files(&full_path)?;

            // Merge metadata into models
            for model in &mut models {
                if let Some(meta) = schema_metadata.get(&model.name) {
                    model.description = meta.description.clone();
                    model.columns = meta.columns.clone();
                    model.tags = meta.tags.clone();
                }
            }
        }

        Ok(models)
    }

    fn parse_model_file(&self, path: &Path) -> Result<DbtModel> {
        let content = fs::read_to_string(path)?;
        let name = path
            .file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or("unknown")
            .to_string();

        let unique_id = format!("model.{}", name);

        // Extract refs from SQL
        let refs = self.extract_refs(&content);
        let sources = self.extract_sources(&content);

        // Build depends_on from refs and sources
        let mut depends_on: Vec<String> = refs.iter()
            .map(|r| format!("model.{}", r))
            .collect();
        for source in &sources {
            depends_on.push(format!("source.{}.{}", source.source_name, source.table_name));
        }

        // Extract materialization from config
        let materialization = self.extract_materialization(&content);

        Ok(DbtModel {
            unique_id,
            name,
            schema: None,
            database: None,
            description: None,
            columns: Vec::new(),
            depends_on,
            refs,
            sources,
            file_path: path.to_string_lossy().to_string(),
            raw_sql: Some(content),
            materialization,
            tags: Vec::new(),
        })
    }

    fn extract_refs(&self, sql: &str) -> Vec<String> {
        let ref_regex = Regex::new(r#"\{\{\s*ref\s*\(\s*['"]([^'"]+)['"]\s*\)\s*\}\}"#).unwrap();
        ref_regex
            .captures_iter(sql)
            .filter_map(|cap| cap.get(1).map(|m| m.as_str().to_string()))
            .collect()
    }

    fn extract_sources(&self, sql: &str) -> Vec<DbtSourceRef> {
        let source_regex = Regex::new(
            r#"\{\{\s*source\s*\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\)\s*\}\}"#,
        )
        .unwrap();

        source_regex
            .captures_iter(sql)
            .filter_map(|cap| {
                Some(DbtSourceRef {
                    source_name: cap.get(1)?.as_str().to_string(),
                    table_name: cap.get(2)?.as_str().to_string(),
                })
            })
            .collect()
    }

    fn extract_materialization(&self, sql: &str) -> Option<String> {
        let config_regex = Regex::new(
            r#"\{\{\s*config\s*\([^)]*materialized\s*=\s*['"]([^'"]+)['"][^)]*\)\s*\}\}"#,
        )
        .ok()?;

        config_regex
            .captures(sql)
            .and_then(|cap| cap.get(1).map(|m| m.as_str().to_string()))
    }

    fn parse_schema_files(&self, model_path: &Path) -> Result<HashMap<String, ModelMetadata>> {
        let mut metadata = HashMap::new();

        for entry in WalkDir::new(model_path)
            .into_iter()
            .filter_map(|e| e.ok())
            .filter(|e| {
                e.path()
                    .file_name()
                    .map_or(false, |n| {
                        let name = n.to_string_lossy();
                        (name.ends_with(".yml") || name.ends_with(".yaml"))
                            && !name.starts_with("dbt_project")
                    })
            })
        {
            if let Ok(content) = fs::read_to_string(entry.path()) {
                if let Ok(yaml) = serde_yaml::from_str::<serde_yaml::Value>(&content) {
                    // Parse models section
                    if let Some(models) = yaml["models"].as_sequence() {
                        for model in models {
                            if let Some(name) = model["name"].as_str() {
                                let meta = ModelMetadata {
                                    description: model["description"].as_str().map(|s| s.to_string()),
                                    columns: self.parse_columns(&model["columns"]),
                                    tags: self.extract_string_array(&model, "tags").unwrap_or_default(),
                                };
                                metadata.insert(name.to_string(), meta);
                            }
                        }
                    }
                }
            }
        }

        Ok(metadata)
    }

    fn parse_columns(&self, columns_yaml: &serde_yaml::Value) -> Vec<DbtColumn> {
        columns_yaml
            .as_sequence()
            .map(|cols| {
                cols.iter()
                    .filter_map(|col| {
                        let name = col["name"].as_str()?.to_string();
                        Some(DbtColumn {
                            name,
                            description: col["description"].as_str().map(|s| s.to_string()),
                            data_type: col["data_type"].as_str().map(|s| s.to_string()),
                            meta: self.parse_meta(&col["meta"]),
                            tests: self.extract_string_array(col, "tests").unwrap_or_default(),
                        })
                    })
                    .collect()
            })
            .unwrap_or_default()
    }

    fn parse_meta(&self, meta_yaml: &serde_yaml::Value) -> HashMap<String, serde_json::Value> {
        let mut meta = HashMap::new();
        if let Some(obj) = meta_yaml.as_mapping() {
            for (key, value) in obj {
                if let Some(key_str) = key.as_str() {
                    if let Ok(json_value) = serde_json::to_value(value) {
                        meta.insert(key_str.to_string(), json_value);
                    }
                }
            }
        }
        meta
    }

    /// Parse all sources in the project
    pub fn parse_sources(&self, project: &DbtProject) -> Result<Vec<DbtSource>> {
        let mut sources = Vec::new();

        for model_path in &project.model_paths {
            let full_path = self.project_path.join(model_path);
            if !full_path.exists() {
                continue;
            }

            // Find all schema.yml files
            for entry in WalkDir::new(&full_path)
                .into_iter()
                .filter_map(|e| e.ok())
                .filter(|e| {
                    e.path()
                        .file_name()
                        .map_or(false, |n| {
                            let name = n.to_string_lossy();
                            name.ends_with(".yml") || name.ends_with(".yaml")
                        })
                })
            {
                if let Ok(content) = fs::read_to_string(entry.path()) {
                    if let Ok(yaml) = serde_yaml::from_str::<serde_yaml::Value>(&content) {
                        if let Some(source_list) = yaml["sources"].as_sequence() {
                            for source in source_list {
                                sources.extend(self.parse_source_definition(source));
                            }
                        }
                    }
                }
            }
        }

        Ok(sources)
    }

    fn parse_source_definition(&self, source_yaml: &serde_yaml::Value) -> Vec<DbtSource> {
        let source_name = source_yaml["name"]
            .as_str()
            .unwrap_or("unknown")
            .to_string();
        let database = source_yaml["database"].as_str().map(|s| s.to_string());
        let schema = source_yaml["schema"].as_str().map(|s| s.to_string());

        source_yaml["tables"]
            .as_sequence()
            .map(|tables| {
                tables
                    .iter()
                    .filter_map(|table| {
                        let name = table["name"].as_str()?.to_string();
                        let unique_id = format!("source.{}.{}", source_name, name);

                        Some(DbtSource {
                            unique_id,
                            source_name: source_name.clone(),
                            name,
                            schema: table["schema"]
                                .as_str()
                                .map(|s| s.to_string())
                                .or_else(|| schema.clone()),
                            database: table["database"]
                                .as_str()
                                .map(|s| s.to_string())
                                .or_else(|| database.clone()),
                            description: table["description"].as_str().map(|s| s.to_string()),
                            columns: self.parse_columns(&table["columns"]),
                            loader: table["loader"].as_str().map(|s| s.to_string()),
                            freshness: None, // TODO: Parse freshness config
                            tags: self.extract_string_array(table, "tags").unwrap_or_default(),
                        })
                    })
                    .collect()
            })
            .unwrap_or_default()
    }
}

struct ModelMetadata {
    description: Option<String>,
    columns: Vec<DbtColumn>,
    tags: Vec<String>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_extract_refs() {
        let parser = DbtProjectParser::new("/tmp");
        let sql = r#"
            SELECT * FROM {{ ref('stg_orders') }}
            JOIN {{ ref("stg_customers") }} ON ...
        "#;
        let refs = parser.extract_refs(sql);
        assert_eq!(refs, vec!["stg_orders", "stg_customers"]);
    }

    #[test]
    fn test_extract_sources() {
        let parser = DbtProjectParser::new("/tmp");
        let sql = r#"
            SELECT * FROM {{ source('raw', 'orders') }}
            JOIN {{ source("raw", "customers") }} ON ...
        "#;
        let sources = parser.extract_sources(sql);
        assert_eq!(sources.len(), 2);
        assert_eq!(sources[0].source_name, "raw");
        assert_eq!(sources[0].table_name, "orders");
    }
}
