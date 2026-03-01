import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { storageAdapter } from '@/adapters';
import type { Snapshot } from '@/types/snapshot.types';

interface SnapshotState {
  snapshots: Snapshot[];
  isLoading: boolean;
  error: string | null;

  loadSnapshots: () => Promise<void>;
  saveSnapshot: (snapshot: Omit<Snapshot, 'id' | 'createdAt'>) => Promise<void>;
  deleteSnapshot: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useSnapshotStore = create<SnapshotState>((set) => ({
  snapshots: [],
  isLoading: false,
  error: null,

  loadSnapshots: async () => {
    set({ isLoading: true, error: null });
    try {
      const snapshots = await storageAdapter.getSnapshots();
      set({ snapshots });
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ isLoading: false });
    }
  },

  saveSnapshot: async (data) => {
    const snapshot: Snapshot = {
      ...data,
      id: nanoid(),
      createdAt: new Date().toISOString(),
    };
    await storageAdapter.saveSnapshot(snapshot);
    set((s) => ({
      snapshots: [...s.snapshots, snapshot].sort((a, b) =>
        a.date.localeCompare(b.date)
      ),
    }));
  },

  deleteSnapshot: async (id) => {
    await storageAdapter.deleteSnapshot(id);
    set((s) => ({
      snapshots: s.snapshots.filter((snap) => snap.id !== id),
    }));
  },

  clearError: () => set({ error: null }),
}));
