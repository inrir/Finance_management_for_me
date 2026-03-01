/**
 * 개발 전용 테스트 데이터 시드.
 * 빌드 시에는 포함되지 않는다 (import.meta.env.DEV 조건부).
 */
import { storageAdapter } from '@/adapters';
import { nanoid } from 'nanoid';
import type { Asset } from '@/types/asset.types';
import type { Transaction } from '@/types/transaction.types';

export async function seedDevData(force = false) {
  // 이미 데이터가 있으면 시드하지 않음 (force=true면 덮어씀)
  const existing = await storageAdapter.getAssets();
  if (existing.length > 0 && !force) return;

  // 기존 데이터 전체 초기화 후 재시드
  const { assets: existingAssets, transactions: existingTxs, snapshots: existingSnaps } =
    await storageAdapter.exportAll();
  if (existingAssets.length > 0 || existingTxs.length > 0 || existingSnaps.length > 0) {
    await storageAdapter.importAll({ assets: [], transactions: [], snapshots: [], exportedAt: '', version: 1 });
  }

  const now = new Date().toISOString();

  const assets: Asset[] = [
    {
      id: 'asset-1',
      name: '삼성전자',
      type: 'stock',
      ticker: '005930',
      market: 'KRX',
      currency: 'KRW',
      currentPrice: 75000,
      quantity: 100,
      priceProvider: 'manual',
      memo: '장기 보유',
      priceUpdatedAt: now,
      createdAt: now,
    },
    {
      id: 'asset-2',
      name: 'S&P500 ETF (SPY)',
      type: 'etf',
      ticker: 'SPY',
      market: 'NYSE',
      currency: 'USD',
      currentPrice: 520,
      quantity: 5,
      priceProvider: 'manual',
      memo: '미국 지수 추종',
      priceUpdatedAt: now,
      createdAt: now,
    },
    {
      id: 'asset-3',
      name: '비트코인',
      type: 'crypto',
      ticker: 'BTC',
      market: 'CRYPTO',
      currency: 'USD',
      currentPrice: 95000,
      quantity: 0.15,
      priceProvider: 'manual',
      memo: '',
      priceUpdatedAt: now,
      createdAt: now,
    },
    {
      id: 'asset-4',
      name: 'KB 정기예금',
      type: 'deposit',
      ticker: undefined,
      market: 'NONE',
      currency: 'KRW',
      currentPrice: 1,
      quantity: 5000000,
      priceProvider: 'manual',
      memo: '연 4.2% 12개월',
      priceUpdatedAt: now,
      createdAt: now,
    },
    {
      id: 'asset-5',
      name: '현금 (KRW)',
      type: 'cash',
      ticker: undefined,
      market: 'NONE',
      currency: 'KRW',
      currentPrice: 1,
      quantity: 2000000,
      priceProvider: 'manual',
      memo: '',
      priceUpdatedAt: now,
      createdAt: now,
    },
  ];

  const transactions: Transaction[] = [
    // 삼성전자 매수 2회
    {
      id: nanoid(), assetId: 'asset-1', type: 'BUY',
      date: '2024-06-10', quantity: 60, price: 78000,
      amount: 4680000, fee: 4680, memo: '1차 매수', createdAt: now,
    },
    {
      id: nanoid(), assetId: 'asset-1', type: 'BUY',
      date: '2024-09-20', quantity: 40, price: 70000,
      amount: 2800000, fee: 2800, memo: '추가 매수 (하락 시)', createdAt: now,
    },
    // SPY 매수
    {
      id: nanoid(), assetId: 'asset-2', type: 'BUY',
      date: '2024-03-15', quantity: 3, price: 490,
      amount: 1470, fee: 1.5, memo: '', createdAt: now,
    },
    {
      id: nanoid(), assetId: 'asset-2', type: 'BUY',
      date: '2024-10-01', quantity: 2, price: 510,
      amount: 1020, fee: 1.0, memo: '', createdAt: now,
    },
    // BTC 매수
    {
      id: nanoid(), assetId: 'asset-3', type: 'BUY',
      date: '2024-01-05', quantity: 0.1, price: 62000,
      amount: 6200, fee: 6.2, memo: '연초 매수', createdAt: now,
    },
    {
      id: nanoid(), assetId: 'asset-3', type: 'BUY',
      date: '2024-08-15', quantity: 0.05, price: 58000,
      amount: 2900, fee: 2.9, memo: '추가', createdAt: now,
    },
    // KB 예금 입금
    {
      id: nanoid(), assetId: 'asset-4', type: 'DEPOSIT',
      date: '2024-05-01', amount: 5000000, memo: '정기예금 가입', createdAt: now,
    },
    // 현금 입금
    {
      id: nanoid(), assetId: 'asset-5', type: 'DEPOSIT',
      date: '2024-11-01', amount: 2000000, memo: '월급 이체', createdAt: now,
    },
    // 삼성전자 배당
    {
      id: nanoid(), assetId: 'asset-1', type: 'DIVIDEND',
      date: '2024-12-20', amount: 365000, memo: '2024 결산배당', createdAt: now,
    },
  ];

  for (const asset of assets) {
    await storageAdapter.saveAsset(asset);
  }
  for (const tx of transactions) {
    await storageAdapter.saveTransaction(tx);
  }

  console.log('[DEV] 테스트 데이터 시드 완료');
}
