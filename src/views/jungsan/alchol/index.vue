<template>
  <div class="jungsan-alchol-container">
    <div class="d-flex">
      <router-link to="/jungsan" class="md-btn">테이블당 정산기</router-link>
    </div>
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <h1>언네임드 회식 정산 계산기</h1>
      <div style="display: flex; align-items: center; justify-content: end; gap: 0.2rem; flex-wrap: wrap;">
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
    <form id="input-fields" @submit.prevent="handleSubmit">
      <div class="input-group-values">
        <div class="input-group">
          <label for="totalSupport">총 회식 지원비</label>
          <input type="number" id="totalSupport" v-model.number="totalSupport" min="0">
        </div>
        <div class="input-group">
          <label for="foodPrice">음식값</label>
          <input type="number" id="foodPrice" v-model.number="foodPrice" min="0">
        </div>
        <div class="input-group">
          <label for="alcoholPrice">술값</label>
          <input type="number" id="alcoholPrice" v-model.number="alcoholPrice" min="0">
        </div>
      </div>
      <!-- 2x2 표로 부원/난입, 술 여부 입력 -->
      <div class="input-group-table">
        <div class="input-group-cell">
          <label for="memberDrink">🍺 부원 (술 마신)</label>
          <input type="number" id="memberDrink" v-model.number="memberDrink" min="0">
          <textarea id="memberDrinkMemo" v-model="memberDrinkMemo" rows="1" placeholder="예: 홍길동, 김철수"
            @input="handleAutoGrow" ref="memberDrinkMemoRef"></textarea>
        </div>
        <div class="input-group-cell">
          <label for="guestDrink">🍺👤 난입 (술 마신)</label>
          <input type="number" id="guestDrink" v-model.number="guestDrink" min="0">
          <textarea id="guestDrinkMemo" v-model="guestDrinkMemo" rows="1" placeholder="예: 이난입, 박외부"
            @input="handleAutoGrow" ref="guestDrinkMemoRef"></textarea>
        </div>
        <div class="input-group-cell">
          <label for="memberNoDrink">부원 (술 안 마신)</label>
          <input type="number" id="memberNoDrink" v-model.number="memberNoDrink" min="0">
          <textarea id="memberNoDrinkMemo" v-model="memberNoDrinkMemo" rows="1" placeholder="예: 최부원, 정회원"
            @input="handleAutoGrow" ref="memberNoDrinkMemoRef"></textarea>
        </div>
        <div class="input-group-cell">
          <label for="guestNoDrink">👤 난입 (술 안 마신)</label>
          <input type="number" id="guestNoDrink" v-model.number="guestNoDrink" min="0">
          <textarea id="guestNoDrinkMemo" v-model="guestNoDrinkMemo" rows="1" placeholder="예: 외부1, 외부2"
            @input="handleAutoGrow" ref="guestNoDrinkMemoRef"></textarea>
        </div>
      </div>

      <button type="submit" id="calc-button">
        <span class="material-icons">calculate</span>
        정산 계산하기
      </button>
    </form>
    <div id="result" ref="resultRef" class="result"
      v-if="formattedResults && formattedResults.formattedResults && formattedResults.formattedResults.length > 0">
      <h2>정산 결과</h2>
      <div class="support-per-person">부원 1인당 지원금: {{ formattedResults.formattedSupportPerMember }}원</div>
      <table class="result-table">
        <thead>
          <tr>
            <th>구분</th>
            <th>인원</th>
            <th>1인당 금액</th>
            <th>지원금</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(result, index) in formattedResults.formattedResults" :key="index">
            <td>{{ result.label || '-' }}</td>
            <td>{{ result.count || 0 }}명</td>
            <td>{{ result.formattedPay || '-' }}원</td>
            <td>{{ result.formattedSupport || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Hidden download link -->
    <a ref="downloadLink" :href="downloadUrl" :download="downloadFilename" style="display: none"></a>

    <!-- Hidden file input -->
    <input ref="fileInput" type="file" accept="application/json" style="display: none" @change="handleFileImport" />

    <!-- Confirm Dialog -->
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

<style scoped>
.jungsan-alchol-container {
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

.result-table {
  width: 100%;
  margin-top: 1rem;
  border-collapse: collapse;
}

.result-table thead tr {
  background: var(--background);
  transition: background-color 500ms ease-in-out;
}

.result-table th,
.result-table td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
  transition: border-color 500ms ease-in-out, color 500ms ease-in-out;
}

.result-table th {
  font-weight: 500;
  color: var(--text-primary);
}

.result-table tbody tr:hover {
  background: var(--background);
  transition: background-color 500ms ease-in-out;
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

/* 반응형 flex 레이아웃 for form#input-fields */
form#input-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  background: var(--surface);
  border-radius: 8px;
  box-shadow: 0 2px 4px var(--shadow-color);
  padding: 24px 20px 20px 20px;
  margin-top: 24px;
  margin-bottom: 24px;
  transition: background-color 500ms ease-in-out, box-shadow 500ms ease-in-out;
}

form#input-fields .input-group {
  flex: 1 1 240px;
  min-width: 220px;
  max-width: 320px;
}

form#input-fields button {
  flex: 1 1 100%;
  max-width: 100%;
  margin-top: 12px;
  align-self: flex-end;
  justify-content: center;
  width: 100%;
}

@media (max-width: 900px) {
  form#input-fields {
    gap: 12px;
    padding: 16px 8px 12px 8px;
  }

  form#input-fields .input-group {
    min-width: 160px;
    max-width: 100%;
  }
}

@media (max-width: 600px) {
  form#input-fields {
    flex-direction: column;
    gap: 8px;
    padding: 10px 2vw 8px 2vw;
  }

  form#input-fields .input-group {
    min-width: 0;
    max-width: 100%;
  }

  form#input-fields button {
    margin-top: 8px;
  }
}

form#input-fields {
  justify-content: center;
  align-items: center;
}

/* 2x2 표 스타일 for input-group-table */
.input-group-table {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
  background: var(--background);
  border-radius: 8px;
  padding: 12px 8px;
  box-shadow: 0 1px 2px var(--shadow-color);
  width: 100%;
  transition: background-color 500ms ease-in-out, box-shadow 500ms ease-in-out;
}

.input-group-cell {
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border-radius: 6px;
  padding: 12px 10px 10px 10px;
  box-shadow: 0 1px 2px var(--shadow-color);
  min-width: 0;
  transition: background-color 500ms ease-in-out, box-shadow 500ms ease-in-out;
}

.input-group-cell label {
  margin-bottom: 6px;
  color: var(--text-secondary);
  font-size: 14px;
}

@media (max-width: 700px) {
  .input-group-table {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 10px;
    padding: 6px 2px;
  }

  .input-group-cell {
    padding: 10px 6px 8px 6px;
  }
}

/* input-group-values grid layout (반응형) */
.input-group-values {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 18px;
  width: 100%;
}

@media (max-width: 900px) {
  .input-group-values {
    gap: 12px;
  }
}

@media (max-width: 600px) {
  .input-group-values {
    gap: 8px;
  }
}

/* 모든 form 필드 100% 너비 */
form input,
form select,
form textarea,
form button {
  width: 100%;
  box-sizing: border-box;
}

.input-group,
.input-group-cell,
.input-group-values {
  width: 100%;
}

.input-group-values>.input-group> :is(input, select, textarea) {
  width: 100%;
}

/* textarea 자동 resize (auto-grow) */
form textarea {
  resize: vertical;
  min-height: 32px;
  max-height: 200px;
  overflow-y: auto;
  transition: min-height 0.2s;
}

@media (min-width: 768px) {
  form#input-fields {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  form#input-fields>button {
    grid-column: span 2;
  }
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
