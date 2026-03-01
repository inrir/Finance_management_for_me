import { useMemo } from 'react';
import { useAssetStore } from '@/store/assetStore';
import { useTxStore } from '@/store/txStore';
import { CalcService } from '@/services/CalcService';

export function useAssetDetail(assetId: string) {
  const asset = useAssetStore((s) => s.assets.find((a) => a.id === assetId));
  const transactions = useTxStore((s) =>
    s.transactions.filter((t) => t.assetId === assetId)
  );

  const stats = useMemo(() => {
    if (!asset) return null;
    return CalcService.calcAssetStats(asset, transactions);
  }, [asset, transactions]);

  return { asset, transactions, stats };
}
