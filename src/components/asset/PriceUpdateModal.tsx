import { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import type { Asset } from '@/types/asset.types';

interface PriceUpdateModalProps {
  asset: Asset;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (price: number) => Promise<void>;
}

export function PriceUpdateModal({
  asset,
  isOpen,
  onClose,
  onUpdate,
}: PriceUpdateModalProps) {
  const [price, setPrice] = useState(asset.currentPrice);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (price < 0) return;
    setLoading(true);
    try {
      await onUpdate(price);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="현재가 업데이트" size="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-sm text-gray-500">
          <span className="font-medium text-gray-900">{asset.name}</span>의 현재가를 입력해주세요.
        </p>
        <Input
          label={`현재가 (${asset.currency})`}
          type="number"
          min="0"
          step="any"
          value={price}
          onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
          autoFocus
        />
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" loading={loading}>
            업데이트
          </Button>
        </div>
      </form>
    </Modal>
  );
}
