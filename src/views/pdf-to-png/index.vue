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
              <div class="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-4 transition-opacity">
                <div class="bg-white/20 backdrop-blur-xl px-4 py-1.5 rounded-full text-white font-bold text-sm">Page {{ img.id }}</div>
                <button
                  @click="downloadSingle(img.url, img.name)"
                  class="flex items-center gap-2 bg-white text-indigo-600 py-2.5 px-6 rounded-xl font-bold border-none cursor-pointer shadow-lg transition-all hover:bg-indigo-50 active:scale-[0.98]"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  다운로드
                </button>
              </div>
              <div class="p-4 bg-slate-50/50 border-t border-slate-100 text-center">
                <p class="text-xs font-medium text-slate-500 m-0 overflow-hidden text-ellipsis whitespace-nowrap px-2">{{ img.name }}</p>
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
  </div>
</template>

<script setup>
import { ref } from 'vue';
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
      images.push({
        id: i,
        url: dataUrl,
        name: `${file.name.replace('.pdf', '')}_page_${i}.png`,
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
