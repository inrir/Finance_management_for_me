import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { storageAdapter } from '@/adapters';
import type { Asset, AssetType, Currency, Market } from '@/types/asset.types';

export type AssetFormData = Omit<Asset, 'id' | 'createdAt' | 'priceUpdatedAt'>;

interface AssetState {
  assets: Asset[];
  isLoading: boolean;
  error: string | null;

  loadAssets: () => Promise<void>;
  addAsset: (data: AssetFormData) => Promise<Asset>;
  updateAsset: (id: string, patch: Partial<AssetFormData>) => Promise<void>;
  updatePrice: (id: string, price: number) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  getAsset: (id: string) => Asset | undefined;
  clearError: () => void;
}

export const useAssetStore = create<AssetState>((set, get) => ({
  assets: [],
  isLoading: false,
  error: null,

  loadAssets: async () => {
    set({ isLoading: true, error: null });
    try {
      const assets = await storageAdapter.getAssets();
      set({ assets });
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ isLoading: false });
    }
  },

  addAsset: async (data) => {
    const now = new Date().toISOString();
    const asset: Asset = {
      ...data,
      id: nanoid(),
      createdAt: now,
      priceUpdatedAt: now,
    };
    await storageAdapter.saveAsset(asset);
    set((s) => ({ assets: [...s.assets, asset] }));
    return asset;
  },

  updateAsset: async (id, patch) => {
    const existing = get().assets.find((a) => a.id === id);
    if (!existing) return;
    const updated: Asset = { ...existing, ...patch };
    await storageAdapter.saveAsset(updated);
    set((s) => ({
      assets: s.assets.map((a) => (a.id === id ? updated : a)),
    }));
  },

  updatePrice: async (id, price) => {
    const existing = get().assets.find((a) => a.id === id);
    if (!existing) return;
    const updated: Asset = {
      ...existing,
      currentPrice: price,
      priceUpdatedAt: new Date().toISOString(),
    };
    await storageAdapter.saveAsset(updated);
    set((s) => ({
      assets: s.assets.map((a) => (a.id === id ? updated : a)),
    }));
  },

  deleteAsset: async (id) => {
    await storageAdapter.deleteAsset(id);
    set((s) => ({ assets: s.assets.filter((a) => a.id !== id) }));
  },

  getAsset: (id) => get().assets.find((a) => a.id === id),

  clearError: () => set({ error: null }),
}));

// 자산 유형 색상 맵 (차트·배지 공통)
export const ASSET_TYPE_COLORS: Record<AssetType, string> = {
  cash: '#6B7280',
  deposit: '#3B82F6',
  stock: '#10B981',
  etf: '#8B5CF6',
  realestate: '#F59E0B',
  crypto: '#EF4444',
  other: '#9CA3AF',
};

export const DEFAULT_ASSET_FORM: AssetFormData = {
  name: '',
  type: 'stock' as AssetType,
  ticker: '',
  market: 'KRX' as Market,
  currency: 'KRW' as Currency,
  currentPrice: 0,
  quantity: 0,
  priceProvider: 'manual',
  memo: '',
};
