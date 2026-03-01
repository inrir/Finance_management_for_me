export type TransactionType =
  | 'BUY'
  | 'SELL'
  | 'DEPOSIT'
  | 'WITHDRAW'
  | 'DIVIDEND';

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  BUY: '매수',
  SELL: '매도',
  DEPOSIT: '입금',
  WITHDRAW: '출금',
  DIVIDEND: '배당·이자',
};

export interface Transaction {
  id: string;
  assetId: string;
  type: TransactionType;
  date: string; // YYYY-MM-DD
  quantity?: number;
  price?: number;
  amount: number; // 순 현금 변동액 (수수료 포함 최종값)
  fee?: number;
  memo?: string;
  createdAt: string;
}
