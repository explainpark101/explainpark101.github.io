import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createPinia } from 'pinia';
import App from '@/App.vue';
import "material-icons";
import '@/styles/style.scss';

// 페이지 로드 시 즉시 테마 초기화 (깜빡임 방지)
(function initializeThemeSync() {
  const savedTheme = localStorage.getItem('theme');
  let theme = 'light';
  
  if (savedTheme) {
    theme = savedTheme;
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    theme = prefersDark ? 'dark' : 'light';
  }
  
  document.documentElement.setAttribute('data-theme', theme);
  document.body.setAttribute('data-theme', theme);
})();

// import.meta.glob을 사용하여 views 폴더의 모든 index.vue 파일을 자동으로 가져오기
// Home.vue는 제외 (별도 처리)
const modules = import.meta.glob('@/views/**/index.vue', { eager: false });

// 파일 경로를 라우트 경로로 변환하는 함수
function getRoutePath(filePath) {
  // '@/views/arch-graphic/index.vue' -> '/arch-graphic'
  // '@/views/jungsan/alchol/index.vue' -> '/jungsan/alchol'
  let path = filePath
    .replace(/^@\/views\//, '') // '@/views/' 제거
    .replace(/\/index\.vue$/, '') // '/index.vue' 제거
    .replace(/^index$/, ''); // 루트 index는 빈 문자열

  // 루트 경로 처리
  if (path === '') {
    return '/';
  }

  return '/' + path;
}

// 라우트 이름 생성 함수
function getRouteName(filePath) {
  // '@/views/arch-graphic/index.vue' -> 'ArchGraphic'
  // '@/views/jungsan/alchol/index.vue' -> 'JungsanAlchol'
  let name = filePath
    .replace(/^@\/views\//, '')
    .replace(/\/index\.vue$/, '')
    .replace(/^index$/, 'Home')
    .split('/')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()))
    .join('');

  return name || 'Home';
}

// 동적으로 라우트 생성
const routes = Object.keys(modules).map((filePath) => {
  const path = getRoutePath(filePath);
  const name = getRouteName(filePath);

  return {
    path,
    name,
    component: modules[filePath],
  };
});

// 홈 페이지는 별도로 처리 (Home.vue)
// unshift를 사용하여 가장 앞에 추가하여 우선순위 보장
routes.unshift({
  path: '/',
  name: 'Home',
  component: () => import('@/views/Home.vue'),
});

// 중복 경로 확인 (디버깅용)
if (process.env.NODE_ENV === 'development') {
  const pathMap = new Map();
  routes.forEach(route => {
    if (pathMap.has(route.path)) {
      console.warn(`Duplicate route path detected: ${route.path}`, {
        existing: pathMap.get(route.path),
        new: route.name
      });
    } else {
      pathMap.set(route.path, route.name);
    }
  });
  console.log('Routes registered:', routes.map(r => ({ path: r.path, name: r.name })));
}


// 라우터 설정
const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);
const pinia = createPinia();


app.use(pinia);
app.use(router);
app.mount('#app');
