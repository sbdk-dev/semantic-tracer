/**
 * Zustand store for lineage state management
 */

import { create } from 'zustand';
import type {
  ParseResult,
  ProjectConfig,
  LineageNode,
} from '../types/semantic';

interface LineageState {
  // Project state
  projectConfig: ProjectConfig | null;
  parseResult: ParseResult | null;
  isLoading: boolean;
  error: string | null;

  // UI state
  selectedNode: LineageNode | null;
  showAuditPanel: boolean;
  searchQuery: string;
  viewMode: 'full' | 'metric' | 'impact';

  // Actions
  setProjectConfig: (config: ProjectConfig) => void;
  setParseResult: (result: ParseResult) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedNode: (node: LineageNode | null) => void;
  toggleAuditPanel: () => void;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: 'full' | 'metric' | 'impact') => void;
  reset: () => void;
}

const initialState = {
  projectConfig: null,
  parseResult: null,
  isLoading: false,
  error: null,
  selectedNode: null,
  showAuditPanel: true,
  searchQuery: '',
  viewMode: 'full' as const,
};

export const useLineageState = create<LineageState>((set) => ({
  ...initialState,

  setProjectConfig: (config) => set({ projectConfig: config }),

  setParseResult: (result) => set({ parseResult: result, error: null }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error, isLoading: false }),

  setSelectedNode: (node) => set({ selectedNode: node }),

  toggleAuditPanel: () =>
    set((state) => ({ showAuditPanel: !state.showAuditPanel })),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setViewMode: (mode) => set({ viewMode: mode }),

  reset: () => set(initialState),
}));
