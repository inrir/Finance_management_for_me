import type { Market } from '@/types/asset.types';

export interface PriceResult {
  ticker: string;
  price: number;
  currency: string;
  source: string; // 'manual' | 'KIS' | 'yahoo' | ...
  fetchedAt: string;
}

/**
 * 시세 조회 Provider 공통 인터페이스.
 * Phase 3에서 KIS/Yahoo 등 외부 API Provider 추가 시 이 인터페이스를 구현한다.
 */
export interface PriceProvider {
  name: string;
  supportedMarkets: Market[];
  fetchPrice(ticker: string, currentPrice?: number): Promise<PriceResult>;
  fetchBatch?(
    tickers: { ticker: string; currentPrice?: number }[]
  ): Promise<PriceResult[]>;
}
