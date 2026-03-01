import { Link } from 'react-router-dom';
import { useAssets } from '@/hooks/useAssets';
import { useTxStore } from '@/store/txStore';
import { Card } from '@/components/common/Card';
import { DonutChart } from '@/components/charts/DonutChart';
import { AssetBadge } from '@/components/common/Badge';
import { CalcService } from '@/services/CalcService';
import { TRANSACTION_TYPE_LABELS } from '@/types/transaction.types';

export default function Dashboard() {
  const { portfolioStats, allocation } = useAssets();
  const transactions = useTxStore((s) => s.transactions);

  const recentTxs = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const pnl = portfolioStats.totalUnrealizedPnL;
  const rate = portfolioStats.totalUnrealizedPnLRate;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">대시보드</h2>
        <p className="text-sm text-gray-400 mt-1">전체 자산 현황</p>
      </div>

      {/* 요약 카드 */}
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
          title="평가손익"
          value={CalcService.formatCurrency(Math.abs(pnl))}
          sub={CalcService.formatRate(rate)}
          trend={pnl > 0 ? 'up' : pnl < 0 ? 'down' : 'neutral'}
        />
        <Card
          title="수익률"
          value={CalcService.formatRate(rate)}
          trend={rate > 0 ? 'up' : rate < 0 ? 'down' : 'neutral'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 자산 비중 차트 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-base font-semibold text-gray-900 mb-4">자산 비중</h3>
          <DonutChart allocation={allocation} height={280} />
        </div>

        {/* 최근 거래 내역 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">최근 거래</h3>
            <Link to="/transactions" className="text-xs text-blue-600 hover:underline">
              전체 보기
            </Link>
          </div>

          {recentTxs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              거래 내역이 없습니다
            </p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {recentTxs.map((tx) => (
                <li key={tx.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AssetBadge
                      type={'stock'}
                      size="sm"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {TRANSACTION_TYPE_LABELS[tx.type]}
                      </p>
                      <p className="text-xs text-gray-400">{tx.date}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {CalcService.formatCurrency(tx.amount)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
