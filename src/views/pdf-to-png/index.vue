<template>
  <div class="pdf-to-png">
    <router-link to="/" class="home-button">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9,22 9,12 15,12 15,22"/>
      </svg>
      앱 목록
    </router-link>

    <div class="pdf-to-png-container">
      <header class="pdf-to-png-header">
        <div class="header-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="M21 15l-5-5L5 21"/>
          </svg>
        </div>
        <h1>PDF to PNG <span class="highlight">Converter</span></h1>
        <p class="subtitle">
          강력한 로컬 엔진을 사용하여 PDF의 모든 페이지를 고화질 PNG 이미지로 즉시 변환합니다.
          모든 처리는 브라우저 내부에서 이루어지며 파일은 서버로 전송되지 않습니다.
        </p>
      </header>

      <main class="pdf-to-png-main">
        <div
          class="upload-zone"
          :class="{ 'has-file': files }"
          @click="triggerFileInput"
          @dragover.prevent
          @drop.prevent="onDrop"
        >
          <input
            ref="fileInputRef"
            type="file"
            accept="application/pdf"
            class="hidden-input"
            @change="onFileChange"
          />
          <div class="upload-content">
            <div class="upload-icon" :class="{ 'has-file': files }">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <div>
              <p class="upload-text">{{ files ? files.name : 'PDF 파일을 여기에 드롭하거나 클릭하세요' }}</p>
              <p class="upload-hint">최대 50MB까지 지원 (로컬 처리)</p>
            </div>
          </div>
        </div>

        <div v-if="error" class="error-message">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{{ error }}</span>
        </div>

        <div v-if="isConverting || progress > 0" class="progress-section">
          <div class="progress-header">
            <div class="progress-status">
              <svg
                v-if="isConverting"
                class="spinner"
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
              <span class="status-text">{{ statusMessage }}</span>
            </div>
            <span class="progress-badge">{{ progress }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progress + '%' }"></div>
          </div>
        </div>

        <div v-if="convertedImages.length > 0 && !isConverting" class="download-all">
          <button class="download-btn" @click="downloadAll">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            모든 페이지 저장하기 ({{ convertedImages.length }})
          </button>
        </div>

        <div v-if="convertedImages.length > 0" class="preview-section">
          <div class="preview-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <h3>변환된 이미지 미리보기</h3>
          </div>
          <div class="preview-grid">
            <div
              v-for="img in convertedImages"
              :key="img.id"
              class="preview-card"
            >
              <div class="preview-img-wrap">
                <img :src="img.url" :alt="'Page ' + img.id" class="preview-img" />
              </div>
              <div class="preview-overlay">
                <div class="overlay-badge">Page {{ img.id }}</div>
                <button
                  class="overlay-btn"
                  @click="downloadSingle(img.url, img.name)"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  다운로드
                </button>
              </div>
              <div class="preview-footer">
                <p class="preview-filename">{{ img.name }}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer class="pdf-to-png-footer">
        <p>© 2024 PDF to PNG Studio. 데이터 보안을 위해 모든 처리는 귀하의 장치에서 로컬로 수행됩니다.</p>
      </footer>
    </div>

    <canvas ref="canvasRef" class="hidden-canvas"></canvas>
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

<style scoped>
.pdf-to-png {
  min-height: 100vh;
  background: #f8fafc;
  color: #0f172a;
}

.home-button {
  position: fixed;
  top: 20px;
  left: calc(50% - 500px + 20px);
  max-width: 1000px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 6px;
  background: rgba(79, 70, 229, 0.1);
  color: #4338ca;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  z-index: 1000;
}

.home-button:hover {
  background: rgba(79, 70, 229, 0.15);
}

.pdf-to-png-container {
  max-width: 64rem;
  margin: 0 auto;
  padding: 4rem 1.5rem;
}

.pdf-to-png-header {
  text-align: center;
  margin-bottom: 4rem;
}

.header-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  background: #4f46e5;
  border-radius: 1rem;
  box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.2);
  margin-bottom: 0.5rem;
  color: white;
}

.pdf-to-png-header h1 {
  font-size: 2.25rem;
  font-weight: 900;
  letter-spacing: -0.025em;
  margin: 0 0 1rem;
}

.highlight {
  color: #4f46e5;
}

.subtitle {
  font-size: 1.125rem;
  color: #64748b;
  max-width: 42rem;
  margin: 0 auto;
  line-height: 1.6;
}

.pdf-to-png-main {
  background: white;
  border-radius: 1.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  border: 1px solid #f1f5f9;
}

.upload-zone {
  border: 2px dashed #e2e8f0;
  border-radius: 1rem;
  padding: 4rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-zone:hover,
.upload-zone.has-file {
  border-color: #c7d2fe;
  background: rgba(238, 242, 255, 0.5);
}

.upload-zone.has-file {
  background: rgba(238, 242, 255, 0.3);
}

.hidden-input {
  display: none;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-icon {
  padding: 1rem;
  border-radius: 9999px;
  background: #f1f5f9;
  color: #94a3b8;
  transition: transform 0.2s;
}

.upload-zone:hover .upload-icon,
.upload-icon.has-file {
  background: #e0e7ff;
  color: #4f46e5;
  transform: scale(1.1);
}

.upload-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.upload-hint {
  color: #94a3b8;
  font-size: 0.875rem;
  margin: 0.25rem 0 0;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  padding: 1rem;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 0.75rem;
  border: 1px solid #fee2e2;
}

.progress-section {
  margin-top: 2.5rem;
}

.progress-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.progress-status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.status-text {
  font-weight: 600;
  color: #334155;
}

.progress-badge {
  font-size: 0.875rem;
  font-weight: 900;
  color: #4f46e5;
  background: #eef2ff;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
}

.progress-bar {
  height: 0.75rem;
  background: #f1f5f9;
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #4f46e5;
  transition: width 0.3s ease-out;
}

.download-all {
  margin-top: 2.5rem;
  display: flex;
  justify-content: center;
}

.download-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #4f46e5;
  color: white;
  padding: 1rem 2.5rem;
  border-radius: 1rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.2);
  transition: all 0.2s;
}

.download-btn:hover {
  background: #4338ca;
}

.download-btn:active {
  transform: scale(0.98);
}

.preview-section {
  margin-top: 4rem;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  color: #94a3b8;
}

.preview-header h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 2rem;
}

@media (min-width: 640px) {
  .preview-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .preview-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.preview-card {
  position: relative;
  background: white;
  border: 1px solid #f1f5f9;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s;
}

.preview-card:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.preview-img-wrap {
  aspect-ratio: 3/4;
  overflow: hidden;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 0.5rem;
}

.preview-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  opacity: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  transition: opacity 0.2s;
}

.preview-card:hover .preview-overlay {
  opacity: 1;
}

.overlay-badge {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(12px);
  padding: 0.375rem 1rem;
  border-radius: 9999px;
  color: white;
  font-weight: 700;
  font-size: 0.875rem;
}

.overlay-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  color: #4f46e5;
  padding: 0.625rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.overlay-btn:hover {
  background: #eef2ff;
}

.overlay-btn:active {
  transform: scale(0.98);
}

.preview-footer {
  padding: 1rem;
  background: rgba(248, 250, 252, 0.5);
  border-top: 1px solid #f1f5f9;
  text-align: center;
}

.preview-filename {
  font-size: 0.75rem;
  font-weight: 500;
  color: #64748b;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 0.5rem;
}

.pdf-to-png-footer {
  margin-top: 5rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
  text-align: center;
}

.pdf-to-png-footer p {
  font-size: 0.875rem;
  color: #94a3b8;
  margin: 0;
}

.hidden-canvas {
  position: absolute;
  left: -9999px;
  top: -9999px;
  pointer-events: none;
}

@media (max-width: 1100px) {
  .home-button {
    left: 20px;
  }
}
</style>
