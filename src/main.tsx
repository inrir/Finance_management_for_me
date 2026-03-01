import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { storageAdapter } from '@/adapters';
import { useAssetStore } from '@/store/assetStore';
import { useTxStore } from '@/store/txStore';
import { useSnapshotStore } from '@/store/snapshotStore';
import { SnapshotService } from '@/services/SnapshotService';

async function bootstrap() {
  // 1. IndexedDB 연결
  await storageAdapter.initialize();

  // 개발 환경 전용: 테스트 데이터 시드
  if (import.meta.env.DEV) {
    const { seedDevData } = await import('./dev-seed');
    await seedDevData();
  }

  // 2. 초기 데이터 로드
  const loadAssets = useAssetStore.getState().loadAssets;
  const loadTransactions = useTxStore.getState().loadTransactions;
  const loadSnapshots = useSnapshotStore.getState().loadSnapshots;

  await Promise.all([loadAssets(), loadTransactions(), loadSnapshots()]);

  // 3. 이번 달 스냅샷 자동 저장 (없는 경우에만)
  const assets = useAssetStore.getState().assets;
  const transactions = useTxStore.getState().transactions;
  await SnapshotService.autoSaveIfNeeded(assets, transactions);

  // 4. 스냅샷 재로드 (자동 저장 후)
  await loadSnapshots();

  // 5. 렌더링
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

bootstrap().catch(console.error);
