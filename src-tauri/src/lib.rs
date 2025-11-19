//! Semantic Layer Metrics Lineage Tracer - Tauri Backend

pub mod commands;
pub mod lineage;
pub mod parsers;
pub mod types;

use commands::{get_impact_analysis, get_metric_lineage, parse_project, search_nodes};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            parse_project,
            get_metric_lineage,
            get_impact_analysis,
            search_nodes,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
