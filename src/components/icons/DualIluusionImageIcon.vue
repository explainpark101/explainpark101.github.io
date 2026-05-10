<template>
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
            <clipPath id="overlap">
                <circle cx="38" cy="50" r="28" />
            </clipPath>
            <pattern id="checker" width="6" height="6" patternUnits="userSpaceOnUse">
                <rect width="3" height="3" fill="#FFFFFF" opacity="0.4" />
                <rect x="3" y="3" width="3" height="3" fill="#FFFFFF" opacity="0.4" />
            </pattern>
        </defs>
        
        {/* 검은 배경 상징 원 */}
        <circle cx="38" cy="50" r="28" fill="#1F2937" />
        
        {/* 하얀 배경 상징 원 */}
        <circle cx="62" cy="50" r="28" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="2" />
        
        {/* 교차 영역 (합성된 투명 이미지 상징) */}
        <g clipPath="url(#overlap)">
            <circle cx="62" cy="50" r="28" fill="#6366F1" />
            {/* 착시를 상징하는 희미한 체크보드 패턴 */}
            <circle cx="62" cy="50" r="28" fill="url(#checker)" />
        </g>
    </svg>
</template>