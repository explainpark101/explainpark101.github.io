<template>
  <div class="font-sans max-w-6xl mx-auto p-5 bg-[var(--background)] text-[var(--text-primary)] transition-colors duration-500">
    <div class="flex">
      <router-link to="/jungsan/alchol" class="inline-flex items-center gap-2 py-2.5 px-5 bg-[var(--primary-color)] text-[var(--surface)] rounded cursor-pointer text-sm font-medium uppercase no-underline shadow transition-all duration-300 hover:bg-[var(--primary-dark)] hover:shadow-lg">일반인 / 술고래 구분 정산기</router-link>
    </div>
    <div class="flex justify-between items-center">
      <h1 class="text-[var(--primary-color)] font-medium mb-6">언네임드 회식 정산 계산기</h1>
      <div class="flex items-center justify-end gap-1 flex-wrap">
        <router-link to="/" class="py-2.5 px-5 bg-purple-700 text-[var(--surface)] rounded cursor-pointer text-sm font-medium inline-flex items-center gap-2 no-underline transition-all duration-300 hover:bg-purple-800 hover:-translate-y-px hover:shadow-lg">
          <span class="material-icons">home</span>앱 목록
        </router-link>
        <button @click="resetForm" class="ml-4 py-2.5 px-5 bg-[var(--primary-color)] text-[var(--surface)] border-none rounded cursor-pointer text-sm font-medium uppercase inline-flex items-center gap-2 transition-colors duration-300 hover:bg-[var(--primary-dark)]">
          <span class="material-icons">restart_alt</span>초기화
        </button>
        <button @click="exportJson" class="ml-2 py-2.5 px-5 bg-[var(--primary-color)] text-[var(--surface)] border-none rounded cursor-pointer text-sm font-medium uppercase inline-flex items-center gap-2 transition-colors duration-300 hover:bg-[var(--primary-dark)]">
          <span class="material-icons">file_upload</span>JSON 내보내기
        </button>
        <button @click="importJson" class="ml-2 py-2.5 px-5 bg-[var(--primary-color)] text-[var(--surface)] border-none rounded cursor-pointer text-sm font-medium uppercase inline-flex items-center gap-2 transition-colors duration-300 hover:bg-[var(--primary-dark)]">
          <span class="material-icons">file_download</span>JSON 가져오기
        </button>
        <button @click="shareLink" class="ml-2 py-2.5 px-5 bg-[var(--primary-color)] text-[var(--surface)] border-none rounded cursor-pointer text-sm font-medium uppercase inline-flex items-center gap-2 transition-colors duration-300 hover:bg-[var(--primary-dark)]">
          <span class="material-icons">link</span>링크로 공유
        </button>
      </div>
    </div>

    <div class="mb-4 flex flex-wrap items-end gap-2">
      <div>
        <label for="tableCount" class="block mb-2 text-[var(--text-secondary)] text-sm">테이블 개수</label>
        <input type="number" id="tableCount" v-model.number="tableCount" min="1" @input="handleTableCountChange" class="w-32 p-3 my-1 border border-[var(--border-color)] rounded text-base bg-[var(--surface)] text-[var(--text-primary)] transition-all duration-300 focus:outline-none focus:border-[var(--primary-color)] box-border">
      </div>
      <button @click="createTables" class="py-2.5 px-5 bg-[var(--primary-color)] text-[var(--surface)] border-none rounded cursor-pointer text-sm font-medium uppercase inline-flex items-center gap-2 transition-colors duration-300 hover:bg-[var(--primary-dark)]">
        <span class="material-icons">add_circle</span>
        테이블 생성
      </button>
    </div>

    <div class="mb-4">
      <label for="totalSupport" class="block mb-2 text-[var(--text-secondary)] text-sm">총 회식 지원비</label>
      <input type="number" id="totalSupport" v-model.number="totalSupport" min="0" class="w-32 p-3 my-1 border border-[var(--border-color)] rounded text-base bg-[var(--surface)] text-[var(--text-primary)] transition-all duration-300 focus:outline-none focus:border-[var(--primary-color)] box-border">
    </div>

    <div id="tablesContainer">
      <div v-for="(table, index) in tables" :key="index" class="mb-5 p-5 bg-[var(--surface)] rounded-lg shadow transition-all duration-300 hover:shadow-lg">
        <h3 class="text-[var(--primary-color)] font-medium">테이블 {{ index + 1 }}</h3>
        <div class="mb-4">
          <label class="block mb-2 text-[var(--text-secondary)] text-sm">부원 수</label>
          <input type="number" v-model.number="table.memberCount" min="0" class="jungsan-input">
        </div>
        <div class="mb-4">
          <label class="block mb-2 text-[var(--text-secondary)] text-sm">난입 수</label>
          <input type="number" v-model.number="table.guestCount" min="0" class="jungsan-input">
        </div>
        <div class="mb-4">
          <label class="block mb-2 text-[var(--text-secondary)] text-sm">메모</label>
          <textarea v-model="table.memo" rows="2" placeholder="부원, 난입 이름을 입력하세요" class="jungsan-input w-full"></textarea>
        </div>
        <div class="mb-4">
          <label class="block mb-2 text-[var(--text-secondary)] text-sm">음식 가격</label>
          <input type="number" v-model.number="table.foodPrice" min="0" class="jungsan-input">
        </div>
        <div class="flex items-center gap-2 my-2">
          <label class="flex gap-2 items-center cursor-pointer m-0">
            <input type="checkbox" v-model="table.hasAlcohol" class="w-[18px] h-[18px] m-0">
            술 섭취
          </label>
        </div>
      </div>
    </div>

    <button @click="calculate" id="calc-button" class="jungsan-btn">
      <span class="material-icons">calculate</span>
      정산 계산하기
    </button>

    <div id="result" ref="resultRef" class="mt-6 p-5 bg-[var(--surface)] rounded-lg shadow grid gap-2 transition-all duration-500"
      v-if="formattedResults && formattedResults.formattedResults && formattedResults.formattedResults.length > 0">
      <h2 class="text-[var(--primary-color)] font-medium mb-4">정산 결과</h2>
      <div class="support-per-person text-[var(--success)] font-medium mt-3 py-2 px-2 rounded bg-[var(--success)]/10 dark:bg-[var(--success)]/10">인당 지원금: {{ formattedResults.formattedSupportPerMember }}원</div>
      <div v-if="formattedResults.formattedRemainingSupportSum" class="remaining-support text-[var(--primary-color)] font-medium mt-3 py-2 px-2 rounded bg-[var(--primary-color)]/10 text-xl">
        <strong>총 남은 지원금: </strong> {{ formattedResults.formattedRemainingSupportSum }}원
      </div>
      <div v-for="(result, index) in formattedResults.formattedResults" :key="index" class="mb-5 p-5 bg-[var(--background)] rounded-lg">
        <h3 class="text-[var(--primary-color)] mt-0">테이블 {{ result.tableNumber }} {{ result.hasAlcohol ? '🍺' : '' }}</h3>
        <p class="my-2 text-[var(--text-secondary)]"><strong>메모:</strong> {{ result.memo || '없음' }}</p>
        <p class="my-2 text-[var(--text-secondary)]"><strong>부원({{ result.memberCount }}명) 정산금액:</strong> {{ result.formattedMemberPayment }}원</p>
        <p class="my-2 text-[var(--text-secondary)]"><strong>난입({{ result.guestCount }}명) 정산금액:</strong> {{ result.formattedGuestPayment }}원</p>
        <p v-if="result.hasAlcohol" class="my-2 text-[var(--text-secondary)]"><strong>술 섭취:</strong> 예</p>
        <p v-if="result.formattedRemainingSupport" class="remaining-support text-[var(--primary-color)] font-medium mt-3 py-2 px-2 rounded bg-[var(--primary-color)]/10">
          <strong>남은 지원금:</strong> {{ result.formattedRemainingSupport }}원
        </p>
      </div>
    </div>

    <a ref="downloadLink" :href="downloadUrl" :download="downloadFilename" class="hidden"></a>
    <input ref="fileInput" type="file" accept="application/json" class="hidden" @change="handleFileImport" />

    <dialog ref="dialogRef" class="jungsan-dialog" @click="handleDialogClick">
      <div class="p-6" @click.stop>
        <h3 class="m-0 mb-4 text-[var(--text-primary)] text-xl font-medium">{{ dialogTitle }}</h3>
        <p class="m-0 mb-6 text-[var(--text-secondary)] text-sm leading-relaxed">{{ dialogMessage }}</p>
        <div class="flex justify-end gap-3">
          <button v-if="!isAlert" @click="handleCancel" class="jungsan-dialog-cancel">취소</button>
          <button ref="confirmButtonRef" @click="handleConfirm" class="jungsan-dialog-confirm" autofocus>확인</button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useJungsanStorage } from '@/composables/useJungsanStorage.js';
import { calculateTableBased } from '@/composables/useJungsanCalculation.js';
import { useFileExport } from '@/composables/useFileExport.js';
import { useConfirmDialog } from '@/composables/useConfirmDialog.js';
import { validateTableBasedData } from '@/utils/jungsanValidation.js';

const STORAGE_KEY = 'jungsanFormData';

// 반응형 데이터
const tableCount = ref(1);
const totalSupport = ref(0);
const tables = ref([]);
const resultData = ref(null);
const resultRef = ref(null);

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

// 테이블 데이터 수집 함수
const collectTableData = (table) => {
  return {
    memberCount: table.memberCount || 0,
    guestCount: table.guestCount || 0,
    foodPrice: table.foodPrice || 0,
    memo: table.memo || '',
    hasAlcohol: table.hasAlcohol || false
  };
};

// 폼 데이터 가져오기
const getFormData = () => {
  if (tables.value.length === 0) return null;
  return {
    tableCount: tableCount.value,
    totalSupport: totalSupport.value,
    tableData: tables.value.map(table => collectTableData(table))
  };
};

// 데이터 로드 함수
const loadData = (data) => {
  tableCount.value = data.tableCount || 1;
  totalSupport.value = data.totalSupport || 0;
  createTables();
  // 테이블 입력값 세팅
  if (data.tableData) {
    data.tableData.forEach((tableData, i) => {
      if (tables.value[i]) {
        tables.value[i].memberCount = tableData.memberCount || 0;
        tables.value[i].guestCount = tableData.guestCount || 0;
        tables.value[i].foodPrice = tableData.foodPrice || 0;
        tables.value[i].memo = tableData.memo || '';
        tables.value[i].hasAlcohol = tableData.hasAlcohol || false;
      }
    });
  }
};

// Storage composable
const { saveToLocalStorage, loadFromLocalStorage, tryRestoreFromQuery, shareLink, clearStorage, isRestoring } =
  useJungsanStorage(STORAGE_KEY, getFormData, loadData, showConfirm, showAlert);

// File export composable
const { downloadLink, downloadUrl, downloadFilename, fileInput, exportJson, importJson, handleFileImport } =
  useFileExport(STORAGE_KEY, loadData, validateTableBasedData, showAlert);

// 계산 함수
const calculate = async () => {
  resultData.value = null;

  const calculationResult = calculateTableBased(tables.value, totalSupport.value);

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
    if (value === null || value === undefined || isNaN(value)) return '0';
    return Math.round(value).toLocaleString();
  };

  // results 배열이 없거나 비어있으면 null 반환
  if (!resultData.value.results || !Array.isArray(resultData.value.results) || resultData.value.results.length === 0) {
    return null;
  }

  return {
    ...resultData.value,
    formattedSupportPerMember: format(resultData.value.supportPerMember),
    formattedRemainingSupportSum: resultData.value.remainingSupportSum
      ? format(resultData.value.remainingSupportSum)
      : null,
    formattedResults: resultData.value.results.map(r => ({
      ...r,
      formattedMemberPayment: format(r.memberPayment),
      formattedGuestPayment: format(r.guestPayment),
      formattedRemainingSupport: r.remainingSupport ? format(r.remainingSupport) : null
    }))
  };
});

// 테이블 생성 함수
const createTables = () => {
  const count = tableCount.value;
  tables.value = Array.from({ length: count }, () => ({
    memberCount: 0,
    guestCount: 0,
    foodPrice: 0,
    memo: '',
    hasAlcohol: false
  }));
};

// 테이블 개수 변경 핸들러
const handleTableCountChange = () => {
  createTables();
};

// 폼 전체 초기화 함수
const resetForm = async () => {
  const confirmed = await showConfirm(
    '초기화 확인',
    '정말 초기화 하시겠습니까? 초기화시 임시저장된 데이터는 삭제되고 되돌릴 수 없습니다.'
  );
  if (!confirmed) return;

  clearStorage();
  tableCount.value = 1;
  totalSupport.value = 0;
  createTables();
  resultData.value = null;
};

// 입력값 변경 감지하여 자동 저장
watch([tableCount, totalSupport, tables], () => {
  if (!isRestoring.value) {
    saveToLocalStorage();
  }
}, { deep: true });

// 초기화
onMounted(async () => {
  if (await tryRestoreFromQuery()) {
    return;
  }
  if (localStorage.getItem(STORAGE_KEY)) {
    await loadFromLocalStorage();
  } else {
    createTables();
  }
});
</script>

<style scoped>
.jungsan-container {
  font-family: 'Roboto', sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: var(--background);
  color: var(--text-primary);
  transition: background-color 500ms ease-in-out, color 500ms ease-in-out;
}

h1 {
  color: var(--primary-color);
  font-weight: 500;
  margin-bottom: 24px;
}

.table-container {
  margin-bottom: 20px;
  padding: 20px;
  background: var(--surface);
  border-radius: 8px;
  box-shadow: 0 2px 4px var(--shadow-color);
  transition: box-shadow 0.3s ease, background-color 500ms ease-in-out;
}

.table-container:hover {
  box-shadow: 0 4px 8px var(--shadow-color);
}

.input-group {
  margin-bottom: 16px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-secondary);
  font-size: 14px;
}

.result {
  margin-top: 24px;
  padding: 20px;
  background: var(--surface);
  border-radius: 8px;
  box-shadow: 0 2px 4px var(--shadow-color);
  display: grid;
  gap: .5rem;
  transition: background-color 500ms ease-in-out, box-shadow 500ms ease-in-out;
}

button {
  padding: 10px 20px;
  background-color: var(--primary-color);
  color: var(--surface);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  transition: background-color 0.3s ease, color 500ms ease-in-out;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

button:hover {
  background-color: var(--primary-dark);
}

button .material-icons {
  font-size: 20px;
}

input,
textarea {
  width: 100%;
  padding: 12px;
  margin: 4px 0;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 16px;
  background-color: var(--surface);
  color: var(--text-primary);
  transition: border-color 0.3s ease, background-color 500ms ease-in-out, color 500ms ease-in-out;
  box-sizing: border-box;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}

input[type="number"] {
  width: 120px;
}

.result h2 {
  color: var(--primary-color);
  font-weight: 500;
  margin-bottom: 16px;
}

.result p {
  margin: 8px 0;
  color: var(--text-secondary);
}

.result .table-container {
  background: var(--background);
}

.result .table-container h3 {
  color: var(--primary-color);
  margin-top: 0;
}

.remaining-support {
  color: var(--primary-color);
  font-weight: 500;
  margin-top: 12px;
  padding: 8px;
  background-color: rgba(25, 118, 210, 0.1);
  border-radius: 4px;
  transition: background-color 500ms ease-in-out, color 500ms ease-in-out;
}

/* 다크모드에서 remaining-support 배경색 조정 */
@media (prefers-color-scheme: dark) {
  .remaining-support {
    background-color: rgba(144, 202, 249, 0.1);
  }
}

[data-theme="dark"] .remaining-support,
body[data-theme="dark"] .remaining-support {
  background-color: rgba(144, 202, 249, 0.1);
}

.support-per-person {
  color: var(--success);
  font-weight: 500;
  margin-top: 12px;
  padding: 8px;
  background-color: rgba(67, 160, 71, 0.1);
  border-radius: 4px;
  transition: background-color 500ms ease-in-out, color 500ms ease-in-out;
}

/* 다크모드에서 support-per-person 배경색 조정 */
@media (prefers-color-scheme: dark) {
  .support-per-person {
    background-color: rgba(102, 187, 106, 0.1);
  }
}

[data-theme="dark"] .support-per-person,
body[data-theme="dark"] .support-per-person {
  background-color: rgba(102, 187, 106, 0.1);
}

.error {
  color: var(--error);
  font-size: 14px;
  margin-top: 4px;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
}

.checkbox-group input[type="checkbox"] {
  width: 18px;
  height: 18px;
  margin: 0;
}

.checkbox-group label {
  margin: 0;
  cursor: pointer;
  display: flex;
  gap: .5rem;
  align-items: center;
}

/* Material Design Button Style for <a> */
a.md-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: var(--primary-color);
  color: var(--surface);
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  text-decoration: none;
  box-shadow: 0 2px 4px var(--shadow-color);
  cursor: pointer;
  transition: background-color 0.3s, box-shadow 0.3s, color 500ms ease-in-out;
}

a.md-btn:hover,
a.md-btn:focus {
  background-color: var(--primary-dark);
  text-decoration: none;
  box-shadow: 0 4px 8px var(--shadow-color);
  color: var(--surface);
}

.home-button {
  padding: 10px 20px;
  background-color: #7B1FA2;
  color: var(--surface);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease, color 500ms ease-in-out;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-transform: none;
}

.home-button:hover {
  background-color: #6A1B9A;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px var(--shadow-color);
}

.home-button .material-icons {
  font-size: 20px;
}

/* Confirm Dialog Styles */
.confirm-dialog {
  border: none;
  border-radius: 8px;
  padding: 0;
  max-width: 400px;
  width: 90%;
  background: var(--surface);
  box-shadow: 0 8px 32px var(--shadow-color);
  transition: background-color 500ms ease-in-out, box-shadow 500ms ease-in-out;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
}

.confirm-dialog::backdrop {
  background: var(--overlay-color);
  backdrop-filter: blur(2px);
}

.dialog-content {
  padding: 24px;
}

.dialog-title {
  margin: 0 0 16px 0;
  color: var(--text-primary);
  font-size: 20px;
  font-weight: 500;
  transition: color 500ms ease-in-out;
}

.dialog-message {
  margin: 0 0 24px 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.5;
  transition: color 500ms ease-in-out;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dialog-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease, color 500ms ease-in-out;
}

.dialog-btn-cancel {
  background-color: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.dialog-btn-cancel:hover {
  background-color: var(--background);
}

.dialog-btn-confirm {
  background-color: var(--primary-color);
  color: var(--surface);
}

.dialog-btn-confirm:hover {
  background-color: var(--primary-dark);
}
</style>
