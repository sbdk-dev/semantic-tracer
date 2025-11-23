import create from 'zustand';

type HistoryState<T> = {
  past: T[];
  present: T | null;
  future: T[];
  set: (state: T) => void;
  undo: () => void;
  redo: () => void;
};

export function createHistoryStore<T>(initial: T) {
  return create<HistoryState<T>>((set, get) => ({
    past: [],
    present: initial,
    future: [],
    set: (state: T) => {
      const { present, past } = get();
      set({ past: [...past, present as T], present: state, future: [] });
    },
    undo: () => {
      const { past, present, future } = get();
      if (past.length === 0) return;
      const previous = past[past.length - 1];
      set({ past: past.slice(0, -1), present: previous, future: [present as T, ...future] });
    },
    redo: () => {
      const { past, present, future } = get();
      if (future.length === 0) return;
      const next = future[0];
      set({ past: [...past, present as T], present: next, future: future.slice(1) });
    },
  }));
}
