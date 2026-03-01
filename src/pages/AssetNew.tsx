import { useNavigate } from 'react-router-dom';
import { useAssetStore } from '@/store/assetStore';
import { AssetForm } from '@/components/asset/AssetForm';
import type { AssetFormData } from '@/store/assetStore';

export default function AssetNew() {
  const navigate = useNavigate();
  const { addAsset } = useAssetStore();

  const handleSubmit = async (data: AssetFormData) => {
    const asset = await addAsset(data);
    navigate(`/assets/${asset.id}`);
  };

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-400 hover:text-gray-700 mb-2"
        >
          ← 뒤로
        </button>
        <h2 className="text-2xl font-bold text-gray-900">자산 추가</h2>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <AssetForm
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
          submitLabel="자산 추가"
        />
      </div>
    </div>
  );
}
