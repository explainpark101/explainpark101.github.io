<template>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="url(#skyIndigoGradient)"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-32 h-32 shrink-0">
        <defs>
            <!-- sky-400(#38bdf8)에서 indigo-400(#818cf8)으로 이어지는 그라데이션 정의 -->
            <linearGradient id="skyIndigoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#38bdf8" />
                <stop offset="100%" stop-color="#818cf8" />
            </linearGradient>
        </defs>

        <!-- 타이머 외곽선 -->
        <circle cx="12" cy="13" r="8" />
        <!-- 시곗바늘 -->
        <path d="M12 9v4l2 2" />
        <!-- 상단 버튼 -->
        <line x1="10" y1="2" x2="14" y2="2" />
        <line x1="12" y1="2" x2="12" y2="5" />
    </svg>
</template>