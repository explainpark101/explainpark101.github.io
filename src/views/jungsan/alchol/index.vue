<template>
  <div class="font-sans max-w-[1200px] mx-auto p-5 bg-[var(--background)] text-[var(--text-primary)] transition-colors duration-500">
    <div class="flex">
      <router-link to="/jungsan" class="inline-flex items-center gap-2 py-2.5 px-5 bg-[var(--primary-color)] text-[var(--surface)] rounded cursor-pointer text-sm font-medium uppercase no-underline shadow transition-all duration-300 hover:bg-[var(--primary-dark)]">테이블당 정산기</router-link>
    </div>
    <div class="flex justify-between items-center">
      <h1 class="text-[var(--primary-color)] font-medium mb-6">언네임드 회식 정산 계산기</h1>
      <div class="flex items-center justify-end gap-1 flex-wrap">
        <button type="button" @click="resetForm" class="ml-4 py-2.5 px-5 bg-[var(--primary-color)] text-[var(--surface)] border-none rounded cursor-pointer text-sm font-medium uppercase inline-flex items-center gap-2 transition-colors duration-300 hover:bg-[var(--primary-dark)]">
          <span class="material-icons">restart_alt</span>초기화
        </button>
        <button type="button" @click="exportJson" class="ml-2 py-2.5 px-5 bg-[var(--primary-color)] text-[var(--surface)] border-none rounded cursor-pointer text-sm font-medium uppercase inline-flex items-center gap-2 transition-colors duration-300 hover:bg-[var(--primary-dark)]">
          <span class="material-icons">file_upload</span>JSON 내보내기
        </button>
        <button type="button" @click="importJson" class="ml-2 py-2.5 px-5 bg-[var(--primary-color)] text-[var(--surface)] border-none rounded cursor-pointer text-sm font-medium uppercase inline-flex items-center gap-2 transition-colors duration-300 hover:bg-[var(--primary-dark)]">
          <span class="material-icons">file_download</span>JSON 가져오기
        </button>
        <button type="button" @click="shareLink" class="ml-2 py-2.5 px-5 bg-[var(--primary-color)] text-[var(--surface)] border-none rounded cursor-pointer text-sm font-medium uppercase inline-flex items-center gap-2 transition-colors duration-300 hover:bg-[var(--primary-dark)]">
          <span class="material-icons">link</span>링크로 공유
        </button>
      </div>
    </div>
    <form id="input-fields" class="flex flex-wrap gap-4 bg-[var(--surface)] rounded-lg shadow p-6 mt-6 mb-6 transition-all duration-500 md:grid md:grid-cols-2 md:justify-center md:items-center" @submit.prevent="handleSubmit">
      <div class="flex flex-wrap gap-4 mb-5 w-full">
        <div class="flex-1 min-w-[220px] max-w-[320px] mb-4">
          <label for="totalSupport" class="block mb-2 text-[var(--text-secondary)] text-sm">총 회식 지원비</label>
          <input type="number" id="totalSupport" v-model.number="totalSupport" min="0" class="w-full p-3 my-1 border border-[var(--border-color)] rounded text-base bg-[var(--surface)] text-[var(--text-primary)] transition-all duration-300 focus:outline-none focus:border-[var(--primary-color)] box-border">
        </div>
        <div class="flex-1 min-w-[220px] max-w-[320px] mb-4">
          <label for="foodPrice" class="block mb-2 text-[var(--text-secondary)] text-sm">음식값</label>
          <input type="number" id="foodPrice" v-model.number="foodPrice" min="0" class="w-full p-3 my-1 border border-[var(--border-color)] rounded text-base bg-[var(--surface)] text-[var(--text-primary)] transition-all duration-300 focus:outline-none focus:border-[var(--primary-color)] box-border">
        </div>
        <div class="flex-1 min-w-[220px] max-w-[320px] mb-4">
          <label for="alcoholPrice" class="block mb-2 text-[var(--text-secondary)] text-sm">술값</label>
          <input type="number" id="alcoholPrice" v-model.number="alcoholPrice" min="0" class="w-full p-3 my-1 border border-[var(--border-color)] rounded text-base bg-[var(--surface)] text-[var(--text-primary)] transition-all duration-300 focus:outline-none focus:border-[var(--primary-color)] box-border">
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4 mb-4 bg-[var(--background)] rounded-lg p-3 shadow w-full">
        <div class="flex flex-col bg-[var(--surface)] rounded-md p-3 shadow min-w-0">
          <label for="memberDrink" class="mb-1.5 text-[var(--text-secondary)] text-sm">🍺 부원 (술 마신)</label>
          <input type="number" id="memberDrink" v-model.number="memberDrink" min="0" class="w-full p-3 my-1 border border-[var(--border-color)] rounded text-base bg-[var(--surface)] text-[var(--text-primary)] transition-all duration-300 focus:outline-none focus:border-[var(--primary-color)] box-border">
          <textarea id="memberDrinkMemo" v-model="memberDrinkMemo" rows="1" placeholder="예: 홍길동, 김철수" class="w-full p-3 my-1 border border-[var(--border-color)] rounded text-base bg-[var(--surface)] text-[var(--text-primary)] transition-all duration-300 focus:outline-none focus:border-[var(--primary-color)] box-border resize-y min-h-8 max-h-[200px] overflow-y-auto" @input="handleAutoGrow" ref="memberDrinkMemoRef"></textarea>
        </div>
        <div class="flex flex-col bg-[var(--surface)] rounded-md p-3 shadow min-w-0">
          <label for="guestDrink" class="mb-1.5 text-[var(--text-secondary)] text-sm">🍺👤 난입 (술 마신)</label>
          <input type="number" id="guestDrink" v-model.number="guestDrink" min="0" class="w-full p-3 my-1 border border-[var(--border-color)] rounded text-base bg-[var(--surface)] text-[var(--text-primary)] transition-all duration-300 focus:outline-none focus:border-[var(--primary-color)] box-border">
          <textarea id="guestDrinkMemo" v-model="guestDrinkMemo" rows="1" placeholder="예: 이난입, 박외부" class="w-full p-3 my-1 border border-[var(--border-color)] rounded text-base bg-[var(--surface)] text-[var(--text-primary)] transition-all duration-300 focus:outline-none focus:border-[var(--primary-color)] box-border resize-y min-h-8 max-h-[200px] overflow-y-auto" @input="handleAutoGrow" ref="guestDrinkMemoRef"></textarea>
        </div>
        <div class="flex flex-col bg-[var(--surface)] rounded-md p-3 shadow min-w-0">
          <label for="memberNoDrink" class="mb-1.5 text-[var(--text-secondary)] text-sm">부원 (술 안 마신)</label>
          <input type="number" id="memberNoDrink" v-model.number="memberNoDrink" min="0" class="w-full p-3 my-1 border border-[var(--border-color)] rounded text-base bg-[var(--surface)] text-[var(--text-primary)] transition-all duration-300 focus:outline-none focus:border-[var(--primary-color)] box-border">
          <textarea id="memberNoDrinkMemo" v-model="memberNoDrinkMemo" rows="1" placeholder="예: 최부원, 정회원" class="w-full p-3 my-1 border border-[var(--border-color)] rounded text-base bg-[var(--surface)] text-[var(--text-primary)] transition-all duration-300 focus:outline-none focus:border-[var(--primary-color)] box-border resize-y min-h-8 max-h-[200px] overflow-y-auto" @input="handleAutoGrow" ref="memberNoDrinkMemoRef"></textarea>
        </div>
        <div class="flex flex-col bg-[var(--surface)] rounded-md p-3 shadow min-w-0">
          <label for="guestNoDrink" class="mb-1.5 text-[var(--text-secondary)] text-sm">👤 난입 (술 안 마신)</label>
          <input type="number" id="guestNoDrink" v-model.number="guestNoDrink" min="0" class="w-full p-3 my-1 border border-[var(--border-color)] rounded text-base bg-[var(--surface)] text-[var(--text-primary)] transition-all duration-300 focus:outline-none focus:border-[var(--primary-color)] box-border">
          <textarea id="guestNoDrinkMemo" v-model="guestNoDrinkMemo" rows="1" placeholder="예: 외부1, 외부2" class="w-full p-3 my-1 border border-[var(--border-color)] rounded text-base bg-[var(--surface)] text-[var(--text-primary)] transition-all duration-300 focus:outline-none focus:border-[var(--primary-color)] box-border resize-y min-h-8 max-h-[200px] overflow-y-auto" @input="handleAutoGrow" ref="guestNoDrinkMemoRef"></textarea>
        </div>
      </div>

      <button type="submit" id="calc-button" class="flex-1 w-full mt-3 py-2.5 px-5 bg-[var(--primary-color)] text-[var(--surface)] border-none rounded cursor-pointer text-sm font-medium uppercase inline-flex items-center justify-center gap-2 transition-colors duration-300 hover:bg-[var(--primary-dark)] md:col-span-2">
        <span class="material-icons">calculate</span>
        정산 계산하기
      </button>
    </form>
    <div id="result" ref="resultRef" class="mt-6 p-5 bg-[var(--surface)] rounded-lg shadow grid gap-2 transition-all duration-500"
      v-if="formattedResults && formattedResults.formattedResults && formattedResults.formattedResults.length > 0">
      <h2 class="text-[var(--primary-color)] font-medium mb-4">정산 결과</h2>
      <div class="text-[var(--success)] font-medium mt-3 py-2 px-2 rounded bg-[var(--success)]/10">부원 1인당 지원금: {{ formattedResults.formattedSupportPerMember }}원</div>
      <table class="w-full mt-4 border-collapse">
        <thead>
          <tr class="bg-[var(--background)]">
            <th class="py-2 px-3 text-left border-b border-[var(--border-color)] font-medium text-[var(--text-primary)]">구분</th>
            <th class="py-2 px-3 text-left border-b border-[var(--border-color)] font-medium text-[var(--text-primary)]">인원</th>
            <th class="py-2 px-3 text-left border-b border-[var(--border-color)] font-medium text-[var(--text-primary)]">1인당 금액</th>
            <th class="py-2 px-3 text-left border-b border-[var(--border-color)] font-medium text-[var(--text-primary)]">지원금</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(result, index) in formattedResults.formattedResults" :key="index" class="hover:bg-[var(--background)] transition-colors">
            <td class="py-2 px-3 text-left border-b border-[var(--border-color)] text-[var(--text-primary)]">{{ result.label || '-' }}</td>
            <td class="py-2 px-3 text-left border-b border-[var(--border-color)] text-[var(--text-primary)]">{{ result.count || 0 }}명</td>
            <td class="py-2 px-3 text-left border-b border-[var(--border-color)] text-[var(--text-primary)]">{{ result.formattedPay || '-' }}원</td>
            <td class="py-2 px-3 text-left border-b border-[var(--border-color)] text-[var(--text-primary)]">{{ result.formattedSupport || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <a ref="downloadLink" :href="downloadUrl" :download="downloadFilename" class="hidden"></a>
    <input ref="fileInput" type="file" accept="application/json" class="hidden" @change="handleFileImport" />

    <dialog ref="dialogRef" class="jungsan-dialog border-none rounded-lg p-0 max-w-md w-[90%] bg-[var(--surface)] shadow-2xl fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 m-0 [&::backdrop]:bg-[var(--overlay-color)] [&::backdrop]:backdrop-blur-sm" @click="handleDialogClick">
      <div class="p-6" @click.stop>
        <h3 class="m-0 mb-4 text-[var(--text-primary)] text-xl font-medium">{{ dialogTitle }}</h3>
        <p class="m-0 mb-6 text-[var(--text-secondary)] text-sm leading-relaxed">{{ dialogMessage }}</p>
        <div class="flex justify-end gap-3">
          <button v-if="!isAlert" type="button" @click="handleCancel" class="py-2.5 px-5 border border-[var(--border-color)] rounded bg-transparent text-[var(--text-secondary)] text-sm font-medium cursor-pointer transition-colors duration-300 hover:bg-[var(--background)]">취소</button>
          <button ref="confirmButtonRef" type="button" @click="handleConfirm" class="py-2.5 px-5 border-none rounded bg-[var(--primary-color)] text-[var(--surface)] text-sm font-medium cursor-pointer transition-colors duration-300 hover:bg-[var(--primary-dark)]" autofocus>확인</button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useJungsanStorage } from '@/composables/useJungsanStorage.js';
import { calculateAlcoholBased } from '@/composables/useJungsanCalculation.js';
import { useFileExport } from '@/composables/useFileExport.js';
import { useAutoGrowTextarea } from '@/composables/useAutoGrowTextarea.js';
import { useConfirmDialog } from '@/composables/useConfirmDialog.js';
import { validateAlcoholBasedData } from '@/utils/jungsanValidation.js';

const STORAGE_KEY = 'jungsanFormData-alchol';

// 반응형 데이터
const totalSupport = ref(0);
const foodPrice = ref(0);
const alcoholPrice = ref(0);
const memberDrink = ref(0);
const guestDrink = ref(0);
const memberNoDrink = ref(0);
const guestNoDrink = ref(0);
const memberDrinkMemo = ref('');
const guestDrinkMemo = ref('');
const memberNoDrinkMemo = ref('');
const guestNoDrinkMemo = ref('');
const resultData = ref(null);
const resultRef = ref(null);

// textarea refs
const memberDrinkMemoRef = ref(null);
const guestDrinkMemoRef = ref(null);
const memberNoDrinkMemoRef = ref(null);
const guestNoDrinkMemoRef = ref(null);

// Confirm Dialog composable
const {
  showDialog,
  dialogTitle,
  dialogMessage,
  dialogRef,
  confirmButtonRef,
  isAlert,
  showConfirm,
  showAlert,
  handleConfirm,
  handleCancel,
  handleDialogClick
} = useConfirmDialog();

// 폼 데이터 가져오기
const getFormData = () => {
  return {
    totalSupport: totalSupport.value,
    memberDrink: memberDrink.value,
    guestDrink: guestDrink.value,
    memberNoDrink: memberNoDrink.value,
    guestNoDrink: guestNoDrink.value,
    foodPrice: foodPrice.value,
    alcoholPrice: alcoholPrice.value,
    memberDrinkMemo: memberDrinkMemo.value || '',
    guestDrinkMemo: guestDrinkMemo.value || '',
    memberNoDrinkMemo: memberNoDrinkMemo.value || '',
    guestNoDrinkMemo: guestNoDrinkMemo.value || ''
  };
};

// 데이터 로드 함수
const loadData = async (data) => {
  totalSupport.value = data.totalSupport || 0;
  memberDrink.value = data.memberDrink || 0;
  guestDrink.value = data.guestDrink || 0;
  memberNoDrink.value = data.memberNoDrink || 0;
  guestNoDrink.value = data.guestNoDrink || 0;
  foodPrice.value = data.foodPrice || 0;
  alcoholPrice.value = data.alcoholPrice || 0;
  memberDrinkMemo.value = data.memberDrinkMemo || '';
  guestDrinkMemo.value = data.guestDrinkMemo || '';
  memberNoDrinkMemo.value = data.memberNoDrinkMemo || '';
  guestNoDrinkMemo.value = data.guestNoDrinkMemo || '';

  // textarea 오토그로우 적용
  await applyAutoGrowToRefs([
    memberDrinkMemoRef,
    guestDrinkMemoRef,
    memberNoDrinkMemoRef,
    guestNoDrinkMemoRef
  ]);
};

// Storage composable
const { saveToLocalStorage, loadFromLocalStorage, tryRestoreFromQuery, shareLink, clearStorage, isRestoring } =
  useJungsanStorage(STORAGE_KEY, getFormData, loadData, showConfirm, showAlert);

// File export composable
const { downloadLink, downloadUrl, downloadFilename, fileInput, exportJson, importJson, handleFileImport } =
  useFileExport(STORAGE_KEY, loadData, validateAlcoholBasedData, showAlert);

// AutoGrow textarea composable
const { applyAutoGrowToRefs, handleAutoGrow } = useAutoGrowTextarea();

// 계산 함수
const calculate = async () => {
  resultData.value = null;

  const calculationResult = calculateAlcoholBased({
    totalSupport: totalSupport.value,
    foodPrice: foodPrice.value,
    alcoholPrice: alcoholPrice.value,
    memberDrink: memberDrink.value,
    guestDrink: guestDrink.value,
    memberNoDrink: memberNoDrink.value,
    guestNoDrink: guestNoDrink.value
  });

  if (calculationResult.error) {
    await showAlert(calculationResult.error, '오류');
    return;
  }

  resultData.value = calculationResult;

  // 결과 영역으로 스크롤
  await nextTick();
  if (resultRef.value) {
    resultRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

// 포맷팅된 결과 (computed)
const formattedResults = computed(() => {
  if (!resultData.value) return null;

  const format = (value) => {
    if (value === null || value === undefined || isNaN(value)) return '-';
    return Math.round(value).toLocaleString();
  };

  // results 배열이 없거나 비어있으면 null 반환
  if (!resultData.value.results || !Array.isArray(resultData.value.results) || resultData.value.results.length === 0) {
    return null;
  }

  return {
    ...resultData.value,
    formattedSupportPerMember: format(resultData.value.supportPerMember),
    formattedResults: resultData.value.results.map(r => ({
      ...r,
      formattedPay: format(r.pay),
      formattedSupport: r.support !== null && r.support !== undefined
        ? format(r.support) + '원'
        : '-'
    }))
  };
});

// 폼 제출 핸들러
const handleSubmit = async (e) => {
  e.preventDefault();
  await calculate();
};

// 폼 전체 초기화 함수
const resetForm = async () => {
  const confirmed = await showConfirm(
    '초기화 확인',
    '정말 초기화 하시겠습니까? 초기화시 임시저장된 데이터는 삭제되고 되돌릴 수 없습니다.'
  );
  if (!confirmed) return;

  clearStorage();
  totalSupport.value = 0;
  memberDrink.value = 0;
  guestDrink.value = 0;
  memberNoDrink.value = 0;
  guestNoDrink.value = 0;
  foodPrice.value = 0;
  alcoholPrice.value = 0;
  memberDrinkMemo.value = '';
  guestDrinkMemo.value = '';
  memberNoDrinkMemo.value = '';
  guestNoDrinkMemo.value = '';
  resultData.value = null;
};

// 입력값 변경 감지하여 자동 저장
watch([
  totalSupport,
  foodPrice,
  alcoholPrice,
  memberDrink,
  guestDrink,
  memberNoDrink,
  guestNoDrink,
  memberDrinkMemo,
  guestDrinkMemo,
  memberNoDrinkMemo,
  guestNoDrinkMemo
], () => {
  if (!isRestoring.value) {
    saveToLocalStorage();
  }
});

// 초기화
onMounted(async () => {
  if (await tryRestoreFromQuery()) {
    return;
  }
  if (localStorage.getItem(STORAGE_KEY)) {
    await loadFromLocalStorage();
  }
  // 초기 textarea 오토그로우 적용
  await applyAutoGrowToRefs([
    memberDrinkMemoRef,
    guestDrinkMemoRef,
    memberNoDrinkMemoRef,
    guestNoDrinkMemoRef
  ]);
});
</script>
