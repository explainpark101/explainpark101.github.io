<template>
    <svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- 배경 그라데이션 -->
  <rect width="512" height="512" rx="120" fill="#0F172A"/>
  
  <!-- 화면 프레임 (S3/Cloud 느낌의 Blue) -->
  <rect x="80" y="100" width="352" height="240" rx="30" stroke="#3B82F6" stroke-width="24"/>
  <rect x="216" y="340" width="80" height="12" fill="#3B82F6"/>
  <rect x="176" y="352" width="160" height="12" rx="6" fill="#3B82F6"/>
  
  <!-- 마이크 아이콘 -->
  <rect x="236" y="150" width="40" height="80" rx="20" fill="white"/>
  <path d="M200 190C200 220.931 225.069 246 256 246C286.931 246 312 220.931 312 190" stroke="white" stroke-width="12" stroke-linecap="round"/>
  <line x1="256" y1="246" x2="256" y2="270" stroke="white" stroke-width="12" stroke-linecap="round"/>

  <!-- 클라우드 업로드 (S3 상징) -->
  <path d="M380 130C380 107.909 362.091 90 340 90C333.35 90 327.067 91.6167 321.5 94.4674C312.83 74.0729 292.516 60 268.75 60C238.15 60 212.81 81.3934 207.25 110.155C204.512 109.401 201.303 109 198 109C182.536 109 170 121.536 170 137C170 152.464 182.536 165 198 165H352C367.464 165 380 152.464 380 137V130Z" fill="#3B82F6" opacity="0.8"/>
  <path d="M275 140L256 121L237 140" stroke="white" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="256" y1="121" x2="256" y2="155" stroke="white" stroke-width="8" stroke-linecap="round"/>

  <!-- 실시간 녹화 표시 (REC) -->
  <circle cx="400" cy="310" r="25" fill="#EF4444">
    <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
  </circle>
</svg>
</template>