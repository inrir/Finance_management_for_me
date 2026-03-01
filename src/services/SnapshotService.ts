import { nanoid } from 'nanoid';
import { storageAdapter } from '@/adapters';
import { CalcService } from './CalcService';
import { createEmptyBreakdown } from '@/types/snapshot.types';
import type { Asset } from '@/types/asset.types';
import type { Transaction } from '@/types/transaction.types';

export const SnapshotService = {
  /**
   * 앱 초기화 시 호출.
   * 이번 달 스냅샷이 없으면 현재값으로 자동 생성한다.
   */
  async autoSaveIfNeeded(
    assets: Asset[],
    transactions: Transaction[]
  ): Promise<void> {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const snapshots = await storageAdapter.getSnapshots();
    const hasThisMonth = snapshots.some((s) => s.date === currentMonth);

    if (hasThisMonth || assets.length === 0) return;

    await this.saveCurrentSnapshot(assets, transactions, currentMonth);
  },

  async saveCurrentSnapshot(
    assets: Asset[],
    transactions: Transaction[],
    date?: string
  ): Promise<void> {
    const snapshotDate = date ?? new Date().toISOString().slice(0, 7);
    const breakdown = createEmptyBreakdown();
    let totalValue = 0;
    let totalCost = 0;

    for (const asset of assets) {
      const assetTxs = transactions.filter((t) => t.assetId === asset.id);
      const stats = CalcService.calcAssetStats(asset, assetTxs);
      breakdown[asset.type] += stats.currentValue;
      totalValue += stats.currentValue;
      totalCost += stats.totalCost;
    }

    const existing = (await storageAdapter.getSnapshots()).find(
      (s) => s.date === snapshotDate
    );
    if (existing) {
      await storageAdapter.deleteSnapshot(existing.id);
    }

    await storageAdapter.saveSnapshot({
      id: nanoid(),
      date: snapshotDate,
      totalValue,
      totalCost,
      breakdown,
      createdAt: new Date().toISOString(),
    });
  },
};
