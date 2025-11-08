import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');
const viewsDir = join(rootDir, 'src', 'views');

// main.js와 동일한 로직으로 라우트 경로 생성
function getRoutePath(filePath) {
  // 'src/views/arch-graphic/index.vue' -> '/arch-graphic'
  // 'src/views/jungsan/alchol/index.vue' -> '/jungsan/alchol'
  let path = filePath
    .replace(/^src\/views\//, '') // 'src/views/' 제거
    .replace(/\/index\.vue$/, '') // '/index.vue' 제거
    .replace(/^index$/, ''); // 루트 index는 빈 문자열

  // 루트 경로 처리
  if (path === '') {
    return '/';
  }

  return '/' + path;
}

// views 폴더를 재귀적으로 스캔하여 index.vue 파일 찾기
function findIndexVueFiles(dir, basePath = '') {
  const files = [];
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      // 디렉토리인 경우 재귀적으로 탐색
      const subPath = basePath ? `${basePath}/${entry}` : entry;
      files.push(...findIndexVueFiles(fullPath, subPath));
    } else if (entry === 'index.vue') {
      // index.vue 파일인 경우
      const relativePath = relative(viewsDir, fullPath).replace(/\\/g, '/');
      files.push(relativePath);
    }
  }

  return files;
}

// 라우트 경로 목록 자동 생성
const indexVueFiles = findIndexVueFiles(viewsDir);
const routes = indexVueFiles.map(file => getRoutePath(file));

// Home.vue는 '/' 경로로 처리 (main.js와 동일)
const homeVuePath = join(viewsDir, 'Home.vue');
if (existsSync(homeVuePath)) {
  routes.push('/');
}

// 중복 제거 및 정렬
const uniqueRoutes = [...new Set(routes)].sort();

// 메인 index.html 읽기
const mainIndexPath = join(distDir, 'index.html');
if (!existsSync(mainIndexPath)) {
  console.error('Error: dist/index.html not found. Please build the project first.');
  process.exit(1);
}

const mainIndexContent = readFileSync(mainIndexPath, 'utf-8');

// 각 라우트 경로에 대해 index.html 생성
uniqueRoutes.forEach((route) => {
  // 경로 정규화 (앞뒤 슬래시 제거)
  const normalizedPath = route === '/' ? '' : route.replace(/^\/|\/$/g, '');
  const targetDir = normalizedPath ? join(distDir, normalizedPath) : distDir;
  
  // 디렉토리 생성
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }
  
  // index.html 생성
  const targetIndexPath = join(targetDir, 'index.html');
  writeFileSync(targetIndexPath, mainIndexContent, 'utf-8');
  
  console.log(`✓ Created: ${targetIndexPath}`);
});

console.log(`\n✅ MPA support: Generated ${uniqueRoutes.length} index.html files`);

