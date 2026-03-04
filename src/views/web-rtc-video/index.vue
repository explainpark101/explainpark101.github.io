<template>
    <div class="font-sans bg-gray-900 text-gray-100 min-h-screen flex items-center justify-center p-4" @beforeunload="handleBeforeUnload">
        <div class="w-full max-w-full mx-auto">
            <div id="home-view" class="text-center max-w-md mx-auto flex flex-col gap-6" :class="{ hidden: currentView !== 'home' }">
                <h1 class="text-3xl font-bold text-white">EZ WebRTC 화상 솔루션
                    <template v-if="isHost">
                        (교사용)
                    </template>
                    <template v-else>
                        (학생용)
                    </template>
                </h1>
                <p class="text-gray-400">서버 없이 QR 코드로 연결하는 P2P 화상통화</p>
                <input id="username-input" v-model="usernameInput" type="text" placeholder="이름을 입력하세요..." class="w-full py-3 px-4 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    @keydown.enter="handleStart" autocomplete="off" autocapitalize="off" />
                <button id="start-btn" type="button" class="w-full py-3 px-6 font-semibold text-white bg-blue-600 rounded-lg border-none cursor-pointer transition-colors hover:bg-blue-700" @click="handleStart">
                    {{ isHost ? '새 화상통화 만들기' : '화상통화 참여하기' }}
                </button>
            </div>

            <div id="waiting-view" class="text-center max-w-md mx-auto flex flex-col gap-4" :class="{ hidden: currentView !== 'waiting' }">
                <h2 v-if="isHost" class="text-2xl font-semibold">화상통화방 생성됨</h2>
                <p v-if="isHost" class="text-gray-400">아래 QR 코드를 상대방이 스캔하게 하세요.</p>
                <div v-if="isHost" id="qrcode-container" class="flex justify-center p-4 bg-white rounded-lg shadow-inner">
                    <div id="qrcode" ref="qrcodeContainer"></div>
                </div>
                <a v-if="isHost && hostRoomUrl" :href="hostRoomUrl" target="_blank" class="block text-sm text-blue-400 underline break-all mt-2 hover:text-blue-300">{{ hostRoomUrl
                }}</a>
                <div v-if="isHost && myPeerId" class="py-3 text-sm text-gray-300 bg-gray-800 rounded-lg break-all">
                    내 룸 ID: {{ myPeerId }}
                </div>
                <div class="flex items-center justify-center gap-2 text-blue-400">
                    <svg class="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                    <span id="status-text">{{ statusText }}</span>
                </div>
                <p v-if="wittyMessage" class="text-gray-500 text-sm h-5">{{ wittyMessage }}</p>
            </div>

            <div id="video-view" class="w-full h-[90vh] flex flex-col bg-gray-800 rounded-lg shadow-xl overflow-hidden md:flex-row" :class="{ hidden: currentView !== 'video' }">
                <div class="flex-1 flex flex-col h-full overflow-hidden">
                    <header class="flex items-center justify-between p-4 font-semibold text-center text-white bg-gray-900 border-b border-gray-700">
                        <span class="flex-1 text-center overflow-hidden text-ellipsis whitespace-nowrap">{{ videoHeaderTitle }}</span>
                        <div class="flex items-center gap-2">
                            <button id="audio-volume-btn" type="button" class="p-1 rounded-md bg-transparent border-none text-white cursor-pointer transition-colors hover:bg-gray-700 active:bg-gray-600" @click="openAudioVolumeModal"
                                :title="'오디오 볼륨 조절'">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z">
                                    </path>
                                </svg>
                            </button>
                            <button id="screen-share-btn" type="button" class="p-1 rounded-md bg-transparent border-none text-white cursor-pointer transition-colors hover:bg-gray-700 active:bg-gray-600"
                                @click="isScreenSharing ? stopScreenShare() : showScreenShareOptionsDialog()"
                                :title="isScreenSharing ? '카메라로 전환' : '화면 공유'">
                                <svg v-if="!isScreenSharing" class="w-6 h-6" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z">
                                    </path>
                                </svg>
                                <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z">
                                    </path>
                                </svg>
                            </button>
                            <button id="options-btn" type="button" class="block md:hidden p-1 rounded-md bg-transparent border-none text-white cursor-pointer transition-colors hover:bg-gray-700" @click="toggleSidebar">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z">
                                    </path>
                                </svg>
                            </button>
                        </div>
                    </header>

                    <div class="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
                        <div class="w-full h-full relative flex items-center justify-center">
                            <video ref="remoteVideo" autoplay playsinline class="w-full h-full object-contain"
                                :class="{ hidden: !remoteStream }"></video>
                            <div v-if="!remoteStream" class="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                <svg class="w-24 h-24 text-gray-500" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z">
                                    </path>
                                </svg>
                                <p class="text-gray-400 mt-4">상대방 연결 대기 중...</p>
                            </div>
                        </div>

                        <div class="absolute top-4 right-4 w-60 h-[180px] rounded-lg overflow-hidden border-2 border-gray-700 bg-gray-900 z-10">
                            <video ref="localVideo" autoplay playsinline muted class="w-full h-full object-cover"
                                :class="{ hidden: !localStream }"></video>
                            <div v-if="isScreenSharing" class="absolute top-2 left-2 flex items-center gap-1 py-1 px-2 bg-black/70 rounded-md text-white text-xs font-semibold z-20 backdrop-blur-sm">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z">
                                    </path>
                                </svg>
                                <span>화면 공유 중</span>
                                <span v-if="screenShareAudioTracks.length > 0" class="audio-indicator">🔊</span>
                                <span v-if="cameraVideoTrack" class="camera-indicator">📹</span>
                            </div>
                            <div v-if="!localStream" class="w-full h-full flex items-center justify-center text-gray-400">
                                <svg class="w-8 h-8 text-gray-500" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z">
                                    </path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <form @submit.prevent="handleSendMessage" class="flex p-4 bg-gray-900 border-t border-gray-700">
                        <input id="message-input" v-model="messageInput" type="text" placeholder="메시지 입력..." class="flex-1 py-2 px-4 text-white bg-gray-700 border border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autocomplete="off" />
                        <button type="submit" class="py-2 px-4 font-semibold text-white bg-blue-600 rounded-r-lg border-none cursor-pointer transition-colors hover:bg-blue-700 [&_svg]:rotate-90">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                            </svg>
                        </button>
                    </form>
                </div>

                <div id="sidebar" ref="sidebar" class="w-full bg-gray-900 p-4 overflow-y-auto border-t border-gray-700 flex flex-col gap-4 md:w-1/3 md:h-full md:border-t-0 md:border-l md:border-gray-700 webrtc-scrollbar" :class="{ hidden: isSidebarHidden }">
                    <div class="flex flex-col gap-2">
                        <h3 class="text-lg font-semibold text-white text-center">채팅</h3>
                        <div id="messages" ref="messagesContainer" class="flex-1 min-h-[200px] max-h-[300px] p-2 overflow-y-auto flex flex-col gap-3 bg-gray-800 rounded-lg webrtc-scrollbar">
                            <div v-for="(msg, index) in sortedMessages" :key="index" class="flex"
                                :class="{ 'justify-end': msg.senderId === myPeerId, 'justify-start': msg.senderId !== myPeerId }">
                                <div class="message-bubble"
                                    :class="{ 'bg-blue-600': msg.senderId === myPeerId, 'bg-gray-700': msg.senderId !== myPeerId }">
                                    <div v-if="msg.senderId !== myPeerId" class="message-name">
                                        {{ msg.displayName }} <span class="text-xs text-gray-400">#{{ msg.shortId
                                        }}</span>
                                    </div>
                                    <div class="message-text">
                                        {{ msg.text }}
                                    </div>
                                    <div class="message-time">{{ formatTime(msg.timestamp) }}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex flex-col gap-2">
                        <h3 class="text-lg font-semibold text-white text-center">참여 QR 코드</h3>
                        <div id="qrcode-chat-container" class="flex justify-center p-2 bg-white rounded-lg shadow-inner mt-2">
                            <div id="qrcode-chat" ref="qrcodeChatContainer"></div>
                        </div>
                        <a v-if="roomUrl" :href="roomUrl" target="_blank" class="block text-sm text-blue-400 underline break-all text-center mt-2 hover:text-blue-300">{{ roomUrl }}</a>
                    </div>

                    <div class="flex flex-col gap-2">
                        <h3 class="text-lg font-semibold text-white text-center">참여자</h3>
                        <ul id="guest-list" class="mt-2 flex flex-col gap-1 text-gray-300 max-h-[200px] overflow-y-auto pr-1 webrtc-scrollbar">
                            <li class="flex items-center justify-between overflow-hidden text-ellipsis whitespace-nowrap py-1 font-semibold text-white">
                                👑 {{ hostName || localUsername }} <span class="text-xs text-gray-400">#{{ hostShortId
                                    || localShortId }}</span>
                                <span v-if="(hostShortId || localShortId) === localShortId">(나)</span>
                                <span v-else>(방장)</span>
                            </li>
                            <li v-for="guest in guests" :key="guest.id" class="flex items-center justify-between overflow-hidden text-ellipsis whitespace-nowrap py-1"
                                :class="{ 'font-semibold text-white': guest.shortId === localShortId }">
                                <span>👤 {{ guest.name }} <span class="text-xs text-gray-400">#{{ guest.shortId
                                }}</span></span>
                                <span v-if="guest.shortId === localShortId">(나)</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div id="modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 transition-opacity" :class="{ hidden: !showModal }" @click.self="closeModal">
                <div class="w-full max-w-md p-6 bg-gray-800 rounded-lg shadow-xl text-center flex flex-col gap-4 scale-95 transition-transform">
                    <h3 class="text-xl font-semibold text-white">{{ modalTitle }}</h3>
                    <p class="text-gray-300">{{ modalMessage }}</p>
                    <div class="flex justify-center gap-4 pt-2">
                        <button v-if="!modalNeedsConfirm" type="button" @click="closeModal" class="py-2 px-6 font-semibold text-white bg-blue-600 rounded-lg border-none cursor-pointer transition-colors hover:bg-blue-700 w-full">확인</button>
                        <template v-else>
                            <button type="button" @click="handleModalConfirm" class="py-2 px-6 font-semibold text-white bg-blue-600 rounded-lg border-none cursor-pointer transition-colors hover:bg-blue-700 w-full">확인</button>
                            <button type="button" @click="closeModal" class="py-2 px-6 font-semibold text-gray-800 bg-gray-300 rounded-lg border-none cursor-pointer transition-colors hover:bg-gray-400 w-1/2">취소</button>
                        </template>
                    </div>
                </div>
            </div>

            <div id="screen-share-options-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 transition-opacity" :class="{ hidden: !showScreenShareOptions }"
                @click.self="closeScreenShareOptions">
                <div class="w-full max-w-md p-6 bg-gray-800 rounded-lg shadow-xl text-center flex flex-col gap-4">
                    <h3 class="text-xl font-semibold text-white">화면 공유 옵션</h3>
                    <div class="flex flex-col gap-4 my-4 text-left">
                        <label class="flex items-center gap-3 cursor-pointer py-3 px-3 rounded-lg transition-colors text-gray-300 hover:bg-gray-700">
                            <input type="checkbox" v-model="screenShareOptions.includeAudio" class="w-5 h-5 cursor-pointer accent-blue-600" />
                            <span class="flex-1 select-none">오디오도 공유하기</span>
                        </label>
                        <label class="flex items-center gap-3 cursor-pointer py-3 px-3 rounded-lg transition-colors text-gray-300 hover:bg-gray-700">
                            <input type="checkbox" v-model="screenShareOptions.keepCamera" class="w-5 h-5 cursor-pointer accent-blue-600" />
                            <span class="flex-1 select-none">웹캠도 함께 표시하기</span>
                        </label>
                    </div>
                    <div class="flex justify-center gap-4 pt-2">
                        <button type="button" @click="confirmScreenShareOptions" class="py-2 px-6 font-semibold text-white bg-blue-600 rounded-lg border-none cursor-pointer transition-colors hover:bg-blue-700 w-full">시작</button>
                        <button type="button" @click="closeScreenShareOptions" class="py-2 px-6 font-semibold text-gray-800 bg-gray-300 rounded-lg border-none cursor-pointer transition-colors hover:bg-gray-400 w-1/2">취소</button>
                    </div>
                </div>
            </div>

            <div id="audio-volume-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 transition-opacity" :class="{ hidden: !showAudioVolumeModal }"
                @click.self="closeAudioVolumeModal">
                <div class="w-full max-w-md p-6 bg-gray-800 rounded-lg shadow-xl text-left flex flex-col gap-4">
                    <h3 class="text-xl font-semibold text-white">오디오 볼륨 조절</h3>
                    <div class="flex flex-col gap-6 my-4" v-if="audioTracksWithVolume.length > 0">
                        <div v-for="trackInfo in audioTracksWithVolume" :key="trackInfo.track.id" class="flex flex-col gap-2">
                            <div class="flex justify-between items-center text-gray-300 text-sm">
                                <span class="font-medium">{{ trackInfo.label }}</span>
                                <span class="text-blue-400 font-semibold min-w-[3rem] text-right">{{ Math.round(trackInfo.volume * 100) }}%</span>
                            </div>
                            <input type="range" min="0" max="1" step="0.01" :value="trackInfo.volume"
                                @input="updateTrackVolume(trackInfo.track, parseFloat($event.target.value))"
                                class="w-full h-2 rounded bg-gray-700 outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-none" />
                        </div>
                    </div>
                    <div v-else class="py-8 px-4 text-center text-gray-400">
                        <p class="m-0">현재 활성화된 오디오 트랙이 없습니다.</p>
                    </div>
                    <div class="flex justify-center gap-4 pt-2">
                        <button type="button" @click="closeAudioVolumeModal" class="py-2 px-6 font-semibold text-white bg-blue-600 rounded-lg border-none cursor-pointer transition-colors hover:bg-blue-700 w-full">닫기</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, onBeforeUnmount, nextTick, watch } from 'vue';

const currentView = ref('home');
const usernameInput = ref('');
const messageInput = ref('');
const isHost = ref(false);
const myPeerId = ref(null);
const localUsername = ref(null);
const localShortId = ref(null);
const pendingHostId = ref(null);
const statusText = ref('');
const wittyMessage = ref('');
const showModal = ref(false);
const modalTitle = ref('');
const modalMessage = ref('');
const modalNeedsConfirm = ref(false);
const modalConfirmCallback = ref(null);
const isSidebarHidden = ref(true);
const messagesContainer = ref(null);
const sidebar = ref(null);
const qrcodeContainer = ref(null);
const qrcodeChatContainer = ref(null);
const localVideo = ref(null);
const remoteVideo = ref(null);

// 미디어 스트림
const localStream = ref(null);
const remoteStream = ref(null);
const isScreenSharing = ref(false);
const screenStream = ref(null);
const cameraVideoTrack = ref(null); // 웹캠 비디오 트랙 저장 (동시 사용을 위해)
const screenShareAudioTracks = ref([]); // 화면 공유 오디오 트랙들 저장
const showScreenShareOptions = ref(false);
const screenShareOptions = ref({
    includeAudio: false,
    keepCamera: false
});
const showAudioVolumeModal = ref(false);
const audioGainNodes = new Map(); // 각 오디오 트랙의 GainNode 저장
const audioContext = ref(null); // Web Audio API 컨텍스트

let peer = null;
let guestConnections = new Map();
let peerNames = new Map();
let mediaCalls = new Map(); // 미디어 호출 관리
let hostRoomUrl = ref(null);
let hostConnection = null;
let hostName = ref(null);
let hostShortId = ref(null);
let allMessages = ref([]);
let wittyMessageInterval = null;
let qrcodeInstance = null;
let qrcodeChatInstance = null;

const wittyMessages = [
    "영역 전개 중...",
    "주술전문고 학생들의 응원을 받는 중...",
    "이타도리 유지가 주물을 삼키는 중...",
    "옷코츠 유타가 리카의 저주를 푸는 중...",
    "전집중 호흡 익히는 중...",
    "빈틈의 실을 찾는 중...",
    "雷의 呼吸, 壱ノ型, 霹靂一閃!",
    "더욱 더 그 넘어로! Plus Ultra!",
    "고무고무! 빠르게 기다리기!",
    "제하하하!!! 이 로딩 속도는 뭐냐!!!",
    "조로가 빠르게 길을 찾고 있는 중...",
    "수둔! 기다리기의 술!",
    "인터넷이 없는 곳에서 이 정도의 데이터량이라니 크흑!!",
    "채팅워드...오...빠...",
    "타코피가 당신을 해피하게 만들 방법을 고민하는 중...",
    "시즈카의 미소를 보기 위해, 사진을 찍는 중...",
    "타코피가 친구와 화해하기를 바라며 리본을 찾는 중...",
    "아마미야 소라가 잉여여신 연기를 준비하는 중...",
    "이치히메가 화료 직전 따봉을 준비하는 중...",
    "도대체 언제부터 서버가 터졌다고 생각한 거지?",
    "트래픽을, 트래픽을 높이지 마라",
    "돔 공연을 축하하기 위해 현관 앞에서 꽃 들고 대기 중...",
    "리치 일발 도라3 뒷도라 3 혼일색 산안커 << 진짜 사기치네 ㅋㅋ",
    "왜 마작부장이 다음 심화 강의를 찍는 중...",
    "회장이 종신 선언문을 작성하는 중...",
    "대학원생이 연구실에서 빨리 나가기를 바라며 대기 중...",
];

const guests = computed(() => {
    return Array.from(peerNames.entries()).map(([id, { name, shortId }]) => ({ id, name, shortId }));
});

const sortedMessages = computed(() => {
    return [...allMessages.value].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
});

const videoHeaderTitle = computed(() => {
    if (isHost.value) {
        return `${localUsername.value}님의 화상통화`;
    }
    return hostName.value ? `${hostName.value}님의 화상통화` : '호스트 정보 기다리는 중...';
});

const roomUrl = computed(() => {
    if (isHost.value) {
        return hostRoomUrl.value;
    }
    return hostRoomUrl.value || (pendingHostId.value ? `${window.location.origin}${window.location.pathname}#${pendingHostId.value}` : '');
});

// 오디오 트랙 볼륨 저장 (반응형)
const audioTrackVolumes = ref(new Map());

// 오디오 트랙 목록과 볼륨 정보
const audioTracksWithVolume = computed(() => {
    if (!localStream.value) return [];

    const tracks = [];
    const audioTracks = localStream.value.getAudioTracks();

    audioTracks.forEach(track => {
        let label = '오디오 트랙';
        // 트랙 라벨 결정
        if (screenShareAudioTracks.value.some(st => st.id === track.id)) {
            label = '화면 공유 오디오';
        } else {
            label = '웹캠 마이크';
        }

        // 볼륨 가져오기 (없으면 1.0)
        if (!audioTrackVolumes.value.has(track.id)) {
            audioTrackVolumes.value.set(track.id, 1.0);
        }
        const volume = audioTrackVolumes.value.get(track.id);

        tracks.push({
            track,
            label,
            volume
        });
    });

    return tracks;
});

function generateShortId(peerId) {
    return peerId.slice(-6);
}

function startWittyMessageRotation() {
    if (wittyMessageInterval) {
        clearInterval(wittyMessageInterval);
    }

    let lastMessage = '';
    const showRandomMessage = () => {
        let newMessage = '';
        if (wittyMessages.length > 1) {
            do {
                newMessage = wittyMessages[Math.floor(Math.random() * wittyMessages.length)];
            } while (newMessage === lastMessage);
        } else if (wittyMessages.length === 1) {
            newMessage = wittyMessages[0];
        }
        wittyMessage.value = newMessage;
        lastMessage = newMessage;
    };

    showRandomMessage();
    wittyMessageInterval = setInterval(showRandomMessage, 2000);
}

function showView(viewId) {
    if (wittyMessageInterval) {
        clearInterval(wittyMessageInterval);
        wittyMessageInterval = null;
    }

    currentView.value = viewId;

    nextTick(() => {
        if (viewId === 'home') {
            const input = document.getElementById('username-input');
            if (input) input.focus();
        } else if (viewId === 'video') {
            const input = document.getElementById('message-input');
            if (input) input.focus();

            if (window.innerWidth > 768) {
                isSidebarHidden.value = false;
            } else {
                isSidebarHidden.value = true;
            }
        }
    });
}

function showModalDialog(title, message, onConfirm = null) {
    modalTitle.value = title;
    modalMessage.value = message;
    modalNeedsConfirm.value = !!onConfirm;
    modalConfirmCallback.value = onConfirm;
    showModal.value = true;
}

function closeModal() {
    showModal.value = false;
    modalConfirmCallback.value = null;
}

function handleModalConfirm() {
    if (modalConfirmCallback.value) {
        modalConfirmCallback.value();
    }
    closeModal();
}

function showScreenShareOptionsDialog() {
    // 옵션 초기화
    screenShareOptions.value = {
        includeAudio: false,
        keepCamera: false
    };
    showScreenShareOptions.value = true;
}

function closeScreenShareOptions() {
    showScreenShareOptions.value = false;
}

function confirmScreenShareOptions() {
    closeScreenShareOptions();
    startScreenShare(screenShareOptions.value);
}

// 오디오 볼륨 모달 열기
function openAudioVolumeModal() {
    // Web Audio API 컨텍스트 초기화
    if (!audioContext.value) {
        audioContext.value = new (window.AudioContext || window.webkitAudioContext)();
    }

    // 모든 오디오 트랙에 대해 GainNode 생성
    if (localStream.value) {
        const audioTracks = localStream.value.getAudioTracks();
        audioTracks.forEach(track => {
            if (!audioGainNodes.has(track.id)) {
                setupAudioTrackGain(track);
            }
        });
    }

    showAudioVolumeModal.value = true;
}

// 오디오 볼륨 모달 닫기
function closeAudioVolumeModal() {
    showAudioVolumeModal.value = false;
}

// 오디오 트랙에 GainNode 설정
function setupAudioTrackGain(track) {
    if (!audioContext.value) {
        audioContext.value = new (window.AudioContext || window.webkitAudioContext)();
    }

    try {
        // MediaStreamTrack을 MediaStreamSource로 변환
        const source = audioContext.value.createMediaStreamSource(new MediaStream([track]));
        const gainNode = audioContext.value.createGain();
        gainNode.gain.value = 1.0; // 기본 볼륨

        // source -> gain -> destination 연결
        source.connect(gainNode);
        gainNode.connect(audioContext.value.destination);

        audioGainNodes.set(track.id, gainNode);
    } catch (err) {
        console.error('오디오 트랙 GainNode 설정 실패:', err);
    }
}

// 오디오 트랙 볼륨 업데이트
function updateTrackVolume(track, volume) {
    // 볼륨 값 저장
    audioTrackVolumes.value.set(track.id, volume);

    // GainNode가 있으면 업데이트
    const gainNode = audioGainNodes.get(track.id);
    if (gainNode) {
        gainNode.gain.value = volume;
    } else {
        // GainNode가 없으면 생성
        setupAudioTrackGain(track);
        const newGainNode = audioGainNodes.get(track.id);
        if (newGainNode) {
            newGainNode.gain.value = volume;
        }
    }
}

function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function broadcast(data, excludePeerId = null) {
    for (let [peerId, conn] of guestConnections) {
        if (peerId !== excludePeerId) {
            try {
                conn.send(data);
            } catch (err) {
                console.error(`Peer ${peerId}로 전송 실패:`, err);
            }
        }
    }
}

function broadcastParticipantList() {
    const guestsList = Array.from(peerNames.entries()).map(([id, { name, shortId }]) => ({ id, name, shortId }));
    const data = {
        type: 'participantUpdate',
        payload: {
            hostName: localUsername.value,
            hostShortId: localShortId.value,
            guests: guestsList
        }
    };
    broadcast(data);
}

// 미디어 디바이스 API 사용 가능 여부 확인
function checkMediaDevicesSupport() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        // 구형 브라우저 폴백
        const getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia;

        if (!getUserMedia) {
            return { supported: false, error: '이 브라우저는 미디어 디바이스 API를 지원하지 않습니다.' };
        }

        // Promise로 래핑
        navigator.mediaDevices = {
            getUserMedia: (constraints) => {
                return new Promise((resolve, reject) => {
                    getUserMedia.call(navigator, constraints, resolve, reject);
                });
            }
        };
    }
    return { supported: true };
}

// 고화질/고음질 미디어 스트림 가져오기
async function getLocalMediaStream() {
    try {
        const supportCheck = checkMediaDevicesSupport();
        if (!supportCheck.supported) {
            showModalDialog('미디어 접근 실패', supportCheck.error || '이 브라우저는 카메라/마이크 접근을 지원하지 않습니다.');
            return null;
        }

        const constraints = {
            video: {
                width: { ideal: 1920 },
                height: { ideal: 1080 },
                frameRate: { ideal: 30 },
                facingMode: 'user'
            },
            audio: {
                sampleRate: 48000,
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        localStream.value = stream;

        if (localVideo.value) {
            localVideo.value.srcObject = stream;
        }

        return stream;
    } catch (err) {
        console.error('미디어 스트림 가져오기 실패:', err);
        showModalDialog('미디어 접근 실패', `카메라/마이크 접근에 실패했습니다: ${err.message}`);
        return null;
    }
}

// 미디어 스트림 정리
function cleanupMediaStreams() {
    if (localStream.value) {
        localStream.value.getTracks().forEach(track => track.stop());
        localStream.value = null;
    }
    if (remoteStream.value) {
        remoteStream.value.getTracks().forEach(track => track.stop());
        remoteStream.value = null;
    }
    if (screenStream.value) {
        screenStream.value.getTracks().forEach(track => track.stop());
        screenStream.value = null;
    }
    if (localVideo.value) {
        localVideo.value.srcObject = null;
    }
    if (remoteVideo.value) {
        remoteVideo.value.srcObject = null;
    }
    isScreenSharing.value = false;
}

// 화면 공유 시작
async function startScreenShare(options = { includeAudio: false, keepCamera: false }) {
    try {
        // 미디어 디바이스 API 지원 확인
        if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
            showModalDialog('화면 공유 실패', '이 브라우저는 화면 공유를 지원하지 않습니다. 최신 브라우저를 사용해주세요.');
            return;
        }

        // 화면 공유 스트림 가져오기 (viewport/디스플레이 크기 자동 적용)
        // 사용자가 화면/탭/윈도우를 선택할 수 있도록 displaySurface 제한 없음
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
            video: {
                cursor: 'always' // 커서 표시
            },
            audio: options.includeAudio || false // 사용자 선택에 따라 오디오 포함
        });

        screenStream.value = displayStream;
        isScreenSharing.value = true;

        // 화면 공유 오디오 트랙 저장 및 처리
        screenShareAudioTracks.value = [];
        if (options.includeAudio && displayStream.getAudioTracks().length > 0) {
            displayStream.getAudioTracks().forEach(track => {
                screenShareAudioTracks.value.push(track);
            });
        }

        if (!localStream.value) {
            // localStream이 없는 경우 (이론적으로는 발생하지 않아야 함)
            localStream.value = displayStream;
            if (localVideo.value) {
                localVideo.value.srcObject = displayStream;
            }
        } else {
            // 기존 스트림 처리
            const screenVideoTrack = displayStream.getVideoTracks()[0];
            const existingVideoTrack = localStream.value.getVideoTracks()[0];

            if (options.keepCamera && existingVideoTrack) {
                // 웹캠과 화면 공유 동시 사용
                // 웹캠 비디오 트랙 저장
                cameraVideoTrack.value = existingVideoTrack;
                // 화면 공유 비디오 트랙 추가 (기존 트랙은 유지하지 않음, PeerJS는 하나의 비디오만 지원)
                // 로컬에서는 화면 공유만 표시하고, PeerJS에는 화면 공유 트랙 전송
                localStream.value.removeTrack(existingVideoTrack);
                localStream.value.addTrack(screenVideoTrack);
                // 웹캠 트랙은 중지하지 않고 저장만 함 (나중에 복구용)
            } else {
                // 화면 공유만 사용 (기존 동작)
                if (existingVideoTrack) {
                    localStream.value.removeTrack(existingVideoTrack);
                    existingVideoTrack.stop();
                }
                localStream.value.addTrack(screenVideoTrack);
            }

            // 화면 공유 오디오 트랙 추가 (웹캠 마이크 오디오는 유지)
            // 기존 웹캠 오디오 트랙은 localStream에 이미 있으므로 유지됨
            if (options.includeAudio && screenShareAudioTracks.value.length > 0) {
                screenShareAudioTracks.value.forEach(audioTrack => {
                    // 중복 추가 방지
                    const existingTrack = localStream.value.getAudioTracks().find(t => t.id === audioTrack.id);
                    if (!existingTrack) {
                        localStream.value.addTrack(audioTrack);
                    }
                });
            }

            // 비디오 요소에 업데이트된 스트림 표시
            if (localVideo.value) {
                localVideo.value.srcObject = localStream.value;
            }
        }

        // 모든 연결된 피어에게 새 트랙 전송
        if (localStream.value) {
            const videoTrack = localStream.value.getVideoTracks()[0];
            for (let [peerId, call] of mediaCalls) {
                try {
                    // PeerJS call 객체의 peerConnection에 접근
                    const peerConnection = call?.peerConnection || call?._pc;
                    if (peerConnection) {
                        // 비디오 트랙 교체
                        const videoSender = peerConnection.getSenders().find(s =>
                            s.track && s.track.kind === 'video'
                        );
                        if (videoSender) {
                            await videoSender.replaceTrack(videoTrack);
                        }

                        // 화면 공유 오디오 트랙 추가 (여러 오디오 트랙 지원)
                        if (options.includeAudio && screenShareAudioTracks.value.length > 0) {
                            screenShareAudioTracks.value.forEach(audioTrack => {
                                // 이미 추가된 트랙인지 확인
                                const existingSender = peerConnection.getSenders().find(s =>
                                    s.track && s.track.id === audioTrack.id
                                );
                                if (!existingSender) {
                                    peerConnection.addTrack(audioTrack, localStream.value);
                                }
                            });
                        }
                    }
                } catch (err) {
                    console.error(`피어 ${peerId}에게 트랙 교체 실패:`, err);
                }
            }
        }

        // 화면 공유 중지 이벤트 감지
        displayStream.getVideoTracks()[0].onended = () => {
            stopScreenShare();
        };

    } catch (err) {
        console.error('화면 공유 실패:', err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            showModalDialog('화면 공유 권한 거부', '화면 공유 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요.');
        } else if (err.name === 'NotFoundError') {
            showModalDialog('화면 공유 실패', '공유할 수 있는 화면을 찾을 수 없습니다.');
        } else {
            showModalDialog('화면 공유 실패', `화면 공유 중 오류가 발생했습니다: ${err.message}`);
        }
        isScreenSharing.value = false;
        screenShareAudioTracks.value = [];
    }
}

// 화면 공유 중지 및 카메라로 전환
async function stopScreenShare() {
    if (!isScreenSharing.value) return;

    try {
        if (!localStream.value) {
            isScreenSharing.value = false;
            return;
        }

        // 화면 공유 비디오 트랙 제거
        const screenVideoTrack = localStream.value.getVideoTracks().find(track =>
            screenStream.value && screenStream.value.getVideoTracks().some(st => st.id === track.id)
        );

        if (screenVideoTrack) {
            localStream.value.removeTrack(screenVideoTrack);
            screenVideoTrack.stop();
        }

        // 화면 공유 오디오 트랙 제거 (여러 개일 수 있음)
        const audioTracksToRemove = [...screenShareAudioTracks.value]; // 복사본 생성
        if (audioTracksToRemove.length > 0) {
            audioTracksToRemove.forEach(audioTrack => {
                const trackInStream = localStream.value.getAudioTracks().find(t => t.id === audioTrack.id);
                if (trackInStream) {
                    localStream.value.removeTrack(trackInStream);
                }
                audioTrack.stop();
            });
        }

        // 화면 공유 스트림 정리
        if (screenStream.value) {
            screenStream.value.getTracks().forEach(track => {
                if (track.readyState !== 'ended') {
                    track.stop();
                }
            });
            screenStream.value = null;
        }

        // 웹캠 비디오 트랙 복구 (keepCamera 옵션이었던 경우)
        if (cameraVideoTrack.value && cameraVideoTrack.value.readyState !== 'ended') {
            // 웹캠 트랙이 아직 활성 상태인지 확인
            const existingVideoTrack = localStream.value.getVideoTracks()[0];
            if (!existingVideoTrack) {
                localStream.value.addTrack(cameraVideoTrack.value);
            } else if (existingVideoTrack.id !== cameraVideoTrack.value.id) {
                // 다른 비디오 트랙이 있으면 교체
                localStream.value.removeTrack(existingVideoTrack);
                existingVideoTrack.stop();
                localStream.value.addTrack(cameraVideoTrack.value);
            }
            cameraVideoTrack.value = null;
        } else {
            // 웹캠 트랙이 없거나 종료된 경우 카메라로 전환
            await switchToCamera();
        }

        // PeerJS 연결에서 화면 공유 트랙 제거
        for (let [peerId, call] of mediaCalls) {
            try {
                const peerConnection = call?.peerConnection || call?._pc;
                if (peerConnection) {
                    // 화면 공유 오디오 트랙 제거
                    if (audioTracksToRemove.length > 0) {
                        const senders = peerConnection.getSenders();
                        senders.forEach(sender => {
                            if (sender.track && audioTracksToRemove.some(t => t.id === sender.track.id)) {
                                peerConnection.removeTrack(sender);
                            }
                        });
                    }

                    // 비디오 트랙 교체 (웹캠으로)
                    const videoTrack = localStream.value.getVideoTracks()[0];
                    if (videoTrack) {
                        const videoSender = peerConnection.getSenders().find(s =>
                            s.track && s.track.kind === 'video'
                        );
                        if (videoSender) {
                            await videoSender.replaceTrack(videoTrack);
                        }
                    }
                }
            } catch (err) {
                console.error(`피어 ${peerId}에게 트랙 제거 실패:`, err);
            }
        }

        // 비디오 요소 업데이트
        if (localVideo.value) {
            localVideo.value.srcObject = localStream.value;
        }

        // 화면 공유 오디오 트랙 배열 정리
        screenShareAudioTracks.value = [];
        isScreenSharing.value = false;
    } catch (err) {
        console.error('화면 공유 중지 실패:', err);
        showModalDialog('오류', '화면 공유를 중지하는 중 오류가 발생했습니다.');
        isScreenSharing.value = false;
    }
}

// 카메라 스트림으로 전환
async function switchToCamera() {
    try {
        // 미디어 디바이스 API 지원 확인
        const supportCheck = checkMediaDevicesSupport();
        if (!supportCheck.supported) {
            showModalDialog('카메라 접근 실패', supportCheck.error || '이 브라우저는 카메라 접근을 지원하지 않습니다.');
            return;
        }

        // 카메라 스트림 가져오기
        const constraints = {
            video: {
                width: { ideal: 1920 },
                height: { ideal: 1080 },
                frameRate: { ideal: 30 },
                facingMode: 'user'
            },
            audio: {
                sampleRate: 48000,
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }
        };

        const cameraStream = await navigator.mediaDevices.getUserMedia(constraints);

        // 기존 스트림의 비디오 트랙 교체
        if (localStream.value) {
            const videoTrack = cameraStream.getVideoTracks()[0];
            const oldVideoTrack = localStream.value.getVideoTracks().find(track => track.kind === 'video');

            if (oldVideoTrack) {
                localStream.value.removeTrack(oldVideoTrack);
                oldVideoTrack.stop();
            }
            localStream.value.addTrack(videoTrack);
        } else {
            localStream.value = cameraStream;
        }

        // 비디오 요소에 카메라 스트림 표시
        if (localVideo.value) {
            localVideo.value.srcObject = localStream.value;
        }

        // 오디오 트랙 처리 (카메라 스트림의 오디오 사용)
        if (cameraStream.getAudioTracks().length > 0 && localStream.value) {
            const audioTrack = cameraStream.getAudioTracks()[0];
            const oldAudioTrack = localStream.value.getAudioTracks()[0];
            if (oldAudioTrack) {
                localStream.value.removeTrack(oldAudioTrack);
                oldAudioTrack.stop();
            }
            localStream.value.addTrack(audioTrack);
        }

        // 모든 연결된 피어에게 새 트랙 전송 (비디오 + 오디오)
        for (let [peerId, call] of mediaCalls) {
            try {
                // PeerJS call 객체의 peerConnection에 접근
                const peerConnection = call?.peerConnection || call?._pc;
                if (peerConnection && localStream.value) {
                    // 비디오 트랙 교체
                    const videoTrack = localStream.value.getVideoTracks()[0];
                    if (videoTrack) {
                        const videoSender = peerConnection.getSenders().find(s =>
                            s.track && s.track.kind === 'video'
                        );
                        if (videoSender) {
                            await videoSender.replaceTrack(videoTrack);
                        }
                    }

                    // 오디오 트랙 교체
                    const audioTrack = localStream.value.getAudioTracks()[0];
                    if (audioTrack) {
                        const audioSender = peerConnection.getSenders().find(s =>
                            s.track && s.track.kind === 'audio'
                        );
                        if (audioSender) {
                            await audioSender.replaceTrack(audioTrack);
                        } else {
                            // 오디오 sender가 없는 경우 새로 추가
                            peerConnection.addTrack(audioTrack, localStream.value);
                        }
                    }
                }
            } catch (err) {
                console.error(`피어 ${peerId}에게 트랙 교체 실패:`, err);
            }
        }

    } catch (err) {
        console.error('카메라 전환 실패:', err);
        showModalDialog('카메라 접근 실패', `카메라에 접근할 수 없습니다: ${err.message}`);
    }
}

function handleData(data, fromPeerId) {
    if (!data || !data.type) return;

    if (isHost.value) {
        switch (data.type) {
            case 'name':
                peerNames.set(fromPeerId, { name: data.payload.name, shortId: data.payload.shortId });
                guestConnections.get(fromPeerId).send({
                    type: 'name',
                    payload: { name: localUsername.value, shortId: localShortId.value },
                    id: myPeerId.value
                });
                guestConnections.get(fromPeerId).send({ type: 'roomInfo', payload: { roomUrl: hostRoomUrl.value } });
                broadcastParticipantList();
                break;

            case 'chat':
                const senderInfo = peerNames.get(fromPeerId) || { name: '알 수 없는 사용자', shortId: '??????' };
                const newMsg = {
                    text: data.payload,
                    displayName: senderInfo.name,
                    shortId: senderInfo.shortId,
                    timestamp: data.timestamp,
                    type: 'chat',
                    senderId: fromPeerId
                };
                allMessages.value.push(newMsg);
                broadcast({
                    type: 'chat',
                    payload: data.payload,
                    timestamp: data.timestamp,
                    sender: { id: fromPeerId, name: senderInfo.name, shortId: senderInfo.shortId }
                }, fromPeerId);
                break;
        }
    } else {
        switch (data.type) {
            case 'name':
                hostName.value = data.payload.name;
                hostShortId.value = data.payload.shortId;
                break;

            case 'roomInfo':
                hostRoomUrl.value = data.payload.roomUrl;
                if (qrcodeChatContainer.value && window.QRCode) {
                    if (qrcodeChatInstance) {
                        qrcodeChatInstance.clear();
                        qrcodeChatInstance = null;
                    }
                    qrcodeChatContainer.value.innerHTML = '';
                    qrcodeChatInstance = new window.QRCode(qrcodeChatContainer.value, { text: data.payload.roomUrl, width: 160, height: 160 });
                }
                break;

            case 'participantUpdate':
                hostName.value = data.payload.hostName;
                hostShortId.value = data.payload.hostShortId;
                break;

            case 'chat':
                allMessages.value.push({
                    text: data.payload,
                    displayName: data.sender.name,
                    shortId: data.sender.shortId,
                    timestamp: data.timestamp,
                    type: 'chat',
                    senderId: data.sender.id
                });
                break;
        }
    }
}

function setupConnectionHandlers(connection) {
    connection.on('open', () => {
        console.log(`데이터 채널 열림: ${connection.peer}`);

        if (isHost.value) {
            // 호스트: 게스트가 연결되면 미디어 호출 시작
            if (localStream.value) {
                const call = peer.call(connection.peer, localStream.value);
                if (call) {
                    mediaCalls.set(connection.peer, call);
                    setupCallHandlers(call, connection.peer);
                }
            }
            showView('video');
        } else {
            hostConnection = connection;
            const nameData = { type: 'name', payload: { name: localUsername.value, shortId: localShortId.value }, id: myPeerId.value };
            hostConnection.send(nameData);

            // 게스트: 호스트에게 미디어 호출 시작
            if (localStream.value) {
                const call = peer.call(pendingHostId.value, localStream.value);
                if (call) {
                    mediaCalls.set(pendingHostId.value, call);
                    setupCallHandlers(call, pendingHostId.value);
                }
            }
            showView('video');
        }
    });

    connection.on('data', (data) => {
        handleData(data, connection.peer);
    });

    connection.on('close', () => {
        console.log(`연결 종료: ${connection.peer}`);
        if (isHost.value) {
            const closedPeerId = connection.peer;
            guestConnections.delete(closedPeerId);
            peerNames.delete(closedPeerId);
            const call = mediaCalls.get(closedPeerId);
            if (call) {
                call.close();
                mediaCalls.delete(closedPeerId);
            }
            broadcastParticipantList();
        } else {
            if (!connection.kicked) {
                showModalDialog('호스트 연결 끊김', '호스트와의 연결이 끊어졌습니다.');
            }
            hostConnection = null;
            const call = mediaCalls.get(pendingHostId.value);
            if (call) {
                call.close();
                mediaCalls.delete(pendingHostId.value);
            }
        }
    });

    connection.on('error', (err) => {
        console.error('연결 에러:', err);
        if (isHost.value) {
            showModalDialog('게스트 연결 오류', `${connection.peer}와 연결 중 오류 발생: ${err.message}`);
        } else {
            showModalDialog('연결 오류', `오류 발생: ${err.message}`);
        }
    });
}

function setupCallHandlers(call, peerId) {
    call.on('stream', (remoteStreamReceived) => {
        console.log('원격 스트림 수신:', peerId);
        remoteStream.value = remoteStreamReceived;
        if (remoteVideo.value) {
            remoteVideo.value.srcObject = remoteStreamReceived;
        }
    });

    call.on('close', () => {
        console.log('미디어 호출 종료:', peerId);
        if (remoteStream.value) {
            remoteStream.value.getTracks().forEach(track => track.stop());
            remoteStream.value = null;
        }
        if (remoteVideo.value) {
            remoteVideo.value.srcObject = null;
        }
        mediaCalls.delete(peerId);
    });

    call.on('error', (err) => {
        console.error('미디어 호출 에러:', err);
        showModalDialog('미디어 연결 오류', `미디어 스트림 교환 중 오류 발생: ${err.message}`);
    });
}

function initializeHost() {
    showView('waiting');
    startWittyMessageRotation();
    statusText.value = 'Peer 서버에 연결 중...';

    peer = new window.Peer(null, {
        debug: 2,
        host: "peerjs.jaehyung101.synology.me",
        secure: true,
        proxied: true,
    });

    peer.on('open', async (id) => {
        myPeerId.value = id;
        if (!localShortId.value) {
            localShortId.value = generateShortId(myPeerId.value);
            sessionStorage.setItem('webrtc-shortId', localShortId.value);
        }
        console.log(`내 Peer ID (호스트): ${myPeerId.value} (#${localShortId.value})`);
        const roomUrl = `${window.location.origin}${window.location.pathname}#${myPeerId.value}`;
        hostRoomUrl.value = roomUrl;

        statusText.value = '미디어 스트림 준비 중...';

        // 로컬 미디어 스트림 가져오기
        const stream = await getLocalMediaStream();
        if (!stream) {
            showView('home');
            return;
        }

        statusText.value = '상대방의 연결을 기다리는 중...';

        if (qrcodeContainer.value && window.QRCode) {
            if (qrcodeInstance) {
                qrcodeInstance.clear();
                qrcodeInstance = null;
            }
            qrcodeContainer.value.innerHTML = '';
            qrcodeInstance = new window.QRCode(qrcodeContainer.value, { text: roomUrl, width: 256, height: 256 });
        }
        if (qrcodeChatContainer.value && window.QRCode) {
            if (qrcodeChatInstance) {
                qrcodeChatInstance.clear();
                qrcodeChatInstance = null;
            }
            qrcodeChatContainer.value.innerHTML = '';
            qrcodeChatInstance = new window.QRCode(qrcodeChatContainer.value, { text: roomUrl, width: 160, height: 160 });
        }
    });

    peer.on('connection', (newConn) => {
        console.log(`새 연결 시도: ${newConn.peer}`);
        guestConnections.set(newConn.peer, newConn);
        setupConnectionHandlers(newConn);
    });

    peer.on('call', (call) => {
        console.log('미디어 호출 수신:', call.peer);
        if (localStream.value) {
            call.answer(localStream.value);
            mediaCalls.set(call.peer, call);
            setupCallHandlers(call, call.peer);
        }
    });

    peer.on('error', (err) => {
        console.error('Peer 에러:', err);
        showModalDialog('연결 실패', `Peer 서버 연결에 실패했습니다: ${err.message}`);
        cleanupMediaStreams();
        showView('home');
    });
}

function initializeGuest(hostId) {
    showView('waiting');
    startWittyMessageRotation();
    statusText.value = '호스트에 연결 중...';

    peer = new window.Peer(null, {
        debug: 3,
        host: "peerjs.jaehyung101.synology.me",
        secure: true,
        proxied: true,
    });

    peer.on('open', async (id) => {
        myPeerId.value = id;
        if (!localShortId.value) {
            localShortId.value = generateShortId(myPeerId.value);
            sessionStorage.setItem('webrtc-shortId', localShortId.value);
        }
        console.log(`내 Peer ID (게스트): ${id} (#${localShortId.value})`);

        statusText.value = '미디어 스트림 준비 중...';

        // 로컬 미디어 스트림 가져오기
        const stream = await getLocalMediaStream();
        if (!stream) {
            showView('home');
            return;
        }

        statusText.value = '호스트에 연결 중...';

        const connection = peer.connect(hostId, { reliable: true });

        if (!connection) {
            console.error('호스트에 연결할 수 없습니다.');
            showModalDialog('연결 실패', '호스트에 연결을 시도할 수 없습니다.');
            cleanupMediaStreams();
            showView('home');
            return;
        }

        setupConnectionHandlers(connection);
    });

    peer.on('call', (call) => {
        console.log('미디어 호출 수신:', call.peer);
        if (localStream.value) {
            call.answer(localStream.value);
            mediaCalls.set(call.peer, call);
            setupCallHandlers(call, call.peer);
        }
    });

    peer.on('error', (err) => {
        console.error('Peer 에러:', err);
        let message = `Peer 오류: ${err.message}`;
        if (err.type === 'peer-unavailable') {
            message = '해당 룸 ID를 찾을 수 없거나 호스트가 오프라인입니다.';
        }
        showModalDialog('연결 실패', message);
        cleanupMediaStreams();
        window.location.hash = '';
        showView('home');
    });
}

function handleStart() {
    const name = usernameInput.value.trim();
    if (!name) {
        showModalDialog('이름 필요', '화상통화에서 사용할 이름을 입력하세요.');
        return;
    }
    localUsername.value = name;

    if (isHost.value) {
        initializeHost();
    } else {
        initializeGuest(pendingHostId.value);
    }
}

function handleSendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    const timestamp = new Date().toISOString();
    const newMsg = {
        text: message,
        displayName: localUsername.value,
        shortId: localShortId.value,
        timestamp: timestamp,
        type: 'chat',
        senderId: myPeerId.value
    };
    allMessages.value.push(newMsg);
    messageInput.value = '';

    const chatData = {
        type: 'chat',
        payload: message,
        timestamp: timestamp,
        sender: { id: myPeerId.value, name: localUsername.value, shortId: localShortId.value }
    };

    if (isHost.value) {
        broadcast(chatData);
    } else if (hostConnection && hostConnection.open) {
        hostConnection.send(chatData);
    }
}

function toggleSidebar() {
    isSidebarHidden.value = !isSidebarHidden.value;
}

function handleBeforeUnload(event) {
    event.preventDefault();
    event.returnValue = '정말 나가시겠습니까?';
    return '정말 나가시겠습니까?';
}

const dynamicScripts = [];
const dynamicMetaTags = [];
let originalDocumentTitle = '';

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const existingScript = document.querySelector(`script[src="${src}"]`);
        if (existingScript) {
            resolve(null);
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            dynamicScripts.push(script);
            resolve(script);
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// HTML head 설정 함수
function setupHead() {
    originalDocumentTitle = document.title;
    document.title = 'ezlive';

    // 기존 meta 태그 제거 (중복 방지)
    const existingMetaTags = document.querySelectorAll('meta[name="description"], meta[name="keywords"], meta[property^="og:"], meta[name^="twitter:"], meta[name="theme-color"], meta[name="apple-mobile-web-app-title"]');
    existingMetaTags.forEach(tag => tag.remove());

    // 기본 메타 태그
    const metaTags = [
        { name: 'description', content: '서버 없이 QR 코드로 연결하는 P2P 화상통화 앱. ezlive로 쉽고 빠르게 화상통화를 시작하세요.' },
        { name: 'keywords', content: '화상통화, WebRTC, P2P, QR코드, 비디오채팅, 화상회의, ezlive' },
        { name: 'theme-color', content: '#111827' },
        { name: 'apple-mobile-web-app-title', content: 'ezlive' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' },
    ];

    // Open Graph 메타 태그
    const ogTags = [
        { property: 'og:title', content: 'ezlive - P2P 화상통화' },
        { property: 'og:description', content: '서버 없이 QR 코드로 연결하는 P2P 화상통화 앱' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: window.location.href },
        { property: 'og:site_name', content: 'ezlive' },
    ];

    // Twitter Card 메타 태그
    const twitterTags = [
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'ezlive - P2P 화상통화' },
        { name: 'twitter:description', content: '서버 없이 QR 코드로 연결하는 P2P 화상통화 앱' },
    ];

    // 메타 태그 추가 함수
    const addMetaTag = (attrs) => {
        const meta = document.createElement('meta');
        Object.keys(attrs).forEach(key => {
            if (key === 'property') {
                meta.setAttribute('property', attrs[key]);
            } else {
                meta.setAttribute(key, attrs[key]);
            }
        });
        document.head.appendChild(meta);
        dynamicMetaTags.push(meta);
    };

    // 모든 메타 태그 추가
    [...metaTags, ...ogTags, ...twitterTags].forEach(tag => addMetaTag(tag));
}

watch(allMessages, () => {
    nextTick(() => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
    });
});

onMounted(async () => {
    // HTML head 설정
    setupHead();

    // 외부 스크립트 로드
  try {
    await Promise.all([
      loadScript('https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js'),
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js')
        ]);
    } catch (error) {
        console.error('스크립트 로드 실패:', error);
        showModalDialog('로드 오류', '필수 라이브러리를 로드하는 중 오류가 발생했습니다.');
    }

    localShortId.value = sessionStorage.getItem('webrtc-shortId');

    if (window.location.hash) {
        pendingHostId.value = window.location.hash.substring(1);
        isHost.value = false;
    } else {
        isHost.value = true;
    }
    showView('home');
});

onBeforeUnmount(() => {
    dynamicScripts.forEach((el) => {
        if (el && el.parentNode) {
            el.parentNode.removeChild(el);
        }
    });
    dynamicScripts.length = 0;
    dynamicMetaTags.forEach((el) => {
        if (el && el.parentNode) {
            el.parentNode.removeChild(el);
        }
    });
    dynamicMetaTags.length = 0;
    if (originalDocumentTitle) {
        document.title = originalDocumentTitle;
    }
});

onUnmounted(() => {
    if (wittyMessageInterval) {
        clearInterval(wittyMessageInterval);
    }
    cleanupMediaStreams();
    if (peer) {
        peer.destroy();
    }
    if (qrcodeInstance) {
        qrcodeInstance.clear();
        qrcodeInstance = null;
    }
    if (qrcodeChatInstance) {
        qrcodeChatInstance.clear();
        qrcodeChatInstance = null;
    }
});
</script>

<style scoped>
.hidden {
  display: none !important;
}

.webrtc-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.webrtc-scrollbar::-webkit-scrollbar-track {
  background: #374151;
}

.webrtc-scrollbar::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}
</style>
