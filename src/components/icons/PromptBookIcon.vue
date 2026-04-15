<template>

<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- 배경 그라데이션 및 그림자 효과 정의 -->
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E3A8A" /> <!-- 진한 파란색 -->
      <stop offset="100%" stop-color="#0F172A" /> <!-- 어두운 슬레이트 -->
    </linearGradient>
    <linearGradient id="terminalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E293B" />
      <stop offset="100%" stop-color="#0F172A" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.4"/>
    </filter>
  </defs>

  <!-- 앱 아이콘 외곽 (둥근 사각형 기반) -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />

  <!-- 터미널/코드 에디터 창 배경 -->
  <rect x="80" y="128" width="352" height="256" rx="24" fill="url(#terminalGrad)" filter="url(#shadow)" stroke="#334155" stroke-width="4" />

  <!-- 에디터 상단 헤더 바 -->
  <path d="M 80 152 Q 80 128 104 128 L 408 128 Q 432 128 432 152 L 432 184 L 80 184 Z" fill="#0F172A" />
  
  <!-- 에디터 제어 버튼 (신호등 색상) -->
  <circle cx="120" cy="156" r="10" fill="#EF4444" /> <!-- 빨강 -->
  <circle cx="152" cy="156" r="10" fill="#F59E0B" /> <!-- 노랑 -->
  <circle cx="184" cy="156" r="10" fill="#10B981" /> <!-- 초록 -->

  <!-- 프롬프트 기호 ( > ) -->
  <path d="M 120 236 L 144 260 L 120 284" fill="none" stroke="#3B82F6" stroke-width="20" stroke-linecap="round" stroke-linejoin="round" />

  <!-- 중괄호 기호 좌측 ( { ) -->
  <path d="M 210 216 Q 190 216 190 236 C 190 246 180 256 170 256 C 180 256 190 266 190 276 Q 190 296 210 296" fill="none" stroke="#10B981" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" />

  <!-- 템플릿 변수를 의미하는 내부 점 3개 ( ... ) -->
  <circle cx="236" cy="256" r="8" fill="#FBBF24" />
  <circle cx="268" cy="256" r="8" fill="#FBBF24" />
  <circle cx="300" cy="256" r="8" fill="#FBBF24" />

  <!-- 중괄호 기호 우측 ( } ) -->
  <path d="M 326 216 Q 346 216 346 236 C 346 246 356 256 366 256 C 356 256 346 266 346 276 Q 346 296 326 296" fill="none" stroke="#10B981" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" />

  <!-- 생성(AI 연동)을 상징하는 반짝임 효과 1 -->
  <path d="M 380 190 Q 400 190 400 170 Q 400 190 420 190 Q 400 190 400 210 Q 400 190 380 190 Z" fill="#60A5FA" />
  
  <!-- 생성(AI 연동)을 상징하는 반짝임 효과 2 -->
  <path d="M 340 310 Q 350 310 350 300 Q 350 310 360 310 Q 350 310 350 320 Q 350 310 340 310 Z" fill="#34D399" />
</svg>

</template>