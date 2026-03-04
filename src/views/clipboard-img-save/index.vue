<template>
  <div class="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-indigo-500 to-purple-600">
    <router-link
      to="/"
      class="fixed top-5 left-5 flex items-center gap-2 px-5 py-3 rounded-full bg-white/90 text-gray-800 font-medium text-sm no-underline shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 z-10"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9,22 9,12 15,12 15,22"/>
      </svg>
      앱 목록
    </router-link>

    <div class="w-full max-w-[600px] bg-white rounded-[20px] shadow-2xl p-10 text-center">
      <h1 class="text-gray-800 text-3xl font-bold mb-8">🖼️ 클립보드 이미지 저장기</h1>

      <button
        @click="pasteFromClipboard"
        class="w-full py-4 px-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-base border-none cursor-pointer mb-8 transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
      >
        📋 클립보드에서 이미지 가져오기
      </button>

      <div
        class="min-h-[200px] my-8 flex items-center justify-center relative rounded-xl border-2 border-dashed transition-all"
        :class="currentImageData ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-300'"
      >
        <div v-if="!currentImageData" class="text-gray-500 text-lg">
          이미지를 클립보드에 복사한 후 위 버튼을 클릭하세요
        </div>
        <img v-if="imageUrl" :src="imageUrl" alt="클립보드 이미지" class="max-w-full max-h-[400px] rounded-lg shadow-md">
      </div>

      <div class="flex items-center justify-center gap-5 mb-8">
        <div class="flex items-center gap-2.5">
          <span class="font-bold text-gray-800">PNG</span>
          <label class="relative inline-block w-[60px] h-[30px] cursor-pointer">
            <input type="checkbox" v-model="isWebP" class="sr-only peer">
            <span class="absolute inset-0 bg-gray-300 rounded-full transition-colors peer-checked:bg-indigo-500"></span>
            <span class="absolute left-1 bottom-1 w-[22px] h-[22px] bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-[30px] pointer-events-none"></span>
          </label>
          <span class="font-bold text-gray-800">WEBP</span>
        </div>
      </div>

      <button
        @click="saveImage"
        :disabled="!currentImageData"
        class="w-full py-4 px-10 rounded-full text-lg border-none cursor-pointer transition-all"
        :class="currentImageData ? 'bg-gradient-to-r from-green-500 to-green-600 text-white opacity-100 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0' : 'bg-gradient-to-r from-green-500 to-green-600 text-white opacity-50 pointer-events-none'"
      >
        💾 이미지 저장하기
      </button>

      <div v-if="errorMessage" class="mt-5 p-2.5 rounded-lg bg-red-100 text-red-600">
        {{ errorMessage }}
      </div>

      <div class="mt-5 p-2.5 text-sm text-gray-600 rounded-lg bg-sky-50">
        💡 팁: 이 기능은 HTTPS 또는 localhost 환경에서만 작동합니다.
      </div>
    </div>
    
    <a ref="downloadLink" :href="downloadUrl" :download="downloadFilename" class="hidden"></a>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';

const currentImageData = ref(null);
const imageUrl = ref(null);
const isWebP = ref(false);
const errorMessage = ref('');
const downloadLink = ref(null);
const downloadUrl = ref('');
const downloadFilename = ref('');

async function pasteFromClipboard() {
  try {
    if (!navigator.clipboard || !navigator.clipboard.read) {
      showError('클립보드 API를 지원하지 않는 브라우저입니다.');
      return;
    }

    const clipboardItems = await navigator.clipboard.read();

    let imageFound = false;
    for (const clipboardItem of clipboardItems) {
      for (const type of clipboardItem.types) {
        if (type.startsWith('image/')) {
          const blob = await clipboardItem.getType(type);
          displayImage(blob);
          imageFound = true;
          break;
        }
      }
      if (imageFound) break;
    }

    if (!imageFound) {
      showError('클립보드에 이미지가 없습니다.');
    }

  } catch (error) {
    console.error('클립보드 읽기 오류:', error);
    showError('클립보드에서 이미지를 가져올 수 없습니다. 권한을 확인해주세요.');
  }
}

function displayImage(blob) {
  if (imageUrl.value) {
    URL.revokeObjectURL(imageUrl.value);
  }
  
  imageUrl.value = URL.createObjectURL(blob);
  currentImageData.value = blob;
  hideError();
}

async function saveImage() {
  if (!currentImageData.value) {
    showError('저장할 이미지가 없습니다.');
    return;
  }

  try {
    const format = isWebP.value ? 'webp' : 'png';

    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = function() {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(function(blob) {
        const url = URL.createObjectURL(blob);
        downloadUrl.value = url;
        downloadFilename.value = `${Date.now()}.${format}`;
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
      }, `image/${format}`, 0.95);
    };

    img.src = URL.createObjectURL(currentImageData.value);

  } catch (error) {
    console.error('이미지 저장 오류:', error);
    showError('이미지 저장 중 오류가 발생했습니다.');
  }
}

function showError(message) {
  errorMessage.value = message;
}

function hideError() {
  errorMessage.value = '';
}

function handleKeyDown(e) {
  if (e.ctrlKey && e.key === 'v') {
    e.preventDefault();
    pasteFromClipboard();
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
  if (imageUrl.value) {
    URL.revokeObjectURL(imageUrl.value);
  }
});
</script>
