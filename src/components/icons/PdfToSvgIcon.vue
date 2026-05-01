<template>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <!-- 배경 그라데이션 (Red to Blue) -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ef4444" />
      <stop offset="100%" stop-color="#3b82f6" />
    </linearGradient>
    
    <!-- 문서 그라데이션 -->
    <linearGradient id="docGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#f8fafc" />
    </linearGradient>

    <!-- 그림자 효과 -->
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.25" />
    </filter>
    <filter id="foldShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="-2" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.15" />
    </filter>
  </defs>

  <!-- 앱 아이콘 배경 -->
  <rect x="32" y="32" width="448" height="448" rx="100" fill="url(#bgGrad)" filter="url(#shadow)" />

  <!-- 문서 본체 -->
  <path d="M160 112 C142.3 112 128 126.3 128 144 V368 C128 385.7 142.3 400 160 400 H352 C369.7 400 384 385.7 384 368 V208 L288 112 H160 Z" fill="url(#docGrad)" filter="url(#shadow)" />

  <!-- 접힌 모서리 -->
  <path d="M288 112 V192 C288 200.8 295.2 208 304 208 H384 Z" fill="#e2e8f0" filter="url(#foldShadow)" />

  <!-- 벡터 제어선 (핸들) -->
  <line x1="192" y1="304" x2="192" y2="208" stroke="#cbd5e1" stroke-width="4" stroke-dasharray="6 4" />
  <line x1="320" y1="192" x2="320" y2="288" stroke="#cbd5e1" stroke-width="4" stroke-dasharray="6 4" />

  <!-- 벡터 제어점 -->
  <circle cx="192" cy="208" r="6" fill="#ffffff" stroke="#94a3b8" stroke-width="3" />
  <circle cx="320" cy="288" r="6" fill="#ffffff" stroke="#94a3b8" stroke-width="3" />

  <!-- 메인 베지어 곡선 -->
  <path d="M 192 304 C 192 208, 320 288, 320 192" fill="none" stroke="#3b82f6" stroke-width="16" stroke-linecap="round" />

  <!-- 시작 노드 -->
  <circle cx="192" cy="304" r="14" fill="#ef4444" />
  <circle cx="192" cy="304" r="6" fill="#ffffff" />

  <!-- 끝 노드 -->
  <circle cx="320" cy="192" r="14" fill="#3b82f6" />
  <circle cx="320" cy="192" r="6" fill="#ffffff" />

  <!-- 텍스트 라벨 -->
  <text x="256" y="368" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="38" fill="#1e293b" text-anchor="middle" letter-spacing="1">PDF2SVG</text>
</svg>
</template>