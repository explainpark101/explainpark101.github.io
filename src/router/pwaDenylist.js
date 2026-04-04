import { HOME_APP_LINKS } from '../data/homeAppLinks.js';

function normalizePathname(href) {
  const path = href.split('?')[0].split('#')[0];
  if (path === '/') return '/';
  return path.replace(/\/+$/, '') || '/';
}

/** `/foo/bar` → Workbox navigateFallbackDenylist용 정규식 (해당 경로 접두만 SPA 폴백 제외). */
function pathToNavigateDenylistRegex(pathname) {
  const trimmed = pathname.replace(/\/+$/, '') || '/';
  if (trimmed === '/') return /^\/$/;
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped}(\\/|$)`);
}

/**
 * @param {Set<string>} spaPathSet — `filePathToRoutePath`로 만든 이 저장소 SPA의 pathname 집합 (`/` 포함)
 */
export function buildPwaNavigateFallbackDenylist(spaPathSet) {
  const deny = [
    /^\/api\//,
    /\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff2?|js|css|json|webmanifest)(?:\?.*)?$/i,
  ];
  const added = new Set();

  for (const item of HOME_APP_LINKS) {
    const href = item.href;
    if (!href.startsWith('/') || href.startsWith('//')) continue;

    const norm = normalizePathname(href);
    if (spaPathSet.has(norm)) continue;
    if (added.has(norm)) continue;
    added.add(norm);
    deny.push(pathToNavigateDenylistRegex(norm));
  }

  return deny;
}
