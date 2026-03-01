# 변경 이력 (Changelog)

변경 시 **날짜 · 시간 · 변경 내용**을 최신 순으로 기록합니다.

---

## [2026-03-02]

### · 포트폴리오 비중 환율 환산 버그 수정

**배경**: USD/JPY 자산의 평가금액을 원화 변환 없이 KRW 자산과 그대로 합산해 비중이 잘못 계산됨.
예) SPY $2,600 + 삼성전자 ₩750,000 → 합계 752,600으로 처리 (단위 불일치).

**변경 파일**
- `src/hooks/useAssets.ts` — `assetStatsInBase` 분리 추출
  - 기존: `portfolioStats` 계산 시에만 KRW 환산 수행 (allocation엔 적용 안 됨)
  - 수정: KRW 환산 통계를 `assetStatsInBase`로 독립 memo로 추출 → `portfolioStats`·`allocation` 모두 이 값 사용
  - `assetStatsInBase`를 훅 반환값에 추가 노출
- `src/hooks/usePortfolio.ts` — `assetStatsInBase` 추가 반환
- `src/pages/Portfolio.tsx`
  - 개별 자산 "비중" 계산: `stat.currentValue / portfolioStats.totalValue` (단위 불일치) → `assetStatsInBase[i].currentValue / portfolioStats.totalValue` (KRW 기준) 수정
  - 개별 자산 "평가금액·투자원금" 열: 외화 자산에 `≈ ₩xxx` 원화 환산액 병기 추가

---

## [2026-03-01]

### 15:00 · 외화 자산 이중 통화 표시

**배경**: USD/JPY 자산의 금액이 본 통화로만 표시되어 전체 원화 환산 규모를 파악하기 어려웠음.

**변경 파일**
- `src/components/common/Card.tsx` — `value` prop 타입을 `string → ReactNode`로 확장 (복합 JSX 전달 가능)
- `src/pages/AssetList.tsx` — 평가금액·평가손익 열에 본 통화 + `≈ ₩xxx` 원화 환산 병기
- `src/pages/AssetDetail.tsx` — 모든 금액 카드(현재 평가금액·평균 매입단가·평가손익 등)에 원화 환산 병기

**동작 방식**
- KRW 자산: 기존과 동일하게 단일 표시
- USD/JPY 자산: 본 통화 금액 아래 `≈ ₩xxx` 소자(小字)로 원화 환산액 추가
- 환율 기준: 설정 > 환율 설정에서 수동 입력한 값 사용

---

### 14:00 · 자산 유형별 입력 UX 개선 + 현재가 일괄 입력

**배경**: 현금·예금에 "현재가 × 수량" 2개 필드가 표시되어 혼란스러웠음. 현재가를 자산별로 하나씩 클릭해서 변경하는 방식이 불편했음.

**변경 파일**
- `src/types/asset.types.ts` — 자산 유형 그룹 상수 추가
  - `PRICE_QTY_TYPES`: 주식·ETF·가상화폐·기타 (현재가 + 수량)
  - `AMOUNT_TYPES`: 현금·예금 (보유금액 단일 입력)
  - `SINGLE_TYPES`: 부동산 (현재 시세 단일 입력)
  - `NEEDS_PRICE_UPDATE_TYPES`: 현재가 수기 업데이트 대상 (PRICE_QTY + SINGLE)
- `src/components/asset/AssetForm.tsx` — 유형별 입력 필드 분기
  - `AMOUNT_TYPES`: "보유금액" 단일 입력 → 저장 시 `currentPrice=1, quantity=금액` 정규화
  - `SINGLE_TYPES`: "현재 시세" 단일 입력 → 저장 시 `quantity=1, currentPrice=시세` 정규화
  - `PRICE_QTY_TYPES`: 현재가 + 수량 2개 필드 (기존 유지)
- `src/pages/AssetList.tsx` — 현재가 일괄 입력 UX 추가
  - "현재가 일괄 입력" 버튼으로 인라인 편집 모드 진입
  - `NEEDS_PRICE_UPDATE_TYPES` 행에만 숫자 입력 필드 표시
  - `AMOUNT_TYPES` 행은 현재가 열에 "-" 표시 (수기 업데이트 불필요)
  - "저장" 버튼 클릭 시 변경된 현재가 일괄 반영
- `src/pages/AssetDetail.tsx` — 유형별 통계 카드 조정
  - `AMOUNT_TYPES`: "보유금액" 카드 1개만 표시, "현재가 업데이트" 버튼 숨김
  - `SINGLE_TYPES`: "현재 시세·취득가액·평가손익" 3카드, "시세 업데이트" 버튼
  - `PRICE_QTY_TYPES`: 기존 4카드(평가금액·평균 매입단가·평가손익·보유수량) 유지

---

### 10:00 · Phase 1 MVP 초기 구현

**개요**: FINANCE.md 기획서를 바탕으로 개인 금융 자산 관리 웹앱 전체를 구현.

**기술 스택**
- React 19 + TypeScript + Vite
- Tailwind CSS v4 (`@tailwindcss/vite` 플러그인)
- Zustand (상태 관리)
- Dexie.js (IndexedDB 래퍼)
- Recharts (차트)
- React Router v7
- nanoid (ID 생성)

**구현 내용 (12단계)**

| 단계 | 내용 |
|------|------|
| 1 | 프로젝트 초기화 (Vite, 경로 별칭 `@/`, Tailwind v4) |
| 2 | 타입 정의 (`Asset`, `Transaction`, `Snapshot`, 열거형) |
| 3 | `StorageAdapter` 인터페이스 + `IndexedDBAdapter` (Dexie.js) |
| 4 | `PriceProvider` 인터페이스 + `ManualPriceProvider` |
| 5 | `CalcService` 순수 함수 (이동평균 원가, 손익, CAGR, 환율 변환) |
| 6 | Zustand 스토어 4개 (자산·거래·스냅샷·설정) |
| 7 | 커스텀 훅 (`useAssets`, `useAssetDetail`, `usePortfolio`) |
| 8 | 공통 컴포넌트 (Card, Badge, Modal, Button, Input, Select, DonutChart, LineChart) |
| 9 | 페이지 7개 (Dashboard, AssetList, AssetDetail, Transactions, Portfolio, History, Settings) |
| 10 | `SnapshotService` 월별 자동 스냅샷 |
| 11 | `BackupService` JSON 내보내기·가져오기 |
| 12 | 라우터 설정 + `vercel.json` SPA 배포 설정 |

**주요 설계 원칙**
- `adapters/index.ts` 한 줄 교체로 IndexedDB → 서버 DB 전환 가능
- `PriceProvider` 패턴으로 향후 자동 시세 조회 확장 가능
- 통화 KRW·USD·JPY 지원, `Currency` 타입 추가만으로 신규 통화 확장 가능

**추가: 개발용 테스트 데이터**
- `src/dev-seed.ts`: 삼성전자·SPY·BTC·KB예금·현금 5개 자산 + 거래 9건
- 설정 페이지 > "개발 전용" 섹션 > "테스트 데이터 추가" 버튼 (개발 환경 전용)
