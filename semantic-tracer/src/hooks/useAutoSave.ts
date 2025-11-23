/**
 * Auto-Save Hook
 *
 * Automatically saves the diagram to localStorage every 30 seconds
 * if there are unsaved changes. Includes debouncing and error handling.
 */

import { useEffect, useState, useRef } from 'react';
import { useDiagramState } from './useDiagramState';
import { trackDiagramEvent } from './usePostHog';

export interface AutoSaveOptions {
  interval?: number; // Default: 30000 (30 seconds)
  debounceDelay?: number; // Default: 2000 (2 seconds)
  enabled?: boolean; // Default: true
}

export interface AutoSaveStatus {
  isSaving: boolean;
  lastSaved: Date | null;
  error: string | null;
}

export function useAutoSave(options: AutoSaveOptions = {}): AutoSaveStatus {
  const {
    interval = 30000, // 30 seconds
    debounceDelay = 2000, // 2 seconds
    enabled = true,
  } = options;

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirty = useDiagramState((state) => state.isDirty);
  const lastSaved = useDiagramState((state) => state.lastSaved);
  const saveDiagram = useDiagramState((state) => state.saveDiagram);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Save function with error handling
  const performSave = async () => {
    if (!isDirty || isSaving) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const startTime = performance.now();
      await saveDiagram();
      const saveTime = performance.now() - startTime;

      trackDiagramEvent('autosave_success', {
        saveTimeMs: Math.round(saveTime),
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Auto-save failed';
      setError(errorMessage);

      trackDiagramEvent('autosave_failed', {
        error: errorMessage,
      });

      console.error('Auto-save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Debounced save - wait for user to stop making changes
  useEffect(() => {
    if (!enabled || !isDirty) {
      return;
    }

    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      trackDiagramEvent('autosave_triggered', {
        trigger: 'debounce',
      });
      performSave();
    }, debounceDelay);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [isDirty, enabled, debounceDelay]);

  // Interval save - save periodically even if still editing
  useEffect(() => {
    if (!enabled) {
      return;
    }

    saveIntervalRef.current = setInterval(() => {
      if (isDirty && !isSaving) {
        trackDiagramEvent('autosave_triggered', {
          trigger: 'interval',
        });
        performSave();
      }
    }, interval);

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, [enabled, interval, isDirty, isSaving]);

  // Save on unmount if dirty
  useEffect(() => {
    return () => {
      if (isDirty && !isSaving) {
        // Note: This is async but we can't await in cleanup
        // The save will still trigger, just might not complete before unmount
        saveDiagram().catch(console.error);
      }
    };
  }, []);

  return {
    isSaving,
    lastSaved,
    error,
  };
}

