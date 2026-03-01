import { useState, useEffect } from 'react';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Button } from '@/components/common/Button';
import { useAssetStore } from '@/store/assetStore';
import type { TransactionFormData } from '@/store/txStore';
import { DEFAULT_TX_FORM } from '@/store/txStore';
import { TRANSACTION_TYPE_LABELS } from '@/types/transaction.types';
import type { TransactionType } from '@/types/transaction.types';

interface TransactionFormProps {
  initial?: Partial<TransactionFormData>;
  fixedAssetId?: string;
  onSubmit: (data: TransactionFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

const TX_TYPES_WITH_QTY: TransactionType[] = ['BUY', 'SELL'];

export function TransactionForm({
  initial,
  fixedAssetId,
  onSubmit,
  onCancel,
  submitLabel = '저장',
}: TransactionFormProps) {
  const assets = useAssetStore((s) => s.assets);
  const [form, setForm] = useState<TransactionFormData>({
    ...DEFAULT_TX_FORM,
    ...initial,
    ...(fixedAssetId ? { assetId: fixedAssetId } : {}),
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const isQtyBased = TX_TYPES_WITH_QTY.includes(form.type);

  useEffect(() => {
    if (isQtyBased && form.quantity && form.price) {
      const fee = form.fee ?? 0;
      const computed =
        form.type === 'BUY'
          ? form.quantity * form.price + fee
          : form.quantity * form.price - fee;
      setForm((f) => ({ ...f, amount: Math.max(0, computed) }));
    }
  }, [form.type, form.quantity, form.price, form.fee, isQtyBased]);

  const set = (key: keyof TransactionFormData, value: string | number | undefined) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = (): boolean => {
    const errs: Partial<Record<string, string>> = {};
    if (!form.assetId) errs.assetId = '자산을 선택해주세요';
    if (!form.date) errs.date = '날짜를 입력해주세요';
    if (isQtyBased) {
      if (!form.quantity || form.quantity <= 0) errs.quantity = '수량을 입력해주세요';
      if (!form.price || form.price <= 0) errs.price = '단가를 입력해주세요';
    } else {
      if (!form.amount || form.amount <= 0) errs.amount = '금액을 입력해주세요';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // 매도 수량 초과 검사
  const validateSellQty = (): boolean => {
    if (form.type !== 'SELL' || !form.quantity) return true;
    const asset = assets.find((a) => a.id === form.assetId);
    if (asset && form.quantity > asset.quantity) {
      setErrors((e) => ({ ...e, quantity: `보유 수량(${asset.quantity})을 초과할 수 없습니다` }));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !validateSellQty()) return;
    setLoading(true);
    try {
      await onSubmit(form);
    } finally {
      setLoading(false);
    }
  };

  const assetOptions = assets.map((a) => ({ value: a.id, label: a.name }));
  const typeOptions = Object.entries(TRANSACTION_TYPE_LABELS).map(([v, l]) => ({
    value: v,
    label: l,
  }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {!fixedAssetId && (
        <Select
          label="자산 *"
          value={form.assetId}
          onChange={(e) => set('assetId', e.target.value)}
          options={[{ value: '', label: '자산 선택' }, ...assetOptions]}
          error={errors.assetId}
        />
      )}

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="거래 유형"
          value={form.type}
          onChange={(e) => set('type', e.target.value as TransactionType)}
          options={typeOptions}
        />
        <Input
          label="거래일 *"
          type="date"
          value={form.date}
          onChange={(e) => set('date', e.target.value)}
          error={errors.date}
        />
      </div>

      {isQtyBased && (
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="수량 *"
            type="number"
            min="0"
            step="any"
            value={form.quantity ?? ''}
            onChange={(e) => set('quantity', parseFloat(e.target.value) || undefined)}
            error={errors.quantity}
          />
          <Input
            label="단가 *"
            type="number"
            min="0"
            step="any"
            value={form.price ?? ''}
            onChange={(e) => set('price', parseFloat(e.target.value) || undefined)}
            error={errors.price}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="거래금액"
          type="number"
          min="0"
          step="any"
          value={form.amount}
          onChange={(e) => set('amount', parseFloat(e.target.value) || 0)}
          readOnly={isQtyBased}
          error={errors.amount}
          hint={isQtyBased ? '수량 × 단가로 자동 계산' : ''}
        />
        <Input
          label="수수료"
          type="number"
          min="0"
          step="any"
          value={form.fee ?? ''}
          onChange={(e) => set('fee', parseFloat(e.target.value) || undefined)}
        />
      </div>

      <Input
        label="메모 (선택)"
        value={form.memo ?? ''}
        onChange={(e) => set('memo', e.target.value)}
        placeholder="자유롭게 입력"
      />

      <div className="flex gap-2 justify-end pt-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            취소
          </Button>
        )}
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
