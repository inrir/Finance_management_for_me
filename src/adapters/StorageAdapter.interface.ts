import type { Asset } from '@/types/asset.types';
import type { Transaction } from '@/types/transaction.types';
import type { Snapshot } from '@/types/snapshot.types';

export interface TransactionFilter {
  assetId?: string;
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
}

export interface BackupData {
  assets: Asset[];
  transactions: Transaction[];
  snapshots: Snapshot[];
  exportedAt: string;
  version: number;
}

/**
 * 저장소 교체 핵심 계약 인터페이스.
 * 서버 전환 시 이 인터페이스를 구현하는 새 어댑터를 추가하고
 * adapters/index.ts 에서 교체만 하면 된다.
 */
export interface StorageAdapter {
  initialize(): Promise<void>;

  // Asset CRUD
  getAssets(): Promise<Asset[]>;
  getAsset(id: string): Promise<Asset | null>;
  saveAsset(asset: Asset): Promise<void>;
  deleteAsset(id: string): Promise<void>; // 연관 Transaction cascade 삭제

  // Transaction CRUD
  getTransactions(filter?: TransactionFilter): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction | null>;
  saveTransaction(tx: Transaction): Promise<void>;
  deleteTransaction(id: string): Promise<void>;

  // Snapshot CRUD
  getSnapshots(): Promise<Snapshot[]>;
  saveSnapshot(snapshot: Snapshot): Promise<void>;
  deleteSnapshot(id: string): Promise<void>;

  // 백업/복원
  exportAll(): Promise<BackupData>;
  importAll(data: BackupData): Promise<void>;
}
