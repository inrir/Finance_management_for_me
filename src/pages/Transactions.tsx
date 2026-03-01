import { useState } from 'react';
import { useTxStore } from '@/store/txStore';
import { useAssetStore } from '@/store/assetStore';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { EmptyState } from '@/components/common/EmptyState';
import { TransactionForm } from '@/components/transaction/TransactionForm';
import { CalcService } from '@/services/CalcService';
import { TRANSACTION_TYPE_LABELS } from '@/types/transaction.types';

export default function Transactions() {
  const transactions = useTxStore((s) => s.transactions);
  const assets = useAssetStore((s) => s.assets);
  const { addTransaction, deleteTransaction } = useTxStore();
  const [showModal, setShowModal] = useState(false);

  const getAssetName = (assetId: string) =>
    assets.find((a) => a.id === assetId)?.name ?? '(삭제된 자산)';

  const handleDelete = async (id: string) => {
    if (!confirm('이 거래 내역을 삭제할까요?')) return;
    await deleteTransaction(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">거래 내역</h2>
          <p className="text-sm text-gray-400 mt-1">총 {transactions.length}건</p>
        </div>
        <Button onClick={() => setShowModal(true)}>+ 거래 추가</Button>
      </div>

      {transactions.length === 0 ? (
        <EmptyState
          title="거래 내역이 없습니다"
          description="자산 상세 또는 여기서 거래를 추가하세요"
          action={<Button onClick={() => setShowModal(true)}>거래 추가</Button>}
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-gray-500 font-medium">날짜</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">자산</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">유형</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">수량</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">단가</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">금액</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-gray-700">{tx.date}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {getAssetName(tx.assetId)}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {TRANSACTION_TYPE_LABELS[tx.type]}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {tx.quantity != null ? tx.quantity.toLocaleString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {tx.price != null
                      ? new Intl.NumberFormat('ko-KR').format(tx.price)
                      : '-'}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {CalcService.formatCurrency(tx.amount)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="거래 추가"
      >
        <TransactionForm
          onSubmit={async (data) => {
            await addTransaction(data);
            setShowModal(false);
          }}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
}
