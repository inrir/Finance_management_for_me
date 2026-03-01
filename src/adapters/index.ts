import { IndexedDBAdapter } from './IndexedDBAdapter';

/**
 * 활성 StorageAdapter 단일 진입점.
 * 서버 전환 시 이 파일의 한 줄만 교체하면 된다.
 *
 * 예시:
 *   import { SupabaseAdapter } from './SupabaseAdapter';
 *   export const storageAdapter = new SupabaseAdapter();
 */
export const storageAdapter = new IndexedDBAdapter();
