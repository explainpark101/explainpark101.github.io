<template>
  <div class="typing-game-container">

    <div id="game-container" class="relative w-full max-w-4xl mx-auto p-4 md:p-6 flex flex-col items-center gap-4">
      <!-- 게임 UI -->
      <div id="game-ui" v-show="showGameUI" class="w-full flex-col items-center gap-4 flex">
        <button id="fullscreen-btn" @click="toggleFullscreen"
          class="absolute top-6 right-6 text-gray-400 hover:text-white transition z-30" title="Toggle Fullscreen">
          <svg v-show="!isFullscreen" id="fullscreen-open-icon" xmlns="http://www.w3.org/2000/svg" width="24"
            height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3">
            </path>
          </svg>
          <svg v-show="isFullscreen" id="fullscreen-close-icon" xmlns="http://www.w3.org/2000/svg" width="24"
            height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round">
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3">
            </path>
          </svg>
        </button>
        <h1 class="text-3xl md:text-4xl font-bold text-emerald-400">Typing Master</h1>
        <div class="w-full flex justify-between items-center bg-slate-800 p-3 rounded-lg shadow-lg">
          <div class="text-lg">SCORE: <span id="score" class="font-bold text-2xl text-yellow-300">{{ score }}</span>
          </div>
          <div class="text-lg">분당타수: <span id="typing-speed" class="font-bold text-1xl text-yellow-300">{{
            Math.round(typingSpeed) }}</span> 타</div>
          <div class="text-lg">LIVES: <span id="lives" class="font-bold text-2xl text-red-500">{{ lives }}</span></div>
        </div>
        <div id="game-screen" ref="gameScreen"
          class="w-full h-[50vh] md:h-[60vh] bg-gray-900/80 border-2 border-slate-700 rounded-lg shadow-inner relative overflow-hidden"
          :class="{ 'flash-red': isFlashing }">
          <GameItem v-for="item in activeItems" :key="item.id" :text="item.text" :type="item.type" :x="item.x"
            :y="item.y" :z-index="item.zIndex" />
        </div>
        <input type="text" id="input-box" ref="inputBox" v-model="inputValue" @keydown="handleInputKeydown"
          @input="checkInputMatch"
          class="w-full p-4 bg-slate-900 border-2 rounded-lg text-xl text-center focus:outline-none focus:ring-2 transition"
          :class="{
            'border-emerald-500 focus:ring-emerald-400': inputMatchState === 'neutral',
            'border-green-500 focus:ring-green-400 bg-green-900/20': inputMatchState === 'match',
            'border-red-500 focus:ring-red-400 bg-red-900/20': inputMatchState === 'no-match' || hasInputError
          }" placeholder="Type here and press Enter..." :disabled="isGameOver" />
      </div>

      <!-- 설정 페이지 모달 -->
      <div v-show="showSettingsModal" id="settings-modal"
        class="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-20">
        <div class="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-2xl text-center">
          <h2 class="text-4xl font-extrabold text-white mb-6">Game Settings</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-left">
            <div>
              <label for="custom-words" class="block mb-2 font-bold text-emerald-400">키워드 (한 줄에 하나씩)</label>
              <textarea id="custom-words" v-model="customWords" rows="8"
                class="w-full focus:outline-none focus:ring-2 focus:ring-emerald-400"></textarea>
            </div>
            <div>
              <label for="custom-syntax" class="block mb-2 font-bold text-purple-400">구문 (한 줄에 하나씩)</label>
              <textarea id="custom-syntax" v-model="customSyntax" rows="8"
                class="w-full focus:outline-none focus:ring-2 focus:ring-purple-400"></textarea>
            </div>
          </div>
          <div class="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <button @click="handleImportClick"
              class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition transform hover:scale-105">
              Import JSON
            </button>
            <input ref="importFileInput" type="file" id="import-file" class="hidden" accept=".json"
              @change="handleImport">
            <button @click="handleExport"
              class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition transform hover:scale-105">
              Export JSON
            </button>
          </div>
          <button @click="startGame"
            class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-2xl py-4 px-10 rounded-lg transition transform hover:scale-105">
            Start Game
          </button>
        </div>
      </div>

      <!-- 게임 종료 모달 -->
      <div v-show="showGameOverModal" id="game-over-modal"
        class="absolute inset-0 bg-black bg-opacity-80 flex-col items-center justify-center z-20 flex">
        <div class="text-center">
          <h2 class="text-5xl font-extrabold text-white mb-4">Game Over</h2>
          <p id="modal-score" class="text-2xl text-yellow-400 mb-2">Final Score: {{ score }}</p>
          <p id="modal-typing-speed" class="text-xl text-yellow-400 mb-8">분당타수: {{ Math.round(typingSpeed) }} 타</p>
          <button @click="resetToSettings"
            class="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-2xl py-4 px-10 rounded-lg transition transform hover:scale-105">
            Back to Settings
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import GameItem from '@/views/typing-game/GameItem.vue';

// UI 상태
const showSettingsModal = ref(true);
const showGameUI = ref(false);
const showGameOverModal = ref(false);
const isFullscreen = ref(false);
const isFlashing = ref(false);
const hasInputError = ref(false);
const inputMatchState = ref('neutral'); // 'neutral', 'match', 'no-match'

// 게임 상태
const score = ref(0);
const lives = ref(5);
const typingSpeed = ref(0);
const isGameOver = ref(true);
const inputValue = ref('');

// 설정 데이터
const customWords = ref('');
const customSyntax = ref('');

// DOM 참조
const gameScreen = ref(null);
const inputBox = ref(null);
const importFileInput = ref(null);

// 게임 내부 상태
const activeItems = ref([]);
const gameSpeed = ref(1);
const spawnRate = ref(2500);
const elapsedTime = ref(0);
const lastSpawnedItem = ref(null);
const wordZIndexCounter = ref(19999);
const syntaxZIndexCounter = ref(9999);
const shuffledWords = ref([]);
const shuffledSyntax = ref([]);
const currentWordIndex = ref(0);
const currentSyntaxIndex = ref(0);
const lastSpawnIsSyntax = ref(false);
let itemIdCounter = 0;

// 인터벌 ID
let gameLoopInterval = null;
let itemSpawnerInterval = null;
let updateTypingSpeedInterval = null;

// 한글 점수 계산
const calculateHangulToScore = (hangul) => {
  if (typeof hangul !== 'string') return 0;
  let score = 0;
  for (let i = 0; i < hangul.length; i++) {
    const char = hangul[i];
    const charCode = char.charCodeAt(0);
    if (char === ' ') {
      score += 1;
    } else if (charCode >= 44032 && charCode <= 55203) {
      score += ((charCode - 44032) % 28 === 0) ? 2 : 3;
    } else {
      score += 1;
    }
  }
  return score;
};

// 배열 셔플
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// 텍스트 영역 처리
const processTextarea = (text) => {
  return text.split('\n').map(line => line.trim()).filter(line => line);
};

// UI 업데이트
const updateUI = () => {
  // 반응형 변수로 자동 업데이트됨
};

// 생명 감소
const decreaseLife = () => {
  if (lives.value > 0) {
    lives.value--;
  }
};

// 점수 증가
const increaseScore = (amount) => {
  if (amount > 0) {
    score.value += amount;
  }
};

// 아이템 제거
const removeItem = (itemId) => {
  const index = activeItems.value.findIndex(item => item.id === itemId);
  if (index !== -1) {
    activeItems.value.splice(index, 1);
  }
};

// 생명 잃기
const loseLife = () => {
  if (isGameOver.value) return;
  decreaseLife();
  updateUI();
  isFlashing.value = true;
  setTimeout(() => {
    isFlashing.value = false;
  }, 300);
  if (lives.value <= 0) {
    endGame();
  }
};

// 난이도 조절
const adjustDifficulty = () => {
  if (score.value > 0 && score.value % 50 === 0) {
    gameSpeed.value += 0.2;
  }
  if (score.value > 0 && score.value % 100 === 0 && spawnRate.value >= 200) {
    spawnRate.value -= 50;
    stopGame();
    startIntervals();
  }
};

// 타이핑 속도 업데이트
const updateTypingSpeed = () => {
  elapsedTime.value += 0.1;
  if (elapsedTime.value > 0) {
    typingSpeed.value = score.value / elapsedTime.value * 60;
  }
};

// 게임 루프
const gameLoop = () => {
  if (isGameOver.value) return;
  if (!gameScreen.value) return;

  activeItems.value.forEach((item) => {
    const speed = item.y < 0 ? gameSpeed.value * 5 : gameSpeed.value;
    item.y += speed * item.speedMultiplier;

    // 아이템이 화면 밖으로 나갔는지 확인 (대략적인 높이 추정)
    const estimatedHeight = 40; // 아이템의 대략적인 높이
    if (item.y + estimatedHeight >= gameScreen.value.offsetHeight) {
      removeItem(item.id);
      loseLife();
    }
  });
};

// 엔티티 스폰
const spawnEntity = (type, speedMultiplier) => {
  let itemText;

  if (type === 'word') {
    if (currentWordIndex.value >= shuffledWords.value.length) {
      currentWordIndex.value = 0;
      shuffledWords.value = shuffleArray([...processTextarea(customWords.value)]);
    }
    if (shuffledWords.value.length > 0) {
      itemText = shuffledWords.value[currentWordIndex.value];
      currentWordIndex.value++;
    }
  } else { // syntax
    if (currentSyntaxIndex.value >= shuffledSyntax.value.length) {
      currentSyntaxIndex.value = 0;
      shuffledSyntax.value = shuffleArray([...processTextarea(customSyntax.value)]);
    }
    if (shuffledSyntax.value.length > 0) {
      itemText = shuffledSyntax.value[currentSyntaxIndex.value];
      currentSyntaxIndex.value++;
    }
  }

  if (!itemText || !gameScreen.value) return;

  const screenWidth = gameScreen.value.offsetWidth;
  // 대략적인 아이템 너비 추정 (텍스트 길이 기반)
  const estimatedItemWidth = itemText.length * 12 + 24; // 대략적인 너비

  let randomX;
  let isOverlapping = false;
  const maxAttempts = 20;
  let attempts = 0;

  do {
    isOverlapping = false;
    randomX = Math.random() * (screenWidth - estimatedItemWidth);

    for (const activeItem of activeItems.value) {
      if (activeItem.y < 40) { // 아이템이 위쪽에 있을 때만 체크
        const existingX = activeItem.x;
        const existingWidth = activeItem.text.length * 12 + 24; // 대략적인 너비

        if (randomX < existingX + existingWidth && randomX + estimatedItemWidth > existingX) {
          isOverlapping = true;
          break;
        }
      }
    }
    attempts++;
  } while (isOverlapping && attempts < maxAttempts);

  const zIndex = type === 'word' ? wordZIndexCounter.value-- : syntaxZIndexCounter.value--;

  const newItem = {
    id: itemIdCounter++,
    text: itemText,
    type: type,
    x: randomX,
    y: -40,
    zIndex: zIndex,
    speedMultiplier: speedMultiplier * (5 / itemText.length)
  };

  activeItems.value.push(newItem);
  lastSpawnedItem.value = newItem;
};

// 아이템 스폰
const spawnItem = () => {
  if (isGameOver.value) return;
  if (activeItems.value.length >= 7) return;

  // 마지막 스폰된 아이템이 충분히 이동했는지 확인
  if (lastSpawnedItem.value) {
    const lastItemExists = activeItems.value.includes(lastSpawnedItem.value);
    if (lastItemExists && lastSpawnedItem.value.y < 10) {
      return;
    }
  }

  const words = processTextarea(customWords.value);
  const syntaxPhrases = processTextarea(customSyntax.value);
  const hasWords = words.length > 0;
  const hasSyntax = syntaxPhrases.length > 0;
  if (!hasWords && !hasSyntax) return;

  const shouldSpawnWord = (Math.random() < 0.75 && hasWords) || !hasSyntax;

  if (shouldSpawnWord) {
    if (lastSpawnIsSyntax.value) {
      lastSpawnIsSyntax.value = false;
      return;
    }
    spawnEntity('word', 1);
  } else {
    spawnEntity('syntax', 0.5);
    lastSpawnIsSyntax.value = true;
  }
};

// 인터벌 시작
const startIntervals = () => {
  gameLoopInterval = setInterval(() => gameLoop(), 16);
  itemSpawnerInterval = setInterval(() => spawnItem(), spawnRate.value);
  updateTypingSpeedInterval = setInterval(() => updateTypingSpeed(), 100);
};

// 게임 중지
const stopGame = () => {
  if (gameLoopInterval) clearInterval(gameLoopInterval);
  if (itemSpawnerInterval) clearInterval(itemSpawnerInterval);
  if (updateTypingSpeedInterval) clearInterval(updateTypingSpeedInterval);
};

// 게임 시작
const startGame = () => {
  const words = processTextarea(customWords.value);
  const syntaxPhrases = processTextarea(customSyntax.value);

  if (words.length === 0 && syntaxPhrases.length === 0) {
    alert('Please enter at least one word or syntax phrase to start the game.');
    return;
  }

  saveDataToLocalStorage();

  // 게임 상태 초기화
  score.value = 0;
  lives.value = 5;
  gameSpeed.value = 1;
  spawnRate.value = 2500;
  activeItems.value = [];
  isGameOver.value = false;
  elapsedTime.value = 0;
  lastSpawnedItem.value = null;
  wordZIndexCounter.value = 19999;
  syntaxZIndexCounter.value = 9999;
  shuffledWords.value = shuffleArray([...words]);
  shuffledSyntax.value = shuffleArray([...syntaxPhrases]);
  currentWordIndex.value = 0;
  currentSyntaxIndex.value = 0;
  lastSpawnIsSyntax.value = false;

  // UI 업데이트
  updateUI();
  activeItems.value = [];
  if (inputBox.value) {
    inputBox.value.disabled = false;
    inputBox.value.value = '';
  }
  inputValue.value = '';
  inputMatchState.value = 'neutral';
  itemIdCounter = 0;

  nextTick(() => {
    if (inputBox.value) {
      inputBox.value.focus();
    }
  });

  showSettingsModal.value = false;
  showGameUI.value = true;
  showGameOverModal.value = false;

  stopGame();
  startIntervals();
};

// 게임 종료
const endGame = () => {
  if (isGameOver.value) return;
  isGameOver.value = true;
  stopGame();
  if (inputBox.value) {
    inputBox.value.disabled = true;
  }
  showGameOverModal.value = true;
};

// 설정으로 리셋
const resetToSettings = () => {
  stopGame();
  showGameOverModal.value = false;
  showGameUI.value = false;
  showSettingsModal.value = true;
  isGameOver.value = true;
};

// 입력 매칭 확인 (실시간)
const checkInputMatch = () => {
  if (!inputValue.value || inputValue.value.trim() === '') {
    inputMatchState.value = 'neutral';
    return;
  }

  const typedText = inputValue.value;
  let hasMatch = false;

  for (const item of activeItems.value) {
    const isSyntax = item.type === 'syntax';

    let sourceText;
    let targetText;

    if (isSyntax) {
      sourceText = item.text.replace(/\s/g, '');
      targetText = typedText.replace(/\s/g, '');
    } else {
      sourceText = item.text.trim();
      targetText = typedText.trim();
    }

    if (sourceText === targetText) {
      hasMatch = true;
      break;
    }
  }

  inputMatchState.value = hasMatch ? 'match' : 'no-match';
};

// 입력 처리
const handleInput = (typedText) => {
  if (!typedText) return;

  let matchedItem = null;
  for (const item of activeItems.value) {
    const isSyntax = item.type === 'syntax';

    let sourceText;
    let targetText;

    if (isSyntax) {
      sourceText = item.text.replace(/\s/g, '');
      targetText = typedText.replace(/\s/g, '');
    } else {
      sourceText = item.text.trim();
      targetText = typedText.trim();
    }

    if (sourceText === targetText) {
      matchedItem = item;
      break;
    }
  }

  if (matchedItem) {
    increaseScore(calculateHangulToScore(matchedItem.text));
    removeItem(matchedItem.id);
    updateUI();
    adjustDifficulty();
    inputMatchState.value = 'neutral';
  } else {
    hasInputError.value = true;
    inputMatchState.value = 'no-match';
    setTimeout(() => {
      hasInputError.value = false;
      inputMatchState.value = 'neutral';
    }, 200);
  }
  inputValue.value = '';
};

// 입력 키다운 핸들러
const handleInputKeydown = (event) => {
  if (!isGameOver.value && event.key === 'Enter') {
    event.preventDefault();
    handleInput(inputValue.value);
  }
};

// LocalStorage 저장
const saveDataToLocalStorage = () => {
  const data = {
    words: customWords.value,
    syntax: customSyntax.value,
  };
  localStorage.setItem('typingGameSettings', JSON.stringify(data));
};

// LocalStorage 로드
const loadDataFromLocalStorage = () => {
  const savedSettings = localStorage.getItem('typingGameSettings');
  if (savedSettings) {
    try {
      const data = JSON.parse(savedSettings);
      customWords.value = typeof data.words === 'string' ? data.words : '';
      customSyntax.value = typeof data.syntax === 'string' ? data.syntax : '';
    } catch (e) {
      console.error('Failed to parse settings from localStorage', e);
      loadDefaultData();
    }
  } else {
    loadDefaultData();
  }
};

// 기본 데이터 로드
const loadDefaultData = () => {
  const defaultWords = ["네트워크", "프로토콜", "알고리즘", "데이터베이스", "서버", "클라이언트", "프레임워크", "라이브러리"];
  const defaultSyntax = ["public static void main", "System.out.println()", "document.getElementById", "addEventListener('click', () => {})"];
  customWords.value = defaultWords.join('\n');
  customSyntax.value = defaultSyntax.join('\n');
};

// Export 처리
const handleExport = () => {
  saveDataToLocalStorage();
  const data = {
    words: processTextarea(customWords.value),
    syntax: processTextarea(customSyntax.value),
  };
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'typing_settings.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Import 클릭 핸들러
const handleImportClick = () => {
  importFileInput.value.click();
};

// Import 처리
const handleImport = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (Array.isArray(data.words) && Array.isArray(data.syntax)) {
        customWords.value = data.words.join('\n');
        customSyntax.value = data.syntax.join('\n');
        saveDataToLocalStorage();
      } else {
        alert('Invalid JSON format. The file must contain "words" and "syntax" arrays.');
      }
    } catch (error) {
      alert('Error parsing JSON file: ' + error.message);
    }
  };
  reader.readAsText(file);
  event.target.value = '';
};

// 전체화면 토글
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => console.error(`Fullscreen Error: ${err.message}`));
  } else {
    document.exitFullscreen();
  }
};

// 전체화면 변경 핸들러
const onFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement;
};

// Tailwind CSS 및 폰트 로드
const loadExternalResources = () => {
  // Tailwind CSS가 이미 로드되었는지 확인
  if (!document.querySelector('script[src*="tailwindcss"]')) {
    const tailwindScript = document.createElement('script');
    tailwindScript.src = 'https://cdn.tailwindcss.com';
    document.head.appendChild(tailwindScript);
  }

  // Fira Code 폰트가 이미 로드되었는지 확인
  if (!document.querySelector('link[href*="Fira+Code"]')) {
    const preconnect1 = document.createElement('link');
    preconnect1.rel = 'preconnect';
    preconnect1.href = 'https://fonts.googleapis.com';
    document.head.appendChild(preconnect1);

    const preconnect2 = document.createElement('link');
    preconnect2.rel = 'preconnect';
    preconnect2.href = 'https://fonts.gstatic.com';
    preconnect2.crossOrigin = 'anonymous';
    document.head.appendChild(preconnect2);

    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);
  }
};

// 보안 로직: 개발자 도구 감지 및 방지
const setupSecurity = () => {
  // 개발자 도구 열기 감지
  let devtools = { open: false };
  const element = new Image();
  Object.defineProperty(element, 'id', {
    get: function () {
      devtools.open = true;
      if (devtools.open) {
        // 개발자 도구가 열렸을 때 페이지를 비우기
        document.documentElement.innerHTML = '';
        document.documentElement.style.display = 'none';
        // 무한 루프로 계속 감지
        setInterval(() => {
          debugger;
        }, 100);
      }
    }
  });

  // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U 등 키 조합 차단
  const keydownHandler = (e) => {
    if (e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
      (e.ctrlKey && e.key === 'U')) {
      e.preventDefault();
      return false;
    }
  };

  // 우클릭 방지
  const contextMenuHandler = (e) => {
    e.preventDefault();
    return false;
  };

  // 선택 방지
  const selectStartHandler = (e) => {
    e.preventDefault();
    return false;
  };

  document.addEventListener('keydown', keydownHandler);
  document.addEventListener('contextmenu', contextMenuHandler);
  document.addEventListener('selectstart', selectStartHandler);

  // 개발자 도구 감지 (크기 변경 감지)
  const sizeCheckInterval = setInterval(() => {
    if (window.outerHeight - window.innerHeight > 200 ||
      window.outerWidth - window.innerWidth > 200) {
      document.documentElement.innerHTML = '';
      document.documentElement.style.display = 'none';
    }
  }, 500);

  // cleanup 함수 반환
  return () => {
    document.removeEventListener('keydown', keydownHandler);
    document.removeEventListener('contextmenu', contextMenuHandler);
    document.removeEventListener('selectstart', selectStartHandler);
    clearInterval(sizeCheckInterval);
  };
};

// 생명주기
let securityCleanup = null;

onMounted(() => {
  loadExternalResources();
  loadDataFromLocalStorage();
  document.addEventListener('fullscreenchange', onFullscreenChange);
  securityCleanup = setupSecurity();
});

onUnmounted(() => {
  stopGame();
  document.removeEventListener('fullscreenchange', onFullscreenChange);
  if (securityCleanup) {
    securityCleanup();
  }
});
</script>

<style scoped>
.typing-game-container {
  font-family: 'Fira Code', monospace;
  background: linear-gradient(135deg, #1e3a8a, #312e81, #111827);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.flash-red {
  animation: flash-red 0.3s ease-out;
}

@keyframes flash-red {

  0%,
  100% {
    background-color: transparent;
  }

  50% {
    background-color: #991b1b;
  }
}

.input-error {
  animation: input-error-animation 0.2s ease-in-out;
}

@keyframes input-error-animation {

  from,
  to {
    transform: translate3d(0, 0, 0);
  }

  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translate3d(-5px, 0, 0);
  }

  20%,
  40%,
  60%,
  80% {
    transform: translate3d(5px, 0, 0);
  }

  50% {
    background-color: #991b1b;
    border-color: #ef4444;
  }
}


input:focus,
textarea:focus {
  caret-color: #34d399;
}

textarea {
  background-color: #1e293b;
  border: 1px solid #475569;
  border-radius: 0.5rem;
  padding: 0.75rem;
  color: #e2e8f0;
  resize: vertical;
}

#settings-modal,
#game-over-modal {
  z-index: 20000;
}

* {
  user-select: none;
}
</style>
