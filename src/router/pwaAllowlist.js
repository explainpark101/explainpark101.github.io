function normalizePathname(href) {
  const path = href.split('?')[0].split('#')[0];
  if (path === '/') return '/';
  return path.replace(/\/+$/, '') || '/';
}

/** `/foo/bar` → Workbox navigateFallbackAllowlist용 정규식 (해당 경로 접두만 SPA 폴백 적용). */
function pathToNavigateAllowlistRegex(pathname) {
  const trimmed = pathname.replace(/\/+$/, '') || '/';
  if (trimmed === '/') return /^\/$/;
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped}(\\/|$)`);
}

/**
 * @param {Set<string>} spaPathSet — `filePathToRoutePath`로 만든 이 저장소 SPA의 pathname 집합 (`/` 포함)
 */
export function buildPwaNavigateFallbackAllowlist(spaPathSet) {
  const allow = [];
  for (const path of spaPathSet) {
    const norm = normalizePathname(path);
    allow.push(pathToNavigateAllowlistRegex(norm));
  }
  return allow;
}
