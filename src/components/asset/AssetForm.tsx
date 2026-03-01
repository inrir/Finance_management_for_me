import { useState } from 'react';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Button } from '@/components/common/Button';
import type { AssetFormData } from '@/store/assetStore';
import { DEFAULT_ASSET_FORM } from '@/store/assetStore';
import {
  ASSET_TYPE_LABELS, MARKET_LABELS, SUPPORTED_CURRENCIES,
  AMOUNT_TYPES, SINGLE_TYPES,
} from '@/types/asset.types';
import type { AssetType, Market, Currency } from '@/types/asset.types';

interface AssetFormProps {
  initial?: Partial<AssetFormData>;
  onSubmit: (data: AssetFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function AssetForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = '저장',
}: AssetFormProps) {
  const [form, setForm] = useState<AssetFormData>({
    ...DEFAULT_ASSET_FORM,
    ...initial,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof AssetFormData, string>>>({});

  const isAmountType = AMOUNT_TYPES.includes(form.type);
  const isSingleType = SINGLE_TYPES.includes(form.type);

  const set = (key: keyof AssetFormData, value: string | number) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = (): boolean => {
    const errs: Partial<Record<keyof AssetFormData, string>> = {};
    if (!form.name.trim()) errs.name = '자산명을 입력해주세요';
    if (isAmountType) {
      if (form.quantity < 0) errs.quantity = '보유금액은 0 이상이어야 합니다';
    } else if (isSingleType) {
      if (form.currentPrice < 0) errs.currentPrice = '시세는 0 이상이어야 합니다';
    } else {
      if (form.currentPrice < 0) errs.currentPrice = '현재가는 0 이상이어야 합니다';
      if (form.quantity < 0) errs.quantity = '수량은 0 이상이어야 합니다';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // 유형에 따라 내부 값 정규화
      const submitData: AssetFormData = isAmountType
        ? { ...form, currentPrice: 1 }       // 현금·예금: 단가=1, 수량=금액
        : isSingleType
        ? { ...form, quantity: 1 }            // 부동산: 수량=1, 단가=시세
        : form;
      await onSubmit(submitData);
    } finally {
      setLoading(false);
    }
  };

  const assetTypeOptions = Object.entries(ASSET_TYPE_LABELS).map(([v, l]) => ({
    value: v,
    label: l,
  }));
  const marketOptions = Object.entries(MARKET_LABELS).map(([v, l]) => ({
    value: v,
    label: l,
  }));
  const currencyOptions = SUPPORTED_CURRENCIES.map((c) => ({ value: c, label: c }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="자산명 *"
        value={form.name}
        onChange={(e) => set('name', e.target.value)}
        placeholder="예: 삼성전자, S&P500 ETF"
        error={errors.name}
      />

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="자산 유형"
          value={form.type}
          onChange={(e) => set('type', e.target.value as AssetType)}
          options={assetTypeOptions}
        />
        <Select
          label="시장"
          value={form.market}
          onChange={(e) => set('market', e.target.value as Market)}
          options={marketOptions}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="통화"
          value={form.currency}
          onChange={(e) => set('currency', e.target.value as Currency)}
          options={currencyOptions}
        />
        <Input
          label="종목코드 (선택)"
          value={form.ticker ?? ''}
          onChange={(e) => set('ticker', e.target.value)}
          placeholder="예: 005930"
        />
      </div>

      {isAmountType ? (
        <Input
          label="보유금액"
          type="number"
          min="0"
          step="any"
          value={form.quantity}
          onChange={(e) => set('quantity', parseFloat(e.target.value) || 0)}
          error={errors.quantity}
          hint="현재 보유 중인 금액을 입력합니다"
        />
      ) : isSingleType ? (
        <Input
          label="현재 시세"
          type="number"
          min="0"
          step="any"
          value={form.currentPrice}
          onChange={(e) => set('currentPrice', parseFloat(e.target.value) || 0)}
          error={errors.currentPrice}
          hint="현재 부동산 시세를 입력합니다"
        />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="현재가"
            type="number"
            min="0"
            step="any"
            value={form.currentPrice}
            onChange={(e) => set('currentPrice', parseFloat(e.target.value) || 0)}
            error={errors.currentPrice}
          />
          <Input
            label="수량"
            type="number"
            min="0"
            step="any"
            value={form.quantity}
            onChange={(e) => set('quantity', parseFloat(e.target.value) || 0)}
            error={errors.quantity}
          />
        </div>
      )}

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
