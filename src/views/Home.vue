<template>
    <div class="min-h-screen w-full flex flex-col justify-center items-center bg-(--background) text-(--text-primary) transition-[background-color,color] duration-500 ease-in-out">
        <!-- PWA 설치 버튼 -->
        <div class="flex justify-between items-center mx-auto mb-5 max-w-[900px] w-full">
            <div id="pwa-install-container" style="display: none">
                <button
                    id="pwa-install-btn"
                    class="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-white text-[0.9rem] font-medium cursor-pointer border-none bg-(--primary-color) shadow-[0_2px_8px_rgba(25,118,210,0.3)] transition-all duration-200 hover:bg-(--primary-dark) hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(25,118,210,0.4)] active:translate-y-0 active:shadow-[0_2px_8px_rgba(25,118,210,0.3)]"
                    @click="handleInstallClick"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                    </svg>
                    앱 설치
                </button>
            </div>
        </div>

        <h1 class="text-center text-[2.2rem] font-bold text-(--text-primary) m-0 mb-8 transition-colors duration-500">
            explainpark101 Apps
        </h1>

        <div class="max-w-[900px] mx-auto flex flex-wrap gap-8 justify-center">
            <router-link to="/arch-graphic" class="no-underline text-inherit">
                <div class="w-[200px] h-[220px] flex flex-col items-center justify-center rounded-2xl bg-(--surface) shadow-[0_2px_8px_var(--shadow-color),0_1.5px_4px_var(--shadow-color)] cursor-pointer relative transition-all duration-200 hover:shadow-[0_6px_24px_rgba(60,60,60,0.16),0_3px_8px_rgba(60,60,60,0.1)] hover:-translate-y-1 hover:scale-[1.03]">
                    <div class="w-16 h-16 mb-4 flex items-center justify-center">
                        <ArchGraphicIcon />
                    </div>
                    <div class="text-xl font-medium text-center mb-1.5 break-keep">건설 그래픽 커뮤니케이션</div>
                    <div class="text-[0.95rem] text-(--text-secondary) text-center break-keep transition-colors duration-500">건설 그래픽 커뮤니케이션 단어 외우기</div>
                </div>
            </router-link>

            <router-link to="/dijkstra" class="no-underline text-inherit">
                <div class="w-[200px] h-[220px] flex flex-col items-center justify-center rounded-2xl bg-(--surface) shadow-[0_2px_8px_var(--shadow-color),0_1.5px_4px_var(--shadow-color)] cursor-pointer relative transition-all duration-200 hover:shadow-[0_6px_24px_rgba(60,60,60,0.16),0_3px_8px_rgba(60,60,60,0.1)] hover:-translate-y-1 hover:scale-[1.03]">
                    <div class="w-16 h-16 mb-4 flex items-center justify-center">
                        <DijkstraIcon />
                    </div>
                    <div class="text-xl font-medium text-center mb-1.5 break-keep">다익스트라 알고리즘</div>
                    <div class="text-[0.95rem] text-(--text-secondary) text-center break-keep transition-colors duration-500">다익스트라 알고리즘 테스트</div>
                </div>
            </router-link>

            <router-link to="/imgs/unnamed" class="no-underline text-inherit">
                <div class="w-[200px] h-[220px] flex flex-col items-center justify-center rounded-2xl bg-(--surface) shadow-[0_2px_8px_var(--shadow-color),0_1.5px_4px_var(--shadow-color)] cursor-pointer relative transition-all duration-200 hover:shadow-[0_6px_24px_rgba(60,60,60,0.16),0_3px_8px_rgba(60,60,60,0.1)] hover:-translate-y-1 hover:scale-[1.03]">
                    <div class="w-16 h-16 mb-4 flex items-center justify-center">
                        <UnnamedIcon />
                    </div>
                    <div class="text-xl font-medium text-center mb-1.5 break-keep">마작부장 강의장면 만들기</div>
                    <div class="text-[0.95rem] text-(--text-secondary) text-center break-keep transition-colors duration-500">합성짤 만들기</div>
                </div>
            </router-link>

            <router-link to="/jungsan" class="no-underline text-inherit">
                <div class="w-[200px] h-[220px] flex flex-col items-center justify-center rounded-2xl bg-(--surface) shadow-[0_2px_8px_var(--shadow-color),0_1.5px_4px_var(--shadow-color)] cursor-pointer relative transition-all duration-200 hover:shadow-[0_6px_24px_rgba(60,60,60,0.16),0_3px_8px_rgba(60,60,60,0.1)] hover:-translate-y-1 hover:scale-[1.03]">
                    <div class="w-16 h-16 mb-4 flex items-center justify-center">
                        <JungsanIcon />
                    </div>
                    <div class="text-xl font-medium text-center mb-1.5 break-keep">회식 정산 계산기</div>
                    <div class="text-[0.95rem] text-(--text-secondary) text-center break-keep transition-colors duration-500">테이블별 회식비 정산</div>
                </div>
            </router-link>

            <router-link to="/password" class="no-underline text-inherit">
                <div class="w-[200px] h-[220px] flex flex-col items-center justify-center rounded-2xl bg-(--surface) shadow-[0_2px_8px_var(--shadow-color),0_1.5px_4px_var(--shadow-color)] cursor-pointer relative transition-all duration-200 hover:shadow-[0_6px_24px_rgba(60,60,60,0.16),0_3px_8px_rgba(60,60,60,0.1)] hover:-translate-y-1 hover:scale-[1.03]">
                    <div class="w-16 h-16 mb-4 flex items-center justify-center">
                        <PasswordIcon />
                    </div>
                    <div class="text-xl font-medium text-center mb-1.5 break-keep">강력한 비밀번호 생성기</div>
                    <div class="text-[0.95rem] text-(--text-secondary) text-center break-keep transition-colors duration-500">안전한 비밀번호 생성</div>
                </div>
            </router-link>

            <router-link to="/surveys" class="no-underline text-inherit">
                <div class="w-[200px] h-[220px] flex flex-col items-center justify-center rounded-2xl bg-(--surface) shadow-[0_2px_8px_var(--shadow-color),0_1.5px_4px_var(--shadow-color)] cursor-pointer relative transition-all duration-200 hover:shadow-[0_6px_24px_rgba(60,60,60,0.16),0_3px_8px_rgba(60,60,60,0.1)] hover:-translate-y-1 hover:scale-[1.03]">
                    <div class="w-16 h-16 mb-4 flex items-center justify-center">
                        <SurveysIcon />
                    </div>
                    <div class="text-xl font-medium text-center mb-1.5 break-keep">검사 모음</div>
                    <div class="text-[0.95rem] text-(--text-secondary) text-center break-keep transition-colors duration-500">각종 검사 모음</div>
                </div>
            </router-link>

            <router-link to="/clipboard-img-save" class="no-underline text-inherit">
                <div class="w-[200px] h-[220px] flex flex-col items-center justify-center rounded-2xl bg-(--surface) shadow-[0_2px_8px_var(--shadow-color),0_1.5px_4px_var(--shadow-color)] cursor-pointer relative transition-all duration-200 hover:shadow-[0_6px_24px_rgba(60,60,60,0.16),0_3px_8px_rgba(60,60,60,0.1)] hover:-translate-y-1 hover:scale-[1.03]">
                    <div class="w-16 h-16 mb-4 flex items-center justify-center">
                        <ClipboardImgSaveIcon />
                    </div>
                    <div class="text-xl font-medium text-center mb-1.5 break-keep">클립보드 이미지 저장기</div>
                    <div class="text-[0.95rem] text-(--text-secondary) text-center break-keep transition-colors duration-500">클립보드 이미지를 PNG/WEBP로 저장</div>
                </div>
            </router-link>

            <router-link to="/pdf-to-png" class="no-underline text-inherit">
                <div class="w-[200px] h-[220px] flex flex-col items-center justify-center rounded-2xl bg-(--surface) shadow-[0_2px_8px_var(--shadow-color),0_1.5px_4px_var(--shadow-color)] cursor-pointer relative transition-all duration-200 hover:shadow-[0_6px_24px_rgba(60,60,60,0.16),0_3px_8px_rgba(60,60,60,0.1)] hover:-translate-y-1 hover:scale-[1.03]">
                    <div class="w-16 h-16 mb-4 flex items-center justify-center">
                        <PdfToPngIcon />
                    </div>
                    <div class="text-xl font-medium text-center mb-1.5 break-keep">PDF to PNG</div>
                    <div class="text-[0.95rem] text-(--text-secondary) text-center break-keep transition-colors duration-500">PDF를 고화질 PNG 이미지로 변환</div>
                </div>
            </router-link>

            <router-link to="/todo" class="no-underline text-inherit">
                <div class="w-[200px] h-[220px] flex flex-col items-center justify-center rounded-2xl bg-(--surface) shadow-[0_2px_8px_var(--shadow-color),0_1.5px_4px_var(--shadow-color)] cursor-pointer relative transition-all duration-200 hover:shadow-[0_6px_24px_rgba(60,60,60,0.16),0_3px_8px_rgba(60,60,60,0.1)] hover:-translate-y-1 hover:scale-[1.03]">
                    <div class="w-16 h-16 mb-4 flex items-center justify-center">
                        <TodoIcon />
                    </div>
                    <div class="text-xl font-medium text-center mb-1.5 break-keep">할 일 관리</div>
                    <div class="text-[0.95rem] text-(--text-secondary) text-center break-keep transition-colors duration-500">할 일 목록 관리 및 체크리스트 <br/> Fast TODO List </div>
                </div>
            </router-link>

            <router-link to="/wbs-chart" class="no-underline text-inherit">
                <div class="w-[200px] h-[220px] flex flex-col items-center justify-center rounded-2xl bg-(--surface) shadow-[0_2px_8px_var(--shadow-color),0_1.5px_4px_var(--shadow-color)] cursor-pointer relative transition-all duration-200 hover:shadow-[0_6px_24px_rgba(60,60,60,0.16),0_3px_8px_rgba(60,60,60,0.1)] hover:-translate-y-1 hover:scale-[1.03]">
                    <div class="w-16 h-16 mb-4 flex items-center justify-center">
                        <WBSChartIcon />
                    </div>
                    <div class="text-xl font-medium text-center mb-1.5 break-keep">WBS 차트 편집기</div>
                    <div class="text-[0.95rem] text-(--text-secondary) text-center break-keep transition-colors duration-500">프로젝트 구조를 시각적으로 계획하고 편집하세요.</div>
                </div>
            </router-link>

            <router-link to="/typing-game" class="no-underline text-inherit">
                <div class="w-[200px] h-[220px] flex flex-col items-center justify-center rounded-2xl bg-(--surface) shadow-[0_2px_8px_var(--shadow-color),0_1.5px_4px_var(--shadow-color)] cursor-pointer relative transition-all duration-200 hover:shadow-[0_6px_24px_rgba(60,60,60,0.16),0_3px_8px_rgba(60,60,60,0.1)] hover:-translate-y-1 hover:scale-[1.03]">
                    <div class="w-16 h-16 mb-4 flex items-center justify-center">
                        <TypingGameIcon />
                    </div>
                    <div class="text-xl font-medium text-center mb-1.5 break-keep">타자 게임</div>
                    <div class="text-[0.95rem] text-(--text-secondary) text-center break-keep transition-colors duration-500">한컴 타자 연습 소나기 비슷한거</div>
                </div>
            </router-link>

            <router-link to="/chatting-app" class="no-underline text-inherit">
                <div class="w-[200px] h-[220px] flex flex-col items-center justify-center rounded-2xl bg-(--surface) shadow-[0_2px_8px_var(--shadow-color),0_1.5px_4px_var(--shadow-color)] cursor-pointer relative transition-all duration-200 hover:shadow-[0_6px_24px_rgba(60,60,60,0.16),0_3px_8px_rgba(60,60,60,0.1)] hover:-translate-y-1 hover:scale-[1.03]">
                    <div class="w-16 h-16 mb-4 flex items-center justify-center">
                        <ChattingAppIcon />
                    </div>
                    <div class="text-xl font-medium text-center mb-1.5 break-keep">WebRTC 채팅</div>
                    <div class="text-[0.95rem] text-(--text-secondary) text-center break-keep transition-colors duration-500">QR코드로 연결하는 퀴즈용 P2P 실시간채팅</div>
                </div>
            </router-link>

            <router-link to="/web-rtc-video" class="no-underline text-inherit">
                <div class="w-[200px] h-[220px] flex flex-col items-center justify-center rounded-2xl bg-(--surface) shadow-[0_2px_8px_var(--shadow-color),0_1.5px_4px_var(--shadow-color)] cursor-pointer relative transition-all duration-200 hover:shadow-[0_6px_24px_rgba(60,60,60,0.16),0_3px_8px_rgba(60,60,60,0.1)] hover:-translate-y-1 hover:scale-[1.03]">
                    <div class="w-16 h-16 mb-4 flex items-center justify-center">
                        <WebRTCVideoIcon />
                    </div>
                    <div class="text-xl font-medium text-center mb-1.5 break-keep">WebRTC 비디오</div>
                    <div class="text-[0.95rem] text-(--text-secondary) text-center break-keep transition-colors duration-500">WebRTC 비디오 통화 테스트</div>
                </div>
            </router-link>

            <router-link to="/html-to-md" class="no-underline text-inherit">
                <div class="w-[200px] h-[220px] flex flex-col items-center justify-center rounded-2xl bg-(--surface) shadow-[0_2px_8px_var(--shadow-color),0_1.5px_4px_var(--shadow-color)] cursor-pointer relative transition-all duration-200 hover:shadow-[0_6px_24px_rgba(60,60,60,0.16),0_3px_8px_rgba(60,60,60,0.1)] hover:-translate-y-1 hover:scale-[1.03]">
                    <div class="w-16 h-16 mb-4 flex items-center justify-center">
                        <HTML2MDIcon />
                    </div>
                    <div class="text-xl font-medium text-center mb-1.5 break-keep">HTML to MD</div>
                    <div class="text-[0.95rem] text-(--text-secondary) text-center break-keep transition-colors duration-500">HTML을 MD로 변환</div>
                </div>
            </router-link>
        </div>

        <hr class="w-full max-w-[900px] mx-auto my-8 border-0 border-t border-(--border-color) transition-[border-color] duration-500" />
        <h3 class="text-center text-2xl font-bold text-(--text-primary) my-8 transition-colors duration-500">
            External Apps
        </h3>
        <div class="max-w-[900px] mx-auto flex flex-wrap gap-8 justify-center pb-8">
            <a href="https://qrscan101.onrender.com/" class="no-underline text-inherit" target="_blank" rel="noopener noreferrer">
                <div class="w-[200px] h-[220px] flex flex-col items-center justify-center rounded-2xl bg-(--surface) shadow-[0_2px_8px_var(--shadow-color),0_1.5px_4px_var(--shadow-color)] cursor-pointer relative transition-all duration-200 hover:shadow-[0_6px_24px_rgba(60,60,60,0.16),0_3px_8px_rgba(60,60,60,0.1)] hover:-translate-y-1 hover:scale-[1.03]">
                    <div class="w-16 h-16 mb-4 flex items-center justify-center">
                        <QRCodeScannerIcon />
                    </div>
                    <div class="text-xl font-medium text-center mb-1.5 break-keep">QR Scanner</div>
                    <div class="text-[0.95rem] text-(--text-secondary) text-center break-keep transition-colors duration-500">QR 코드 스캐너 / 클립보드 qr코드 인식</div>
                </div>
            </a>
            <a href="/test-paper/" class="no-underline text-inherit" target="_blank" rel="noopener noreferrer">
                <div class="w-[200px] h-[220px] flex flex-col items-center justify-center rounded-2xl bg-(--surface) shadow-[0_2px_8px_var(--shadow-color),0_1.5px_4px_var(--shadow-color)] cursor-pointer relative transition-all duration-200 hover:shadow-[0_6px_24px_rgba(60,60,60,0.16),0_3px_8px_rgba(60,60,60,0.1)] hover:-translate-y-1 hover:scale-[1.03]">
                    <div class="w-16 h-16 mb-4 flex items-center justify-center">
                        <ExamPaperIcon />
                    </div>
                    <div class="text-xl font-medium text-center mb-1.5 break-keep">Exam Master</div>
                    <div class="text-[0.95rem] text-(--text-secondary) text-center break-keep transition-colors duration-500">시험 응시 및 채점 도우미</div>
                </div>
            </a>
            <a href="/s3haim" class="no-underline text-inherit" target="_blank" rel="noopener noreferrer">
                <div class="w-[200px] h-[220px] flex flex-col items-center justify-center rounded-2xl bg-(--surface) shadow-[0_2px_8px_var(--shadow-color),0_1.5px_4px_var(--shadow-color)] cursor-pointer relative transition-all duration-200 hover:shadow-[0_6px_24px_rgba(60,60,60,0.16),0_3px_8px_rgba(60,60,60,0.1)] hover:-translate-y-1 hover:scale-[1.03]">
                    <div class="w-16 h-16 mb-4 flex items-center justify-center">
                        <S3HaimIcon />
                    </div>
                    <div class="text-xl font-medium text-center mb-1.5 break-keep">S3 Haim</div>
                    <div class="text-[0.95rem] text-(--text-secondary) text-center break-keep transition-colors duration-500">S3 활용 Note Taking App</div>
                </div>
            </a>
        </div>
    </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import ArchGraphicIcon from '@/components/icons/ArchGraphicIcon.vue';
import DijkstraIcon from '@/components/icons/DijkstraIcon.vue';
import UnnamedIcon from '@/components/icons/UnnamedIcon.vue';
import JungsanIcon from '@/components/icons/JungsanIcon.vue';
import PasswordIcon from '@/components/icons/PasswordIcon.vue';
import SurveysIcon from '@/components/icons/SurveysIcon.vue';
import ClipboardImgSaveIcon from '@/components/icons/ClipboardImgSaveIcon.vue';
import PdfToPngIcon from '@/components/icons/PdfToPngIcon.vue';
import TodoIcon from '@/components/icons/TodoIcon.vue';
import WBSChartIcon from '@/components/icons/WBSChartIcon.vue';
import TypingGameIcon from '@/components/icons/TypingGameIcon.vue';
import ChattingAppIcon from '@/components/icons/ChattingAppIcon.vue';
import WebRTCVideoIcon from '@/components/icons/WebRTCVideoIcon.vue';
import QRCodeScannerIcon from '@/components/icons/QrCodeScannerIcon.vue';
import ExamPaperIcon from '@/components/icons/ExamPaperIcon.vue';
import S3HaimIcon from '@/components/icons/S3HaimIcon.vue';
import HTML2MDIcon from '@/components/icons/HTML2MDIcon.vue';

let deferredPrompt = null;
let pwaInstallContainer = null;
let pwaInstallBtn = null;

const handleInstallClick = async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('PWA 설치가 수락되었습니다.');
            if (pwaInstallContainer) pwaInstallContainer.style.display = 'none';
        } else {
            console.log('PWA 설치가 거부되었습니다.');
        }
        deferredPrompt = null;
    }
};

onMounted(() => {
    pwaInstallContainer = document.getElementById('pwa-install-container');
    pwaInstallBtn = document.getElementById('pwa-install-btn');

    // Service Worker 등록 해제
    if ('serviceWorker' in navigator && false) {
        navigator.serviceWorker
            .register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    }
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
            for (const registration of registrations) {
                registration.unregister().then((success) => {
                    if (success) {
                        console.log('Service Worker unregistered successfully');
                    }
                });
            }
        });
    }

    // PWA 설치 이벤트 감지
    const beforeInstallHandler = (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (pwaInstallContainer) {
            pwaInstallContainer.style.display = 'block';
        }
    };

    // PWA 설치 완료 이벤트
    const installedHandler = () => {
        console.log('PWA가 성공적으로 설치되었습니다.');
        if (pwaInstallContainer) {
            pwaInstallContainer.style.display = 'none';
        }
    };

    // 이미 설치된 경우 확인
    if (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true
    ) {
        if (pwaInstallContainer) {
            pwaInstallContainer.style.display = 'none';
        }
    }

    window.addEventListener('beforeinstallprompt', beforeInstallHandler);
    window.addEventListener('appinstalled', installedHandler);

    onUnmounted(() => {
        window.removeEventListener('beforeinstallprompt', beforeInstallHandler);
        window.removeEventListener('appinstalled', installedHandler);
    });
});
</script>

