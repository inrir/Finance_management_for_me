import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAssetStore } from '@/store/assetStore';
import { useAssets } from '@/hooks/useAssets';
import { useSettingsStore } from '@/store/settingsStore';
import { Button } from '@/components/common/Button';
import { AssetBadge } from '@/components/common/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import { PriceUpdateModal } from '@/components/asset/PriceUpdateModal';
import { CalcService } from '@/services/CalcService';
import type { Asset } from '@/types/asset.types';
import { AMOUNT_TYPES, NEEDS_PRICE_UPDATE_TYPES } from '@/types/asset.types';

export default function AssetList() {
  const { assets, assetStats } = useAssets();
  const { updatePrice, deleteAsset } = useAssetStore();
  const { exchangeRates } = useSettingsStore();
  const [priceTarget, setPriceTarget] = useState<Asset | null>(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkPrices, setBulkPrices] = useState<Record<string, string>>({});

  const enterBulkMode = () => {
    const prices: Record<string, string> = {};
    assets.forEach((a) => {
      if (NEEDS_PRICE_UPDATE_TYPES.includes(a.type)) {
        prices[a.id] = String(a.currentPrice);
      }
    });
    setBulkPrices(prices);
    setBulkMode(true);
  };

  const saveBulk = async () => {
    for (const [id, val] of Object.entries(bulkPrices)) {
      const price = parseFloat(val);
      if (!isNaN(price) && price >= 0) await updatePrice(id, price);
    }
    setBulkMode(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" 자산과 관련 거래 내역을 모두 삭제할까요?`)) return;
    await deleteAsset(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">자산 관리</h2>
          <p className="text-sm text-gray-400 mt-1">총 {assets.length}개 자산</p>
        </div>
        <div className="flex gap-2">
          {bulkMode ? (
            <>
              <Button variant="secondary" onClick={() => setBulkMode(false)}>취소</Button>
              <Button onClick={saveBulk}>저장</Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={enterBulkMode}>현재가 일괄 입력</Button>
              <Link to="/assets/new">
                <Button>+ 자산 추가</Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {assets.length === 0 ? (
        <EmptyState
          title="자산이 없습니다"
          description="첫 자산을 추가해보세요"
          action={
            <Link to="/assets/new">
              <Button>자산 추가하기</Button>
            </Link>
          }
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-gray-500 font-medium">자산명</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">현재가</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">평가금액</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">수익률</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">평가손익</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {assets.map((asset, i) => {
                const stat = assetStats[i];
                const rate = stat?.unrealizedPnLRate ?? 0;
                const pnl = stat?.unrealizedPnL ?? 0;
                const isForeign = asset.currency !== 'KRW';
                const toKrw = (v: number) =>
                  CalcService.convertToBase(v, asset.currency, 'KRW', exchangeRates);
                return (
                  <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <AssetBadge type={asset.type} size="sm" />
                        <Link
                          to={`/assets/${asset.id}`}
                          className="font-medium text-gray-900 hover:text-blue-600"
                        >
                          {asset.name}
                        </Link>
                        {asset.currentPrice === 0 && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                            현재가 미입력
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {AMOUNT_TYPES.includes(asset.type) ? (
                        <span className="text-gray-300 text-xs">-</span>
                      ) : bulkMode && NEEDS_PRICE_UPDATE_TYPES.includes(asset.type) ? (
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={bulkPrices[asset.id] ?? ''}
                          onChange={(e) =>
                            setBulkPrices((p) => ({ ...p, [asset.id]: e.target.value }))
                          }
                          className="w-32 text-right border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                      ) : (
                        <button
                          onClick={() => setPriceTarget(asset)}
                          className="hover:text-blue-600 hover:underline transition-colors"
                          title="클릭하여 현재가 업데이트"
                        >
                          {new Intl.NumberFormat('ko-KR').format(asset.currentPrice)}{' '}
                          <span className="text-gray-400 text-xs">{asset.currency}</span>
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {CalcService.formatCurrency(stat?.currentValue ?? 0, asset.currency)}
                      {isForeign && (
                        <div className="text-xs font-normal text-gray-400 mt-0.5">
                          ≈ {CalcService.formatCurrency(toKrw(stat?.currentValue ?? 0))}
                        </div>
                      )}
                    </td>
                    <td className={`px-4 py-3 text-right font-medium ${rate > 0 ? 'text-emerald-600' : rate < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                      {CalcService.formatRate(rate)}
                    </td>
                    <td className={`px-4 py-3 text-right font-medium ${pnl > 0 ? 'text-emerald-600' : pnl < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                      {pnl >= 0 ? '+' : ''}
                      {CalcService.formatCurrency(pnl, asset.currency)}
                      {isForeign && (
                        <div className="text-xs font-normal text-gray-400 mt-0.5">
                          ≈ {pnl >= 0 ? '+' : ''}{CalcService.formatCurrency(toKrw(pnl))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(asset.id, asset.name)}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {priceTarget && (
        <PriceUpdateModal
          asset={priceTarget}
          isOpen={true}
          onClose={() => setPriceTarget(null)}
          onUpdate={(price) => updatePrice(priceTarget.id, price)}
        />
      )}
    </div>
  );
}
