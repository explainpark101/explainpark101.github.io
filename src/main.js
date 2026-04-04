import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createPinia } from 'pinia';
import { registerSW } from 'virtual:pwa-register';
import App from '@/App.vue';
import 'material-icons';
import '@/styles/style.css';
import {
  viewModules,
  filePathToRoutePath,
  filePathToRouteName,
} from '@/router/viewGlobRoutes.js';

registerSW({ immediate: true });

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

const routes = Object.keys(viewModules).map((filePath) => {
  const path = filePathToRoutePath(filePath).replaceAll('//', '/');
  const name = filePathToRouteName(filePath);

  return {
    path,
    name,
    component: viewModules[filePath],
  };
});

routes.unshift({
  path: '/',
  name: 'Home',
  component: () => import('@/views/Home.vue'),
});

if (process.env.NODE_ENV === 'development') {
  const pathMap = new Map();
  routes.forEach((route) => {
    if (pathMap.has(route.path)) {
      console.warn(`Duplicate route path detected: ${route.path}`, {
        existing: pathMap.get(route.path),
        new: route.name,
      });
    } else {
      pathMap.set(route.path, route.name);
    }
  });
  console.log(
    'Routes registered:',
    routes.map((r) => ({ path: r.path, name: r.name })),
  );
}

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.mount('#app');
