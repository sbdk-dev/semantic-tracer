/**
 * Project picker component for selecting dbt project and semantic layer
 */

import { useState } from 'react';
import type { ProjectConfig, SemanticLayerType } from '../../types/semantic';
import { selectDirectory, selectSemanticLayerFile } from '../../services/tauri';

interface ProjectPickerProps {
  onProjectSelected: (config: ProjectConfig) => void;
  isLoading: boolean;
}

export function ProjectPicker({ onProjectSelected, isLoading }: ProjectPickerProps) {
  const [dbtPath, setDbtPath] = useState<string>('');
  const [semanticPath, setSemanticPath] = useState<string>('');
  const [semanticType, setSemanticType] = useState<SemanticLayerType>('DbtSemanticLayer');

  const handleSelectDbtProject = async () => {
    const path = await selectDirectory();
    if (path) {
      setDbtPath(path);
    }
  };

  const handleSelectSemanticFile = async () => {
    const path = await selectSemanticLayerFile();
    if (path) {
      setSemanticPath(path);
    }
  };

  const handleSubmit = () => {
    if (!dbtPath) return;

    onProjectSelected({
      dbt_project_path: dbtPath,
      semantic_layer_path: semanticPath || undefined,
      semantic_layer_type: semanticType,
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8">
      <div className="w-full max-w-xl bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Semantic Layer Lineage Tracer
        </h1>
        <p className="text-gray-600 mb-6">
          Select your dbt project to trace metrics lineage back to data sources.
        </p>

        {/* dbt Project Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            dbt Project Directory *
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={dbtPath}
              readOnly
              placeholder="Select dbt project directory..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
            />
            <button
              onClick={handleSelectDbtProject}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              Browse
            </button>
          </div>
        </div>

        {/* Semantic Layer Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Semantic Layer Type
          </label>
          <select
            value={semanticType}
            onChange={(e) => setSemanticType(e.target.value as SemanticLayerType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="DbtSemanticLayer">dbt Semantic Layer (MetricFlow)</option>
            <option value="Snowflake">Snowflake Semantic Layer</option>
            <option value="None">None (dbt models only)</option>
          </select>
        </div>

        {/* Snowflake Semantic Layer File (conditional) */}
        {semanticType === 'Snowflake' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Snowflake Semantic Layer File
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={semanticPath}
                readOnly
                placeholder="Select semantic layer YAML file..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
              />
              <button
                onClick={handleSelectSemanticFile}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 text-sm"
              >
                Browse
              </button>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!dbtPath || isLoading}
          className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Parsing Project...
            </span>
          ) : (
            'Load Project'
          )}
        </button>

        {/* Help Text */}
        <p className="mt-4 text-xs text-gray-500 text-center">
          The dbt project directory should contain a dbt_project.yml file.
        </p>
      </div>
    </div>
  );
}
