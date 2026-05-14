<template>
  <div class="min-h-screen flex items-center justify-center p-5 bg-linear-to-br from-indigo-500 to-purple-600">
    <router-link
      to="/"
      class="fixed top-5 left-5 flex items-center gap-2 px-5 py-3 rounded-full bg-white/90 text-gray-800 font-medium text-sm no-underline shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 z-10"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9,22 9,12 15,12 15,22"/>
      </svg>
      App List
    </router-link>

    <div class="w-full max-w-[800px] bg-white rounded-[20px] shadow-2xl p-10 text-center">
      <h1 class="text-gray-800 text-3xl font-bold mb-8">🖼️ Clipboard Image Saver</h1>

      <div class="flex flex-wrap gap-3 justify-center mb-6">
        <button
          @click="pasteFromClipboard"
          class="py-3 px-6 rounded-full bg-linear-to-r from-indigo-500 to-purple-600 text-white font-base border-none cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
        >
          📋 Paste from Clipboard
        </button>
        <button
          @click="openFilePicker"
          class="py-3 px-6 rounded-full bg-linear-to-r from-blue-500 to-cyan-500 text-white font-base border-none cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
        >
          📁 Select Files
        </button>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          multiple
          class="hidden"
          @change="handleFileSelect"
        >
      </div>

      <div
        class="min-h-[200px] my-6 flex items-center justify-center relative rounded-xl border-2 border-dashed transition-all"
        :class="dropZoneClass"
        @dragenter.prevent="onDragEnter"
        @dragover.prevent="onDragOver"
        @dragleave.prevent="onDragLeave"
        @drop.prevent="onDrop"
      >
        <div v-if="images.length === 0" class="text-gray-500 text-lg p-8 select-none pointer-events-none">
          <div class="text-5xl mb-4">📂</div>
          <p>Drag & drop images here,<br>paste from clipboard, or select files</p>
          <p class="text-sm text-gray-400 mt-2">Ctrl+V to paste</p>
        </div>

        <div v-else class="w-full p-4">
          <div class="flex items-center justify-between mb-4 px-1">
            <span class="text-sm text-gray-600 font-medium">
              {{ selectedCount }} / {{ images.length }} selected
            </span>
            <div class="flex gap-2">
              <button
                @click="selectAll"
                class="text-xs px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-700 border-none cursor-pointer hover:bg-indigo-200 transition-colors"
              >
                Select All
              </button>
              <button
                @click="deselectAll"
                class="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 border-none cursor-pointer hover:bg-gray-200 transition-colors"
              >
                Deselect All
              </button>
              <button
                @click="removeSelected"
                :disabled="selectedCount === 0"
                class="text-xs px-3 py-1.5 rounded-full border-none cursor-pointer transition-colors"
                :class="selectedCount > 0 ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-gray-100 text-gray-400 pointer-events-none'"
              >
                Remove Selected
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <div
              v-for="img in images"
              :key="img.id"
              class="relative group rounded-lg overflow-hidden border-2 transition-all cursor-pointer aspect-square"
              :class="img.selected ? 'border-indigo-500 shadow-md ring-2 ring-indigo-200' : 'border-gray-200 hover:border-gray-400'"
              @click="toggleSelect(img.id)"
            >
              <img
                :src="img.url"
                :alt="img.name"
                class="w-full h-full object-cover"
              >
              <div
                class="absolute top-2 left-2 w-6 h-6 rounded-md flex items-center justify-center transition-all shadow-sm"
                :class="img.selected ? 'bg-indigo-500' : 'bg-white/80 group-hover:bg-white'"
              >
                <svg v-if="img.selected" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
              </div>
              <div class="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-2 py-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                {{ img.name }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-center gap-5 mb-6">
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

      <div class="flex flex-wrap gap-3 justify-center">
        <button
          @click="downloadSelected"
          :disabled="selectedCount === 0 || isConverting"
          class="py-4 px-10 rounded-full text-lg border-none cursor-pointer transition-all"
          :class="selectedCount > 0 && !isConverting ? 'bg-linear-to-r from-green-500 to-green-600 text-white hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0' : 'bg-linear-to-r from-green-500 to-green-600 text-white opacity-50 pointer-events-none'"
        >
          <span v-if="isConverting">⏳ Converting... ({{ convertProgress }}/{{ selectedCount }})</span>
          <span v-else>💾 Download Selected ({{ selectedCount }})</span>
        </button>
      </div>

      <div v-if="errorMessage" class="mt-5 p-2.5 rounded-lg bg-red-100 text-red-600">
        {{ errorMessage }}
      </div>

      <div class="mt-5 p-2.5 text-sm text-gray-600 rounded-lg bg-sky-50">
        💡 Tip: Clipboard feature requires HTTPS or localhost.
      </div>
    </div>

    <a ref="downloadLink" :href="downloadUrl" :download="downloadFilename" class="hidden"></a>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';

let nextId = 0;

const images = ref([]);
const isWebP = ref(false);
const errorMessage = ref('');
const isDragging = ref(false);
const isConverting = ref(false);
const convertProgress = ref(0);
const downloadLink = ref(null);
const downloadUrl = ref('');
const downloadFilename = ref('');
const fileInput = ref(null);

const selectedCount = computed(() => images.value.filter(img => img.selected).length);

const dropZoneClass = computed(() => {
  if (isDragging.value) return 'border-indigo-500 bg-indigo-100/60 scale-[1.01]';
  if (images.value.length > 0) return 'border-indigo-500 bg-indigo-50/50';
  return 'border-gray-300';
});

function addImages(blobs) {
  for (const blob of blobs) {
    if (!blob.type.startsWith('image/')) continue;
    const url = URL.createObjectURL(blob);
    images.value.push({
      id: nextId++,
      blob,
      url,
      name: blob.name || `image-${nextId}`,
      selected: true,
    });
  }
  hideError();
}

function toggleSelect(id) {
  const img = images.value.find(i => i.id === id);
  if (img) img.selected = !img.selected;
}

function selectAll() {
  images.value.forEach(img => img.selected = true);
}

function deselectAll() {
  images.value.forEach(img => img.selected = false);
}

function removeSelected() {
  const toRemove = images.value.filter(img => img.selected);
  toRemove.forEach(img => URL.revokeObjectURL(img.url));
  images.value = images.value.filter(img => !img.selected);
}

async function pasteFromClipboard() {
  try {
    if (!navigator.clipboard || !navigator.clipboard.read) {
      showError('This browser does not support the Clipboard API.');
      return;
    }

    const clipboardItems = await navigator.clipboard.read();
    let imageFound = false;

    for (const clipboardItem of clipboardItems) {
      for (const type of clipboardItem.types) {
        if (type.startsWith('image/')) {
          const blob = await clipboardItem.getType(type);
          addImages([blob]);
          imageFound = true;
          break;
        }
      }
      if (imageFound) break;
    }

    if (!imageFound) {
      showError('No image found in clipboard.');
    }
  } catch (error) {
    console.error('Clipboard read error:', error);
    showError('Cannot read clipboard. Please check permissions.');
  }
}

function openFilePicker() {
  fileInput.value?.click();
}

function handleFileSelect(e) {
  const files = Array.from(e.target.files || []);
  if (files.length === 0) return;
  addImages(files);
  e.target.value = '';
}

function onDragEnter() {
  isDragging.value = true;
}

function onDragOver() {
  isDragging.value = true;
}

function onDragLeave(e) {
  if (!e.currentTarget.contains(e.relatedTarget)) {
    isDragging.value = false;
  }
}

function onDrop(e) {
  isDragging.value = false;
  const files = Array.from(e.dataTransfer?.files || []);
  const imageFiles = files.filter(f => f.type.startsWith('image/'));

  if (imageFiles.length === 0) {
    showError('No image files detected in the dropped items.');
    return;
  }
  addImages(imageFiles);
}

function convertBlob(blob, format) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((result) => {
        URL.revokeObjectURL(img.src);
        if (result) resolve(result);
        else reject(new Error('Canvas toBlob failed'));
      }, `image/${format}`, 0.95);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Image load failed'));
    };
    img.src = URL.createObjectURL(blob);
  });
}

async function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  downloadUrl.value = url;
  downloadFilename.value = filename;
  await nextTick();
  downloadLink.value?.click();
  await new Promise(r => setTimeout(r, 150));
  URL.revokeObjectURL(url);
  downloadUrl.value = '';
  downloadFilename.value = '';
}

async function downloadSelected() {
  const selected = images.value.filter(img => img.selected);
  if (selected.length === 0) {
    showError('No images selected.');
    return;
  }

  const format = isWebP.value ? 'webp' : 'png';
  isConverting.value = true;
  convertProgress.value = 0;

  try {
    for (let i = 0; i < selected.length; i++) {
      const img = selected[i];
      const converted = await convertBlob(img.blob, format);
      const baseName = img.name.replace(/\.[^.]+$/, '') || `image-${i + 1}`;
      await triggerDownload(converted, `${baseName}.${format}`);
      convertProgress.value = i + 1;
    }
  } catch (error) {
    console.error('Conversion error:', error);
    showError('Error occurred during image conversion.');
  } finally {
    isConverting.value = false;
    convertProgress.value = 0;
  }
}

function showError(message) {
  errorMessage.value = message;
}

function hideError() {
  errorMessage.value = '';
}

function handleKeyDown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
    e.preventDefault();
    pasteFromClipboard();
  }
}

function handlePaste(e) {
  const files = Array.from(e.clipboardData?.files || []);
  const imageFiles = files.filter(f => f.type.startsWith('image/'));
  if (imageFiles.length > 0) {
    e.preventDefault();
    addImages(imageFiles);
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('paste', handlePaste);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('paste', handlePaste);
  images.value.forEach(img => URL.revokeObjectURL(img.url));
});
</script>
