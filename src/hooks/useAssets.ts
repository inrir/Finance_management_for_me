import { useMemo } from 'react';
import { useAssetStore } from '@/store/assetStore';
import { useTxStore } from '@/store/txStore';
import { useSettingsStore } from '@/store/settingsStore';
import { CalcService } from '@/services/CalcService';

export function useAssets() {
  const assets = useAssetStore((s) => s.assets);
  const transactions = useTxStore((s) => s.transactions);
  const { exchangeRates, baseCurrency } = useSettingsStore();

  const assetStats = useMemo(
    () =>
      assets.map((asset) => {
        const assetTxs = transactions.filter((t) => t.assetId === asset.id);
        return CalcService.calcAssetStats(asset, assetTxs);
      }),
    [assets, transactions]
  );

  // 기준 통화(KRW)로 환산한 자산별 통계 — 비중·포트폴리오 집계 전용
  const assetStatsInBase = useMemo(
    () =>
      assetStats.map((stat, i) => {
        const asset = assets[i];
        if (!asset || asset.currency === baseCurrency) return stat;
        const factor = CalcService.convertToBase(1, asset.currency, baseCurrency, exchangeRates);
        return {
          ...stat,
          currentValue: stat.currentValue * factor,
          totalCost: stat.totalCost * factor,
          unrealizedPnL: stat.unrealizedPnL * factor,
        };
      }),
    [assetStats, assets, baseCurrency, exchangeRates]
  );

  const portfolioStats = useMemo(
    () => CalcService.calcPortfolioStats(assetStatsInBase),
    [assetStatsInBase]
  );

  const allocation = useMemo(
    () => CalcService.calcAllocation(assetStatsInBase, assets),
    [assetStatsInBase, assets]
  );

  return { assets, assetStats, assetStatsInBase, portfolioStats, allocation };
}
