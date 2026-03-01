import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { storageAdapter } from '@/adapters';
import type { Transaction, TransactionType } from '@/types/transaction.types';
import type { TransactionFilter } from '@/adapters/StorageAdapter.interface';

export type TransactionFormData = Omit<Transaction, 'id' | 'createdAt'>;

interface TxState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;

  loadTransactions: (filter?: TransactionFilter) => Promise<void>;
  addTransaction: (data: TransactionFormData) => Promise<Transaction>;
  updateTransaction: (
    id: string,
    patch: Partial<TransactionFormData>
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getTransactionsByAsset: (assetId: string) => Transaction[];
  clearError: () => void;
}

export const useTxStore = create<TxState>((set, get) => ({
  transactions: [],
  isLoading: false,
  error: null,

  loadTransactions: async (filter) => {
    set({ isLoading: true, error: null });
    try {
      const transactions = await storageAdapter.getTransactions(filter);
      set({ transactions });
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ isLoading: false });
    }
  },

  addTransaction: async (data) => {
    const tx: Transaction = {
      ...data,
      id: nanoid(),
      createdAt: new Date().toISOString(),
    };
    await storageAdapter.saveTransaction(tx);
    set((s) => ({ transactions: [tx, ...s.transactions] }));
    return tx;
  },

  updateTransaction: async (id, patch) => {
    const existing = get().transactions.find((t) => t.id === id);
    if (!existing) return;
    const updated: Transaction = { ...existing, ...patch };
    await storageAdapter.saveTransaction(updated);
    set((s) => ({
      transactions: s.transactions.map((t) => (t.id === id ? updated : t)),
    }));
  },

  deleteTransaction: async (id) => {
    await storageAdapter.deleteTransaction(id);
    set((s) => ({
      transactions: s.transactions.filter((t) => t.id !== id),
    }));
  },

  getTransactionsByAsset: (assetId) =>
    get().transactions.filter((t) => t.assetId === assetId),

  clearError: () => set({ error: null }),
}));

export const DEFAULT_TX_FORM: TransactionFormData = {
  assetId: '',
  type: 'BUY' as TransactionType,
  date: new Date().toISOString().slice(0, 10),
  quantity: undefined,
  price: undefined,
  amount: 0,
  fee: undefined,
  memo: '',
};
