<template>
    <div class="home-page">
        <!-- PWA 설치 버튼 -->
        <div class="pwa-install-wrapper">
            <div id="pwa-install-container" style="display: none">
                <button id="pwa-install-btn" class="pwa-install-button" @click="handleInstallClick">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                    </svg>
                    앱 설치
                </button>
            </div>
        </div>

        <h1 class="main-title">explainpark101 Apps</h1>

        <div class="container">
            <router-link to="/arch-graphic" class="app-card">
                <div class="card">
                    <div class="icon">
                        <ArchGraphicIcon />
                    </div>
                    <div class="card-title">건설 그래픽 커뮤니케이션</div>
                    <div class="card-desc">건설 그래픽 커뮤니케이션 단어 외우기</div>
                </div>
            </router-link>

            <router-link to="/dijkstra" class="app-card">
                <div class="card">
                    <div class="icon">
                        <DijkstraIcon />
                    </div>
                    <div class="card-title">다익스트라 알고리즘</div>
                    <div class="card-desc">다익스트라 알고리즘 테스트</div>
                </div>
            </router-link>

            <router-link to="/imgs/unnamed" class="app-card">
                <div class="card">
                    <div class="icon">
                        <UnnamedIcon />
                    </div>
                    <div class="card-title">마작부장 강의장면 만들기</div>
                    <div class="card-desc">합성짤 만들기</div>
                </div>
            </router-link>

            <router-link to="/jungsan" class="app-card">
                <div class="card">
                    <div class="icon">
                        <JungsanIcon />
                    </div>
                    <div class="card-title">회식 정산 계산기</div>
                    <div class="card-desc">테이블별 회식비 정산</div>
                </div>
            </router-link>

            <router-link to="/password" class="app-card">
                <div class="card">
                    <div class="icon">
                        <PasswordIcon />
                    </div>
                    <div class="card-title">강력한 비밀번호 생성기</div>
                    <div class="card-desc">안전한 비밀번호 생성</div>
                </div>
            </router-link>

            <router-link to="/surveys" class="app-card">
                <div class="card">
                    <div class="icon">
                        <SurveysIcon />
                    </div>
                    <div class="card-title">검사 모음</div>
                    <div class="card-desc">각종 검사 모음</div>
                </div>
            </router-link>

            <router-link to="/clipboard-img-save" class="app-card">
                <div class="card">
                    <div class="icon">
                        <ClipboardImgSaveIcon />
                    </div>
                    <div class="card-title">클립보드 이미지 저장기</div>
                    <div class="card-desc">클립보드 이미지를 PNG/WEBP로 저장</div>
                </div>
            </router-link>

            <router-link to="/pdf-to-png" class="app-card">
                <div class="card">
                    <div class="icon">
                        <PdfToPngIcon />
                    </div>
                    <div class="card-title">PDF to PNG</div>
                    <div class="card-desc">PDF를 고화질 PNG 이미지로 변환</div>
                </div>
            </router-link>

            <router-link to="/todo" class="app-card">
                <div class="card">
                    <div class="icon">
                        <TodoIcon />
                    </div>
                    <div class="card-title">할 일 관리</div>
                    <div class="card-desc">할 일 목록 관리 및 체크리스트</div>
                </div>
            </router-link>

            <router-link to="/wbs-chart" class="app-card">
                <div class="card">
                    <div class="icon">
                        <WBSChartIcon />
                    </div>
                    <div class="card-title">WBS 차트 편집기</div>
                    <div class="card-desc">프로젝트 구조를 시각적으로 계획하고 편집하세요.</div>
                </div>
            </router-link>

            <router-link to="/typing-game" class="app-card">
                <div class="card">
                    <div class="icon">
                        <TypingGameIcon />
                    </div>
                    <div class="card-title">타자 게임</div>
                    <div class="card-desc">한컴 타자 연습 소나기 비슷한거</div>
                </div>
            </router-link>

            <router-link to="/chatting-app" class="app-card">
                <div class="card">
                    <div class="icon">
                        <ChattingAppIcon />
                    </div>
                    <div class="card-title">WebRTC 채팅</div>
                    <div class="card-desc">QR코드로 연결하는 퀴즈용 P2P 실시간채팅</div>
                </div>
            </router-link>

            <router-link to="/web-rtc-video" class="app-card">
                <div class="card">
                    <div class="icon">
                        <WebRTCVideoIcon />
                    </div>
                    <div class="card-title">WebRTC 비디오</div>
                    <div class="card-desc">WebRTC 비디오 통화 테스트</div>
                </div>
            </router-link>
        </div>

        <hr />
        <h3 class="section-title">External Apps</h3>
        <div class="container">
            <a href="https://qrscan101.onrender.com/" class="app-card" target="_blank" rel="noopener noreferrer">
                <div class="card">
                    <div class="icon">
                        <QRCodeScannerIcon />
                    </div>
                    <div class="card-title">QR Scanner</div>
                    <div class="card-desc">QR 코드 스캐너 / 클립보드 qr코드 인식</div>
                </div>
            </a>
        </div>
    </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import DownloadIcon from '@/components/icons/DownloadIcon.vue';
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

let deferredPrompt = null;
const pwaInstallContainer = document.getElementById('pwa-install-container');
const pwaInstallBtn = document.getElementById('pwa-install-btn');

const handleInstallClick = async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('PWA 설치가 수락되었습니다.');
            pwaInstallContainer.style.display = 'none';
        } else {
            console.log('PWA 설치가 거부되었습니다.');
        }
        deferredPrompt = null;
    }
};

onMounted(() => {
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

    // Cleanup
    onUnmounted(() => {
        window.removeEventListener('beforeinstallprompt', beforeInstallHandler);
        window.removeEventListener('appinstalled', installedHandler);
    });
});
</script>

<style scoped>
.home-page {
    background-color: var(--background);
    font-family: 'Roboto', 'Noto Sans KR', Arial, sans-serif;
    margin: 0;
    padding: 0;
    min-height: 100vh;
    min-height: 100dvh;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    transition: background-color 500ms ease-in-out, color 500ms ease-in-out;
}

.pwa-install-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 auto 20px auto;
    max-width: 900px;
    width: 100%;
}

.pwa-install-button {
    background: #1976d2;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    box-shadow: 0 2px 8px rgba(25, 118, 210, 0.3);
    transition: all 0.2s ease;
}

.pwa-install-button:hover {
    background: #1565c0;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(25, 118, 210, 0.4);
}

.pwa-install-button:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(25, 118, 210, 0.3);
}

.main-title {
    text-align: center;
    font-family: 'Roboto', 'Noto Sans KR', Arial, sans-serif;
    font-size: 2.2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 32px 0;
    transition: color 500ms ease-in-out;
}

.section-title {
    text-align: center;
    font-family: 'Roboto', 'Noto Sans KR', Arial, sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 32px 0;
    transition: color 500ms ease-in-out;
}

.container {
    max-width: 900px;
    margin: 0 auto;
    display: flex;
    flex-wrap: wrap;
    gap: 32px;
    justify-content: center;
}

.app-card {
    text-decoration: none;
    color: inherit;
}

.card {
    background-color: var(--surface);
    border-radius: 16px;
    box-shadow: 0 2px 8px var(--shadow-color), 0 1.5px 4px var(--shadow-color);
    width: 200px;
    height: 220px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: box-shadow 0.2s, transform 0.2s, background-color 500ms ease-in-out;
    cursor: pointer;
    position: relative;
}

.card:hover {
    box-shadow: 0 6px 24px rgba(60, 60, 60, 0.16), 0 3px 8px rgba(60, 60, 60, 0.1);
    transform: translateY(-4px) scale(1.03);
}

.icon {
    width: 64px;
    height: 64px;
    margin-bottom: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.card-title {
    font-size: 1.2rem;
    font-weight: 500;
    text-align: center;
    margin-bottom: 6px;
    word-break: keep-all !important;
}

.card-desc {
    font-size: 0.95rem;
    color: var(--text-secondary);
    text-align: center;
    word-break: keep-all !important;
    transition: color 500ms ease-in-out;
}

hr {
    width: 100%;
    max-width: 900px;
    margin: 32px auto;
    border: none;
    border-top: 1px solid var(--border-color);
    transition: border-color 500ms ease-in-out;
}
</style>
