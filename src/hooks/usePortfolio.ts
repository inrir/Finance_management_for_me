import { useAssets } from './useAssets';
import { useSnapshotStore } from '@/store/snapshotStore';

export function usePortfolio() {
  const { assets, assetStats, assetStatsInBase, portfolioStats, allocation } = useAssets();
  const snapshots = useSnapshotStore((s) => s.snapshots);

  return { assets, assetStats, assetStatsInBase, portfolioStats, allocation, snapshots };
}
