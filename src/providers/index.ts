import { ManualPriceProvider } from './ManualPriceProvider';
import type { PriceProvider } from './PriceProvider.interface';

/**
 * 등록된 Price Provider 맵.
 * Phase 3에서 KISProvider 추가 시 여기에 등록만 하면 된다.
 *
 * 예시:
 *   import { KISPriceProvider } from './KISPriceProvider';
 *   providers['KIS'] = new KISPriceProvider(apiKey);
 */
const providers: Record<string, PriceProvider> = {
  manual: new ManualPriceProvider(),
};

export function getPriceProvider(name: string): PriceProvider {
  return providers[name] ?? providers['manual'];
}

export function getRegisteredProviderNames(): string[] {
  return Object.keys(providers);
}
