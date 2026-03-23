<template>
    <div
        class="min-h-screen w-full flex flex-col justify-center items-center bg-(--background) text-(--text-primary) transition-[background-color,color] duration-500 ease-in-out">
        <!-- PWA 설치 버튼 -->
        <div class="flex justify-between items-center mx-auto mb-5 max-w-[900px] w-full">
            <div id="pwa-install-container" style="display: none">
                <button id="pwa-install-btn"
                    class="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-white text-[0.9rem] font-medium cursor-pointer border-none bg-(--primary-color) shadow-[0_2px_8px_rgba(25,118,210,0.3)] transition-all duration-200 hover:bg-(--primary-dark) hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(25,118,210,0.4)] active:translate-y-0 active:shadow-[0_2px_8px_rgba(25,118,210,0.3)]"
                    @click="handleInstallClick">
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
            <router-link v-for="item in internalAppItems" :key="item.to" :to="item.to"
                class="no-underline text-inherit">
                <div
                    class="w-[200px] h-[220px] flex flex-col items-center justify-center rounded-2xl bg-(--surface) shadow-[0_2px_8px_var(--shadow-color),0_1.5px_4px_var(--shadow-color)] cursor-pointer relative transition-all duration-200 hover:shadow-[0_6px_24px_rgba(60,60,60,0.16),0_3px_8px_rgba(60,60,60,0.1)] hover:-translate-y-1 hover:scale-[1.03]">
                    <div class="w-16 h-16 mb-4 flex items-center justify-center">
                        <component :is="item.icon" />
                    </div>
                    <div class="text-xl font-medium text-center mb-1.5 break-keep">{{ item.title }}</div>
                    <div class="text-[0.95rem] text-(--text-secondary) text-center break-keep transition-colors duration-500"
                        v-html="item.description"></div>
                </div>
            </router-link>
        </div>

        <hr
            class="w-full max-w-[900px] mx-auto my-8 border-0 border-t border-(--border-color) transition-[border-color] duration-500" />
        <div class="max-w-[900px] mx-auto w-full flex flex-col items-center gap-4 my-8">
            <h3 class="text-center text-2xl font-bold text-(--text-primary) m-0 transition-colors duration-500">
                External Apps
            </h3>
            <label
                class="inline-flex items-center gap-2 cursor-pointer select-none text-(--text-primary) text-[0.95rem]">
                <span
                    class="relative inline-block w-10 h-5 rounded-full bg-(--surface) shadow-inner transition-colors duration-200"
                    :class="{ 'bg-(--primary-color)': externalOpenInNewTab }">
                    <input type="checkbox" class="sr-only peer" :checked="externalOpenInNewTab"
                        @change="(e) => setExternalOpenInNewTab(e.target.checked)" />
                    <span
                        class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
                        :class="{ 'translate-x-5': externalOpenInNewTab }" />
                </span>
                <span>외부 앱 새 탭에서 열기</span>
            </label>
        </div>
        <div class="max-w-[900px] mx-auto flex flex-wrap gap-8 justify-center pb-8">
            <a v-for="item in externalAppItems" :key="item.href" :href="item.href" class="no-underline text-inherit"
                :target="externalOpenInNewTab ? '_blank' : '_self'"
                :rel="externalOpenInNewTab ? 'noopener noreferrer' : undefined">
                <div
                    class="w-[200px] h-[220px] flex flex-col items-center justify-center rounded-2xl bg-(--surface) shadow-[0_2px_8px_var(--shadow-color),0_1.5px_4px_var(--shadow-color)] cursor-pointer relative transition-all duration-200 hover:shadow-[0_6px_24px_rgba(60,60,60,0.16),0_3px_8px_rgba(60,60,60,0.1)] hover:-translate-y-1 hover:scale-[1.03]">
                    <div class="w-16 h-16 mb-4 flex items-center justify-center">
                        <component :is="item.icon" />
                    </div>
                    <div class="text-xl font-medium text-center mb-1.5 break-keep">{{ item.title }}</div>
                    <div
                        class="text-[0.95rem] text-(--text-secondary) text-center break-keep transition-colors duration-500">
                        {{ item.description }}</div>
                </div>
            </a>
        </div>
    </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';

const EXTERNAL_OPEN_NEW_TAB_KEY = 'home-external-open-new-tab';

function getInitialExternalOpenInNewTab() {
    if (typeof localStorage === 'undefined') return true;
    const stored = localStorage.getItem(EXTERNAL_OPEN_NEW_TAB_KEY);
    return stored !== 'false';
}

const externalOpenInNewTab = ref(getInitialExternalOpenInNewTab());

function setExternalOpenInNewTab(value) {
    externalOpenInNewTab.value = value;
    try {
        localStorage.setItem(EXTERNAL_OPEN_NEW_TAB_KEY, String(value));
    } catch (_) { }
}
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
import S3VideoRecorderIcon from '../components/icons/S3VideoRecorderIcon.vue';
import WebDavViewerIcon from '../components/icons/WebDavViewerIcon.vue';

const internalAppItems = [
    { to: '/arch-graphic', icon: ArchGraphicIcon, title: '건설 그래픽 커뮤니케이션', description: '건설 그래픽 커뮤니케이션 단어 외우기' },
    { to: '/dijkstra', icon: DijkstraIcon, title: '다익스트라 알고리즘', description: '다익스트라 알고리즘 테스트' },
    // { to: '/imgs/unnamed', icon: UnnamedIcon, title: '마작부장 강의장면 만들기', description: '합성짤 만들기' },
    { to: '/jungsan', icon: JungsanIcon, title: '회식 정산 계산기', description: '테이블별 회식비 정산' },
    { to: '/password', icon: PasswordIcon, title: '강력한 비밀번호 생성기', description: '안전한 비밀번호 생성' },
    { to: '/surveys', icon: SurveysIcon, title: '검사 모음', description: '각종 검사 모음' },
    { to: '/clipboard-img-save', icon: ClipboardImgSaveIcon, title: '클립보드 이미지 저장기', description: '클립보드 이미지를 PNG/WEBP로 저장' },
    { to: '/pdf-to-png', icon: PdfToPngIcon, title: 'PDF to PNG', description: 'PDF를 고화질 PNG 이미지로 변환' },
    { to: '/todo', icon: TodoIcon, title: '할 일 관리', description: '할 일 목록 관리 및 체크리스트 <br/> Fast TODO List' },
    { to: '/wbs-chart', icon: WBSChartIcon, title: 'WBS 차트 편집기', description: '프로젝트 구조를 시각적으로 계획하고 편집하세요.' },
    // { to: '/typing-game', icon: TypingGameIcon, title: '타자 게임', description: '한컴 타자 연습 소나기 비슷한거' },
    { to: '/chatting-app', icon: ChattingAppIcon, title: 'WebRTC 채팅', description: 'QR코드로 연결하는 퀴즈용 P2P 실시간채팅' },
    { to: '/web-rtc-video', icon: WebRTCVideoIcon, title: 'WebRTC 비디오', description: 'WebRTC 비디오 통화 테스트' },
    { to: '/html-to-md', icon: HTML2MDIcon, title: 'HTML to MD', description: 'HTML을 MD로 변환' },
];

const externalAppItems = [
    { href: 'https://qrscan101.onrender.com/', icon: QRCodeScannerIcon, title: 'QR Scanner', description: 'QR 코드 스캐너 / 클립보드 qr코드 인식' },
    { href: '/test-paper/', icon: ExamPaperIcon, title: 'Exam Master', description: '시험 응시 및 채점 도우미' },
    { href: '/s3haim', icon: S3HaimIcon, title: 'S3 Haim', description: 'S3 활용 Note Taking App' },
    // { href: '/s3-video-recorder', icon: S3VideoRecorderIcon, title: 'S3 Video Recorder', description: 'S3 활용 Video Recorder App' },
    { href: '/webdav-viewer', icon: WebDavViewerIcon, title: 'WebDAV Viewer', description: 'WebDAV Viewer App' },
    { href: 'https://focus-timer.jaehyung101.biz/', icon: FocusTimerIcon, title: 'Focus Timer', description: '타이머 앱' },
];

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
