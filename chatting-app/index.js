// DOM 요소 가져오기
const homeView = document.getElementById('home-view');
const waitingView = document.getElementById('waiting-view');
const chatView = document.getElementById('chat-view');

const usernameInput = document.getElementById('username-input');
const startBtn = document.getElementById('start-btn');

const qrcodeContainer = document.getElementById('qrcode');
const roomLink = document.getElementById('room-link');
const roomIdDisplay = document.getElementById('room-id-display');
const statusText = document.getElementById('status-text');
const waitingViewTitle = document.getElementById('waiting-view-title'); // (신규)
const hostQrInstruction = document.getElementById('host-qr-instruction'); // (신규)
const wittyMessage = document.getElementById('witty-message'); // (신규)

const chatHeaderTitleText = document.getElementById('chat-header-title-text'); // (수정) ID 변경
const hostControls = document.getElementById('host-controls');
const revealBtn = document.getElementById('reveal-btn');
const hostLocalRevealBtn = document.getElementById('host-local-reveal-btn'); // (신규)
const resetBtn = document.getElementById('reset-btn');

const messages = document.getElementById('messages');
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');

const sidebar = document.getElementById('sidebar');
const qrcodeChat = document.getElementById('qrcode-chat');
const sidebarRoomLink = document.getElementById('sidebar-room-link');
const guestList = document.getElementById('guest-list'); // (수정)

const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalClose = document.getElementById('modal-close');
const modalConfirm = document.getElementById('modal-confirm');
const modalCancel = document.getElementById('modal-cancel');

// (신규) 모바일 옵션 모달 요소
const optionsBtn = document.getElementById('options-btn');

// --- 앱 상태 변수 ---
let peer = null;
let myPeerId = null;
let localUsername = null;
let localShortId = null; // (신규) 유저 고유값
let pendingHostId = null;
let isHost = false;

// 호스트 전용 변수
let guestConnections = new Map();
// (수정) peerNames는 이제 {name, shortId} 객체를 저장
let peerNames = new Map();
let hostRoomUrl = null;
let hostLocalReveal = false;
let bannedShortIds = new Set(); // (수정) 밴된 shortId 목록

// 게스트 전용 변수
let hostConnection = null;
let hostName = null;
let hostShortId = null; // (신규) 호스트 고유값
let messagesVisibleByHost = false;

let allMessages = [];
let wittyMessageInterval = null; // (신규)
const wittyMessages = [
    "영역 전개 중...",
    "주술전문고 학생들의 응원을 받는 중...",
    "이타도리 유지가 주물을 삼키는 중...",
    "옷코츠 유타가 리카의 저주를 푸는 중...",

    "전집중 호흡 익히는 중...",
    "빈틈의 실을 찾는 중...",
    "雷の呼吸, 壱ノ型, 霹靂一閃!",

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


/**
 * (신규) 재치있는 메시지 로테이션 시작 함수
 */
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
        wittyMessage.textContent = newMessage;
        lastMessage = newMessage;
    };

    showRandomMessage(); // 즉시 하나 표시
    wittyMessageInterval = setInterval(showRandomMessage, 2000);
}

/**
 * (신규) 고유 ID 생성 함수
 */
function generateShortId(peerId) {
    return peerId.slice(-6);
}

/**
 * 뷰 표시 헬퍼 함수
 */
function showView(viewId) {
    // (신규) 뷰 전환 시 재치있는 메시지 타이머 중지
    if (wittyMessageInterval) {
        clearInterval(wittyMessageInterval);
        wittyMessageInterval = null;
    }

    homeView.classList.add('hidden');
    waitingView.classList.add('hidden');
    chatView.classList.add('hidden');
    document.getElementById(viewId).classList.remove('hidden');

    // (신규) 뷰에 따라 입력 필드에 자동 포커스
    if (viewId === 'home-view') {
        usernameInput.focus();
    } else if (viewId === 'chat-view') {
        messageInput.focus();
    }

    if (viewId === 'chat-view') {
        if (isHost) {
            optionsBtn.classList.remove('hidden');
        }
        else {
            optionsBtn.classList.add('hidden');
        }

        if (window.innerWidth > 768) {
            sidebar.classList.remove('hidden');
        }
        else {
            sidebar.classList.add('hidden');
        }
    }
    else {
        sidebar.classList.add('hidden');
        optionsBtn.classList.add('hidden');
    }
}

/**
 * 모달 표시 헬퍼 함수
 */
function showModal(title, message, onConfirm = null) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;

    if (onConfirm) {
        modalClose.classList.add('hidden');
        modalConfirm.classList.remove('hidden');
        modalCancel.classList.remove('hidden');
        modalConfirm.onclick = () => {
            modal.classList.add('hidden');
            onConfirm();
        };
        modalCancel.onclick = () => {
            modal.classList.add('hidden');
        };
    } else {
        modalClose.classList.remove('hidden');
        modalConfirm.classList.add('hidden');
        modalCancel.classList.add('hidden');
    }

    modal.classList.remove('hidden');
    setTimeout(() => modal.querySelector('.transform').classList.remove('scale-95'), 10);
}

modalClose.onclick = () => {
    modal.classList.add('hidden');
    modal.querySelector('.transform').classList.add('scale-95');
    const title = modalTitle.textContent;
    if (title === '연결 종료' || title === '연결 실패' || title === '호스트 연결 끊김' || title === '추방 알림' || title === '밴 알림' || title === '입장 거부') {
        showView('home-view');
        window.location.hash = '';
        window.location.reload();
    }
};

/**
 * (수정) 참여자 목록 UI 업데이트 (고유 ID 표시)
 */
function updateGuestList(currentHostName, currentHostShortId, guests) {
    if (guestList) {
        guestList.innerHTML = '';

        // Host
        const hostElement = document.createElement('li');
        hostElement.className = 'flex items-center justify-between font-semibold text-white truncate py-1';
        const hostNameSpan = document.createElement('span');
        let hostDisplayName = `👑 ${currentHostName} <span class="text-xs text-gray-400">#${currentHostShortId}</span>`;
        if (currentHostShortId === localShortId) {
            hostDisplayName += ' (나)';
        } else {
            hostDisplayName += ' (방장)';
        }
        hostNameSpan.innerHTML = hostDisplayName;
        hostNameSpan.title = `${currentHostName} (방장)`;
        hostElement.appendChild(hostNameSpan);
        guestList.appendChild(hostElement);

        // Guests
        guests.forEach(guest => {
            const guestElement = document.createElement('li');
            guestElement.className = 'flex items-center justify-between truncate text-gray-300 py-1';
            const guestNameSpan = document.createElement('span');

            let guestDisplayName = `👤 ${guest.name} <span class="text-xs text-gray-400">#${guest.shortId}</span>`;
            if (guest.shortId === localShortId) {
                guestNameSpan.className = 'font-semibold text-white truncate';
                guestDisplayName += ' (나)';
            } else {
                guestNameSpan.className = 'truncate';
            }
            guestNameSpan.innerHTML = guestDisplayName;
            guestNameSpan.title = guest.name;
            guestElement.appendChild(guestNameSpan);

            if (isHost && guest.shortId !== localShortId) {
                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'flex items-center space-x-1';

                const kickButton = document.createElement('button');
                kickButton.textContent = '추방';
                kickButton.className = 'px-2 py-0.5 text-xs font-semibold text-white bg-yellow-600 rounded hover:bg-yellow-700';
                kickButton.dataset.peerId = guest.id;
                kickButton.dataset.peerName = guest.name;
                kickButton.onclick = handleKick;
                buttonContainer.appendChild(kickButton);

                const banButton = document.createElement('button');
                banButton.textContent = '밴';
                banButton.className = 'px-2 py-0.5 text-xs font-semibold text-white bg-red-600 rounded hover:bg-red-700';
                banButton.dataset.peerId = guest.id;
                banButton.dataset.peerName = guest.name;
                banButton.dataset.shortId = guest.shortId; // (신규) 밴 로직을 위해 shortId 추가
                banButton.onclick = handleBan;
                buttonContainer.appendChild(banButton);

                guestElement.appendChild(buttonContainer);
            }

            guestList.appendChild(guestElement);
        });
    }
}


/**
 * 모든 메시지 렌더링 함수
 */
function renderAllMessages() {
    messages.innerHTML = '';

    const sortedMessages = [...allMessages].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    sortedMessages.forEach(msg => {
        const { text, displayName, shortId, timestamp, type, senderId } = msg;

        if (type === 'system') {
            return;
        }

        const messageElement = document.createElement('div');
        const bubbleElement = document.createElement('div');
        bubbleElement.classList.add('px-4', 'py-2', 'rounded-lg', 'max-w-xs', 'break-words', 'shadow-md');

        const timeString = new Date(timestamp).toLocaleTimeString('ko-KR', {
            hour: '2-digit', minute: '2-digit'
        });
        const textNode = document.createElement('div');
        textNode.classList.add('break-words');
        const timeNode = document.createElement('div');
        timeNode.classList.add('text-xs', 'text-right', 'mt-1');
        timeNode.textContent = timeString;

        if (senderId === myPeerId) {
            messageElement.classList.add('flex', 'justify-end');
            bubbleElement.classList.add('bg-blue-600', 'text-white');
            timeNode.classList.add('text-blue-200');
            textNode.textContent = text;
            bubbleElement.appendChild(textNode);
            bubbleElement.appendChild(timeNode);
        } else {
            messageElement.classList.add('flex', 'justify-start');
            bubbleElement.classList.add('bg-gray-700', 'text-white');
            timeNode.classList.add('text-gray-400');

            const nameNode = document.createElement('div');
            nameNode.classList.add('font-semibold', 'text-sm', 'text-gray-300', 'mb-1');
            nameNode.innerHTML = `${displayName} <span class="text-xs text-gray-400">#${shortId}</span>`;
            bubbleElement.appendChild(nameNode);

            const isHostMsg = !isHost && senderId === pendingHostId;
            let showContent = false;

            if (messagesVisibleByHost) {
                showContent = true;
            } else {
                if (isHost) {
                    if (hostLocalReveal) {
                        showContent = true;
                    } else {
                        showContent = false;
                    }
                } else {
                    showContent = isHostMsg;
                }
            }

            if (showContent) {
                textNode.textContent = text;
            } else {
                textNode.textContent = "메시지를 보냈습니다.";
                textNode.classList.add('italic', 'text-gray-400');
            }
            bubbleElement.appendChild(textNode);
            bubbleElement.appendChild(timeNode);
        }

        messageElement.appendChild(bubbleElement);
        messages.appendChild(messageElement);
    });

    messages.scrollTop = messages.scrollHeight;
}


/**
 * 호스트 전용: 브로드캐스트
 */
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

/**
 * 호스트 전용: 참여자 임시 추방
 */
function handleKick(event) {
    const peerId = event.target.dataset.peerId;
    const peerName = event.target.dataset.peerName;

    showModal(`'${peerName}' 추방 확인`, `'${peerName}'님을 채팅방에서 일시적으로 내보내시겠습니까? (재입장 가능)`, () => {
        const conn = guestConnections.get(peerId);
        if (conn) {
            try {
                conn.send({ type: 'control', command: 'kick' });
            } catch (err) {
                console.error(`${peerId}에게 추방 메시지 전송 실패:`, err);
            }
            setTimeout(() => conn.close(), 500);
        }
    });
}

/**
 * 호스트 전용: 참여자 영구 추방 (밴)
 */
function handleBan(event) {
    const peerId = event.target.dataset.peerId;
    const peerName = event.target.dataset.peerName;
    const shortId = event.target.dataset.shortId; // (신규) shortId 가져오기

    showModal(`'${peerName}' 밴 확인`, `'${peerName}'님을 채팅방에서 영구적으로 내보내시겠습니까? (재입장 불가)`, () => {
        bannedShortIds.add(shortId); // (수정) peerId 대신 shortId를 밴 리스트에 추가
        const conn = guestConnections.get(peerId);
        if (conn) {
            try {
                conn.send({ type: 'control', command: 'ban' });
            } catch (err) {
                console.error(`${peerId}에게 밴 메시지 전송 실패:`, err);
            }
            setTimeout(() => conn.close(), 500);
        }
    });
}

/**
 * 호스트 전용: 참여자 목록 브로드캐스트
 */
function broadcastParticipantList() {
    const guests = Array.from(peerNames.entries()).map(([id, {name, shortId}]) => ({ id, name, shortId }));
    const data = {
        type: 'participantUpdate',
        payload: {
            hostName: localUsername,
            hostShortId: localShortId,
            guests: guests
        }
    };
    broadcast(data);
    updateGuestList(localUsername, localShortId, guests);
}


/**
 * 수신된 데이터 처리
 */
function handleData(data, fromPeerId) {
    if (!data || !data.type) return;

    if (isHost) {
        switch (data.type) {
            case 'name':
                // (수정) 밴된 shortId인지 확인
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
                    payload: { name: localUsername, shortId: localShortId },
                    id: myPeerId
                });
                guestConnections.get(fromPeerId).send({ type: 'roomInfo', payload: { roomUrl: hostRoomUrl } });
                guestConnections.get(fromPeerId).send({ type: 'control', command: 'revealToggle', payload: messagesVisibleByHost });
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
                allMessages.push(newMsg);
                renderAllMessages();
                broadcast({
                    type: 'chat',
                    payload: data.payload,
                    timestamp: data.timestamp,
                    sender: { id: fromPeerId, name: senderInfo.name, shortId: senderInfo.shortId }
                }, fromPeerId);
                break;
        }
    } else { // Guest
        switch (data.type) {
            case 'name':
                hostName = data.payload.name;
                hostShortId = data.payload.shortId;
                chatHeaderTitleText.textContent = `${hostName}님의 채팅방`;
                break;

            case 'roomInfo':
                const guestRoomUrl = data.payload.roomUrl;
                new QRCode(qrcodeChat, { text: guestRoomUrl, width: 160, height: 160 });
                sidebarRoomLink.href = guestRoomUrl;
                sidebarRoomLink.textContent = guestRoomUrl;
                break;

            case 'participantUpdate':
                updateGuestList(data.payload.hostName, data.payload.hostShortId, data.payload.guests);
                break;

            case 'chat':
                allMessages.push({
                    text: data.payload,
                    displayName: data.sender.name,
                    shortId: data.sender.shortId,
                    timestamp: data.timestamp,
                    type: 'chat',
                    senderId: data.sender.id
                });
                renderAllMessages();
                break;

            case 'control':
                if (data.command === 'reset') {
                    allMessages = [];
                    renderAllMessages();
                } else if (data.command === 'revealToggle') {
                    messagesVisibleByHost = data.payload;
                    renderAllMessages();
                } else if (data.command === 'kick') {
                    showModal('추방 알림', '호스트에 의해 채팅방에서 일시적으로 내보내졌습니다.');
                    if (hostConnection) {
                        hostConnection.kicked = true;
                        hostConnection.close();
                    }
                } else if (data.command === 'ban') {
                    showModal('밴 알림', '호스트에 의해 채팅방에서 영구적으로 내보내졌습니다.');
                    if (hostConnection) {
                        hostConnection.kicked = true;
                        hostConnection.close();
                    }
                } else if (data.command === 'rejected') {
                    showModal('입장 거부', '호스트에 의해 입장이 거부되었습니다. 이전에 밴 되었을 수 있습니다.');
                    if (hostConnection) {
                        hostConnection.kicked = true;
                        hostConnection.close();
                    }
                }
                break;
        }
    }
}

/**
 * P2P 연결 이벤트 핸들러 설정
 */
function setupConnectionHandlers(connection) {
    connection.on('open', () => {
        console.log(`데이터 채널 열림: ${connection.peer}`);

        if (isHost) {
            showView('chat-view');
            hostControls.classList.remove('hidden');
        } else {
            hostConnection = connection;
            const nameData = { type: 'name', payload: { name: localUsername, shortId: localShortId }, id: myPeerId };
            hostConnection.send(nameData);
            showView('chat-view');
            chatHeaderTitleText.textContent = '호스트 정보 기다리는 중...';
        }
    });

    connection.on('data', (data) => {
        handleData(data, connection.peer);
    });

    connection.on('close', () => {
        console.log(`연결 종료: ${connection.peer}`);
        if (isHost) {
            const closedPeerId = connection.peer;
            guestConnections.delete(closedPeerId);
            peerNames.delete(closedPeerId);
            broadcastParticipantList();
        } else {
            if (!connection.kicked) {
                showModal('호스트 연결 끊김', '호스트와의 연결이 끊어졌습니다.');
            }
            hostConnection = null;
        }
    });

    connection.on('error', (err) => {
        console.error('연결 에러:', err);
        if (isHost) {
            showModal('게스트 연결 오류', `${connection.peer}와 연결 중 오류 발생: ${err.message}`);
        } else {
            showModal('연결 오류', `오류 발생: ${err.message}`);
        }
    });
}

/**
 * 호스트(방장)로 Peer 초기화
 */
function initializeHost() {
    showView('waiting-view');
    // (수정) 호스트에게만 보이는 요소 표시
    waitingViewTitle.classList.remove('hidden');
    hostQrInstruction.classList.remove('hidden');
    qrcodeContainer.classList.remove('hidden');
    roomIdDisplay.classList.remove('hidden');
    roomLink.classList.remove('hidden');
    wittyMessage.classList.remove('hidden'); // (수정) 호스트에게도 재치있는 메시지 표시

    // (수정) 재치있는 메시지 로테이션 시작
    startWittyMessageRotation();

    statusText.textContent = 'Peer 서버에 연결 중...';

    peer = new Peer(null, { debug: 2 });

    peer.on('open', (id) => {
        myPeerId = id;
        // (수정) sessionStorage에서 shortId를 가져오거나 새로 생성
        if (!localShortId) {
            localShortId = generateShortId(myPeerId);
            sessionStorage.setItem('chat-shortId', localShortId);
        }
        console.log(`내 Peer ID (호스트): ${myPeerId} (#${localShortId})`);
        const roomUrl = `${window.location.origin}${window.location.pathname}#${myPeerId}`;
        hostRoomUrl = roomUrl;

        roomIdDisplay.textContent = `내 룸 ID: ${myPeerId}`;
        statusText.textContent = '상대방의 연결을 기다리는 중...';
        roomLink.href = roomUrl;
        roomLink.textContent = roomUrl;

        new QRCode(qrcodeContainer, { text: roomUrl, width: 256, height: 256 });
        new QRCode(qrcodeChat, { text: roomUrl, width: 160, height: 160 });
        sidebarRoomLink.href = roomUrl;
        sidebarRoomLink.textContent = roomUrl;

        chatHeaderTitleText.textContent = `${localUsername}님의 채팅방`;
        updateGuestList(localUsername, localShortId, []);
    });

    peer.on('connection', (newConn) => {
        // (수정) 연결 시 바로 밴 여부를 확인하지 않고, 첫 메시지(name) 수신 시 확인
        console.log(`새 연결 시도: ${newConn.peer}`);
        guestConnections.set(newConn.peer, newConn);
        setupConnectionHandlers(newConn);
    });

    peer.on('error', (err) => {
        console.error('Peer 에러:', err);
        showModal('연결 실패', `Peer 서버 연결에 실패했습니다: ${err.message}`);
        showView('home-view');
    });
}

/**
 * 게스트(참여자)로 Peer 초기화
 */
function initializeGuest(hostId) {
    showView('waiting-view');
    // (수정) 게스트에게는 불필요한 요소 숨김
    waitingViewTitle.classList.add('hidden');
    hostQrInstruction.classList.add('hidden');
    qrcodeContainer.classList.add('hidden');
    roomIdDisplay.classList.add('hidden');
    roomLink.classList.add('hidden');
    wittyMessage.classList.remove('hidden'); // (신규) 게스트에게는 재치있는 메시지 표시

    // (수정) 재치있는 메시지 로테이션 시작
    startWittyMessageRotation();

    statusText.textContent = '호스트에 연결 중...';

    peer = new Peer(null, { debug: 2 });

    peer.on('open', (id) => {
        myPeerId = id;
        // (수정) sessionStorage에서 shortId를 가져오거나 새로 생성
        if (!localShortId) {
            localShortId = generateShortId(myPeerId);
            sessionStorage.setItem('chat-shortId', localShortId);
        }
        console.log(`내 Peer ID (게스트): ${id} (#${localShortId})`);

        const connection = peer.connect(hostId, { reliable: true });

        if (!connection) {
            console.error('호스트에 연결할 수 없습니다.');
            showModal('연결 실패', '호스트에 연결을 시도할 수 없습니다.');
            showView('home-view');
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
        showModal('연결 실패', message);
        window.location.hash = '';
        showView('home-view');
    });
}

// --- 이벤트 리스너 ---

usernameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        startBtn.click();
    }
});

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    if (!message) return;

    const timestamp = new Date().toISOString();
    const newMsg = {
        text: message,
        displayName: localUsername,
        shortId: localShortId,
        timestamp: timestamp,
        type: 'chat',
        senderId: myPeerId
    };
    allMessages.push(newMsg);
    renderAllMessages();

    const chatData = {
        type: 'chat',
        payload: message,
        timestamp: timestamp,
        sender: { id: myPeerId, name: localUsername, shortId: localShortId }
    };

    if (isHost) {
        broadcast(chatData);
    } else if (hostConnection && hostConnection.open) {
        hostConnection.send(chatData);
    }

    messageInput.value = '';
});

startBtn.addEventListener('click', () => {
    const name = usernameInput.value.trim();
    if (!name) {
        showModal('이름 필요', '채팅에서 사용할 이름을 입력하세요.');
        return;
    }
    localUsername = name;

    if (isHost) {
        initializeHost();
    } else {
        initializeGuest(pendingHostId);
    }
});

resetBtn.addEventListener('click', () => {
    showModal('메시지 초기화 확인', '정말로 모든 메시지를 삭제하시겠습니까?', () => {
        allMessages = [];
        renderAllMessages();
        broadcast({ type: 'control', command: 'reset' });
    });
});

revealBtn.addEventListener('click', () => {
    messagesVisibleByHost = !messagesVisibleByHost;
    if (messagesVisibleByHost) {
        revealBtn.textContent = '메시지 숨기기';
        revealBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
        revealBtn.classList.add('bg-yellow-600', 'hover:bg-yellow-700');
    } else {
        revealBtn.textContent = '모든 메시지 보이기';
        revealBtn.classList.remove('bg-yellow-600', 'hover:bg-yellow-700');
        revealBtn.classList.add('bg-green-600', 'hover:bg-green-700');
        if (hostLocalReveal) {
            hostLocalReveal = false;
            hostLocalRevealBtn.textContent = '내 화면에서만 보기';
            hostLocalRevealBtn.classList.remove('bg-purple-800');
            hostLocalRevealBtn.classList.add('bg-purple-600', 'hover:bg-purple-700');
        }
    }
    renderAllMessages();
    broadcast({ type: 'control', command: 'revealToggle', payload: messagesVisibleByHost });
});

hostLocalRevealBtn.addEventListener('click', () => {
    hostLocalReveal = !hostLocalReveal;
    if (hostLocalReveal) {
        hostLocalRevealBtn.textContent = '내 화면 보기 끄기';
        hostLocalRevealBtn.classList.remove('bg-purple-600', 'hover:bg-purple-700');
        hostLocalRevealBtn.classList.add('bg-purple-800');
    } else {
        hostLocalRevealBtn.textContent = '내 화면에서만 보기';
        hostLocalRevealBtn.classList.remove('bg-purple-800');
        hostLocalRevealBtn.classList.add('bg-purple-600', 'hover:bg-purple-700');
    }
    renderAllMessages();
});

optionsBtn.addEventListener('click', () => {
    sidebar.classList.toggle('hidden');
});

window.addEventListener('load', () => {
    // (신규) sessionStorage에서 shortId 불러오기
    localShortId = sessionStorage.getItem('chat-shortId');

    if (window.location.hash) {
        pendingHostId = window.location.hash.substring(1);
        isHost = false;
        startBtn.textContent = '채팅방 참여하기';
    } else {
        isHost = true;
        startBtn.textContent = '새 채팅방 만들기';
    }
    showView('home-view');
});

window.addEventListener('beforeunload', () => {
    if (peer) {
        peer.destroy();
    }
});
