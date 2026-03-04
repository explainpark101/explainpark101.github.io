<template>
  <div class="chatting-app" @beforeunload="handleBeforeUnload">
    <div class="main-container">
      <!-- 1. 홈 뷰 (초기 화면 - 이름 입력) -->
      <div id="home-view" class="home-view" :class="{ hidden: currentView !== 'home' }">
        <h1>WebRTC P2P 채팅</h1>
        <p>서버 없이 QR 코드로 연결하는 P2P 채팅방</p>
        <input
          id="username-input"
          v-model="usernameInput"
          type="text"
          placeholder="이름을 입력하세요..."
          @keydown.enter="handleStart"
          autocomplete="off"
          autocapitalize="off"
        />
        <button id="start-btn" @click="handleStart">
          {{ isHost ? '새 채팅방 만들기' : '채팅방 참여하기' }}
        </button>
      </div>

      <!-- 2. 대기 뷰 (호스트가 QR 코드 보여주는 화면) -->
      <div id="waiting-view" class="waiting-view" :class="{ hidden: currentView !== 'waiting' }">
        <h2 v-if="isHost">채팅방 생성됨</h2>
        <p v-if="isHost">아래 QR 코드를 상대방이 스캔하게 하세요.</p>
        <div v-if="isHost" id="qrcode-container" class="qrcode-container">
          <div id="qrcode" ref="qrcodeContainer"></div>
        </div>
        <a v-if="isHost && hostRoomUrl" :href="hostRoomUrl" target="_blank" class="room-link">{{ hostRoomUrl }}</a>
        <div v-if="isHost && myPeerId" class="room-id-display">
          내 룸 ID: {{ myPeerId }}
        </div>
        <div class="status-container">
          <svg class="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span id="status-text">{{ statusText }}</span>
        </div>
        <p v-if="wittyMessage" class="witty-message">{{ wittyMessage }}</p>
      </div>

      <!-- 3. 채팅 뷰 -->
      <div id="chat-view" class="chat-view" :class="{ hidden: currentView !== 'chat' }">
        <div class="chat-main">
          <header class="chat-header">
            <span class="chat-header-title">{{ chatHeaderTitle }}</span>
            <button
              v-if="isHost"
              id="options-btn"
              class="options-btn md:hidden"
              @click="toggleSidebar"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
              </svg>
            </button>
          </header>

          <div v-if="isHost" id="host-controls" class="host-controls">
            <button @click="toggleReveal" class="btn-reveal">
              {{ messagesVisibleByHost ? '메시지 숨기기' : '모든 메시지 보이기' }}
            </button>
            <button @click="toggleHostLocalReveal" class="btn-host-local-reveal">
              {{ hostLocalReveal ? '내 화면 보기 끄기' : '내 화면에서만 보기' }}
            </button>
            <button @click="handleReset" class="btn-reset">메시지 초기화</button>
          </div>

          <div id="messages" ref="messagesContainer" class="messages">
            <div
              v-for="(msg, index) in sortedMessages"
              :key="index"
              class="message-item"
              :class="{ 'message-right': msg.senderId === myPeerId, 'message-left': msg.senderId !== myPeerId }"
            >
              <div class="message-bubble" :class="{ 'bg-blue-600': msg.senderId === myPeerId, 'bg-gray-700': msg.senderId !== myPeerId }">
                <div v-if="msg.senderId !== myPeerId" class="message-name">
                  {{ msg.displayName }} <span class="text-xs text-gray-400">#{{ msg.shortId }}</span>
                </div>
                <div class="message-text" :class="{ 'italic text-gray-400': !shouldShowMessage(msg) }">
                  {{ shouldShowMessage(msg) ? msg.text : '메시지를 보냈습니다.' }}
                </div>
                <div class="message-time">{{ formatTime(msg.timestamp) }}</div>
              </div>
            </div>
          </div>

          <form @submit.prevent="handleSendMessage" class="chat-form">
            <input
              id="message-input"
              v-model="messageInput"
              type="text"
              placeholder="메시지 입력..."
              autocomplete="off"
            />
            <button type="submit">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
            </button>
          </form>
        </div>

        <div id="sidebar" ref="sidebar" class="sidebar" :class="{ hidden: isSidebarHidden }">
          <div>
            <h3>참여 QR 코드</h3>
            <div id="qrcode-chat-container" class="qrcode-chat-container">
              <div id="qrcode-chat" ref="qrcodeChatContainer"></div>
            </div>
            <a v-if="roomUrl" :href="roomUrl" target="_blank" class="sidebar-room-link">{{ roomUrl }}</a>
          </div>
          <div>
            <h3>참여자 목록</h3>
            <ul id="guest-list" class="guest-list">
              <li class="guest-item host">
                👑 {{ hostName || localUsername }} <span class="text-xs text-gray-400">#{{ hostShortId || localShortId }}</span>
                <span v-if="(hostShortId || localShortId) === localShortId">(나)</span>
                <span v-else>(방장)</span>
              </li>
              <li
                v-for="guest in guests"
                :key="guest.id"
                class="guest-item"
                :class="{ 'is-me': guest.shortId === localShortId }"
              >
                <span>👤 {{ guest.name }} <span class="text-xs text-gray-400">#{{ guest.shortId }}</span></span>
                <span v-if="guest.shortId === localShortId">(나)</span>
                <div v-if="isHost && guest.shortId !== localShortId" class="guest-actions">
                  <button @click="handleKick(guest)" class="btn-kick">추방</button>
                  <button @click="handleBan(guest)" class="btn-ban">밴</button>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 4. 모달 (알림용) -->
      <div
        id="modal"
        class="modal-overlay"
        :class="{ hidden: !showModal }"
        @click.self="closeModal"
      >
        <div class="modal-content">
          <h3>{{ modalTitle }}</h3>
          <p>{{ modalMessage }}</p>
          <div class="modal-actions">
            <button v-if="!modalNeedsConfirm" @click="closeModal" class="btn-modal-ok">확인</button>
            <template v-else>
              <button @click="handleModalConfirm" class="btn-modal-confirm">확인</button>
              <button @click="closeModal" class="btn-modal-cancel">취소</button>
            </template>
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
const qrcodeImg = ref(null);
const qrcodeChatImg = ref(null);

let peer = null;
let guestConnections = new Map();
let peerNames = new Map();
let hostRoomUrl = ref(null);
let hostLocalReveal = ref(false);
let bannedShortIds = new Set();
let hostConnection = null;
let hostName = ref(null);
let hostShortId = ref(null);
let messagesVisibleByHost = ref(false);
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

const chatHeaderTitle = computed(() => {
  if (isHost.value) {
    return `${localUsername.value}님의 채팅방`;
  }
  return hostName.value ? `${hostName.value}님의 채팅방` : '호스트 정보 기다리는 중...';
});

const roomUrl = computed(() => {
  if (isHost.value) {
    return hostRoomUrl.value;
  }
  return hostRoomUrl.value || (pendingHostId.value ? `${window.location.origin}${window.location.pathname}#${pendingHostId.value}` : '');
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
    } else if (viewId === 'chat') {
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

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function shouldShowMessage(msg) {
  if (msg.senderId === myPeerId.value) return true;
  
  if (messagesVisibleByHost.value) {
    return true;
  }
  
  if (isHost.value) {
    return hostLocalReveal.value;
  } else {
    return msg.senderId === pendingHostId.value;
  }
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

function handleKick(guest) {
  showModalDialog(`'${guest.name}' 추방 확인`, `'${guest.name}'님을 채팅방에서 일시적으로 내보내시겠습니까? (재입장 가능)`, () => {
    const conn = guestConnections.get(guest.id);
    if (conn) {
      try {
        conn.send({ type: 'control', command: 'kick' });
      } catch (err) {
        console.error(`${guest.id}에게 추방 메시지 전송 실패:`, err);
      }
      setTimeout(() => conn.close(), 500);
    }
  });
}

function handleBan(guest) {
  showModalDialog(`'${guest.name}' 밴 확인`, `'${guest.name}'님을 채팅방에서 영구적으로 내보내시겠습니까? (재입장 불가)`, () => {
    bannedShortIds.add(guest.shortId);
    const conn = guestConnections.get(guest.id);
    if (conn) {
      try {
        conn.send({ type: 'control', command: 'ban' });
      } catch (err) {
        console.error(`${guest.id}에게 밴 메시지 전송 실패:`, err);
      }
      setTimeout(() => conn.close(), 500);
    }
  });
}

function broadcastParticipantList() {
  const guestsList = Array.from(peerNames.entries()).map(([id, {name, shortId}]) => ({ id, name, shortId }));
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

function handleData(data, fromPeerId) {
  if (!data || !data.type) return;

  if (isHost.value) {
    switch (data.type) {
      case 'name':
        const guestShortId = data.payload.shortId;
        if (bannedShortIds.has(guestShortId)) {
          console.log(`밴된 유저(${guestShortId})의 재연결 시도 차단.`);
          const conn = guestConnections.get(fromPeerId);
          if (conn) {
            try {
              conn.send({ type: 'control', command: 'rejected' });
            } finally {
              setTimeout(() => conn.close(), 500);
            }
          }
          return;
        }

        peerNames.set(fromPeerId, { name: data.payload.name, shortId: data.payload.shortId });
        guestConnections.get(fromPeerId).send({
          type: 'name',
          payload: { name: localUsername.value, shortId: localShortId.value },
          id: myPeerId.value
        });
        guestConnections.get(fromPeerId).send({ type: 'roomInfo', payload: { roomUrl: hostRoomUrl.value } });
        guestConnections.get(fromPeerId).send({ type: 'control', command: 'revealToggle', payload: messagesVisibleByHost.value });
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
          // 기존 QR 코드 완전히 제거
          if (qrcodeChatInstance) {
            qrcodeChatInstance.clear();
            qrcodeChatInstance = null;
          }
          // 기존 img 요소 제거
          if (qrcodeChatImg.value) {
            qrcodeChatImg.value.remove();
            qrcodeChatImg.value = null;
          }
          // 컨테이너 완전히 비우기 (모든 자식 요소 제거)
          qrcodeChatContainer.value.innerHTML = '';
          // 새 QR 코드 생성
          qrcodeChatInstance = new window.QRCode(qrcodeChatContainer.value, { text: data.payload.roomUrl, width: 160, height: 160 });
          // 생성된 img 요소를 ref에 할당 (마지막 요소만)
          nextTick(() => {
            const imgs = qrcodeChatContainer.value.querySelectorAll('img');
            // 모든 img 제거하고 마지막 것만 남기기
            if (imgs.length > 1) {
              for (let i = 0; i < imgs.length - 1; i++) {
                imgs[i].remove();
              }
            }
            const lastImg = qrcodeChatContainer.value.querySelector('img');
            if (lastImg) {
              qrcodeChatImg.value = lastImg;
            }
          });
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

      case 'control':
        if (data.command === 'reset') {
          allMessages.value = [];
        } else if (data.command === 'revealToggle') {
          messagesVisibleByHost.value = data.payload;
        } else if (data.command === 'kick') {
          showModalDialog('추방 알림', '호스트에 의해 채팅방에서 일시적으로 내보내졌습니다.');
          if (hostConnection) {
            hostConnection.kicked = true;
            hostConnection.close();
          }
        } else if (data.command === 'ban') {
          showModalDialog('밴 알림', '호스트에 의해 채팅방에서 영구적으로 내보내졌습니다.');
          if (hostConnection) {
            hostConnection.kicked = true;
            hostConnection.close();
          }
        } else if (data.command === 'rejected') {
          showModalDialog('입장 거부', '호스트에 의해 입장이 거부되었습니다. 이전에 밴 되었을 수 있습니다.');
          if (hostConnection) {
            hostConnection.kicked = true;
            hostConnection.close();
          }
        }
        break;
    }
  }
}

function setupConnectionHandlers(connection) {
  connection.on('open', () => {
    console.log(`데이터 채널 열림: ${connection.peer}`);

    if (isHost.value) {
      showView('chat');
    } else {
      hostConnection = connection;
      const nameData = { type: 'name', payload: { name: localUsername.value, shortId: localShortId.value }, id: myPeerId.value };
      hostConnection.send(nameData);
      showView('chat');
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
      broadcastParticipantList();
    } else {
      if (!connection.kicked) {
        showModalDialog('호스트 연결 끊김', '호스트와의 연결이 끊어졌습니다.');
      }
      hostConnection = null;
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

  peer.on('open', (id) => {
    myPeerId.value = id;
    if (!localShortId.value) {
      localShortId.value = generateShortId(myPeerId.value);
      sessionStorage.setItem('chat-shortId', localShortId.value);
    }
    console.log(`내 Peer ID (호스트): ${myPeerId.value} (#${localShortId.value})`);
    const roomUrl = `${window.location.origin}${window.location.pathname}#${myPeerId.value}`;
    hostRoomUrl.value = roomUrl;

    statusText.value = '상대방의 연결을 기다리는 중...';

    if (qrcodeContainer.value && window.QRCode) {
      // 기존 QR 코드 완전히 제거
      if (qrcodeInstance) {
        qrcodeInstance.clear();
        qrcodeInstance = null;
      }
      // 기존 img 요소 제거
      if (qrcodeImg.value) {
        qrcodeImg.value.remove();
        qrcodeImg.value = null;
      }
      // 컨테이너 완전히 비우기 (모든 자식 요소 제거)
      qrcodeContainer.value.innerHTML = '';
      // 새 QR 코드 생성
      qrcodeInstance = new window.QRCode(qrcodeContainer.value, { text: roomUrl, width: 256, height: 256 });
      // 생성된 img 요소를 ref에 할당 (마지막 요소만)
      nextTick(() => {
        const imgs = qrcodeContainer.value.querySelectorAll('img');
        // 모든 img 제거하고 마지막 것만 남기기
        if (imgs.length > 1) {
          for (let i = 0; i < imgs.length - 1; i++) {
            imgs[i].remove();
          }
        }
        const lastImg = qrcodeContainer.value.querySelector('img');
        if (lastImg) {
          qrcodeImg.value = lastImg;
        }
      });
    }
    if (qrcodeChatContainer.value && window.QRCode) {
      // 기존 QR 코드 완전히 제거
      if (qrcodeChatInstance) {
        qrcodeChatInstance.clear();
        qrcodeChatInstance = null;
      }
      // 기존 img 요소 제거
      if (qrcodeChatImg.value) {
        qrcodeChatImg.value.remove();
        qrcodeChatImg.value = null;
      }
      // 컨테이너 완전히 비우기 (모든 자식 요소 제거)
      qrcodeChatContainer.value.innerHTML = '';
      // 새 QR 코드 생성
      qrcodeChatInstance = new window.QRCode(qrcodeChatContainer.value, { text: roomUrl, width: 160, height: 160 });
      // 생성된 img 요소를 ref에 할당 (마지막 요소만)
      nextTick(() => {
        const imgs = qrcodeChatContainer.value.querySelectorAll('img');
        // 모든 img 제거하고 마지막 것만 남기기
        if (imgs.length > 1) {
          for (let i = 0; i < imgs.length - 1; i++) {
            imgs[i].remove();
          }
        }
        const lastImg = qrcodeChatContainer.value.querySelector('img');
        if (lastImg) {
          qrcodeChatImg.value = lastImg;
        }
      });
    }
  });

  peer.on('connection', (newConn) => {
    console.log(`새 연결 시도: ${newConn.peer}`);
    guestConnections.set(newConn.peer, newConn);
    setupConnectionHandlers(newConn);
  });

  peer.on('error', (err) => {
    console.error('Peer 에러:', err);
    showModalDialog('연결 실패', `Peer 서버 연결에 실패했습니다: ${err.message}`);
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

  peer.on('open', (id) => {
    myPeerId.value = id;
    if (!localShortId.value) {
      localShortId.value = generateShortId(myPeerId.value);
      sessionStorage.setItem('chat-shortId', localShortId.value);
    }
    console.log(`내 Peer ID (게스트): ${id} (#${localShortId.value})`);

    const connection = peer.connect(hostId, { reliable: true });

    if (!connection) {
      console.error('호스트에 연결할 수 없습니다.');
      showModalDialog('연결 실패', '호스트에 연결을 시도할 수 없습니다.');
      showView('home');
      return;
    }

    setupConnectionHandlers(connection);
  });

  peer.on('error', (err) => {
    console.error('Peer 에러:', err);
    let message = `Peer 오류: ${err.message}`;
    if (err.type === 'peer-unavailable') {
      message = '해당 룸 ID를 찾을 수 없거나 호스트가 오프라인입니다.';
    }
    showModalDialog('연결 실패', message);
    window.location.hash = '';
    showView('home');
  });
}

function handleStart() {
  const name = usernameInput.value.trim();
  if (!name) {
    showModalDialog('이름 필요', '채팅에서 사용할 이름을 입력하세요.');
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

function toggleReveal() {
  messagesVisibleByHost.value = !messagesVisibleByHost.value;
  broadcast({ type: 'control', command: 'revealToggle', payload: messagesVisibleByHost.value });
}

function toggleHostLocalReveal() {
  hostLocalReveal.value = !hostLocalReveal.value;
}

function handleReset() {
  showModalDialog('메시지 초기화 확인', '정말로 모든 메시지를 삭제하시겠습니까?', () => {
    allMessages.value = [];
    broadcast({ type: 'control', command: 'reset' });
  });
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

function loadScript(src) {
  return new Promise((resolve, reject) => {
    // 이미 로드되어 있는지 확인
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

watch(allMessages, () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
});

onMounted(async () => {
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

  localShortId.value = sessionStorage.getItem('chat-shortId');

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
});

onUnmounted(() => {
  if (wittyMessageInterval) {
    clearInterval(wittyMessageInterval);
  }
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
  // ref 정리
  if (qrcodeImg.value) {
    qrcodeImg.value = null;
  }
  if (qrcodeChatImg.value) {
    qrcodeChatImg.value = null;
  }
});
</script>

<style scoped>
.chatting-app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #111827;
  color: #f3f4f6;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.main-container {
  width: 100%;
  max-width: 64rem;
  margin: 0 auto;
}

.hidden {
  display: none !important;
}

.home-view {
  text-align: center;
  max-width: 28rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.home-view h1 {
  font-size: 1.875rem;
  font-weight: 700;
  color: white;
}

.home-view p {
  color: #9ca3af;
}

.home-view input {
  width: 100%;
  padding: 0.75rem 1rem;
  color: white;
  background-color: #374151;
  border: 1px solid #4b5563;
  border-radius: 0.5rem;
}

.home-view input:focus {
  outline: none;
  box-shadow: 0 0 0 2px #3b82f6;
}

.home-view button {
  width: 100%;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  color: white;
  background-color: #2563eb;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.home-view button:hover {
  background-color: #1d4ed8;
}

.waiting-view {
  text-align: center;
  max-width: 28rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.waiting-view h2 {
  font-size: 1.5rem;
  font-weight: 600;
}

.waiting-view p {
  color: #9ca3af;
}

.qrcode-container {
  display: flex;
  justify-content: center;
  padding: 1rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
}

.room-link {
  display: block;
  font-size: 0.875rem;
  color: #60a5fa;
  text-decoration: underline;
  word-break: break-all;
  margin-top: 0.5rem;
}

.room-link:hover {
  color: #93c5fd;
}

.room-id-display {
  padding: 0.75rem;
  font-size: 0.875rem;
  color: #d1d5db;
  background-color: #1f2937;
  border-radius: 0.5rem;
  word-break: break-all;
}

.status-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #60a5fa;
}

.spinner {
  width: 1.25rem;
  height: 1.25rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.witty-message {
  color: #6b7280;
  font-size: 0.875rem;
  height: 1.25rem;
}

.chat-view {
  width: 100%;
  height: 90vh;
  display: flex;
  flex-direction: column;
  background-color: #1f2937;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

@media (min-width: 768px) {
  .chat-view {
    flex-direction: row;
  }
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  font-weight: 600;
  text-align: center;
  color: white;
  background-color: #111827;
  border-bottom: 1px solid #374151;
}

.chat-header-title {
  width: 100%;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.options-btn {
  display: none;
  padding: 0.25rem;
  border-radius: 0.375rem;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
}

.options-btn:hover {
  background-color: #374151;
}

@media (max-width: 767px) {
  .options-btn {
    display: block;
  }
}

.host-controls {
  display: none;
  padding: 0.5rem;
  background-color: #111827;
  border-bottom: 1px solid #374151;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
}

.host-controls:not(.hidden) {
  display: flex;
}

.btn-reveal,
.btn-host-local-reveal,
.btn-reset {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-reveal {
  background-color: #16a34a;
}

.btn-reveal:hover {
  background-color: #15803d;
}

.btn-host-local-reveal {
  background-color: #9333ea;
}

.btn-host-local-reveal:hover {
  background-color: #7e22ce;
}

.btn-reset {
  background-color: #dc2626;
}

.btn-reset:hover {
  background-color: #b91c1c;
}

.messages {
  flex: 1;
  height: 100%;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.messages::-webkit-scrollbar {
  width: 8px;
}

.messages::-webkit-scrollbar-track {
  background: #374151;
}

.messages::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}

.message-item {
  display: flex;
}

.message-right {
  justify-content: flex-end;
}

.message-left {
  justify-content: flex-start;
}

.message-bubble {
  padding: 1rem;
  border-radius: 0.5rem;
  max-width: 18rem;
  word-break: break-words;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.message-name {
  font-weight: 600;
  font-size: 0.875rem;
  color: #d1d5db;
  margin-bottom: 0.25rem;
}

.message-text {
  word-break: break-word;
}

.message-time {
  font-size: 0.75rem;
  text-align: right;
  margin-top: 0.25rem;
}

.chat-form {
  display: flex;
  padding: 1rem;
  background-color: #111827;
  border-top: 1px solid #374151;
}

.chat-form input {
  flex: 1;
  padding: 0.5rem 1rem;
  color: white;
  background-color: #374151;
  border: 1px solid #4b5563;
  border-radius: 0.5rem 0 0 0.5rem;
}

.chat-form input:focus {
  outline: none;
  box-shadow: 0 0 0 2px #3b82f6;
}

.chat-form button {
  padding: 0.5rem 1rem;
  font-weight: 600;
  color: white;
  background-color: #2563eb;
  border-radius: 0 0.5rem 0.5rem 0;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.chat-form button:hover {
  background-color: #1d4ed8;
}

.chat-form button svg {
  transform: rotate(0.25turn);
}

.sidebar {
  width: 100%;
  background-color: #111827;
  padding: 1rem;
  overflow-y: auto;
  border-top: 1px solid #374151;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 768px) {
  .sidebar {
    width: 33.333333%;
    height: 100%;
    border-top: none;
    border-left: 1px solid #374151;
  }
}

.sidebar h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
  text-align: center;
}

.qrcode-chat-container {
  display: flex;
  justify-content: center;
  padding: 0.5rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
  margin-top: 0.5rem;
}

.sidebar-room-link {
  display: block;
  font-size: 0.875rem;
  color: #60a5fa;
  text-decoration: underline;
  word-break: break-all;
  text-align: center;
  margin-top: 0.5rem;
}

.sidebar-room-link:hover {
  color: #93c5fd;
}

.guest-list {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  color: #d1d5db;
  max-height: 200px;
  overflow-y: auto;
  padding-right: 4px;
}

.guest-list::-webkit-scrollbar {
  width: 8px;
}

.guest-list::-webkit-scrollbar-track {
  background: #374151;
}

.guest-list::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}

.guest-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0.25rem 0;
}

.guest-item.host {
  font-weight: 600;
  color: white;
}

.guest-item.is-me {
  font-weight: 600;
  color: white;
}

.guest-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.btn-kick,
.btn-ban {
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  border-radius: 0.25rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-kick {
  background-color: #ca8a04;
}

.btn-kick:hover {
  background-color: #a16207;
}

.btn-ban {
  background-color: #dc2626;
}

.btn-ban:hover {
  background-color: #b91c1c;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.75);
  transition: opacity 0.3s;
}

.modal-content {
  width: 100%;
  max-width: 24rem;
  padding: 1.5rem;
  background-color: #1f2937;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transform: scale(0.95);
  transition: transform 0.3s;
}

.modal-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
}

.modal-content p {
  color: #d1d5db;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding-top: 0.5rem;
}

.btn-modal-ok,
.btn-modal-confirm,
.btn-modal-cancel {
  padding: 0.5rem 1.5rem;
  font-weight: 600;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-modal-ok,
.btn-modal-confirm {
  color: white;
  background-color: #2563eb;
  width: 100%;
}

.btn-modal-ok:hover,
.btn-modal-confirm:hover {
  background-color: #1d4ed8;
}

.btn-modal-cancel {
  color: #1f2937;
  background-color: #d1d5db;
  width: 50%;
}

.btn-modal-cancel:hover {
  background-color: #9ca3af;
}
</style>
