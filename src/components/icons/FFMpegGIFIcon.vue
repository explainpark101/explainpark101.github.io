<template>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <defs>
        <!-- 배경 그라데이션 -->
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#3b82f6" />
          <stop offset="100%" stop-color="#312e81" />
        </linearGradient>
        <!-- 필름 투명도 그라데이션 -->
        <linearGradient id="filmGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.3" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0.1" />
        </linearGradient>
      </defs>

      <!-- 앱 배경 (둥근 사각형) -->
      <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />

      <!-- MP4 / 필름 아이콘 -->
      <g transform="translate(64, 128)">
        <rect width="160" height="256" rx="24" fill="url(#filmGrad)" stroke="#ffffff" stroke-width="12" />
        <!-- 필름 구멍 -->
        <path d="M 24 0 v 256 M 136 0 v 256" stroke="#ffffff" stroke-width="4" stroke-dasharray="16 24" opacity="0.6" />
        <!-- 재생 버튼 -->
        <polygon points="60,104 116,128 60,152" fill="#ffffff" />
      </g>

      <!-- 변환 화살표 -->
      <g transform="translate(210, 230)">
        <path d="M 0 14 L 32 14 L 32 0 L 64 26 L 32 52 L 32 38 L 0 38 Z" fill="#ffffff" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.2))" />
      </g>

      <!-- GIF 텍스트 배지 -->
      <g transform="translate(260, 180)">
        <rect width="180" height="152" rx="32" fill="#ffffff" filter="drop-shadow(0 10px 15px rgba(0,0,0,0.1))" />
        <text x="90" y="104" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="900" font-size="68" fill="#4338ca" text-anchor="middle" letter-spacing="-2">GIF</text>
      </g>

      <!-- 60 FPS 배지 -->
      <g transform="translate(360, 80)">
        <circle cx="48" cy="48" r="48" fill="#f59e0b" stroke="#ffffff" stroke-width="6" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.2))" />
        <text x="48" y="52" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="34" fill="#ffffff" text-anchor="middle">60</text>
        <text x="48" y="74" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="bold" font-size="16" fill="#ffffff" text-anchor="middle">FPS</text>
      </g>
    </svg>
</template>