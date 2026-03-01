import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAssetDetail } from '@/hooks/useAssetDetail';
import { useAssetStore } from '@/store/assetStore';
import { useTxStore } from '@/store/txStore';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { AssetBadge } from '@/components/common/Badge';
import { PriceUpdateModal } from '@/components/asset/PriceUpdateModal';
import { AssetForm } from '@/components/asset/AssetForm';
import { TransactionForm } from '@/components/transaction/TransactionForm';
import { CalcService } from '@/services/CalcService';
import { TRANSACTION_TYPE_LABELS } from '@/types/transaction.types';
import type { Transaction } from '@/types/transaction.types';
import { AMOUNT_TYPES, SINGLE_TYPES } from '@/types/asset.types';
import { useSettingsStore } from '@/store/settingsStore';

export default function AssetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { asset, transactions, stats } = useAssetDetail(id ?? '');
  const { updatePrice, updateAsset, deleteAsset } = useAssetStore();
  const { addTransaction, deleteTransaction } = useTxStore();

  const { exchangeRates } = useSettingsStore();
  const isForeign = asset?.currency !== 'KRW';
  const toKrw = (v: number) =>
    asset ? CalcService.convertToBase(v, asset.currency, 'KRW', exchangeRates) : v;

  // 카드에 원화 병기가 필요할 때 사용하는 헬퍼
  const dualValue = (amount: number, formatted: string) =>
    isForeign ? (
      <>
        {formatted}
        <span className="block text-sm font-normal text-gray-400 mt-1">
          ≈ {CalcService.formatCurrency(toKrw(amount))}
        </span>
      </>
    ) : (
      formatted
    );

  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);

  if (!asset || !stats) {
    return (
      <div className="text-center py-20 text-gray-400">
        자산을 찾을 수 없습니다.{' '}
        <button onClick={() => navigate('/assets')} className="text-blue-600 hover:underline">
          목록으로
        </button>
      </div>
    );
  }

  const handleDeleteAsset = async () => {
    if (!confirm(`"${asset.name}" 자산과 관련 거래 내역을 모두 삭제할까요?`)) return;
    await deleteAsset(asset.id);
    navigate('/assets');
  };

  const handleDeleteTx = async (txId: string) => {
    if (!confirm('이 거래 내역을 삭제할까요?')) return;
    await deleteTransaction(txId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate(-1)} className="text-sm text-gray-400 hover:text-gray-700 mb-1">
            ← 뒤로
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">{asset.name}</h2>
            <AssetBadge type={asset.type} />
          </div>
          {asset.ticker && (
            <p className="text-sm text-gray-400 mt-0.5">{asset.ticker} · {asset.market}</p>
          )}
        </div>
        <div className="flex gap-2">
          {!AMOUNT_TYPES.includes(asset.type) && (
            <Button variant="secondary" size="sm" onClick={() => setShowPriceModal(true)}>
              {SINGLE_TYPES.includes(asset.type) ? '시세 업데이트' : '현재가 업데이트'}
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={() => setShowEditModal(true)}>
            편집
          </Button>
          <Button variant="danger" size="sm" onClick={handleDeleteAsset}>
            삭제
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      {AMOUNT_TYPES.includes(asset.type) ? (
        // 현금·예금: 보유금액만 표시 (현재가·수량 개념 없음)
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card
            title="보유금액"
            value={dualValue(
              stats.currentValue,
              CalcService.formatCurrency(stats.currentValue, asset.currency)
            )}
          />
        </div>
      ) : SINGLE_TYPES.includes(asset.type) ? (
        // 부동산: 시세·취득가액·평가손익 표시 (수량=1 고정)
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            title="현재 시세"
            value={dualValue(
              stats.currentValue,
              CalcService.formatCurrency(stats.currentValue, asset.currency)
            )}
          />
          <Card
            title="취득가액"
            value={dualValue(
              stats.avgCost,
              CalcService.formatCurrency(stats.avgCost, asset.currency)
            )}
          />
          <Card
            title="평가손익"
            value={dualValue(
              Math.abs(stats.unrealizedPnL),
              CalcService.formatCurrency(Math.abs(stats.unrealizedPnL), asset.currency)
            )}
            sub={CalcService.formatRate(stats.unrealizedPnLRate)}
            trend={stats.unrealizedPnL > 0 ? 'up' : stats.unrealizedPnL < 0 ? 'down' : 'neutral'}
          />
        </div>
      ) : (
        // 주식·ETF·가상화폐·기타: 전체 카드 표시
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card
            title="현재 평가금액"
            value={dualValue(
              stats.currentValue,
              CalcService.formatCurrency(stats.currentValue, asset.currency)
            )}
          />
          <Card
            title="평균 매입단가"
            value={dualValue(
              stats.avgCost,
              `${new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 2 }).format(stats.avgCost)} ${asset.currency}`
            )}
          />
          <Card
            title="평가손익"
            value={dualValue(
              Math.abs(stats.unrealizedPnL),
              CalcService.formatCurrency(Math.abs(stats.unrealizedPnL), asset.currency)
            )}
            sub={CalcService.formatRate(stats.unrealizedPnLRate)}
            trend={stats.unrealizedPnL > 0 ? 'up' : stats.unrealizedPnL < 0 ? 'down' : 'neutral'}
          />
          <Card
            title="보유 수량"
            value={stats.totalQuantity.toLocaleString()}
          />
        </div>
      )}

      {/* 거래 내역 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">거래 내역</h3>
          <Button size="sm" onClick={() => setShowTxModal(true)}>
            + 거래 추가
          </Button>
        </div>

        {transactions.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            거래 내역이 없습니다
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50">
                <th className="text-left px-5 py-3 text-gray-500 font-medium">날짜</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">유형</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">수량</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">단가</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">금액</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-gray-700">{tx.date}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {TRANSACTION_TYPE_LABELS[tx.type]}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {tx.quantity != null ? tx.quantity.toLocaleString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {tx.price != null
                      ? new Intl.NumberFormat('ko-KR').format(tx.price)
                      : '-'}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {CalcService.formatCurrency(tx.amount, asset.currency)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDeleteTx(tx.id)}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 모달들 */}
      {showPriceModal && (
        <PriceUpdateModal
          asset={asset}
          isOpen={true}
          onClose={() => setShowPriceModal(false)}
          onUpdate={(price) => updatePrice(asset.id, price)}
        />
      )}

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="자산 편집"
      >
        <AssetForm
          initial={asset}
          onSubmit={async (data) => {
            await updateAsset(asset.id, data);
            setShowEditModal(false);
          }}
          onCancel={() => setShowEditModal(false)}
          submitLabel="저장"
        />
      </Modal>

      <Modal
        isOpen={showTxModal || editTx !== null}
        onClose={() => { setShowTxModal(false); setEditTx(null); }}
        title={editTx ? '거래 수정' : '거래 추가'}
      >
        <TransactionForm
          fixedAssetId={asset.id}
          initial={editTx ?? undefined}
          onSubmit={async (data) => {
            await addTransaction(data);
            setShowTxModal(false);
            setEditTx(null);
          }}
          onCancel={() => { setShowTxModal(false); setEditTx(null); }}
        />
      </Modal>
    </div>
  );
}
