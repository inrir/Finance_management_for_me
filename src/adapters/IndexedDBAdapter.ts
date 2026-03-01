import Dexie, { type Table } from 'dexie';
import type { StorageAdapter, TransactionFilter, BackupData } from './StorageAdapter.interface';
import type { Asset } from '@/types/asset.types';
import type { Transaction } from '@/types/transaction.types';
import type { Snapshot } from '@/types/snapshot.types';

class FinanceDB extends Dexie {
  assets!: Table<Asset, string>;
  transactions!: Table<Transaction, string>;
  snapshots!: Table<Snapshot, string>;

  constructor() {
    super('FinanceManagerDB');
    this.version(1).stores({
      assets: 'id, type, market, currency',
      transactions: 'id, assetId, type, date',
      snapshots: 'id, date',
    });
    // 스키마 변경 필요 시 version(2) 블록을 추가하여 기존 데이터를 유지하며 마이그레이션
  }
}

export class IndexedDBAdapter implements StorageAdapter {
  private db: FinanceDB;

  constructor() {
    this.db = new FinanceDB();
  }

  async initialize(): Promise<void> {
    await this.db.open();
  }

  async getAssets(): Promise<Asset[]> {
    return this.db.assets.toArray();
  }

  async getAsset(id: string): Promise<Asset | null> {
    return (await this.db.assets.get(id)) ?? null;
  }

  async saveAsset(asset: Asset): Promise<void> {
    await this.db.assets.put(asset);
  }

  async deleteAsset(id: string): Promise<void> {
    // 연관 거래 내역 cascade 삭제
    await this.db.transaction(
      'rw',
      [this.db.assets, this.db.transactions],
      async () => {
        await this.db.assets.delete(id);
        await this.db.transactions.where('assetId').equals(id).delete();
      }
    );
  }

  async getTransactions(filter?: TransactionFilter): Promise<Transaction[]> {
    let result: Transaction[];

    if (filter?.assetId) {
      result = await this.db.transactions
        .where('assetId')
        .equals(filter.assetId)
        .toArray();
    } else {
      result = await this.db.transactions.toArray();
    }

    if (filter?.from) {
      result = result.filter((t) => t.date >= filter.from!);
    }
    if (filter?.to) {
      result = result.filter((t) => t.date <= filter.to!);
    }

    return result.sort((a, b) => b.date.localeCompare(a.date));
  }

  async getTransaction(id: string): Promise<Transaction | null> {
    return (await this.db.transactions.get(id)) ?? null;
  }

  async saveTransaction(tx: Transaction): Promise<void> {
    await this.db.transactions.put(tx);
  }

  async deleteTransaction(id: string): Promise<void> {
    await this.db.transactions.delete(id);
  }

  async getSnapshots(): Promise<Snapshot[]> {
    const all = await this.db.snapshots.toArray();
    return all.sort((a, b) => a.date.localeCompare(b.date));
  }

  async saveSnapshot(snapshot: Snapshot): Promise<void> {
    await this.db.snapshots.put(snapshot);
  }

  async deleteSnapshot(id: string): Promise<void> {
    await this.db.snapshots.delete(id);
  }

  async exportAll(): Promise<BackupData> {
    const [assets, transactions, snapshots] = await Promise.all([
      this.db.assets.toArray(),
      this.db.transactions.toArray(),
      this.db.snapshots.toArray(),
    ]);
    return {
      assets,
      transactions,
      snapshots,
      exportedAt: new Date().toISOString(),
      version: 1,
    };
  }

  async importAll(data: BackupData): Promise<void> {
    await this.db.transaction(
      'rw',
      [this.db.assets, this.db.transactions, this.db.snapshots],
      async () => {
        await this.db.assets.clear();
        await this.db.transactions.clear();
        await this.db.snapshots.clear();
        await this.db.assets.bulkPut(data.assets);
        await this.db.transactions.bulkPut(data.transactions);
        await this.db.snapshots.bulkPut(data.snapshots);
      }
    );
  }
}
