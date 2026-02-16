<template>
    <svg :width="size" :height="size" viewBox="0 0 48 48" fill="none">
        <!-- 시험지 배경 -->
        <rect x="10" y="6" width="28" height="36" rx="2" fill="#fff" stroke="#333" stroke-width="2" />
        
        <!-- 상단 제목 영역 -->
        <rect x="14" y="10" width="20" height="3" rx="1" fill="#E0E0E0" />
        
        <!-- 문제 번호와 체크박스 -->
        <circle cx="16" cy="18" r="1.5" fill="#333" />
        <rect x="20" y="16.5" width="16" height="2" rx="1" fill="#666" />
        
        <circle cx="16" cy="24" r="1.5" fill="#333" />
        <rect x="20" y="22.5" width="14" height="2" rx="1" fill="#666" />
        
        <circle cx="16" cy="30" r="1.5" fill="#333" />
        <rect x="20" y="28.5" width="18" height="2" rx="1" fill="#666" />
        
        <!-- 체크박스들 -->
        <rect x="14" y="34" width="3" height="3" rx="0.5" fill="none" stroke="#333" stroke-width="1.5" />
        <rect x="14" y="38" width="3" height="3" rx="0.5" fill="none" stroke="#333" stroke-width="1.5" />
        
        <!-- 펜/연필 -->
        <path d="M32 34 L36 30 L38 32 L34 36 Z" fill="#FF5722" />
        <line x1="36" y1="30" x2="38" y2="32" stroke="#FF5722" stroke-width="1.5" stroke-linecap="round" />
    </svg>
</template>

<script setup>
defineProps({
    size: {
        type: [Number, String],
        default: 48
    }
});
</script>
