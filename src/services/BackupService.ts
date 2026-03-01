import { storageAdapter } from '@/adapters';
import type { BackupData } from '@/adapters/StorageAdapter.interface';

const BACKUP_VERSION = 1;

export const BackupService = {
  async exportJSON(): Promise<void> {
    const data = await storageAdapter.exportAll();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  async importJSON(file: File): Promise<void> {
    const text = await file.text();
    let data: BackupData;

    try {
      data = JSON.parse(text) as BackupData;
    } catch {
      throw new Error('JSON 파일을 파싱할 수 없습니다. 올바른 백업 파일인지 확인해주세요.');
    }

    if (!Array.isArray(data.assets) || !Array.isArray(data.transactions) || !Array.isArray(data.snapshots)) {
      throw new Error('백업 파일 형식이 올바르지 않습니다. (assets, transactions, snapshots 필드 필요)');
    }

    if (data.version !== undefined && data.version > BACKUP_VERSION) {
      throw new Error(`지원하지 않는 백업 버전입니다. (현재: v${BACKUP_VERSION}, 파일: v${data.version})`);
    }

    await storageAdapter.importAll(data);
  },
};
