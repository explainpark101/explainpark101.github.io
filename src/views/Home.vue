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
            <router-link v-for="item in internalAppItems" :key="item.href" :to="item.href"
                class="no-underline text-inherit">
                <div
                    class="w-[200px] h-[220px] flex flex-col items-center justify-center rounded-2xl bg-(--surface) shadow-[0_2px_8px_var(--shadow-color),0_1.5px_4px_var(--shadow-color)] cursor-pointer relative transition-all duration-200 hover:shadow-[0_6px_24px_rgba(60,60,60,0.16),0_3px_8px_rgba(60,60,60,0.1)] hover:-translate-y-1 hover:scale-[1.03]">
                    <div class="w-16 h-16 mb-4 flex items-center justify-center">
                        <component :is="item.icon" />
                    </div>
                    <div class="text-xl font-medium text-center mb-1.5 break-keep">{{ item.title }}</div>
                    <div v-if="item.descriptionHtml"
                        class="text-[0.95rem] text-(--text-secondary) text-center break-keep transition-colors duration-500"
                        v-html="item.description"></div>
                    <div v-else
                        class="text-[0.95rem] text-(--text-secondary) text-center break-keep transition-colors duration-500">
                        {{ item.description }}</div>
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
            <a v-for="item in externalAppItems" :key="item.href" :href="resolveExternalHref(item.href)"
                class="no-underline text-inherit" :target="externalOpenInNewTab ? '_blank' : '_self'"
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
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { HOME_APP_LINKS } from '@/data/homeAppLinks.js';

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

const router = useRouter();

function isSpaHref(href) {
    if (!href || /^https?:\/\//i.test(href)) return false;
    return router.resolve(href).matched.length > 0;
}

const appItems = computed(() =>
    HOME_APP_LINKS.map((item) => ({
        ...item,
        isSpa: isSpaHref(item.href),
    })),
);

const internalAppItems = computed(() => appItems.value.filter((i) => i.isSpa));
const externalAppItems = computed(() => appItems.value.filter((i) => !i.isSpa));

function resolveExternalHref(href) {
    if (!href?.startsWith('/')) return href;
    return typeof window !== 'undefined' ? `${window.location.origin}${href}` : href;
}

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

    const beforeInstallHandler = (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (pwaInstallContainer) {
            pwaInstallContainer.style.display = 'block';
        }
    };

    const installedHandler = () => {
        console.log('PWA가 성공적으로 설치되었습니다.');
        if (pwaInstallContainer) {
            pwaInstallContainer.style.display = 'none';
        }
    };

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
