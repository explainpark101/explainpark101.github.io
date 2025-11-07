# explainpark101.github.io

Vue 3 + Vite + Vue Router로 구성된 SPA (Single Page Application) 프로젝트입니다.

## 프로젝트 구조

모든 페이지가 Vue Router로 관리되는 SPA입니다:

- `/` - 메인 페이지 (앱 목록)
- `/arch-graphic` - 건설 그래픽 커뮤니케이션
- `/dijkstra` - 다익스트라 알고리즘
- `/jungsan` - 회식 정산 계산기
- `/password` - 비밀번호 생성기
- `/surveys` - 검사 모음
- `/wbs-chart` - WBS 차트 편집기
- `/typing-game` - 타자 게임
- 등등...

## 개발 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

개발 서버가 `http://localhost:3000`에서 실행됩니다.

### 3. 빌드

```bash
npm run build
```

빌드 결과는 `dist/` 폴더에 생성됩니다.

## 프로젝트 구조

폴더 구조가 기존 HTML 구조와 일치하도록 구성되어 있습니다:

```
src/views/
├── Home.vue                    # 메인 페이지
├── arch-graphic/
│   ├── index.vue              # /arch-graphic
│   └── endterm/
│       └── index.vue          # /arch-graphic/endterm
├── dijkstra/
│   └── index.vue               # /dijkstra
├── jungsan/
│   ├── index.vue              # /jungsan
│   └── alchol/
│       └── index.vue           # /jungsan/alchol
└── ...
```

**자동 라우팅**: `main.js`에서 `import.meta.glob`을 사용하여 `views` 폴더의 모든 `index.vue` 파일을 자동으로 라우터에 등록합니다. 새로운 폴더를 만들고 `index.vue`를 추가하면 자동으로 라우트가 생성됩니다!

## 기존 HTML을 Vue 컴포넌트로 변환하기

현재 대부분의 페이지는 placeholder 컴포넌트로 되어 있습니다. 기존 HTML 파일을 Vue 컴포넌트로 변환하려면:

1. 기존 HTML 파일 확인 (예: `arch-graphic/index.html`)
2. 해당 Vue 컴포넌트 파일 열기 (예: `src/views/arch-graphic/index.vue`)
3. HTML 내용을 `<template>` 섹션으로 이동
4. 스크립트 로직을 `<script setup>` 섹션으로 변환
5. CSS를 `<style scoped>` 섹션으로 이동

예시:

```vue
<template>
  <!-- 기존 HTML의 body 내용을 여기에 -->
  <div class="app-container">
    <!-- ... -->
  </div>
</template>

<script setup>
// 기존 HTML의 script 내용을 여기에
// Vue 3 Composition API 사용
</script>

<style scoped>
/* 기존 HTML의 style 내용을 여기에 */
</style>
```

## 새로운 기능 추가하기

새로운 기능을 추가하는 것은 매우 간단합니다:

1. `src/views/` 폴더에 새로운 폴더 생성 (예: `src/views/new-feature/`)
2. 그 폴더에 `index.vue` 파일 생성
3. 끝! 자동으로 라우터에 등록됩니다

예시:

```bash
# 폴더 생성
mkdir -p src/views/new-feature

# index.vue 파일 생성
touch src/views/new-feature/index.vue
```

```vue
<!-- src/views/new-feature/index.vue -->
<template>
  <div>
    <h1>새로운 기능</h1>
    <!-- ... -->
  </div>
</template>

<script setup>
// 컴포넌트 로직
</script>
```

자동으로 `/new-feature` 경로로 접근할 수 있습니다!

## 기술 스택

- Vue 3 (Composition API)
- Vite
- Vue Router 4

