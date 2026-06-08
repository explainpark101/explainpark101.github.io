<template>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
        <defs>
            <!-- 백그라운드 프리미엄 다크 그라데이션 -->
            <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#0f172a" />
                <stop offset="100%" stop-color="#1e293b" />
            </linearGradient>
            <!-- PDF 오렌지-레드 포인트 그라데이션 -->
            <linearGradient id="pdfGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#ef4444" />
                <stop offset="100%" stop-color="#f97316" />
            </linearGradient>
            <!-- 추출/이미지 인디고-바이올렛 그라데이션 -->
            <linearGradient id="imgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#6366f1" />
                <stop offset="100%" stop-color="#a855f7" />
            </linearGradient>
            <!-- 소프트 글로우 발광 필터 효과 -->
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="14" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <!-- 3D 입체감을 위한 그림자 필터 효과 -->
            <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.6" />
            </filter>
        </defs>

        <!-- 원형 모서리가 적용된 프리미엄 다크 카드 백그라운드 -->
        <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />

        <!-- 배경에 펼쳐지는 은은한 시각적 공간감 연출 -->
        <circle cx="256" cy="256" r="190" fill="url(#imgGrad)" opacity="0.06" filter="url(#glow)" />

        <g filter="url(#shadow)">
            <!-- PDF 문서 프레임 바디 (좌측 후면 배치) -->
            <path
                d="M 100 140 C 100 129, 109 120, 120 120 L 280 120 L 320 160 L 320 380 C 320 391, 311 400, 300 400 L 120 400 C 109 400, 100 391, 100 380 Z"
                fill="#1e293b" stroke="#334155" stroke-width="4" />

            <!-- 정제된 문서를 표현하는 본문 텍스트 슬롯 레이아웃 -->
            <line x1="140" y1="230" x2="280" y2="230" stroke="#475569" stroke-width="6" stroke-linecap="round" />
            <line x1="140" y1="270" x2="240" y2="270" stroke="#475569" stroke-width="6" stroke-linecap="round" />
            <line x1="140" y1="310" x2="270" y2="310" stroke="#475569" stroke-width="6" stroke-linecap="round" />
            <line x1="140" y1="350" x2="210" y2="350" stroke="#475569" stroke-width="6" stroke-linecap="round" />

            <!-- 상단 좌측 PDF 심볼 태그 가공 -->
            <path d="M 100 140 C 100 129, 109 120, 120 120 L 210 120 L 210 174 L 100 174 Z" fill="url(#pdfGrad)" />
            <text x="118" y="156" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="900"
                font-size="24" letter-spacing="1">PDF</text>

            <!-- 상단 우측 문서 폴딩(접힘) 디테일 구현 -->
            <path d="M 280 120 L 320 160 L 296 160 C 287 160, 280 153, 280 144 Z" fill="#334155" />
            <path d="M 280 120 L 320 160 L 280 160 Z" fill="#090d16" opacity="0.4" />
        </g>

        <!-- 추출 프로세스를 나타내는 추적 다이나믹 동적 점선 -->
        <path d="M 170 320 C 150 430, 360 450, 380 320 C 390 260, 350 220, 320 200" fill="none" stroke="url(#imgGrad)"
            stroke-width="10" stroke-linecap="round" stroke-dasharray="5 10" opacity="0.5" />

        <!-- 이미지로 뿜어져 올라오는 발광 흐름 메인 커브 -->
        <path d="M 210 280 C 230 380, 360 360, 340 240" fill="none" stroke="url(#imgGrad)" stroke-width="12"
            stroke-linecap="round" filter="url(#glow)" opacity="0.8" />

        <!-- 대상 사진 프레임을 지향하는 깔끔한 벡터 화살표 헤드 -->
        <path d="M 322 255 L 340 232 L 358 260" fill="none" stroke="url(#imgGrad)" stroke-width="10"
            stroke-linecap="round" stroke-linejoin="round" />

        <!-- 자유롭게 인출되어 날아오르는 고품질 사진 프레임 (우측 배치) -->
        <g transform="translate(244, 100) rotate(8, 110, 110)" filter="url(#shadow)">
            <!-- 유려한 바이올렛 외곽 테두리 하우징 -->
            <rect x="10" y="10" width="200" height="200" rx="28" fill="#090d16" stroke="url(#imgGrad)"
                stroke-width="5" />

            <!-- 사진 내부 이너 캔버스 공간 확보 -->
            <rect x="22" y="22" width="176" height="176" rx="20" fill="#1e293b" />

            <!-- 밝게 연출되는 황금빛 미니멀 썬셋 자산 -->
            <circle cx="132" cy="78" r="24" fill="#fbbf24" filter="url(#glow)" opacity="0.6" />
            <circle cx="132" cy="78" r="24" fill="#fbbf24" />
            <circle cx="132" cy="78" r="18" fill="#fef08a" />

            <!-- 수려한 그라데이션이 인가된 기하학적 산맥 레이어 -->
            <path
                d="M 22 198 L 76 122 C 81 115, 91 115, 96 122 L 142 184 L 156 162 C 161 155, 171 155, 176 162 L 198 198 Z"
                fill="url(#imgGrad)" />

            <!-- 투명도를 응용하여 입체감을 더한 전경 레이어 산맥 피크 -->
            <path d="M 52 198 L 102 133 C 105 129, 111 129, 114 133 L 164 198 Z" fill="#c084fc" opacity="0.35" />
        </g>
    </svg>
</template>