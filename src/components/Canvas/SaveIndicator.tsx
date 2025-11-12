/**
 * Save Indicator Component
 *
 * Displays the current save status: saving, saved, or error.
 * Auto-hides after 3 seconds of "saved" state.
 */

import { useEffect, useState } from 'react';
import { AutoSaveStatus } from '../../hooks/useAutoSave';

interface SaveIndicatorProps {
  status: AutoSaveStatus;
}

export function SaveIndicator({ status }: SaveIndicatorProps) {
  const { isSaving, lastSaved, error } = status;
  const [visible, setVisible] = useState(false);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);

  // Show indicator when saving or when there's an error
  useEffect(() => {
    if (isSaving || error) {
      setVisible(true);
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        setHideTimeout(null);
      }
    } else if (lastSaved) {
      // Show "Saved" message, then hide after 3 seconds
      setVisible(true);
      const timeout = setTimeout(() => {
        setVisible(false);
      }, 3000);
      setHideTimeout(timeout);
    }

    return () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, [isSaving, lastSaved, error]);

  if (!visible) {
    return null;
  }

  // Calculate time since last save
  const getTimeSinceLastSave = (): string => {
    if (!lastSaved) return '';

    const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000);

    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Saving state */}
      {isSaving && (
        <div className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-sm font-medium">Saving...</span>
        </div>
      )}

      {/* Saved state */}
      {!isSaving && !error && lastSaved && (
        <div className="bg-green-600 text-white px-4 py-2 rounded-md shadow-lg flex items-center gap-2">
          <svg
            className="h-4 w-4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">
            Saved {getTimeSinceLastSave()}
          </span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-600 text-white px-4 py-2 rounded-md shadow-lg flex items-center gap-2 max-w-sm">
          <svg
            className="h-4 w-4 flex-shrink-0"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <div className="text-sm font-medium">Save failed</div>
            <div className="text-xs opacity-90">{error}</div>
          </div>
        </div>
      )}
    </div>
  );
}
