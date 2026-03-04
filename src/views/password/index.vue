<template>
  <div class="font-sans bg-[var(--background)] text-[var(--text-primary)] flex justify-center items-center min-h-screen m-0">
    <div class="bg-[var(--surface)] p-6 md:p-8 rounded-xl shadow-lg w-full max-w-6xl flex flex-col gap-4">
      <div class="flex justify-between items-center mb-5">
        <router-link to="/" class="text-[var(--primary-color)] font-medium inline-flex items-center transition-colors duration-200 hover:text-blue-700 dark:hover:text-blue-400 no-underline">
          ← 앱 목록
        </router-link>

        <div v-if="showPWAInstall" id="pwa-install-container">
          <button @click="installPWA" class="bg-green-600 text-white border-none py-2 px-4 rounded-md text-sm font-medium cursor-pointer inline-flex items-center gap-1.5 shadow-md shadow-green-600/30 transition-all duration-200 hover:bg-green-700 hover:-translate-y-px hover:shadow-lg hover:shadow-green-600/40 active:translate-y-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
            앱 설치
          </button>
        </div>
      </div>

      <h1 class="text-center text-[var(--text-primary)]">강력한 비밀번호 생성기</h1>
      <span class="text-[var(--text-secondary)] text-sm text-center mb-4 block">
        🔒 모든 데이터는 로컬에서만 처리되며, 인터넷 연결 없이도 완벽하게 작동합니다
      </span>
      
      <div class="flex flex-row gap-8 items-start max-md:flex-col max-md:items-center max-md:flex-wrap">
        <div class="flex-1 flex flex-col gap-2 min-w-0">
          <div class="flex items-center bg-[var(--surface)] p-4 rounded-lg shadow-md border border-[var(--border-color)]">
            <input type="text" v-model="passwordOutput" readonly class="flex-grow py-3 px-3 text-lg border border-[var(--border-color)] rounded-md bg-gray-100 dark:bg-gray-800 text-[var(--text-primary)] font-bold font-mono">
            <button @click="copyPassword" id="copyButton" class="ml-2.5 py-3 px-4 bg-blue-600 text-white border-none rounded-md cursor-pointer transition-colors duration-200 hover:bg-blue-800 inline-flex items-center gap-1">
              <span class="material-icons">{{ copyButtonIcon }}</span> {{ copyButtonText }}
            </button>
          </div>
          
          <div class="flex items-center gap-2.5 bg-[var(--surface)] p-4 rounded-lg shadow-md border border-[var(--border-color)]">
            <label for="lengthSlider">길이:</label>
            <input type="range" id="lengthSlider" v-model.number="length" min="1" max="64" @input="updateLength" class="flex-grow mx-2.5">
            <input type="number" v-model.number="length" min="1" max="64" @input="updateLengthFromInput" @wheel.prevent="handleLengthWheel" class="w-16 py-2 px-2 border border-[var(--border-color)] rounded-md text-center bg-[var(--surface)] text-[var(--text-primary)]">
          </div>
          
          <button @click="generatePassword" id="generateButton" class="w-full py-4 text-xl font-bold bg-green-600 text-white border-none rounded-lg cursor-pointer transition-all duration-200 shadow-md hover:bg-green-700 hover:shadow-lg">
            <span class="material-icons align-middle">rocket_launch</span> 생성하기
          </button>

          <div class="mt-5 p-5 bg-[var(--surface)] rounded-lg border border-[var(--border-color)] shadow-md flex flex-col gap-4">
            <h3 class="m-0 mb-2.5 text-lg text-[var(--text-secondary)]">사용자 정의 문자 목록</h3>
            <textarea v-model="customChars" placeholder="추가로 사용할 문자들을 입력하세요 (예: 한글, 이모지, 특수문자 등)" class="w-full min-h-[60px] max-h-[200px] py-2.5 px-2.5 border border-[var(--border-color)] rounded-md bg-[var(--surface)] text-[var(--text-primary)] font-mono resize-y overflow-y-auto box-border"></textarea>

            <div class="grid grid-cols-2 gap-4 bg-[var(--surface)] p-2.5">
              <div class="flex items-center bg-gray-100 dark:bg-gray-800 p-2.5 rounded-md justify-between" v-for="(charSet, key) in charSets" :key="key">
                <span>{{ charSetLabels[key] }}</span>
                <button class="py-1.5 px-3 border-none rounded cursor-pointer text-sm transition-colors duration-200 bg-green-600 text-white whitespace-nowrap hover:bg-green-700" @click="addChars(charSet)">
                  <span class="material-icons align-middle text-base">add</span> 추가
                </button>
              </div>
            </div>

            <div class="flex gap-2.5 flex-wrap justify-end">
              <button class="py-2 px-3 border-none rounded cursor-pointer text-sm transition-colors duration-200 bg-green-600 text-white hover:bg-green-700" @click="saveCustomChars">
                <span class="material-icons align-middle">save</span> 저장
              </button>
              <button class="py-2 px-3 border-none rounded cursor-pointer text-sm transition-colors duration-200 bg-amber-500 text-gray-900 hover:bg-amber-600 dark:bg-amber-600 dark:text-white dark:hover:bg-amber-700" @click="exportCustomChars">
                <span class="material-icons align-middle">file_download</span> 내보내기
              </button>
              <button class="py-2 px-3 border-none rounded cursor-pointer text-sm transition-colors duration-200 bg-purple-600 text-white hover:bg-purple-700" @click="triggerImport">
                <span class="material-icons align-middle">file_upload</span> 가져오기
              </button>
              <input type="file" ref="importFileInput" accept=".json" class="hidden" @change="handleImport">
            </div>

            <div>
              <div class="py-2 border-b border-[var(--border-color)]">
                <h4 class="m-0 text-base text-[var(--text-secondary)]">저장된 목록들</h4>
                <div v-if="savedListsCount > 0" class="flex items-center gap-1.5 cursor-pointer text-gray-500 text-sm py-1 hover:text-[var(--text-secondary)]" @click="toggleSavedLists">
                  <span class="material-icons transition-transform duration-300" :class="{ 'rotate-180': isSavedListsCollapsed }">{{ toggleIcon }}</span>
                  <span>{{ toggleText }}</span>
                </div>
                <div v-else class="text-gray-500 italic text-sm py-2.5">저장된 목록이 없습니다.</div>
              </div>
              <div class="max-h-[200px] overflow-hidden transition-[max-height] duration-300 ease-in-out" :class="{ 'max-h-0': isSavedListsCollapsed }">
                <div class="flex justify-between items-center py-2 px-3 bg-gray-100 dark:bg-gray-800 border border-[var(--border-color)] rounded mt-2" v-for="(list, name) in savedListsObj" :key="name">
                  <span>{{ name }}</span>
                  <div class="flex gap-2">
                    <button class="py-1 px-2 border-none rounded cursor-pointer text-xs bg-blue-600 text-white hover:bg-blue-700" @click="loadList(name)">
                      <span class="material-icons align-middle">folder_open</span> 불러오기
                    </button>
                    <button class="py-1 px-2 border-none rounded cursor-pointer text-xs bg-red-600 text-white hover:bg-red-700" @click="deleteList(name)">
                      <span class="material-icons align-middle">delete</span> 삭제
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex-1 flex flex-col gap-2 min-w-0">
          <div class="p-5 bg-cyan-50 dark:bg-cyan-950/40 rounded-lg border border-cyan-200 dark:border-cyan-800 shadow-md w-full box-border flex flex-col gap-4">
            <h3 class="m-0 text-lg text-cyan-800 dark:text-cyan-200"><span class="material-icons align-middle">link</span> PostgreSQL URL 생성</h3>
            <div class="grid grid-cols-2 gap-4 w-full box-border">
              <div class="flex flex-col w-full">
                <label for="dbHost" class="text-sm font-medium text-[var(--text-secondary)]">호스트</label>
                <input type="text" v-model="dbHost" placeholder="예: aws-0-us-east-1.pooler.supabase.com" class="py-2 px-2 border border-[var(--border-color)] rounded text-sm w-full box-border bg-[var(--surface)] text-[var(--text-primary)]">
              </div>
              <div class="flex flex-col w-full">
                <label for="dbPort" class="text-sm font-medium text-[var(--text-secondary)]">포트</label>
                <input type="text" v-model="dbPort" placeholder="예: 5432" class="py-2 px-2 border border-[var(--border-color)] rounded text-sm w-full box-border bg-[var(--surface)] text-[var(--text-primary)]">
              </div>
              <div class="flex flex-col w-full">
                <label for="dbUser" class="text-sm font-medium text-[var(--text-secondary)]">사용자명</label>
                <input type="text" v-model="dbUser" placeholder="예: postgres" class="py-2 px-2 border border-[var(--border-color)] rounded text-sm w-full box-border bg-[var(--surface)] text-[var(--text-primary)]">
              </div>
              <div class="flex flex-col w-full">
                <label for="dbName" class="text-sm font-medium text-[var(--text-secondary)]">데이터베이스명</label>
                <input type="text" v-model="dbName" placeholder="예: postgres" class="py-2 px-2 border border-[var(--border-color)] rounded text-sm w-full box-border bg-[var(--surface)] text-[var(--text-primary)]">
              </div>
            </div>
            <div class="bg-gray-100 dark:bg-gray-800 border border-[var(--border-color)] rounded py-2.5 px-2.5 font-mono text-sm break-all text-[var(--text-primary)]">{{ dbUrlOutput }}</div>
            <div class="flex gap-2.5">
              <button class="py-2 px-3 border-none rounded cursor-pointer text-sm transition-colors duration-200 bg-cyan-600 text-white hover:bg-cyan-700" @click="generateDbUrl">
                <span class="material-icons align-middle">link</span> URL 생성
              </button>
              <button class="py-2 px-3 border-none rounded cursor-pointer text-sm transition-colors duration-200 bg-gray-600 text-white hover:bg-gray-700" @click="copyDbUrl">
                <span class="material-icons align-middle">{{ copyDbUrlIcon }}</span> {{ copyDbUrlText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div :class="['fixed top-5 right-5 bg-green-600 text-white py-3 px-5 rounded-md shadow-lg z-[1000] text-sm font-medium transition-all duration-300', showToast ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full']">{{ toastMessage }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';

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
let d2codingFontLinkEl = null;

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
  d2codingFontLinkEl = document.createElement('link');
  d2codingFontLinkEl.href = 'http://cdn.jsdelivr.net/gh/joungkyun/font-d2coding/d2coding.css';
  d2codingFontLinkEl.rel = 'stylesheet';
  d2codingFontLinkEl.type = 'text/css';
  document.head.appendChild(d2codingFontLinkEl);

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

onBeforeUnmount(() => {
  if (d2codingFontLinkEl && d2codingFontLinkEl.parentNode) {
    d2codingFontLinkEl.parentNode.removeChild(d2codingFontLinkEl);
    d2codingFontLinkEl = null;
  }
});
</script>

<style>
@import url('https://cdn.jsdelivr.net/gh/toss/tossface/dist/tossface.css');
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Noto+Color+Emoji&display=swap');
</style>
