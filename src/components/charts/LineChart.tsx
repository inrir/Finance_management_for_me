import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { Snapshot } from '@/types/snapshot.types';

interface LineChartProps {
  snapshots: Snapshot[];
  height?: number;
}

export function AssetLineChart({ snapshots, height = 300 }: LineChartProps) {
  const data = snapshots.map((s) => ({
    date: s.date,
    평가금액: Math.round(s.totalValue),
    투자원금: Math.round(s.totalCost),
  }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
        스냅샷을 저장하면 추이 차트가 표시됩니다
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReLineChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis
          tickFormatter={(v: number) =>
            v >= 100000000
              ? `${(v / 100000000).toFixed(1)}억`
              : v >= 10000
                ? `${(v / 10000).toFixed(0)}만`
                : String(v)
          }
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          formatter={(value: number | undefined) =>
            new Intl.NumberFormat('ko-KR', {
              style: 'currency',
              currency: 'KRW',
              maximumFractionDigits: 0,
            }).format(value ?? 0)
          }
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="평가금액"
          stroke="#10B981"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="투자원금"
          stroke="#3B82F6"
          strokeWidth={2}
          dot={false}
          strokeDasharray="5 5"
        />
      </ReLineChart>
    </ResponsiveContainer>
  );
}
