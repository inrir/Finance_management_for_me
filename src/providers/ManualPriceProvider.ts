import type { Market } from '@/types/asset.types';
import type { PriceProvider, PriceResult } from './PriceProvider.interface';

/**
 * MVP 수동 입력 Provider.
 * Asset에 저장된 currentPrice를 그대로 반환한다.
 */
export class ManualPriceProvider implements PriceProvider {
  name = 'manual';
  supportedMarkets: Market[] = ['KRX', 'NYSE', 'NASDAQ', 'CRYPTO', 'NONE'];

  async fetchPrice(ticker: string, currentPrice = 0): Promise<PriceResult> {
    return {
      ticker,
      price: currentPrice,
      currency: 'KRW',
      source: 'manual',
      fetchedAt: new Date().toISOString(),
    };
  }

  async fetchBatch(
    items: { ticker: string; currentPrice?: number }[]
  ): Promise<PriceResult[]> {
    return Promise.all(
      items.map((item) => this.fetchPrice(item.ticker, item.currentPrice ?? 0))
    );
  }
}
