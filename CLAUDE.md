# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # 개발 서버 시작 (http://localhost:5173)
npm run build      # 프로덕션 빌드 (tsc -b && vite build)
npm run lint       # ESLint 실행
npx tsc --noEmit   # 타입 검사만 (빌드 없이)
```

테스트 프레임워크는 없음. 변경 후 `npx tsc --noEmit` → `npm run build` 순으로 검증.

---

## 아키텍처

### 계층 구조

```
types/          → 순수 타입·상수 (의존성 없음)
adapters/       → 스토리지 추상화 (StorageAdapter 인터페이스)
providers/      → 시세 조회 추상화 (PriceProvider 인터페이스)
services/       → 순수 비즈니스 로직 (CalcService, BackupService, SnapshotService)
store/          → Zustand 상태 (adapters 호출)
hooks/          → 파생 상태·계산 (store + services 조합)
components/     → UI (hooks 소비)
pages/          → 라우트 단위 페이지 (hooks + components 조합)
```

각 계층은 아래 방향으로만 의존. pages → hooks → store → adapters.

### 핵심 확장 포인트

**스토리지 교체** (`src/adapters/index.ts` 한 줄만 변경):
```ts
// IndexedDB → Supabase 전환 시
export const storageAdapter = new SupabaseAdapter();
```

**시세 자동화** (`src/providers/index.ts`):
```ts
// ManualPriceProvider → KIS/Yahoo API Provider 교체
```

### 자산 유형 그룹

`src/types/asset.types.ts`에 정의된 그룹 상수로 분기:

| 상수 | 유형 | 입력 방식 |
|------|------|-----------|
| `PRICE_QTY_TYPES` | stock · etf · crypto · other | 현재가 × 수량 |
| `AMOUNT_TYPES` | cash · deposit | 보유금액 (저장 시 `currentPrice=1, quantity=금액`) |
| `SINGLE_TYPES` | realestate | 현재 시세 (저장 시 `quantity=1, currentPrice=시세`) |
| `NEEDS_PRICE_UPDATE_TYPES` | PRICE_QTY + SINGLE | 현재가 수기 업데이트 대상 |

새 유형 추가 시 이 상수들에만 반영하면 폼·목록·상세 분기가 자동 적용됨.

### 통화 변환

- 설정에서 입력한 환율: `settingsStore.exchangeRates` (`{ KRW: 1, USD: 1350, JPY: 9 }`)
- `CalcService.convertToBase(amount, fromCurrency, 'KRW', rates)` 로 KRW 환산
- `assetStats` — 각 자산의 **본 통화** 기준 통계
- `assetStatsInBase` — **KRW 환산** 통계 (비중·포트폴리오 집계에 사용)
- UI에서 외화 자산은 본 통화 + `≈ ₩xxx` 병기 패턴 사용

### 상태 흐름

```
main.tsx bootstrap()
  └─ storageAdapter.initialize()
  └─ store.loadAssets() / loadTransactions() / loadSnapshots()
  └─ SnapshotService.autoSaveIfNeeded()   ← 월별 자동 스냅샷
  └─ ReactDOM.render()
```

Zustand store는 DB와 메모리를 동기화 유지. 쓰기 작업은 항상 `storageAdapter → set()` 순서.

### CalcService

순수 함수 클래스 (`src/services/CalcService.ts`):
- `calcAssetStats(asset, transactions)` — 이동평균법으로 자산별 통계 계산
- `calcPortfolioStats(statsList)` — 전체 합산 (반드시 KRW 환산된 stats 전달)
- `calcAllocation(statsList, assets)` — 유형별 비중 (반드시 KRW 환산된 stats 전달)
- `convertToBase(amount, from, to, rates)` — 통화 변환

### 데이터 모델 핵심

```ts
Asset { id, name, type, market, currency, currentPrice, quantity, ticker, priceProvider, memo, createdAt, priceUpdatedAt }
Transaction { id, assetId, type, date, quantity?, price?, amount, fee?, memo? }
Snapshot { id, date, totalValue, totalCost, breakdown: Record<AssetType, number> }
```

### Tailwind CSS v4

`@import "tailwindcss"` (CSS 진입점), `@tailwindcss/vite` 플러그인 사용.
`tailwind.config.ts` 없음. 커스텀 테마는 `src/index.css`의 `@theme` 블록에서 관리.

### 개발용 테스트 데이터

`src/dev-seed.ts` — 개발 환경(`import.meta.env.DEV`)에서만 동작.
설정 페이지 > "개발 전용" 섹션 > "테스트 데이터 추가" 버튼으로 실행 (기존 데이터 초기화 후 재삽입).
