<template>
  <div class="typing-game-app">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&display=swap" rel="stylesheet">

    <div id="game-container" class="game-container">
      <!-- 게임 UI (초기에는 숨김) -->
      <div id="game-ui" class="game-ui" :class="{ hidden: !isGameStarted, flex: isGameStarted }">
        <button
          @click="toggleFullscreen"
          class="fullscreen-btn"
          title="Toggle Fullscreen"
        >
          <svg
            v-if="!isFullscreen"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
          </svg>
        </button>
        <h1 class="game-title">Typing Master</h1>
        <div class="stats-bar">
          <div class="stat">SCORE: <span class="stat-value">{{ score }}</span></div>
          <div class="stat">분당타수: <span class="stat-value">{{ typingSpeed.toFixed(0) }}</span> 타</div>
          <div class="stat">LIVES: <span class="stat-value lives">{{ lives }}</span></div>
        </div>
        <div
          id="game-screen"
          ref="gameScreen"
          class="game-screen"
          :class="{ 'flash-red': isFlashing }"
        >
          <div
            v-for="item in activeItems"
            :key="item.id"
            :class="['item', item.type]"
            :style="{
              left: item.x + 'px',
              top: item.y + 'px',
              zIndex: item.zIndex
            }"
          >
            {{ item.text }}
          </div>
        </div>
        <input
          type="text"
          id="input-box"
          ref="inputBox"
          v-model="inputValue"
          @keydown.enter="handleEnter"
          class="input-box"
          :class="{ 'input-error': hasInputError }"
          :disabled="!isGameStarted || isGameOver"
          placeholder="Type here and press Enter..."
        />
      </div>

      <!-- 설정 페이지 모달 (초기에 보임) -->
      <div
        id="settings-modal"
        class="settings-modal"
        :class="{ hidden: isGameStarted }"
      >
        <div class="settings-content">
          <h2>Game Settings</h2>
          <div class="settings-grid">
            <div>
              <label for="custom-words">키워드 (한 줄에 하나씩)</label>
              <textarea
                id="custom-words"
                v-model="customWords"
                rows="8"
              ></textarea>
            </div>
            <div>
              <label for="custom-syntax">구문 (한 줄에 하나씩)</label>
              <textarea
                id="custom-syntax"
                v-model="customSyntax"
                rows="8"
              ></textarea>
            </div>
          </div>
          <div class="settings-actions">
            <button @click="triggerImport" class="btn-import">Import JSON</button>
            <input
              type="file"
              ref="importFile"
              class="hidden"
              accept=".json"
              @change="handleImport"
            />
            <button @click="handleExport" class="btn-export">Export JSON</button>
          </div>
          <button @click="startGame" class="btn-start">Start Game</button>
        </div>
      </div>

      <!-- 게임 종료 모달 (초기에는 숨김) -->
      <div
        id="game-over-modal"
        class="game-over-modal"
        :class="{ hidden: !isGameOver, flex: isGameOver }"
      >
        <div class="game-over-content">
          <h2>Game Over</h2>
          <p class="modal-score">Final Score: {{ score }}</p>
          <p class="modal-typing-speed">분당타수: {{ typingSpeed.toFixed(0) }} 타</p>
          <button @click="resetToSettings" class="btn-restart">Back to Settings</button>
        </div>
      </div>
    </div>
    
    <!-- Hidden download link -->
    <a
      ref="downloadLink"
      :href="downloadUrl"
      :download="downloadFilename"
      style="display: none"
    ></a>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';

class Game {
  #score;
  #lives;
  #activeItemsRef;
  #gameScreenRef;
  #gameSpeed;
  #spawnRate;
  #gameLoopInterval;
  #itemSpawnerInterval;
  #isGameOver;
  #lastSpawnIsSyntax;
  #elapsedTime;
  #updateTypingSpeedInterval;
  #onGameOver;
  #lastSpawnedItem = null;
  #wordZIndexCounter;
  #syntaxZIndexCounter;
  #shuffledWords;
  #shuffledSyntax;
  #currentWordIndex;
  #currentSyntaxIndex;

  constructor(elements, words, syntaxPhrases, onGameOver, activeItemsRef, gameScreenRef, itemIdGenerator) {
    this.elements = elements;
    this.words = words;
    this.syntaxPhrases = syntaxPhrases;
    this.#onGameOver = onGameOver;
    this.#activeItemsRef = activeItemsRef;
    this.#gameScreenRef = gameScreenRef;
    this.#itemIdGenerator = itemIdGenerator;
    this.#isGameOver = true;
    this.#lastSpawnIsSyntax = false;
    this.#wordZIndexCounter = 19999;
    this.#syntaxZIndexCounter = 9999;
    this.#shuffledWords = [];
    this.#shuffledSyntax = [];
    this.#currentWordIndex = 0;
    this.#currentSyntaxIndex = 0;
  }

  get isGameOver() {
    return this.#isGameOver;
  }

  get currentScore() {
    return this.#score;
  }

  get typingSpeed() {
    if (!this.#elapsedTime || this.#elapsedTime === 0) return 0;
    return this.#score / this.#elapsedTime * 60;
  }

  start() {
    this.#score = 0;
    this.#lives = 5;
    this.#gameSpeed = 1;
    this.#spawnRate = 2500;
    this.#activeItemsRef.value = [];
    this.#isGameOver = false;
    this.#elapsedTime = 0;
    this.#lastSpawnedItem = null;
    this.#wordZIndexCounter = 19999;
    this.#syntaxZIndexCounter = 9999;
    this.#shuffledWords = this.#shuffleArray([...this.words]);
    this.#shuffledSyntax = this.#shuffleArray([...this.syntaxPhrases]);
    this.#currentWordIndex = 0;
    this.#currentSyntaxIndex = 0;
    this.#updateUI();
    this.elements.inputBox.disabled = false;
    this.elements.inputBox.value = '';
    this.elements.inputBox.focus();

    this.stop();

    this.#gameLoopInterval = setInterval(() => this.#gameLoop(), 16);
    this.#itemSpawnerInterval = setInterval(() => this.#spawnItem(), this.#spawnRate);
    this.#updateTypingSpeedInterval = setInterval(() => this.#updateTypingSpeed(), 100);
  }

  stop() {
    clearInterval(this.#gameLoopInterval);
    clearInterval(this.#itemSpawnerInterval);
    clearInterval(this.#updateTypingSpeedInterval);
  }

  #shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  #updateTypingSpeed() {
    this.#elapsedTime += 0.1;
    if (this.#onGameOver) {
      this.#onGameOver({ typingSpeed: this.typingSpeed });
    }
  }

  #increaseScore(amount) {
    if (amount > 0) this.#score += amount;
  }

  #decreaseLife() {
    if (this.#lives > 0) this.#lives--;
  }

  #gameLoop() {
    if (this.#isGameOver) return;
    const gameScreenHeight = this.#gameScreenRef?.offsetHeight || 0;
    this.#activeItemsRef.value.forEach((item, index) => {
      const speed = item.y < 0 ? this.#gameSpeed * 5 : this.#gameSpeed;
      item.y += speed * item.speedMultiplier;
      
      // Estimate item height (approximate based on text length)
      const estimatedHeight = item.text.length * 20 + 20; // rough estimate
      if (item.y + estimatedHeight >= gameScreenHeight) {
        this.#removeItem(index);
        this.#loseLife();
      }
    });
  }

  #spawnItem() {
    if (this.#isGameOver) return;
    if (this.#activeItemsRef.value.length >= 7) return;

    if (this.#lastSpawnedItem) {
      const lastItemExists = this.#activeItemsRef.value.includes(this.#lastSpawnedItem);
      if (lastItemExists && this.#lastSpawnedItem.y < 10) {
        return;
      }
    }

    const hasWords = this.words.length > 0;
    const hasSyntax = this.syntaxPhrases.length > 0;
    if (!hasWords && !hasSyntax) return;

    const shouldSpawnWord = (Math.random() < 0.75 && hasWords) || !hasSyntax;

    if (shouldSpawnWord) {
      if (this.#lastSpawnIsSyntax) {
        this.#lastSpawnIsSyntax = false;
        return;
      }
      this.#spawnEntity('word', 1, this.#itemIdGenerator);
    } else {
      this.#spawnEntity('syntax', 0.5, this.#itemIdGenerator);
      this.#lastSpawnIsSyntax = true;
    }
  }

  #spawnEntity(type, speedMultiplier, itemIdGenerator) {
    let itemText;

    if (type === 'word') {
      if (this.#currentWordIndex >= this.#shuffledWords.length) {
        this.#currentWordIndex = 0;
        this.#shuffledWords = this.#shuffleArray([...this.words]);
      }
      if (this.#shuffledWords.length > 0) {
        itemText = this.#shuffledWords[this.#currentWordIndex];
        this.#currentWordIndex++;
      }
    } else {
      if (this.#currentSyntaxIndex >= this.#shuffledSyntax.length) {
        this.#currentSyntaxIndex = 0;
        this.#shuffledSyntax = this.#shuffleArray([...this.syntaxPhrases]);
      }
      if (this.#shuffledSyntax.length > 0) {
        itemText = this.#shuffledSyntax[this.#currentSyntaxIndex];
        this.#currentSyntaxIndex++;
      }
    }

    if (!itemText) return;

    const zIndex = type === 'word' ? this.#wordZIndexCounter-- : this.#syntaxZIndexCounter--;
    
    const screenWidth = this.#gameScreenRef?.offsetWidth || 800;
    // Estimate item width based on text length
    const estimatedItemWidth = itemText.length * 12 + 24; // rough estimate
    
    let randomX;
    let isOverlapping = false;
    const maxAttempts = 20;
    let attempts = 0;

    do {
      isOverlapping = false;
      randomX = Math.random() * (screenWidth - estimatedItemWidth);
      
      for (const activeItem of this.#activeItemsRef.value) {
        if (activeItem.y < 40) { // Only check items near top
          const existingX = activeItem.x;
          const existingWidth = activeItem.text.length * 12 + 24; // rough estimate

          if (randomX < existingX + existingWidth && randomX + estimatedItemWidth > existingX) {
            isOverlapping = true;
            break;
          }
        }
      }
      attempts++;
    } while (isOverlapping && attempts < maxAttempts);

    const newItem = {
      id: itemIdGenerator(),
      text: itemText,
      type: type,
      x: randomX,
      y: -40,
      zIndex: zIndex,
      speedMultiplier: speedMultiplier * (5 / itemText.length)
    };
    
    this.#activeItemsRef.value.push(newItem);
    this.#lastSpawnedItem = newItem;
  }

  #loseLife() {
    if (this.#isGameOver) return;
    this.#decreaseLife();
    this.#updateUI();
    if (this.#onGameOver) {
      this.#onGameOver({ flash: true });
    }
    if (this.#lives <= 0) {
      this.endGame();
    }
  }

  endGame() {
    if (this.#isGameOver) return;
    this.#isGameOver = true;
    this.stop();
    this.elements.inputBox.disabled = true;
    if (this.#onGameOver) {
      this.#onGameOver({ gameOver: true });
    }
  }

  #removeItem(index) {
    this.#activeItemsRef.value.splice(index, 1);
  }

  #updateUI() {
    if (this.#onGameOver) {
      this.#onGameOver({ score: this.#score, lives: this.#lives });
    }
  }

  #adjustDifficulty() {
    if (this.#score > 0 && this.#score % 50 === 0) {
      this.#gameSpeed += 0.2;
    }
    if (this.#score > 0 && this.#score % 100 === 0 && this.#spawnRate >= 200) {
      this.#spawnRate -= 50;
      this.stop();
      this.#itemSpawnerInterval = setInterval(() => this.#spawnItem(), this.#spawnRate);
      this.#gameLoopInterval = setInterval(() => this.#gameLoop(), 16);
      this.#updateTypingSpeedInterval = setInterval(() => this.#updateTypingSpeed(), 100);
    }
  }

  static calculateHangulToScore(hangul) {
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
  }

  handleInput(typedText) {
    if (!typedText) return;

    let matchedIndex = -1;
    for (let i = 0; i < this.#activeItemsRef.value.length; i++) {
      const item = this.#activeItemsRef.value[i];
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
        matchedIndex = i;
        break;
      }
    }

    if (matchedIndex !== -1) {
      this.#increaseScore(Game.calculateHangulToScore(this.#activeItemsRef.value[matchedIndex].text));
      this.#removeItem(matchedIndex);
      this.#updateUI();
      this.#adjustDifficulty();
      if (this.#onGameOver) {
        this.#onGameOver({ inputError: false });
      }
    } else {
      if (this.#onGameOver) {
        this.#onGameOver({ inputError: true });
      }
    }
    this.elements.inputBox.value = '';
  }
}

const gameScreen = ref(null);
const inputBox = ref(null);
const importFile = ref(null);
const isGameStarted = ref(false);
const isGameOver = ref(false);
const isFullscreen = ref(false);
const score = ref(0);
const lives = ref(5);
const typingSpeed = ref(0);
const inputValue = ref('');
const customWords = ref('');
const customSyntax = ref('');
const isFlashing = ref(false);
const hasInputError = ref(false);
const activeItems = ref([]);
let itemIdCounter = 0;

let typingGame = null;

const saveDataToLocalStorage = () => {
  const data = {
    words: customWords.value,
    syntax: customSyntax.value,
  };
  localStorage.setItem('typingGameSettings', JSON.stringify(data));
};

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

const loadDefaultData = () => {
  const defaultWords = ["네트워크", "프로토콜", "알고리즘", "데이터베이스", "서버", "클라이언트", "프레임워크", "라이브러리"];
  const defaultSyntax = ["public static void main", "System.out.println()", "document.getElementById", "addEventListener('click', () => {})"];
  customWords.value = defaultWords.join('\n');
  customSyntax.value = defaultSyntax.join('\n');
};

const processTextarea = (textarea) => {
  return textarea.split('\n').map(line => line.trim()).filter(line => line);
};

const startGame = () => {
  saveDataToLocalStorage();

  const words = processTextarea(customWords.value);
  const syntaxPhrases = processTextarea(customSyntax.value);

  if (words.length === 0 && syntaxPhrases.length === 0) {
    alert('Please enter at least one word or syntax phrase to start the game.');
    return;
  }

  isGameStarted.value = true;
  isGameOver.value = false;

  const gameElements = {
    gameScreen: gameScreen.value,
    inputBox: inputBox.value,
    scoreEl: { innerText: '' },
    livesEl: { innerText: '' },
    typingSpeedEl: { innerText: '' }
  };

  const generateItemId = () => {
    return itemIdCounter++;
  };

  typingGame = new Game(gameElements, words, syntaxPhrases, handleGameUpdate, activeItems, gameScreen, generateItemId);
  typingGame.start();
  
  nextTick(() => {
    if (inputBox.value) {
      inputBox.value.focus();
    }
  });
};

const handleGameUpdate = (update) => {
  if (update.score !== undefined) score.value = update.score;
  if (update.lives !== undefined) lives.value = update.lives;
  if (update.typingSpeed !== undefined) typingSpeed.value = update.typingSpeed;
  if (update.flash) {
    isFlashing.value = true;
    setTimeout(() => {
      isFlashing.value = false;
    }, 300);
  }
  if (update.inputError) {
    hasInputError.value = true;
    setTimeout(() => {
      hasInputError.value = false;
    }, 200);
  }
  if (update.gameOver) {
    isGameOver.value = true;
  }
};

const handleEnter = (e) => {
  if (typingGame && !typingGame.isGameOver && e.key === 'Enter') {
    e.preventDefault();
    typingGame.handleInput(inputValue.value);
    inputValue.value = '';
  }
};

const resetToSettings = () => {
  if (typingGame) {
    typingGame.stop();
    typingGame = null;
  }
  activeItems.value = [];
  isGameOver.value = false;
  isGameStarted.value = false;
  score.value = 0;
  lives.value = 5;
  typingSpeed.value = 0;
  inputValue.value = '';
};

const downloadLink = ref(null);
const downloadUrl = ref('');
const downloadFilename = ref('');

const handleExport = () => {
  saveDataToLocalStorage();
  const data = {
    words: processTextarea(customWords.value),
    syntax: processTextarea(customSyntax.value),
  };
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  downloadUrl.value = url;
  downloadFilename.value = 'typing_settings.json';
  nextTick(() => {
    if (downloadLink.value) {
      downloadLink.value.click();
      setTimeout(() => {
        URL.revokeObjectURL(url);
        downloadUrl.value = '';
        downloadFilename.value = '';
      }, 100);
    }
  });
};

const triggerImport = () => {
  importFile.value?.click();
};

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

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => console.error(`Fullscreen Error: ${err.message}`));
  } else {
    document.exitFullscreen();
  }
};

const onFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement;
};

onMounted(() => {
  loadDataFromLocalStorage();
  document.addEventListener('fullscreenchange', onFullscreenChange);
});

onUnmounted(() => {
  if (typingGame) {
    typingGame.stop();
  }
  document.removeEventListener('fullscreenchange', onFullscreenChange);
});
</script>

<style scoped>
* {
  user-select: none;
}

.typing-game-app {
  font-family: 'Fira Code', monospace;
  overflow: hidden;
  background: linear-gradient(135deg, #1e3a8a, #312e81, #111827);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.game-container {
  position: relative;
  width: 100%;
  max-width: 64rem;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.game-ui {
  width: 100%;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  position: relative;
}

.game-ui.hidden {
  display: none;
}

.fullscreen-btn {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  color: #9ca3af;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
  z-index: 30;
}

.fullscreen-btn:hover {
  color: white;
}

.game-title {
  font-size: 2.25rem;
  font-weight: 700;
  color: #34d399;
}

.stats-bar {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #1e293b;
  padding: 0.75rem;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.stat {
  font-size: 1.125rem;
}

.stat-value {
  font-weight: 700;
  font-size: 1.5rem;
  color: #fde047;
}

.stat-value.lives {
  color: #ef4444;
}

.game-screen {
  width: 100%;
  height: 50vh;
  background-color: rgba(17, 24, 39, 0.8);
  border: 2px solid #475569;
  border-radius: 0.5rem;
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
}

.game-screen.flash-red {
  animation: flash-red 0.3s ease-out;
}

@keyframes flash-red {
  0%, 100% {
    background-color: transparent;
  }
  50% {
    background-color: #991b1b;
  }
}

.input-box {
  width: 100%;
  padding: 1rem;
  background-color: #0f172a;
  border: 2px solid #10b981;
  border-radius: 0.5rem;
  font-size: 1.25rem;
  text-align: center;
  transition: all 0.2s;
  color: white;
}

.input-box:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(52, 211, 153, 0.5);
}

.input-box:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-box.input-error {
  animation: input-error-animation 0.2s ease-in-out;
}

@keyframes input-error-animation {
  from, to {
    transform: translate3d(0, 0, 0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translate3d(-5px, 0, 0);
  }
  20%, 40%, 60%, 80% {
    transform: translate3d(5px, 0, 0);
  }
  50% {
    background-color: #991b1b;
    border-color: #ef4444;
  }
}

.item {
  position: absolute;
  color: #e5e7eb;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 1.1rem;
  word-wrap: break-word;
  overflow-wrap: break-word;
  transition: transform 50ms ease-out;
  will-change: transform;
}

.word {
  background-color: rgba(30, 41, 59, 0.8);
  border: 1px solid #4b5563;
}

.syntax {
  background-color: rgba(59, 17, 107, 0.8);
  border: 1px solid #c084fc;
  font-size: 1rem;
}

input:focus,
textarea:focus {
  caret-color: #34d399;
}

.settings-modal {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 20000;
}

.settings-modal.hidden {
  display: none;
}

.settings-content {
  background-color: #1e293b;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 42rem;
  text-align: center;
}

.settings-content h2 {
  font-size: 2.25rem;
  font-weight: 800;
  color: white;
  margin-bottom: 1.5rem;
}

.settings-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
  text-align: left;
}

@media (min-width: 768px) {
  .settings-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.settings-grid label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.settings-grid label:first-of-type {
  color: #34d399;
}

.settings-grid label:last-of-type {
  color: #a78bfa;
}

.settings-grid textarea {
  width: 100%;
  background-color: #1e293b;
  border: 1px solid #475569;
  border-radius: 0.5rem;
  padding: 0.75rem;
  color: #e2e8f0;
  resize: vertical;
}

.settings-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1.5rem;
}

@media (min-width: 640px) {
  .settings-actions {
    flex-direction: row;
  }
}

.btn-import,
.btn-export {
  background-color: #2563eb;
  color: white;
  font-weight: 700;
  padding: 0.5rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-import:hover {
  background-color: #1d4ed8;
  transform: scale(1.05);
}

.btn-export {
  background-color: #4b5563;
}

.btn-export:hover {
  background-color: #374151;
  transform: scale(1.05);
}

.btn-start {
  width: 100%;
  background-color: #10b981;
  color: white;
  font-weight: 700;
  font-size: 1.5rem;
  padding: 1rem 2.5rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-start:hover {
  background-color: #059669;
  transform: scale(1.05);
}

.game-over-modal {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.8);
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 20000;
}

.game-over-modal.hidden {
  display: none;
}

.game-over-content {
  text-align: center;
}

.game-over-content h2 {
  font-size: 3rem;
  font-weight: 800;
  color: white;
  margin-bottom: 1rem;
}

.modal-score {
  font-size: 1.5rem;
  color: #fde047;
  margin-bottom: 0.5rem;
}

.modal-typing-speed {
  font-size: 1.25rem;
  color: #fde047;
  margin-bottom: 2rem;
}

.btn-restart {
  background-color: #10b981;
  color: white;
  font-weight: 700;
  font-size: 1.5rem;
  padding: 1rem 2.5rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-restart:hover {
  background-color: #059669;
  transform: scale(1.05);
}
</style>
