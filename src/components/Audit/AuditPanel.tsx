/**
 * Audit panel showing project health and issues
 */

import type { AuditResult, AuditIssue } from '../../types/semantic';

interface AuditPanelProps {
  audit: AuditResult;
  onIssueClick?: (issue: AuditIssue) => void;
}

export function AuditPanel({ audit, onIssueClick }: AuditPanelProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="h-full overflow-y-auto bg-white border-l border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Project Audit</h2>
      </div>

      {/* Scores */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Health Scores</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Completeness</span>
              <span className={getScoreColor(audit.completeness_score)}>
                {audit.completeness_score.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full"
                style={{ width: `${audit.completeness_score}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Documentation</span>
              <span className={getScoreColor(audit.documentation_coverage)}>
                {audit.documentation_coverage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${audit.documentation_coverage}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Model Coverage</span>
              <span className={getScoreColor(audit.model_coverage)}>
                {audit.model_coverage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full"
                style={{ width: `${audit.model_coverage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Summary</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-gray-50 p-2 rounded">
            <div className="text-lg font-semibold text-gray-900">
              {audit.summary.total_metrics}
            </div>
            <div className="text-xs text-gray-500">Metrics</div>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <div className="text-lg font-semibold text-gray-900">
              {audit.summary.total_measures}
            </div>
            <div className="text-xs text-gray-500">Measures</div>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <div className="text-lg font-semibold text-gray-900">
              {audit.summary.total_models}
            </div>
            <div className="text-xs text-gray-500">Models</div>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <div className="text-lg font-semibold text-gray-900">
              {audit.summary.total_sources}
            </div>
            <div className="text-xs text-gray-500">Sources</div>
          </div>
        </div>

        <div className="mt-3 space-y-1 text-xs text-gray-600">
          <div>
            Documented: {audit.summary.documented_metrics}/{audit.summary.total_metrics} metrics,{' '}
            {audit.summary.documented_models}/{audit.summary.total_models} models
          </div>
          <div>
            Tested: {audit.summary.tested_models}/{audit.summary.total_models} models
          </div>
          {audit.summary.orphaned_models > 0 && (
            <div className="text-yellow-600">
              Orphaned: {audit.summary.orphaned_models} models
            </div>
          )}
        </div>
      </div>

      {/* Issues */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Issues ({audit.issues.length})
        </h3>

        {audit.issues.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-4">
            No issues found
          </div>
        ) : (
          <div className="space-y-2">
            {audit.issues.slice(0, 20).map((issue, index) => (
              <div
                key={index}
                onClick={() => onIssueClick?.(issue)}
                className={`
                  p-2 rounded border text-xs cursor-pointer
                  hover:shadow-sm transition-shadow
                  ${getSeverityColor(issue.severity)}
                `}
              >
                <div className="font-medium">{issue.message}</div>
                {issue.suggestion && (
                  <div className="mt-1 opacity-75 text-xs">
                    Suggestion: {issue.suggestion}
                  </div>
                )}
              </div>
            ))}

            {audit.issues.length > 20 && (
              <div className="text-xs text-gray-500 text-center py-2">
                +{audit.issues.length - 20} more issues
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
