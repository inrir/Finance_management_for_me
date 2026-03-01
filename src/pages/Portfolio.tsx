import { usePortfolio } from '@/hooks/usePortfolio';
import { useSettingsStore } from '@/store/settingsStore';
import { Card } from '@/components/common/Card';
import { DonutChart } from '@/components/charts/DonutChart';
import { AssetBadge } from '@/components/common/Badge';
import { CalcService } from '@/services/CalcService';
import { ASSET_TYPE_LABELS } from '@/types/asset.types';
import type { AssetType } from '@/types/asset.types';

export default function Portfolio() {
  const { portfolioStats, allocation, assetStats, assetStatsInBase, assets } = usePortfolio();
  const { exchangeRates } = useSettingsStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">포트폴리오 분석</h2>
        <p className="text-sm text-gray-400 mt-1">자산 비중 및 현황</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          title="총 평가금액"
          value={CalcService.formatCurrency(portfolioStats.totalValue)}
        />
        <Card
          title="총 투자원금"
          value={CalcService.formatCurrency(portfolioStats.totalCost)}
        />
        <Card
          title="전체 수익률"
          value={CalcService.formatRate(portfolioStats.totalUnrealizedPnLRate)}
          trend={portfolioStats.totalUnrealizedPnLRate > 0 ? 'up' : portfolioStats.totalUnrealizedPnLRate < 0 ? 'down' : 'neutral'}
        />
        <Card
          title="전체 평가손익"
          value={CalcService.formatCurrency(Math.abs(portfolioStats.totalUnrealizedPnL))}
          trend={portfolioStats.totalUnrealizedPnL > 0 ? 'up' : portfolioStats.totalUnrealizedPnL < 0 ? 'down' : 'neutral'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">자산 유형별 비중</h3>
          <DonutChart allocation={allocation} height={300} />
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">유형별 현황</h3>
          {Object.entries(allocation).length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">자산을 추가해주세요</p>
          ) : (
            <ul className="space-y-3">
              {Object.entries(allocation).map(([type, item]) => (
                <li key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AssetBadge type={type as AssetType} />
                    <span className="text-sm text-gray-600">
                      {ASSET_TYPE_LABELS[type as AssetType]}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {CalcService.formatCurrency(item.value)}
                    </p>
                    <p className="text-xs text-gray-400">{item.ratio.toFixed(1)}%</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 개별 자산 수익률 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">개별 자산 현황</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-50 bg-gray-50">
              <th className="text-left px-5 py-3 text-gray-500 font-medium">자산명</th>
              <th className="text-right px-4 py-3 text-gray-500 font-medium">평가금액</th>
              <th className="text-right px-4 py-3 text-gray-500 font-medium">투자원금</th>
              <th className="text-right px-4 py-3 text-gray-500 font-medium">수익률</th>
              <th className="text-right px-4 py-3 text-gray-500 font-medium">비중</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {assetStats.map((stat, i) => {
              const asset = assets[i];
              const statInBase = assetStatsInBase[i];
              // 비중은 KRW 환산 기준으로 계산
              const ratio =
                portfolioStats.totalValue > 0
                  ? (statInBase.currentValue / portfolioStats.totalValue) * 100
                  : 0;
              const isForeign = asset.currency !== 'KRW';
              const toKrw = (v: number) =>
                CalcService.convertToBase(v, asset.currency, 'KRW', exchangeRates);
              return (
                <tr key={stat.assetId}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <AssetBadge type={asset.type} size="sm" />
                      <span className="font-medium text-gray-900">{asset.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {CalcService.formatCurrency(stat.currentValue, asset.currency)}
                    {isForeign && (
                      <div className="text-xs text-gray-400 mt-0.5">
                        ≈ {CalcService.formatCurrency(toKrw(stat.currentValue))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {CalcService.formatCurrency(stat.totalCost, asset.currency)}
                    {isForeign && (
                      <div className="text-xs text-gray-400 mt-0.5">
                        ≈ {CalcService.formatCurrency(toKrw(stat.totalCost))}
                      </div>
                    )}
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${stat.unrealizedPnLRate > 0 ? 'text-emerald-600' : stat.unrealizedPnLRate < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                    {CalcService.formatRate(stat.unrealizedPnLRate)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">
                    {ratio.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
