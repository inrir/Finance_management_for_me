import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Currency } from '@/types/asset.types';
import { SUPPORTED_CURRENCIES } from '@/types/asset.types';

// Currency 타입에 새 통화 추가 시 여기 defaultRates도 함께 업데이트
const defaultRates: Record<Currency, number> = {
  KRW: 1,
  USD: 1350,
  JPY: 9,
};

interface SettingsState {
  baseCurrency: Currency;
  exchangeRates: Record<Currency, number>;
  supportedCurrencies: Currency[];

  setBaseCurrency: (currency: Currency) => void;
  setExchangeRate: (currency: Currency, rate: number) => void;
  getRate: (from: Currency) => number; // → KRW 기준 환율 반환
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      baseCurrency: 'KRW',
      exchangeRates: defaultRates,
      supportedCurrencies: SUPPORTED_CURRENCIES,

      setBaseCurrency: (currency) => set({ baseCurrency: currency }),

      setExchangeRate: (currency, rate) =>
        set((s) => ({
          exchangeRates: { ...s.exchangeRates, [currency]: rate },
        })),

      getRate: (from) => get().exchangeRates[from] ?? 1,
    }),
    { name: 'finance-settings' }
  )
);
