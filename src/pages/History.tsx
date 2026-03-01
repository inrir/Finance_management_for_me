import { useState } from 'react';
import { useSnapshotStore } from '@/store/snapshotStore';
import { useAssetStore } from '@/store/assetStore';
import { useTxStore } from '@/store/txStore';
import { Button } from '@/components/common/Button';
import { AssetLineChart } from '@/components/charts/LineChart';
import { CalcService } from '@/services/CalcService';
import { SnapshotService } from '@/services/SnapshotService';
import { EmptyState } from '@/components/common/EmptyState';

export default function History() {
  const { snapshots, deleteSnapshot, loadSnapshots } = useSnapshotStore();
  const assets = useAssetStore((s) => s.assets);
  const transactions = useTxStore((s) => s.transactions);
  const [loading, setLoading] = useState(false);

  const handleSaveNow = async () => {
    setLoading(true);
    try {
      await SnapshotService.saveCurrentSnapshot(assets, transactions);
      await loadSnapshots();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, date: string) => {
    if (!confirm(`${date} 스냅샷을 삭제할까요?`)) return;
    await deleteSnapshot(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">자산 추이</h2>
          <p className="text-sm text-gray-400 mt-1">월별 스냅샷 기반</p>
        </div>
        <Button onClick={handleSaveNow} loading={loading}>
          이번 달 스냅샷 저장
        </Button>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-4">자산 추이 차트</h3>
        <AssetLineChart snapshots={snapshots} height={320} />
      </div>

      {snapshots.length === 0 ? (
        <EmptyState
          title="스냅샷이 없습니다"
          description="이번 달 스냅샷을 저장하면 추이가 기록됩니다"
          action={
            <Button onClick={handleSaveNow} loading={loading}>
              스냅샷 저장
            </Button>
          }
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">스냅샷 목록</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50">
                <th className="text-left px-5 py-3 text-gray-500 font-medium">날짜</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">평가금액</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">투자원금</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">손익</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[...snapshots].reverse().map((snap) => {
                const pnl = snap.totalValue - snap.totalCost;
                const rate = snap.totalCost > 0 ? (pnl / snap.totalCost) * 100 : 0;
                return (
                  <tr key={snap.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-900">{snap.date}</td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {CalcService.formatCurrency(snap.totalValue)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {CalcService.formatCurrency(snap.totalCost)}
                    </td>
                    <td className={`px-4 py-3 text-right font-medium ${pnl > 0 ? 'text-emerald-600' : pnl < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                      {pnl >= 0 ? '+' : ''}{CalcService.formatCurrency(pnl)}
                      <span className="text-xs ml-1 opacity-70">
                        ({CalcService.formatRate(rate)})
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(snap.id, snap.date)}
                        className="text-xs text-red-400 hover:text-red-600"
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
    </div>
  );
}
