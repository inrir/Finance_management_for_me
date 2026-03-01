import type { AssetType } from '@/types/asset.types';
import { ASSET_TYPE_LABELS } from '@/types/asset.types';
import { ASSET_TYPE_COLORS } from '@/store/assetStore';

interface BadgeProps {
  type: AssetType;
  size?: 'sm' | 'md';
}

export function AssetBadge({ type, size = 'md' }: BadgeProps) {
  const color = ASSET_TYPE_COLORS[type];
  const label = ASSET_TYPE_LABELS[type];
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${padding}`}
      style={{ backgroundColor: `${color}20`, color }}
    >
      {label}
    </span>
  );
}
