<template>
  <div class="jungsan-container">
    <div class="d-flex">
      <router-link to="/jungsan/alchol" class="md-btn">일반인 / 술고래 구분 정산기</router-link>
    </div>
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <h1>언네임드 회식 정산 계산기</h1>
      <div style="display: flex; align-items: center; justify-content: end; gap: 0.2rem; flex-wrap: wrap;">
        <router-link to="/" class="home-button">
          <span class="material-icons">home</span>앱 목록
        </router-link>
        <button @click="resetForm" style="margin-left: 1rem;">
          <span class="material-icons">restart_alt</span>초기화
        </button>
        <button @click="exportJson" style="margin-left: 0.5rem;">
          <span class="material-icons">file_upload</span>JSON 내보내기
        </button>
        <button @click="importJson" style="margin-left: 0.5rem;">
          <span class="material-icons">file_download</span>JSON 가져오기
        </button>
        <button @click="shareLink" style="margin-left: 0.5rem;">
          <span class="material-icons">link</span>링크로 공유
        </button>
      </div>
    </div>

    <div class="input-group">
      <label for="tableCount">테이블 개수</label>
      <input type="number" id="tableCount" v-model.number="tableCount" min="1" @input="handleTableCountChange">
      <button @click="createTables">
        <span class="material-icons">add_circle</span>
        테이블 생성
      </button>
    </div>

    <div class="input-group">
      <label for="totalSupport">총 회식 지원비</label>
      <input type="number" id="totalSupport" v-model.number="totalSupport" min="0">
    </div>

    <div id="tablesContainer">
      <div v-for="(table, index) in tables" :key="index" class="table-container">
        <h3>테이블 {{ index + 1 }}</h3>
        <div class="input-group">
          <label>부원 수</label>
          <input type="number" v-model.number="table.memberCount" min="0">
        </div>
        <div class="input-group">
          <label>난입 수</label>
          <input type="number" v-model.number="table.guestCount" min="0">
        </div>
        <div class="input-group">
          <label>메모</label>
          <textarea v-model="table.memo" rows="2" placeholder="부원, 난입 이름을 입력하세요"></textarea>
        </div>
        <div class="input-group">
          <label>음식 가격</label>
          <input type="number" v-model.number="table.foodPrice" min="0">
        </div>
        <div class="checkbox-group">
          <label>
            <input type="checkbox" v-model="table.hasAlcohol">
            술 섭취
          </label>
        </div>
      </div>
    </div>

    <button @click="calculate" id="calc-button">
      <span class="material-icons">calculate</span>
      정산 계산하기
    </button>

    <div id="result" ref="resultRef" class="result"
      v-if="formattedResults && formattedResults.formattedResults && formattedResults.formattedResults.length > 0">
      <h2>정산 결과</h2>
      <div class="support-per-person">인당 지원금: {{ formattedResults.formattedSupportPerMember }}원</div>
      <div v-if="formattedResults.formattedRemainingSupportSum" class="remaining-support" style="font-size: 1.2rem;">
        <strong>총 남은 지원금: </strong> {{ formattedResults.formattedRemainingSupportSum }}원
      </div>
      <div v-for="(result, index) in formattedResults.formattedResults" :key="index" class="table-container">
        <h3>테이블 {{ result.tableNumber }} {{ result.hasAlcohol ? '🍺' : '' }}</h3>
        <p><strong>메모:</strong> {{ result.memo || '없음' }}</p>
        <p><strong>부원({{ result.memberCount }}명) 정산금액:</strong> {{ result.formattedMemberPayment }}원</p>
        <p><strong>난입({{ result.guestCount }}명) 정산금액:</strong> {{ result.formattedGuestPayment }}원</p>
        <p v-if="result.hasAlcohol"><strong>술 섭취:</strong> 예</p>
        <p v-if="result.formattedRemainingSupport" class="remaining-support">
          <strong>남은 지원금:</strong> {{ result.formattedRemainingSupport }}원
        </p>
      </div>
    </div>

    <!-- Hidden download link -->
    <a ref="downloadLink" :href="downloadUrl" :download="downloadFilename" style="display: none"></a>

    <!-- Hidden file input -->
    <input ref="fileInput" type="file" accept="application/json" style="display: none" @change="handleFileImport" />

    <!-- Confirm/Alert Dialog -->
    <dialog ref="dialogRef" class="confirm-dialog" @click="handleDialogClick">
      <div class="dialog-content" @click.stop>
        <h3 class="dialog-title">{{ dialogTitle }}</h3>
        <p class="dialog-message">{{ dialogMessage }}</p>
        <div class="dialog-actions">
          <button v-if="!isAlert" @click="handleCancel" class="dialog-btn dialog-btn-cancel">취소</button>
          <button ref="confirmButtonRef" @click="handleConfirm" class="dialog-btn dialog-btn-confirm"
            autofocus>확인</button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useJungsanStorage } from '../../composables/useJungsanStorage.js';
import { calculateTableBased } from '../../composables/useJungsanCalculation.js';
import { useFileExport } from '../../composables/useFileExport.js';
import { useConfirmDialog } from '../../composables/useConfirmDialog.js';
import { validateTableBasedData } from '../../utils/jungsanValidation.js';

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
