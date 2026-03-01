import { useRef, useState } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { BackupService } from '@/services/BackupService';
import type { Currency } from '@/types/asset.types';
import { seedDevData } from '@/dev-seed';

export default function Settings() {
  const { exchangeRates, setExchangeRate, supportedCurrencies } = useSettingsStore();
  const [importing, setImporting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);

  const handleSeedData = async () => {
    setSeeding(true);
    setSeedMsg(null);
    try {
      await seedDevData(true); // force=true: 기존 데이터 덮어씀
      setSeedMsg('테스트 데이터 추가 완료! 페이지를 새로고침합니다...');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      setSeedMsg(`오류: ${String(err)}`);
    } finally {
      setSeeding(false);
    }
  };
  const [exporting, setExporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      await BackupService.exportJSON();
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportError(null);
    setImportSuccess(false);
    try {
      await BackupService.importJSON(file);
      setImportSuccess(true);
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      setImportError(String(err));
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const nonKRW = supportedCurrencies.filter((c) => c !== 'KRW');

  return (
    <div className="max-w-lg space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">설정</h2>
      </div>

      {/* 환율 설정 */}
      <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-1">환율 설정 (KRW 기준)</h3>
        <p className="text-xs text-gray-400 mb-4">
          1 외화 = ? KRW 형식으로 입력합니다. 새 통화 추가는 개발자에게 문의하세요.
        </p>
        <div className="space-y-3">
          {nonKRW.map((currency) => (
            <div key={currency} className="flex items-center gap-3">
              <span className="w-12 text-sm font-medium text-gray-700">{currency}</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={exchangeRates[currency as Currency]}
                onChange={(e) =>
                  setExchangeRate(
                    currency as Currency,
                    parseFloat(e.target.value) || 1
                  )
                }
                className="w-40"
              />
              <span className="text-sm text-gray-400">KRW</span>
            </div>
          ))}
        </div>
      </section>

      {/* 데이터 백업 */}
      <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-1">데이터 백업 / 복원</h3>
        <p className="text-xs text-gray-400 mb-4">
          모든 자산·거래·스냅샷 데이터를 JSON 파일로 내보내거나 복원합니다.
          복원 시 기존 데이터가 모두 교체됩니다.
        </p>
        <div className="flex gap-3 items-center">
          <Button onClick={handleExport} loading={exporting} variant="secondary">
            JSON 내보내기
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            loading={importing}
            variant="secondary"
          >
            JSON 가져오기
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
        </div>
        {importError && (
          <p className="mt-3 text-sm text-red-500 bg-red-50 rounded-lg p-3">
            {importError}
          </p>
        )}
        {importSuccess && (
          <p className="mt-3 text-sm text-emerald-600 bg-emerald-50 rounded-lg p-3">
            복원 완료! 페이지를 새로고침합니다...
          </p>
        )}
      </section>

      {/* 앱 정보 */}
      <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-3">앱 정보</h3>
        <ul className="text-sm text-gray-500 space-y-1">
          <li>저장 방식: 브라우저 IndexedDB (로컬 저장)</li>
          <li>지원 통화: KRW · USD · JPY</li>
          <li>버전: 1.0.0 (MVP)</li>
        </ul>
      </section>

      {/* 개발 전용 */}
      {import.meta.env.DEV && (
        <section className="bg-amber-50 rounded-xl p-6 border border-amber-200">
          <h3 className="font-semibold text-amber-800 mb-1">개발 전용</h3>
          <p className="text-xs text-amber-600 mb-4">
            빌드 환경에서는 표시되지 않습니다.
          </p>
          <Button
            onClick={handleSeedData}
            loading={seeding}
            variant="secondary"
          >
            테스트 데이터 추가
          </Button>
          {seedMsg && (
            <p className={`mt-3 text-sm rounded-lg p-3 ${
              seedMsg.startsWith('오류')
                ? 'bg-red-50 text-red-600'
                : 'bg-green-50 text-green-700'
            }`}>
              {seedMsg}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
