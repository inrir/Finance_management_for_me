import type { Asset, AssetType, Currency } from '@/types/asset.types';
import type { Transaction } from '@/types/transaction.types';

export interface AssetStats {
  assetId: string;
  avgCost: number;           // 평균 매입단가
  totalCost: number;         // 총 투자원금 (현재 보유분 원가)
  totalQuantity: number;     // 현재 보유 수량
  currentValue: number;      // 현재 평가금액 (currentPrice × quantity)
  unrealizedPnL: number;     // 평가손익
  unrealizedPnLRate: number; // 평가수익률(%)
  realizedPnL: number;       // 실현손익
  dividendTotal: number;     // 배당·이자 합계
}

export interface PortfolioStats {
  totalValue: number;
  totalCost: number;
  totalUnrealizedPnL: number;
  totalUnrealizedPnLRate: number;
}

export interface AllocationItem {
  value: number;
  ratio: number; // 0~100
}

export type AllocationMap = Partial<Record<AssetType, AllocationItem>>;

export class CalcService {
  /**
   * 자산별 통계 계산 (이동평균법).
   * - BUY: 매입단가 누적, avgCost 재계산
   * - SELL: 실현손익 계산 후 원가 차감 (avgCost 유지)
   * - DEPOSIT/WITHDRAW: 현금 자산 처리 (quantity = 금액, price = 1)
   * - DIVIDEND: 별도 배당 합계
   */
  static calcAssetStats(asset: Asset, transactions: Transaction[]): AssetStats {
    let totalCost = 0;
    let totalQuantity = 0;
    let avgCost = 0;
    let realizedPnL = 0;
    let dividendTotal = 0;

    const sorted = [...transactions].sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    for (const tx of sorted) {
      switch (tx.type) {
        case 'BUY': {
          const qty = tx.quantity ?? 0;
          const unitPrice = tx.price ?? 0;
          const fee = tx.fee ?? 0;
          const cost = qty * unitPrice + fee;
          totalCost += cost;
          totalQuantity += qty;
          avgCost = totalQuantity > 0 ? totalCost / totalQuantity : 0;
          break;
        }
        case 'SELL': {
          const qty = tx.quantity ?? 0;
          const sellPrice = tx.price ?? 0;
          const fee = tx.fee ?? 0;
          const proceeds = sellPrice * qty - fee;
          realizedPnL += proceeds - avgCost * qty;
          totalCost -= avgCost * qty; // 보유 원가에서 해당 수량 원가 차감
          totalQuantity -= qty;
          // avgCost는 그대로 유지
          break;
        }
        case 'DEPOSIT': {
          // 현금 자산: 금액 = 수량
          totalCost += tx.amount;
          totalQuantity += tx.amount;
          avgCost = totalQuantity > 0 ? totalCost / totalQuantity : 0;
          break;
        }
        case 'WITHDRAW': {
          // 출금 비율만큼 원가·수량 차감
          if (totalQuantity > 0) {
            const ratio = tx.amount / totalQuantity;
            totalCost -= totalCost * ratio;
          }
          totalQuantity -= tx.amount;
          break;
        }
        case 'DIVIDEND': {
          dividendTotal += tx.amount;
          break;
        }
      }
    }

    // 음수 수량 방어 (매도 오입력 등)
    if (totalQuantity < 0) totalQuantity = 0;
    if (totalCost < 0) totalCost = 0;

    const currentValue = asset.currentPrice * totalQuantity;
    const unrealizedPnL = currentValue - totalCost;
    const unrealizedPnLRate =
      totalCost > 0 ? (unrealizedPnL / totalCost) * 100 : 0;

    return {
      assetId: asset.id,
      avgCost,
      totalCost,
      totalQuantity,
      currentValue,
      unrealizedPnL,
      unrealizedPnLRate,
      realizedPnL,
      dividendTotal,
    };
  }

  /**
   * 포트폴리오 전체 집계.
   * 모든 자산의 통계를 합산한다.
   */
  static calcPortfolioStats(statsList: AssetStats[]): PortfolioStats {
    const totalValue = statsList.reduce((s, a) => s + a.currentValue, 0);
    const totalCost = statsList.reduce((s, a) => s + a.totalCost, 0);
    const totalUnrealizedPnL = totalValue - totalCost;
    const totalUnrealizedPnLRate =
      totalCost > 0 ? (totalUnrealizedPnL / totalCost) * 100 : 0;

    return {
      totalValue,
      totalCost,
      totalUnrealizedPnL,
      totalUnrealizedPnLRate,
    };
  }

  /**
   * CAGR (연환산 수익률).
   * 음수·0 방어 처리 포함.
   */
  static calcCAGR(
    startValue: number,
    endValue: number,
    days: number
  ): number {
    if (startValue <= 0 || endValue <= 0 || days < 1) return 0;
    const years = days / 365;
    return (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
  }

  /**
   * 자산 유형별 비중 계산.
   */
  static calcAllocation(
    statsList: AssetStats[],
    assets: Asset[]
  ): AllocationMap {
    const totalValue = statsList.reduce((s, a) => s + a.currentValue, 0);
    const byType: Partial<Record<AssetType, number>> = {};

    for (const stat of statsList) {
      const asset = assets.find((a) => a.id === stat.assetId);
      if (!asset) continue;
      byType[asset.type] = (byType[asset.type] ?? 0) + stat.currentValue;
    }

    const result: AllocationMap = {};
    for (const [type, value] of Object.entries(byType)) {
      result[type as AssetType] = {
        value,
        ratio: totalValue > 0 ? (value / totalValue) * 100 : 0,
      };
    }
    return result;
  }

  /**
   * 통화 변환 (KRW 기준 환율표 사용).
   * rates 형식: { USD: 1350, JPY: 9 } → 1 USD = 1350 KRW
   */
  static convertToBase(
    amount: number,
    fromCurrency: Currency,
    baseCurrency: Currency,
    rates: Record<Currency, number>
  ): number {
    if (fromCurrency === baseCurrency) return amount;
    // fromCurrency → KRW → baseCurrency
    const toKRW = rates[fromCurrency] ?? 1;
    const fromKRW = rates[baseCurrency] ?? 1;
    return amount * (toKRW / fromKRW);
  }

  /**
   * 숫자 포맷 유틸리티.
   */
  static formatCurrency(
    amount: number,
    currency: Currency = 'KRW'
  ): string {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency,
      maximumFractionDigits: currency === 'KRW' ? 0 : 2,
    }).format(amount);
  }

  static formatRate(rate: number): string {
    const sign = rate >= 0 ? '+' : '';
    return `${sign}${rate.toFixed(2)}%`;
  }
}
