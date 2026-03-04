<template>
  <div class="font-sans bg-[var(--background)] pb-10 min-h-screen">
    <router-link to="/" class="fixed top-5 left-5 bg-[var(--surface)]/95 rounded-full py-3 px-5 cursor-pointer transition-all duration-200 flex items-center gap-2 text-sm font-medium text-[var(--primary-color)] no-underline shadow-lg z-[1000] hover:bg-[var(--surface)] hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0">
      <i class="material-icons text-lg">home</i>
      앱 목록
    </router-link>

    <div class="mt-10 max-w-[600px] mx-auto rounded-lg shadow-lg bg-[var(--surface)] p-8 pt-6">
      <h1 class="text-center text-2xl font-bold text-[var(--primary-color)] mb-8 flex items-center justify-center gap-2">
        <i class="material-icons">layers</i>마작부장 강의장면 만들기
      </h1>
      <form id="img-form">
        <div class="file-field input-field">
          <div class="btn">
            <span>타겟(target.png)</span>
            <input type="file" id="target-input" accept="image/*" @change="handleFileChange">
          </div>
          <div class="file-path-wrapper">
            <input class="file-path validate" type="text" placeholder="Perspective 변환할 이미지를 선택하세요">
          </div>
        </div>
      </form>
      <div class="text-center my-6 flex flex-wrap justify-center gap-2">
        <button id="make-btn" class="inline-flex items-center gap-2 px-4 py-2 rounded bg-[var(--primary-color)] text-white hover:bg-[var(--primary-dark)] transition-colors" @click="makeImage">
          <i class="material-icons">layers</i>최종 이미지 만들기
        </button>
        <button id="save-btn" class="inline-flex items-center gap-2 px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition-colors" @click="saveImage">
          <i class="material-icons">file_download</i>PNG로 저장
        </button>
      </div>
      <canvas id="result-canvas" ref="resultCanvas" class="bg-white rounded-lg shadow-md mb-6 w-full max-w-full h-auto"></canvas>
      <div class="mb-6">
        <label for="humanPosition" class="text-[var(--primary-color)] font-medium">인물 X 위치</label>
        <input type="range" id="humanPosition" min="0" max="1000" step="0.1" :value="humanX" @input="handleSliderChange" class="mx-2">
        <span id="humanPositionValue" class="ml-2 text-[var(--primary-color)] font-medium">{{ humanX }}</span>
      </div>
      <a id="download-link" class="mt-4 block hidden bg-blue-600 text-white px-4 py-2 rounded inline-flex items-center gap-2" ref="downloadLink">
        <i class="material-icons">file_download</i>다운로드
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, onBeforeUnmount } from 'vue';

let boardImg = null;
let targetImg = null;
let manImg = null;
let humanX = ref(0);
let baseCompositeImg = null;
let fx = null;
let M = null;

const resultCanvas = ref(null);
const downloadLink = ref(null);

// fetch로 이미지 로드 (Blob → DataURL → Image) - Promise 반환
async function fetchImageToImageObj(url) {
  const res = await fetch(url);
  const blob = await res.blob();
  const dataUrl = await new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.readAsDataURL(blob);
  });
  return await new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = dataUrl;
  });
}

// 업로드 이미지 읽기 (Promise 반환)
async function readImage(input) {
  if (!input.files || !input.files[0]) return null;
  const dataUrl = await new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.readAsDataURL(input.files[0]);
  });
  return await new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = dataUrl;
  });
}

// perspective 변환 (Promise 반환)
async function perspectiveTransform(img) {
  if (!fx) {
    alert("glfx.js가 정상적으로 로드되지 않았습니다.");
    return null;
  }
  
  // 1. 이미지 크기 체크 및 리사이즈
  let w = img.width, h = img.height;
  let resizedImg = img;

  if (w < 1000 || h < 600) {
    // 1000x600으로 리사이즈
    const resizeCanvas = document.createElement('canvas');
    resizeCanvas.width = Math.max(w, 1000);
    resizeCanvas.height = Math.max(h, 800);
    const rctx = resizeCanvas.getContext('2d');
    rctx.drawImage(img, 0, 0, resizeCanvas.width, resizeCanvas.height);
    resizedImg = await new Promise(resolve => {
      const tmpImg = new Image();
      tmpImg.onload = () => resolve(tmpImg);
      tmpImg.src = resizeCanvas.toDataURL();
    });
    w = resizeCanvas.width;
    h = resizeCanvas.height;
  }

  const fxCanvas = fx.canvas();
  const texture = fxCanvas.texture(resizedImg);
  const before = [0,0, w,0, w,h, 0,h];
  const after  = [107,134, 946,41, 957,645, 95,588];
  fxCanvas.draw(texture).perspective(before, after).update();

  // 변환된 이미지를 임시 캔버스에 복사
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = w;
  tempCanvas.height = h;
  tempCanvas.getContext('2d').drawImage(fxCanvas, 0, 0);
  const dataUrl = tempCanvas.toDataURL();
  return await new Promise(resolve => {
    const resultImg = new Image();
    resultImg.onload = () => resolve(resultImg);
    resultImg.src = dataUrl;
  });
}

// board + perspective(target) 합성 이미지를 임시로 만듦
async function updateBaseComposite() {
  if (!boardImg || !targetImg) return;
  const w = boardImg.width, h = boardImg.height;
  // 임시 캔버스 생성
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = w;
  tempCanvas.height = h;
  const ctx = tempCanvas.getContext('2d');
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(boardImg, 0, 0);

  const perspImg = await perspectiveTransform(targetImg);
  if (perspImg) {
    ctx.drawImage(perspImg, 0, 0);
  }

  // 임시 합성 이미지를 Image 객체로 저장
  const dataUrl = tempCanvas.toDataURL();
  baseCompositeImg = await new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = dataUrl;
  });
}

// baseCompositeImg 위에 인물만 다시 그림
async function updateHumanLayer() {
  if (!baseCompositeImg || !manImg) return;
  const canvas = resultCanvas.value;
  if (!canvas) return;
  canvas.width = baseCompositeImg.width;
  canvas.height = baseCompositeImg.height;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(baseCompositeImg, 0, 0);
  ctx.drawImage(manImg, humanX.value, canvas.height - manImg.height);
}

// 파일 변경 핸들러
const handleFileChange = async (event) => {
  targetImg = await readImage(event.target);
  if (targetImg) {
    await updateBaseComposite();
    await updateHumanLayer();
  }
};

// 슬라이더 변경 핸들러
const handleSliderChange = async (event) => {
  humanX.value = parseFloat(event.target.value);
  await updateHumanLayer();
};

// 최종 이미지 만들기
const makeImage = async () => {
  await updateBaseComposite();
  await updateHumanLayer();
  if (M) {
    M.toast({html: '합성이 완료되었습니다!', classes: 'blue'});
  }
};

// 이미지 저장
const saveImage = () => {
  const canvas = resultCanvas.value;
  if (!canvas) return;
  const link = downloadLink.value;
  if (!link) return;
  
  canvas.toBlob(function(blob) {
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = 'result.png';
    link.style.display = 'inline-block';
    link.textContent = '다운로드';
    link.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      link.style.display = 'none';
    }, 1000);
  }, 'image/png');
};

// 클립보드에서 이미지 붙여넣기
const handlePaste = async (e) => {
  if (!navigator.clipboard || !navigator.clipboard.read) return;

  try {
    const items = await navigator.clipboard.read();
    for (const item of items) {
      for (const type of item.types) {
        if (type.startsWith('image/')) {
          const blob = await item.getType(type);
          const file = new File([blob], 'pasted-image.png', { type: blob.type });

          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);

          const input = document.getElementById('target-input');
          input.files = dataTransfer.files;

          // change 이벤트 강제 발생
          const event = new Event('change', { bubbles: true });
          input.dispatchEvent(event);

          if (M) {
            M.toast({html: '클립보드 이미지를 붙여넣었습니다.', classes: 'blue'});
          }
          return;
        }
      }
    }
  } catch (err) {
    if (M) {
      M.toast({html: '클립보드에서 이미지를 읽을 수 없습니다.', classes: 'red'});
    }
  }
};

// 동적 로드 요소 (onBeforeUnmount에서 제거용)
const dynamicLoadElements = [];

// CDN 라이브러리 로드
const loadLibraries = () => {
  return new Promise((resolve) => {
    // Material Icons 폰트
    if (!document.querySelector('link[href*="material-icons"]')) {
      const materialIcons = document.createElement('link');
      materialIcons.rel = 'stylesheet';
      materialIcons.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
      document.head.appendChild(materialIcons);
      dynamicLoadElements.push(materialIcons);
    }

    // Materialize CSS
    if (!document.querySelector('link[href*="materialize"]')) {
      const materializeCSS = document.createElement('link');
      materializeCSS.rel = 'stylesheet';
      materializeCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css';
      document.head.appendChild(materializeCSS);
      dynamicLoadElements.push(materializeCSS);
    }

    // Materialize JS
    if (!window.M) {
      const materializeJS = document.createElement('script');
      materializeJS.src = 'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js';
      materializeJS.onload = () => {
        M = window.M;
        resolve();
      };
      document.head.appendChild(materializeJS);
      dynamicLoadElements.push(materializeJS);
    } else {
      M = window.M;
      resolve();
    }
  });
};

// glfx.js 로드
const loadGlfx = () => {
  return new Promise((resolve) => {
    if (window.fx) {
      fx = window.fx;
      resolve();
      return;
    }
    const glfxScript = document.createElement('script');
    glfxScript.src = 'https://cdn.jsdelivr.net/npm/glfx@0.0.4/glfx.min.js';
    glfxScript.onload = () => {
      fx = window.fx;
      if (!fx) {
        alert("glfx.js가 정상적으로 로드되지 않았습니다. 네트워크 상태를 확인하거나, CDN 주소를 확인하세요.");
      }
      resolve();
    };
    document.head.appendChild(glfxScript);
    dynamicLoadElements.push(glfxScript);
  });
};

onMounted(async () => {
  await loadLibraries();
  await loadGlfx();
  
  // 이미지 로드
  boardImg = await fetchImageToImageObj('/imgs/unnamed/board.png');
  manImg = await fetchImageToImageObj('/imgs/unnamed/man.png');
  
  // 슬라이더 max값 설정
  const slider = document.getElementById('humanPosition');
  if (slider && boardImg) {
    slider.max = boardImg.width;
    slider.value = 0;
    humanX.value = 0;
  }
  
  // 클립보드 이벤트 리스너
  window.addEventListener('paste', handlePaste);
});

onBeforeUnmount(() => {
  dynamicLoadElements.forEach((el) => {
    if (el && el.parentNode) {
      el.parentNode.removeChild(el);
    }
  });
  dynamicLoadElements.length = 0;
});

onUnmounted(() => {
  window.removeEventListener('paste', handlePaste);
});
</script>

<style>
/* Materialize file input - ::file-selector-button */
.file-field input[type=file]::file-selector-button {
  background: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 6px 16px;
  cursor: pointer;
}
</style>
