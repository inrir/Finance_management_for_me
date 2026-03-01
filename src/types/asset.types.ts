export type AssetType =
  | 'cash'
  | 'deposit'
  | 'stock'
  | 'etf'
  | 'realestate'
  | 'crypto'
  | 'other';

export type Market = 'KRX' | 'NYSE' | 'NASDAQ' | 'CRYPTO' | 'NONE';

// 확장 시 이 타입에만 추가 (settingsStore.exchangeRates도 함께 업데이트)
export type Currency = 'KRW' | 'USD' | 'JPY';

export const SUPPORTED_CURRENCIES: Currency[] = ['KRW', 'USD', 'JPY'];

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  cash: '현금',
  deposit: '예·적금',
  stock: '주식',
  etf: 'ETF',
  realestate: '부동산',
  crypto: '가상화폐',
  other: '기타',
};

/**
 * 자산 유형 그룹 분류
 *
 * PRICE_QTY: 현재가(단가) + 수량 → 주식·ETF·가상화폐·기타
 * AMOUNT:    보유금액 단일 입력  → 현금·예·적금 (currentPrice=1 고정, quantity=금액)
 * SINGLE:    시세 단일 입력     → 부동산 (quantity=1 고정, currentPrice=시세)
 */
export const PRICE_QTY_TYPES: AssetType[] = ['stock', 'etf', 'crypto', 'other'];
export const AMOUNT_TYPES: AssetType[]    = ['cash', 'deposit'];
export const SINGLE_TYPES: AssetType[]    = ['realestate'];

/** 현재가 수기 업데이트가 필요한 유형 (일괄 입력 대상) */
export const NEEDS_PRICE_UPDATE_TYPES: AssetType[] = [...PRICE_QTY_TYPES, ...SINGLE_TYPES];

export const MARKET_LABELS: Record<Market, string> = {
  KRX: '한국거래소',
  NYSE: 'NYSE',
  NASDAQ: 'NASDAQ',
  CRYPTO: '가상화폐',
  NONE: '해당없음',
};

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  ticker?: string;
  market: Market;
  currency: Currency;
  currentPrice: number;
  quantity: number;
  priceProvider: string; // 'manual' | 향후 'KIS' 등
  memo?: string;
  priceUpdatedAt: string;
  createdAt: string;
}
