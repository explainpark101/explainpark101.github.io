<template>
  <div class="password-app">
    <div class="container">
      <div class="header-controls">
        <router-link to="/" class="back-link">
          ← 앱 목록
        </router-link>

        <div v-if="showPWAInstall" id="pwa-install-container">
          <button @click="installPWA" class="pwa-install-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
            앱 설치
          </button>
        </div>
      </div>

      <h1>강력한 비밀번호 생성기</h1>
      <span class="description">
        🔒 모든 데이터는 로컬에서만 처리되며, 인터넷 연결 없이도 완벽하게 작동합니다
      </span>
      
      <div class="wrapper">
        <div class="main-content">
          <div class="password-display">
            <input type="text" v-model="passwordOutput" readonly>
            <button @click="copyPassword" id="copyButton">
              <span class="material-icons">{{ copyButtonIcon }}</span> {{ copyButtonText }}
            </button>
          </div>
          
          <div class="length-option">
            <label for="lengthSlider">길이:</label>
            <input type="range" id="lengthSlider" v-model.number="length" min="1" max="64" @input="updateLength">
            <input type="number" v-model.number="length" min="1" max="64" @input="updateLengthFromInput" @wheel.prevent="handleLengthWheel">
          </div>
          
          <button @click="generatePassword" id="generateButton">
            <span class="material-icons">rocket_launch</span> 생성하기
          </button>

          <div class="custom-chars-section">
            <h3>사용자 정의 문자 목록</h3>
            <textarea v-model="customChars" placeholder="추가로 사용할 문자들을 입력하세요 (예: 한글, 이모지, 특수문자 등)"></textarea>

            <div class="options">
              <div class="option" v-for="(charSet, key) in charSets" :key="key">
                <span>{{ charSetLabels[key] }}</span>
                <button class="add-chars-btn" @click="addChars(charSet)">
                  <span class="material-icons">add</span> 추가
                </button>
              </div>
            </div>

            <div class="custom-chars-controls">
              <button class="save-btn" @click="saveCustomChars">
                <span class="material-icons">save</span> 저장
              </button>
              <button class="export-btn" @click="exportCustomChars">
                <span class="material-icons">file_download</span> 내보내기
              </button>
              <button class="import-btn" @click="triggerImport">
                <span class="material-icons">file_upload</span> 가져오기
              </button>
              <input type="file" ref="importFileInput" accept=".json" style="display: none;" @change="handleImport">
            </div>

            <div class="saved-lists">
              <div class="saved-lists-header">
                <h4>저장된 목록들</h4>
                <div v-if="savedListsCount > 0" class="saved-lists-toggle" @click="toggleSavedLists">
                  <span class="material-icons" :class="{ rotated: isSavedListsCollapsed }">{{ toggleIcon }}</span>
                  <span>{{ toggleText }}</span>
                </div>
                <div v-else class="saved-lists-empty">저장된 목록이 없습니다.</div>
              </div>
              <div class="saved-lists-content" :class="{ collapsed: isSavedListsCollapsed }">
                <div class="saved-list-item" v-for="(list, name) in savedListsObj" :key="name">
                  <span>{{ name }}</span>
                  <div class="d-flex gap-2">
                    <button class="load-list-btn" @click="loadList(name)">
                      <span class="material-icons">folder_open</span> 불러오기
                    </button>
                    <button class="delete-list-btn" @click="deleteList(name)">
                      <span class="material-icons">delete</span> 삭제
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="sidebar">
          <div class="db-url-section">
            <h3><span class="material-icons">link</span> PostgreSQL URL 생성</h3>
            <div class="db-url-inputs">
              <div class="db-url-input-group">
                <label for="dbHost">호스트</label>
                <input type="text" v-model="dbHost" placeholder="예: aws-0-us-east-1.pooler.supabase.com">
              </div>
              <div class="db-url-input-group">
                <label for="dbPort">포트</label>
                <input type="text" v-model="dbPort" placeholder="예: 5432">
              </div>
              <div class="db-url-input-group">
                <label for="dbUser">사용자명</label>
                <input type="text" v-model="dbUser" placeholder="예: postgres">
              </div>
              <div class="db-url-input-group">
                <label for="dbName">데이터베이스명</label>
                <input type="text" v-model="dbName" placeholder="예: postgres">
              </div>
            </div>
            <div class="db-url-output">{{ dbUrlOutput }}</div>
            <div class="db-url-controls">
              <button class="generate-db-url-btn" @click="generateDbUrl">
                <span class="material-icons">link</span> URL 생성
              </button>
              <button class="copy-db-url-btn" @click="copyDbUrl">
                <span class="material-icons">{{ copyDbUrlIcon }}</span> {{ copyDbUrlText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div :class="['toast', { show: showToast }]">{{ toastMessage }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';

const passwordOutput = ref('');
const length = ref(16);
const customChars = ref('');
const showPWAInstall = ref(false);
const deferredPrompt = ref(null);
const importFileInput = ref(null);
const savedListsObj = ref({});
const isSavedListsCollapsed = ref(false);
const dbHost = ref('localhost');
const dbPort = ref('5432');
const dbUser = ref('postgres');
const dbName = ref('postgres');
const dbUrlOutput = ref('PostgreSQL URL이 여기에 표시됩니다...');
const showToast = ref(false);
const toastMessage = ref('');
const copyButtonText = ref('복사');
const copyButtonIcon = ref('content_copy');
const copyDbUrlText = ref('복사');
const copyDbUrlIcon = ref('content_copy');

const charSets = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>/?'
};

const charSetLabels = {
  uppercase: '대문자 (A-Z)',
  lowercase: '소문자 (a-z)',
  numbers: '숫자 (0-9)',
  symbols: '특수문자 (!@#)'
};

const savedListsCount = computed(() => Object.keys(savedListsObj.value).length);
const toggleIcon = computed(() => isSavedListsCollapsed.value ? 'expand_less' : 'expand_more');
const toggleText = computed(() => isSavedListsCollapsed.value ? '접기' : '펼치기');

function showToastMessage(message) {
  toastMessage.value = message;
  showToast.value = true;
  setTimeout(() => {
    showToast.value = false;
  }, 2100);
}

function updateLength() {
  if (length.value >= 1 && length.value <= 64) {
    localStorage.setItem('passwordLength', length.value.toString());
  }
}

function updateLengthFromInput() {
  if (length.value >= 1 && length.value <= 64) {
    updateLength();
  }
}

function handleLengthWheel(e) {
  e.preventDefault();
  const delta = e.deltaY > 0 ? -1 : 1;
  const newValue = length.value + delta;
  if (newValue >= 1 && newValue <= 64) {
    length.value = newValue;
    updateLength();
  }
}

function getRandomChar(str) {
  const randomValues = new Uint32Array(1);
  window.crypto.getRandomValues(randomValues);
  return str[randomValues[0] % str.length];
}

function generatePassword() {
  const lengthValue = length.value;
  const customCharsValue = customChars.value.trim();

  if (!customCharsValue) {
    alert('사용자 정의 문자 목록에 문자를 추가해주세요.');
    return;
  }

  let charset = customCharsValue;
  let guaranteedChars = [];
  guaranteedChars.push(getRandomChar(customCharsValue));

  const remainingLength = lengthValue - guaranteedChars.length;
  for (let i = 0; i < remainingLength; i++) {
    guaranteedChars.push(getRandomChar(charset));
  }

  for (let i = guaranteedChars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [guaranteedChars[i], guaranteedChars[j]] = [guaranteedChars[j], guaranteedChars[i]];
  }

  const finalPassword = guaranteedChars.join('');
  animatePasswordGeneration(finalPassword);
}

function animatePasswordGeneration(finalPassword) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>/?가나다라마바사아자차카타파하';
  let currentIndex = 0;

  const animationInterval = setInterval(() => {
    let animatedPassword = '';
    for (let i = 0; i < currentIndex; i++) {
      animatedPassword += finalPassword[i];
    }
    for (let i = currentIndex; i < finalPassword.length; i++) {
      animatedPassword += chars[Math.floor(Math.random() * chars.length)];
    }
    passwordOutput.value = animatedPassword;
    currentIndex++;
    if (currentIndex > finalPassword.length) {
      clearInterval(animationInterval);
      passwordOutput.value = finalPassword;
    }
  }, 50);
}

function copyPassword() {
  if (!passwordOutput.value) return;
  navigator.clipboard.writeText(passwordOutput.value).then(() => {
    copyButtonIcon.value = 'check';
    copyButtonText.value = '복사됨!';
    showToastMessage('비밀번호가 클립보드에 복사되었습니다!');
    setTimeout(() => {
      copyButtonIcon.value = 'content_copy';
      copyButtonText.value = '복사';
    }, 1500);
  });
}

function addChars(charsToAdd) {
  const currentChars = customChars.value;
  const uniqueChars = new Set(currentChars.split(''));
  charsToAdd.split('').forEach(char => uniqueChars.add(char));
  customChars.value = Array.from(uniqueChars).join('');
}

function saveCustomChars() {
  const name = prompt('저장할 목록의 이름을 입력하세요:');
  if (name && name.trim()) {
    const savedLists = JSON.parse(localStorage.getItem('customCharsLists') || '{}');
    savedLists[name.trim()] = {
      chars: customChars.value,
      timestamp: Date.now()
    };
    localStorage.setItem('customCharsLists', JSON.stringify(savedLists));
    updateSavedListsDisplay();
    alert('목록이 저장되었습니다!');
  }
}

function exportCustomChars() {
  const savedLists = JSON.parse(localStorage.getItem('customCharsLists') || '{}');
  if (Object.keys(savedLists).length === 0) {
    alert('저장된 목록이 없습니다.');
    return;
  }
  const dataStr = JSON.stringify(savedLists, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'custom_chars_lists.json';
  link.click();
  URL.revokeObjectURL(url);
}

function triggerImport() {
  importFileInput.value?.click();
}

function handleImport(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const importedData = JSON.parse(e.target.result);
        const currentLists = JSON.parse(localStorage.getItem('customCharsLists') || '{}');
        const mergedData = { ...currentLists, ...importedData };
        localStorage.setItem('customCharsLists', JSON.stringify(mergedData));
        updateSavedListsDisplay();
        alert('목록이 성공적으로 가져와졌습니다!');
      } catch (error) {
        alert('파일 형식이 올바르지 않습니다.');
      }
    };
    reader.readAsText(file);
  }
}

function updateSavedListsDisplay() {
  const savedLists = JSON.parse(localStorage.getItem('customCharsLists') || '{}');
  savedListsObj.value = savedLists;
}

function loadList(name) {
  const savedLists = JSON.parse(localStorage.getItem('customCharsLists') || '{}');
  if (savedLists[name]) {
    customChars.value = savedLists[name].chars;
  }
}

function deleteList(name) {
  if (confirm(`"${name}" 목록을 삭제하시겠습니까?`)) {
    const savedLists = JSON.parse(localStorage.getItem('customCharsLists') || '{}');
    delete savedLists[name];
    localStorage.setItem('customCharsLists', JSON.stringify(savedLists));
    updateSavedListsDisplay();
  }
}

function toggleSavedLists() {
  isSavedListsCollapsed.value = !isSavedListsCollapsed.value;
}

function generatePostgresUrl(password) {
  const host = dbHost.value.trim() || 'localhost';
  const port = dbPort.value.trim() || '5432';
  const user = dbUser.value.trim() || 'postgres';
  const db = dbName.value.trim() || 'postgres';
  const encodedPassword = encodeURIComponent(password);
  return `postgresql://${user}:${encodedPassword}@${host}:${port}/${db}`;
}

function generateDbUrl() {
  if (!passwordOutput.value) {
    alert('먼저 비밀번호를 생성해주세요.');
    return;
  }
  dbUrlOutput.value = generatePostgresUrl(passwordOutput.value);
}

function copyDbUrl() {
  if (dbUrlOutput.value === 'PostgreSQL URL이 여기에 표시됩니다...') {
    alert('먼저 URL을 생성해주세요.');
    return;
  }
  navigator.clipboard.writeText(dbUrlOutput.value).then(() => {
    copyDbUrlIcon.value = 'check';
    copyDbUrlText.value = '복사됨!';
    showToastMessage('PostgreSQL URL이 클립보드에 복사되었습니다!');
    setTimeout(() => {
      copyDbUrlIcon.value = 'content_copy';
      copyDbUrlText.value = '복사';
    }, 1500);
  });
}

function installPWA() {
  if (deferredPrompt.value) {
    deferredPrompt.value.prompt();
    deferredPrompt.value.userChoice.then(({ outcome }) => {
      if (outcome === 'accepted') {
        showPWAInstall.value = false;
      }
      deferredPrompt.value = null;
    });
  }
}

function checkPWAMode() {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                       window.navigator.standalone === true;
  return !isStandalone;
}

onMounted(() => {
  // 동적으로 스타시트 링크 추가
  const linkElement = document.createElement('link');
  linkElement.href = 'http://cdn.jsdelivr.net/gh/joungkyun/font-d2coding/d2coding.css';
  linkElement.rel = 'stylesheet';
  linkElement.type = 'text/css';
  document.head.appendChild(linkElement);

  const savedLength = localStorage.getItem('passwordLength');
  if (savedLength) {
    const lengthValue = parseInt(savedLength);
    if (lengthValue >= 1 && lengthValue <= 64) {
      length.value = lengthValue;
    }
  }

  updateSavedListsDisplay();

  if (!customChars.value.trim()) {
    const allChars = charSets.uppercase + charSets.lowercase + charSets.numbers + charSets.symbols;
    customChars.value = allChars;
  }

  if (checkPWAMode()) {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt.value = e;
      showPWAInstall.value = true;
    });

    window.addEventListener('appinstalled', () => {
      showPWAInstall.value = false;
    });
  }

  generatePassword();
});
</script>

<style scoped>
@import url('https://cdn.jsdelivr.net/gh/toss/tossface/dist/tossface.css');
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Noto+Color+Emoji&display=swap');

:root {
  --bg-primary: #f0f2f5;
  --bg-secondary: #ffffff;
  --bg-tertiary: #f8f9fa;
  --bg-quaternary: #f9f9f9;
  --bg-input: #f8f8f8;
  --bg-card: #ffffff;
  --text-primary: #333;
  --text-secondary: #1a1a1a;
  --text-tertiary: #495057;
  --text-quaternary: #666;
  --text-muted: #6c757d;
  --border-color: #ccc;
  --border-light: #ced4da;
  --border-lighter: #dee2e6;
  --border-section: #e9ecef;
  --shadow: rgba(0, 0, 0, 0.1);
  --shadow-card: rgba(0, 0, 0, 0.08);
  --shadow-toast: rgba(0, 0, 0, 0.15);
  --db-section-bg: #e8f4fd;
  --db-section-border: #bee5eb;
  --db-section-text: #0c5460;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1a1a1a;
    --bg-secondary: #2d2d2d;
    --bg-tertiary: #252525;
    --bg-quaternary: #2a2a2a;
    --bg-input: #333333;
    --bg-card: #2d2d2d;
    --text-primary: #e0e0e0;
    --text-secondary: #ffffff;
    --text-tertiary: #b0b0b0;
    --text-quaternary: #a0a0a0;
    --text-muted: #888888;
    --border-color: #444444;
    --border-light: #3a3a3a;
    --border-lighter: #3a3a3a;
    --border-section: #3a3a3a;
    --shadow: rgba(0, 0, 0, 0.3);
    --shadow-card: rgba(0, 0, 0, 0.4);
    --shadow-toast: rgba(0, 0, 0, 0.4);
    --db-section-bg: #1e3a4a;
    --db-section-border: #2a5a6a;
    --db-section-text: #a0d0e0;
  }
}

.password-app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
}

.container {
  background-color: var(--bg-secondary);
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 12px var(--shadow);
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.wrapper {
  display: flex;
  flex-direction: row;
  gap: 2rem;
  align-items: flex-start;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
}

.sidebar {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
}

h1 {
  text-align: center;
  color: var(--text-secondary);
}

.password-display {
  display: flex;
  align-items: center;
  background-color: var(--bg-card);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px var(--shadow-card);
  border: 1px solid var(--border-lighter);
}

.password-display input {
  flex-grow: 1;
  padding: 12px;
  font-size: 1.1em;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  background-color: var(--bg-input);
  color: var(--text-primary);
  font-family: 'Courier New', Courier, monospace;
  font-weight: bold;
}

.password-display button {
  margin-left: 10px;
  padding: 12px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.password-display button:hover {
  background-color: #0056b3;
}

.length-option {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: var(--bg-card);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px var(--shadow-card);
  border: 1px solid var(--border-lighter);
}

.length-option input[type="range"] {
  flex-grow: 1;
  margin: 0 10px;
}

.length-option input[type="number"] {
  width: 60px;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  text-align: center;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

#generateButton {
  width: 100%;
  padding: 15px;
  font-size: 1.2em;
  font-weight: bold;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px var(--shadow-card);
}

#generateButton:hover {
  background-color: #218838;
  box-shadow: 0 4px 12px var(--shadow-card);
}

.custom-chars-section {
  margin-top: 20px;
  padding: 20px;
  background-color: var(--bg-card);
  border-radius: 8px;
  border: 1px solid var(--border-section);
  box-shadow: 0 2px 8px var(--shadow-card);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.custom-chars-section h3 {
  margin: 0 0 10px 0;
  font-size: 1.1em;
  color: var(--text-tertiary);
}

.custom-chars-section textarea {
  width: 100%;
  min-height: 60px;
  max-height: 200px;
  padding: 10px;
  border: 1px solid var(--border-light);
  border-radius: 5px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-family: "JetBrains Mono", 'D2 coding', monospace;
  resize: vertical;
  box-sizing: border-box;
  overflow-y: auto;
}

.options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  background: var(--bg-secondary) !important;
  padding: 10px;
}

.option {
  display: flex;
  align-items: center;
  background-color: var(--bg-quaternary);
  padding: 10px;
  border-radius: 5px;
  justify-content: space-between;
}

.add-chars-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  transition: background-color 0.2s;
  background-color: #28a745;
  color: white;
  white-space: nowrap;
}

.add-chars-btn:hover {
  background-color: #218838;
}

.custom-chars-controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.custom-chars-controls button {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  transition: background-color 0.2s;
}

.save-btn {
  background-color: #28a745;
  color: white;
}

.save-btn:hover {
  background-color: #218838;
}

.export-btn {
  background-color: #ffc107;
  color: #212529;
}

.export-btn:hover {
  background-color: #e0a800;
}

@media (prefers-color-scheme: dark) {
  .export-btn {
    background-color: #d4a017;
    color: #ffffff;
  }
  
  .export-btn:hover {
    background-color: #b89015;
  }
}

.import-btn {
  background-color: #6f42c1;
  color: white;
}

.import-btn:hover {
  background-color: #5a32a3;
}

.saved-lists-header {
  padding: 8px 0;
  border-bottom: 1px solid var(--border-lighter);
}

.saved-lists-header h4 {
  margin: 0;
  font-size: 1em;
  color: var(--text-tertiary);
}

.saved-lists-toggle {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  color: var(--text-muted);
  font-size: 0.9em;
  padding: 4px 0;
}

.saved-lists-toggle:hover {
  color: var(--text-tertiary);
}

.saved-lists-empty {
  color: var(--text-muted);
  font-style: italic;
  font-size: 0.9em;
  padding: 10px 0;
}

.toggle-icon {
  transition: transform 0.3s ease;
  font-size: 1.2em;
  color: var(--text-muted);
}

.toggle-icon.rotated {
  transform: rotate(0.5turn);
}

.saved-lists-content {
  max-height: 200px;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.saved-lists-content.collapsed {
  max-height: 0;
}

.saved-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-lighter);
  border-radius: 4px;
  margin-top: 8px;
}

.saved-list-item button {
  padding: 4px 8px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.8em;
}

.load-list-btn {
  background-color: #007bff;
  color: white;
}

.delete-list-btn {
  background-color: #dc3545;
  color: white;
}

.material-icons {
  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
}

.db-url-section {
  padding: 20px;
  background-color: var(--db-section-bg);
  border-radius: 8px;
  border: 1px solid var(--db-section-border);
  box-shadow: 0 2px 8px var(--shadow-card);
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.db-url-section h3 {
  margin: 0;
  font-size: 1.1em;
  color: var(--db-section-text);
}

.db-url-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  box-sizing: border-box;
  width: 100%;
}

.db-url-input-group {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.db-url-input-group label {
  font-size: 0.9em;
  font-weight: 500;
  color: var(--text-tertiary);
}

.db-url-inputs input {
  padding: 8px;
  border: 1px solid var(--border-light);
  border-radius: 4px;
  font-size: 0.9em;
  width: 100%;
  box-sizing: border-box;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.db-url-output {
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-lighter);
  border-radius: 4px;
  padding: 10px;
  font-family: "JetBrains Mono", 'D2 coding', monospace;
  font-size: 0.9em;
  word-break: break-all;
  color: var(--text-primary);
}

.db-url-controls {
  display: flex;
  gap: 10px;
}

.db-url-controls button {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  transition: background-color 0.2s;
}

.generate-db-url-btn {
  background-color: #17a2b8;
  color: white;
}

.generate-db-url-btn:hover {
  background-color: #138496;
}

.copy-db-url-btn {
  background-color: #6c757d;
  color: white;
}

.copy-db-url-btn:hover {
  background-color: #5a6268;
}

.d-flex {
  display: flex;
}

.gap-2 {
  gap: .5rem;
}

.header-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.back-link {
  text-decoration: none;
  color: #007bff;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  transition: color 0.2s;
}

.back-link:hover {
  color: #0056b3;
}

@media (prefers-color-scheme: dark) {
  .back-link {
    color: #4da6ff;
  }
  
  .back-link:hover {
    color: #66b3ff;
  }
}

.description {
  color: var(--text-quaternary);
  font-size: 0.9em;
  text-align: center;
  margin-bottom: 1rem;
  font-weight: 400;
}

.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #28a745;
  color: white;
  padding: 12px 20px;
  border-radius: 6px;
  box-shadow: 0 4px 12px var(--shadow-toast);
  z-index: 1000;
  opacity: 0;
  transform: translateX(100%);
  transition: all 0.3s ease;
  font-size: 0.9em;
  font-weight: 500;
}

.toast.show {
  opacity: 1;
  transform: translateX(0);
}

.pwa-install-button {
  background: #28a745;
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
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
  transition: all 0.2s ease;
}

.pwa-install-button:hover {
  background: #218838;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
}

.pwa-install-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
}

@media (max-aspect-ratio: 4/3) {
  .wrapper {
    justify-content: center;
    flex-direction: column;
    flex-wrap: wrap;
    align-items: center;
  }
  .option {
    align-content: center;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
  }
  .custom-chars-controls {
    justify-content: center;
  }
}
</style>
