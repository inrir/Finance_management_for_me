import type { AssetType } from './asset.types';

export type AssetTypeBreakdown = Record<AssetType, number>;

export function createEmptyBreakdown(): AssetTypeBreakdown {
  return {
    cash: 0,
    deposit: 0,
    stock: 0,
    etf: 0,
    realestate: 0,
    crypto: 0,
    other: 0,
  };
}

export interface Snapshot {
  id: string;
  date: string; // YYYY-MM
  totalValue: number;
  totalCost: number;
  breakdown: AssetTypeBreakdown;
  createdAt: string;
}
