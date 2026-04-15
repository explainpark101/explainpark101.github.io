<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <router-link
      to="/"
      class="fixed top-5 left-[max(20px,calc(50%-500px+20px))] max-w-[1000px] inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-indigo-500/10 text-indigo-700 font-medium no-underline transition-all hover:bg-indigo-500/15 z-[1000]"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9,22 9,12 15,12 15,22"/>
      </svg>
      앱 목록
    </router-link>

    <div class="max-w-4xl mx-auto py-16 px-6">
      <header class="text-center mb-16">
        <div class="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/20 mb-2 text-white">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="M21 15l-5-5L5 21"/>
          </svg>
        </div>
        <h1 class="text-4xl font-black tracking-tight m-0 mb-4">PDF to PNG <span class="text-indigo-600">Converter</span></h1>
        <p class="text-lg text-slate-500 max-w-[42rem] mx-auto leading-relaxed">
          강력한 로컬 엔진을 사용하여 PDF의 모든 페이지를 고화질 PNG 이미지로 즉시 변환합니다.
          모든 처리는 브라우저 내부에서 이루어지며 파일은 서버로 전송되지 않습니다.
        </p>
      </header>

      <main class="bg-white rounded-3xl shadow-2xl p-8 border border-slate-100">
        <div
          class="border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all"
          :class="files ? 'border-indigo-300 bg-indigo-50/30' : 'border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50'"
          @click="triggerFileInput"
          @dragover.prevent
          @drop.prevent="onDrop"
        >
          <input ref="fileInputRef" type="file" accept="application/pdf" class="hidden" @change="onFileChange" />
          <div class="flex flex-col items-center gap-4">
            <div
              class="p-4 rounded-full transition-transform"
              :class="files ? 'bg-indigo-100 text-indigo-600 scale-110' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'"
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <div>
              <p class="text-xl font-bold text-slate-800 m-0">{{ files ? files.name : 'PDF 파일을 여기에 드롭하거나 클릭하세요' }}</p>
              <p class="text-slate-400 text-sm mt-1 m-0">최대 50MB까지 지원 (로컬 처리)</p>
            </div>
          </div>
        </div>

        <div v-if="error" class="flex items-center gap-2 mt-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{{ error }}</span>
        </div>

        <div v-if="isConverting || progress > 0" class="mt-10">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-3">
              <svg
                v-if="isConverting"
                class="w-5 h-5 animate-spin"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M21 12a9 9 0 11-6.22-8.56"/>
              </svg>
              <svg
                v-else
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <span class="font-semibold text-slate-700">{{ statusMessage }}</span>
            </div>
            <span class="text-sm font-black text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">{{ progress }}%</span>
          </div>
          <div class="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div class="h-full bg-indigo-600 transition-all duration-300 ease-out" :style="{ width: progress + '%' }"></div>
          </div>
        </div>

        <div v-if="convertedImages.length > 0 && !isConverting" class="mt-10 flex justify-center">
          <button
            @click="downloadAll"
            class="flex items-center gap-3 bg-indigo-600 text-white py-4 px-10 rounded-2xl font-bold border-none cursor-pointer shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-700 active:scale-[0.98]"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            모든 페이지 저장하기 ({{ convertedImages.length }})
          </button>
        </div>

        <div v-if="convertedImages.length > 0" class="mt-16">
          <div class="flex items-center gap-2 mb-6 text-slate-400">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <h3 class="text-lg font-bold text-slate-800 m-0">변환된 이미지 미리보기</h3>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div
              v-for="img in convertedImages"
              :key="img.id"
              class="relative bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm transition-shadow hover:shadow-xl group"
            >
              <div class="aspect-[3/4] overflow-hidden bg-slate-50 flex items-center justify-center">
                <img :src="img.url" :alt="'Page ' + img.id" class="w-full h-full object-contain p-2" />
              </div>
              <div class="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-3 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                <div class="bg-white/20 backdrop-blur-xl px-4 py-1.5 rounded-full text-white font-bold text-sm">Page {{ img.id }}</div>
                <div class="flex flex-col gap-2 w-[min(100%,220px)] px-2">
                  <button
                    type="button"
                    @click.stop="downloadSingle(img.url, img.name)"
                    class="flex items-center justify-center gap-2 bg-white text-indigo-600 py-2 px-4 rounded-xl font-bold border-none cursor-pointer shadow-lg transition-all hover:bg-indigo-50 active:scale-[0.98] text-sm"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    다운로드
                  </button>
                  <button
                    type="button"
                    @click.stop="copyImageToClipboard(img.url)"
                    class="flex items-center justify-center gap-2 bg-white/95 text-slate-800 py-2 px-4 rounded-xl font-bold border-none cursor-pointer shadow-lg transition-all hover:bg-white active:scale-[0.98] text-sm"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                    클립보드에 복사
                  </button>
                  <button
                    type="button"
                    @click.stop="openPreviewModal(img)"
                    class="flex items-center justify-center gap-2 bg-white/95 text-slate-800 py-2 px-4 rounded-xl font-bold border-none cursor-pointer shadow-lg transition-all hover:bg-white active:scale-[0.98] text-sm"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="M21 21l-4.3-4.3"/>
                      <line x1="11" y1="8" x2="11" y2="14"/>
                      <line x1="8" y1="11" x2="14" y2="11"/>
                    </svg>
                    크게 보기
                  </button>
                  <button
                    type="button"
                    @click.stop="openPreviewNewTab(img.url)"
                    class="flex items-center justify-center gap-2 bg-white/95 text-slate-800 py-2 px-4 rounded-xl font-bold border-none cursor-pointer shadow-lg transition-all hover:bg-white active:scale-[0.98] text-sm"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <polyline points="15 3 21 3 21 9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                    새 탭에서 미리보기
                  </button>
                </div>
              </div>
              <div class="p-3 bg-slate-50/50 border-t border-slate-100">
                <p class="text-xs font-medium text-slate-500 m-0 mb-2 overflow-hidden text-ellipsis whitespace-nowrap px-1 text-center">{{ img.name }}</p>
                <div class="flex flex-wrap items-center justify-center gap-1.5">
                  <button
                    type="button"
                    @click="downloadSingle(img.url, img.name)"
                    class="inline-flex items-center gap-1 rounded-lg bg-indigo-600 text-white text-[11px] font-bold px-2.5 py-1.5 border-none cursor-pointer hover:bg-indigo-700"
                    title="다운로드"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    저장
                  </button>
                  <button
                    type="button"
                    @click="copyImageToClipboard(img.url)"
                    class="inline-flex items-center gap-1 rounded-lg bg-slate-200 text-slate-800 text-[11px] font-bold px-2.5 py-1.5 border-none cursor-pointer hover:bg-slate-300"
                    title="클립보드에 복사"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                    복사
                  </button>
                  <button
                    type="button"
                    @click="openPreviewModal(img)"
                    class="inline-flex items-center gap-1 rounded-lg bg-slate-200 text-slate-800 text-[11px] font-bold px-2.5 py-1.5 border-none cursor-pointer hover:bg-slate-300"
                    title="크게 보기"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="M21 21l-4.3-4.3"/>
                      <line x1="11" y1="8" x2="11" y2="14"/>
                      <line x1="8" y1="11" x2="14" y2="11"/>
                    </svg>
                    확대
                  </button>
                  <button
                    type="button"
                    @click="openPreviewNewTab(img.url)"
                    class="inline-flex items-center gap-1 rounded-lg bg-slate-200 text-slate-800 text-[11px] font-bold px-2.5 py-1.5 border-none cursor-pointer hover:bg-slate-300"
                    title="새 탭에서 미리보기"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <polyline points="15 3 21 3 21 9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                    새 탭
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer class="mt-20 pt-8 border-t border-slate-200 text-center">
        <p class="text-sm text-slate-400 m-0">© 2024 PDF to PNG Studio. 데이터 보안을 위해 모든 처리는 귀하의 장치에서 로컬로 수행됩니다.</p>
      </footer>
    </div>

    <canvas ref="canvasRef" class="absolute -left-[9999px] -top-[9999px] pointer-events-none"></canvas>

    <div
      v-if="copyToast"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[2100] px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium shadow-lg pointer-events-none"
      role="status"
    >
      {{ copyToast }}
    </div>

    <Teleport to="body">
      <div
        v-if="previewModal"
        class="fixed inset-0 z-[2000] overflow-y-auto bg-slate-950/85 p-2 sm:p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-label="이미지 크게 보기"
        @click.self="closePreviewModal"
      >
        <div class="flex min-h-full items-center justify-center">
          <div class="relative my-2 flex w-full max-w-[96vw] flex-col items-center gap-3">
            <button
              type="button"
              class="absolute right-2 top-2 z-20 flex h-10 w-10 items-center justify-center rounded-full border-none bg-white text-slate-800 shadow-lg cursor-pointer hover:bg-slate-100"
              aria-label="닫기"
              @click="closePreviewModal"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <div class="relative flex w-full items-center justify-center px-11 sm:px-14">
              <button
                type="button"
                class="absolute left-0 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border-none bg-white/95 text-slate-800 shadow-lg cursor-pointer hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="!canGoPrevPage"
                aria-label="이전 페이지 (←)"
                @click="goToPreviousPage"
              >
                ←
              </button>
              <img
                :src="previewModal.url"
                :alt="previewModal.alt"
                class="h-auto max-h-[calc(100vh-220px)] w-auto max-w-[96vw] rounded-lg object-contain shadow-2xl ring-1 ring-white/10"
              />
              <button
                type="button"
                class="absolute right-0 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border-none bg-white/95 text-slate-800 shadow-lg cursor-pointer hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="!canGoNextPage"
                aria-label="다음 페이지 (→)"
                @click="goToNextPage"
              >
                →
              </button>
            </div>
            <p class="text-sm text-slate-300 m-0 text-center">
              {{ previewModal.name }} ({{ previewModal.id }} / {{ previewTotalPages }})
            </p>
            <div class="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 text-white text-sm font-bold px-3 py-2 border-none cursor-pointer hover:bg-indigo-700"
                @click="downloadSingle(previewModal.url, previewModal.name)"
              >
                이미지 저장
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg bg-white/95 text-slate-800 text-sm font-bold px-3 py-2 border-none cursor-pointer hover:bg-white"
                @click="copyImageToClipboard(previewModal.url)"
              >
                클립보드에 복사
              </button>
            </div>
            <p class="text-xs text-slate-400 m-0 text-center">키보드 단축키: ← / →</p>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const files = ref(null);
const isConverting = ref(false);
const progress = ref(0);
const convertedImages = ref([]);
const statusMessage = ref('');
const error = ref(null);

const fileInputRef = ref(null);
const canvasRef = ref(null);

/** @type {import('vue').Ref<{ id: number; url: string; name: string; alt: string } | null>} */
const previewModal = ref(null);
const previewIndex = ref(-1);
const copyToast = ref('');
let copyToastTimer = null;

const previewTotalPages = computed(() => convertedImages.value.length);
const canGoPrevPage = computed(() => previewIndex.value > 0);
const canGoNextPage = computed(() => previewIndex.value < convertedImages.value.length - 1);

function setPreviewModalByIndex(index) {
  const target = convertedImages.value[index];
  if (!target) {
    return;
  }
  previewIndex.value = index;
  previewModal.value = {
    id: target.id,
    url: target.url,
    name: target.name,
    alt: `Page ${target.id}`,
  };
}

function openPreviewModal(img) {
  const index = convertedImages.value.findIndex((item) => item.id === img.id);
  setPreviewModalByIndex(index >= 0 ? index : 0);
}

function closePreviewModal() {
  previewModal.value = null;
  previewIndex.value = -1;
}

function goToPreviousPage() {
  if (!canGoPrevPage.value) {
    return;
  }
  setPreviewModalByIndex(previewIndex.value - 1);
}

function goToNextPage() {
  if (!canGoNextPage.value) {
    return;
  }
  setPreviewModalByIndex(previewIndex.value + 1);
}

function onPreviewKeydown(e) {
  if (!previewModal.value) {
    return;
  }
  if (e.key === 'Escape') {
    closePreviewModal();
    return;
  }
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    goToPreviousPage();
    return;
  }
  if (e.key === 'ArrowRight') {
    e.preventDefault();
    goToNextPage();
  }
}

watch(previewModal, (v) => {
  document.body.style.overflow = v ? 'hidden' : '';
});

onMounted(() => {
  window.addEventListener('keydown', onPreviewKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onPreviewKeydown);
  document.body.style.overflow = '';
  if (copyToastTimer) {
    clearTimeout(copyToastTimer);
  }
});

async function copyImageToClipboard(dataUrl) {
  try {
    if (!navigator.clipboard?.write) {
      showError('이 브라우저에서는 클립보드 복사를 지원하지 않습니다.');
      return;
    }
    const blob = await (await fetch(dataUrl)).blob();
    const type = blob.type || 'image/png';
    await navigator.clipboard.write([new ClipboardItem({ [type]: blob })]);
    copyToast.value = '이미지가 클립보드에 복사되었습니다.';
    if (copyToastTimer) {
      clearTimeout(copyToastTimer);
    }
    copyToastTimer = setTimeout(() => {
      copyToast.value = '';
      copyToastTimer = null;
    }, 2200);
  } catch (err) {
    console.error(err);
    showError('클립보드에 복사하지 못했습니다. HTTPS 환경인지 확인해 주세요.');
  }
}

function openPreviewNewTab(url) {
  const w = window.open('', '_blank', 'noopener,noreferrer');
  if (!w) {
    showError('팝업이 차단되었습니다. 브라우저에서 팝업을 허용해 주세요.');
    return;
  }
  w.document.write(
    '<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>미리보기</title>',
  );
  w.document.write(
    '<style>body{margin:0;background:#0f172a;color:#e2e8f0;font-family:system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:16px;box-sizing:border-box;}img{max-width:100%;max-height:calc(100vh - 32px);width:auto;height:auto;object-fit:contain;border-radius:8px;}</style></head><body>',
  );
  w.document.write('<img src="' + url.replace(/"/g, '&quot;') + '" alt="미리보기"/>');
  w.document.write('</body></html>');
  w.document.close();
}

function triggerFileInput() {
  fileInputRef.value?.click();
}

function onFileChange(e) {
  const file = e.target.files[0];
  if (file && file.type === 'application/pdf') {
    handleFile(file);
  } else {
    showError('PDF 파일만 업로드할 수 있습니다.');
  }
}

function onDrop(e) {
  const file = e.dataTransfer.files[0];
  if (file && file.type === 'application/pdf') {
    handleFile(file);
  } else {
    showError('PDF 파일만 업로드할 수 있습니다.');
  }
}

function showError(msg) {
  error.value = msg;
  setTimeout(() => { error.value = null; }, 3000);
}

async function handleFile(file) {
  if (!pdfjsLib) {
    showError('라이브러리가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
    return;
  }

  files.value = file;
  isConverting.value = true;
  progress.value = 0;
  convertedImages.value = [];
  error.value = null;
  statusMessage.value = 'PDF 파일을 분석하는 중...';

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const totalPages = pdf.numPages;
    const pageDigits = String(totalPages).length;
    const baseName = file.name.replace(/\.pdf$/i, '');
    const images = [];

    for (let i = 1; i <= totalPages; i++) {
      statusMessage.value = `${totalPages}개 페이지 중 ${i}번째 변환 중...`;

      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });

      const canvas = canvasRef.value;
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      const dataUrl = canvas.toDataURL('image/png');
      const pageNumber = String(i).padStart(pageDigits, '0');
      images.push({
        id: i,
        url: dataUrl,
        name: `${baseName}_page_${pageNumber}.png`,
      });

      progress.value = Math.round((i / totalPages) * 100);
      convertedImages.value = [...images];
    }

    statusMessage.value = '변환 완료!';
    isConverting.value = false;
  } catch (err) {
    console.error(err);
    showError('PDF 변환 중 오류가 발생했습니다.');
    isConverting.value = false;
  }
}

async function downloadAll() {
  for (const img of convertedImages.value) {
    const link = document.createElement('a');
    link.href = img.url;
    link.download = img.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
}

function downloadSingle(url, name) {
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
}
</script>
