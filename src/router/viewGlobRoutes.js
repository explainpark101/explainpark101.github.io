import { filePathToRoutePath, filePathToRouteName } from '@/router/routePathUtils.js';

/**
 * `main.js`와 동일한 glob으로 등록되는 SPA 라우트 경로를 계산합니다.
 */
export const viewModules = import.meta.glob('@/views/**/index.vue', { eager: false });

export { filePathToRoutePath, filePathToRouteName };
