import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { AssetType } from '@/types/asset.types';
import { ASSET_TYPE_LABELS } from '@/types/asset.types';
import { ASSET_TYPE_COLORS } from '@/store/assetStore';
import type { AllocationMap } from '@/services/CalcService';

interface DonutChartProps {
  allocation: AllocationMap;
  height?: number;
}

export function DonutChart({ allocation, height = 300 }: DonutChartProps) {
  const data = Object.entries(allocation)
    .filter(([, item]) => item.value > 0)
    .map(([type, item]) => ({
      name: ASSET_TYPE_LABELS[type as AssetType],
      value: item.value,
      ratio: item.ratio,
      type: type as AssetType,
    }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
        자산을 추가하면 비중이 표시됩니다
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius="55%"
          outerRadius="75%"
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry) => (
            <Cell key={entry.type} fill={ASSET_TYPE_COLORS[entry.type]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number | undefined) =>
            new Intl.NumberFormat('ko-KR').format(Math.round(value ?? 0))
          }
        />
        <Legend
          formatter={(value, entry) => {
            const ratio = (entry.payload as { ratio: number }).ratio;
            return `${value} ${ratio.toFixed(1)}%`;
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
