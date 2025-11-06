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
            @input="autoGrowTextarea($event.target)" ref="memberDrinkMemoRef"></textarea>
        </div>
        <div class="input-group-cell">
          <label for="guestDrink">🍺👤 난입 (술 마신)</label>
          <input type="number" id="guestDrink" v-model.number="guestDrink" min="0">
          <textarea id="guestDrinkMemo" v-model="guestDrinkMemo" rows="1" placeholder="예: 이난입, 박외부"
            @input="autoGrowTextarea($event.target)" ref="guestDrinkMemoRef"></textarea>
        </div>
        <div class="input-group-cell">
          <label for="memberNoDrink">부원 (술 안 마신)</label>
          <input type="number" id="memberNoDrink" v-model.number="memberNoDrink" min="0">
          <textarea id="memberNoDrinkMemo" v-model="memberNoDrinkMemo" rows="1" placeholder="예: 최부원, 정회원"
            @input="autoGrowTextarea($event.target)" ref="memberNoDrinkMemoRef"></textarea>
        </div>
        <div class="input-group-cell">
          <label for="guestNoDrink">👤 난입 (술 안 마신)</label>
          <input type="number" id="guestNoDrink" v-model.number="guestNoDrink" min="0">
          <textarea id="guestNoDrinkMemo" v-model="guestNoDrinkMemo" rows="1" placeholder="예: 외부1, 외부2"
            @input="autoGrowTextarea($event.target)" ref="guestNoDrinkMemoRef"></textarea>
        </div>
      </div>

      <button type="submit" id="calc-button">
        <span class="material-icons">calculate</span>
        정산 계산하기
      </button>
    </form>
    <div id="result" class="result" v-html="resultHtml"></div>

    <!-- Hidden download link -->
    <a ref="downloadLink" :href="downloadUrl" :download="downloadFilename" style="display: none"></a>

    <!-- Hidden file input -->
    <input ref="fileInput" type="file" accept="application/json" style="display: none" @change="handleFileImport" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import pako from 'pako';
import msgpack from 'msgpack-lite';

const STORAGE_KEY = 'jungsanFormData-alchol';

const route = useRoute();
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
const resultHtml = ref('');

const memberDrinkMemoRef = ref(null);
const guestDrinkMemoRef = ref(null);
const memberNoDrinkMemoRef = ref(null);
const guestNoDrinkMemoRef = ref(null);
const downloadLink = ref(null);
const downloadUrl = ref('');
const downloadFilename = ref('');
const fileInput = ref(null);

// msgpack + pako + base64url 조합 인코딩/디코딩 함수
function base64UrlEncode(uint8arr) {
  let b64 = btoa(String.fromCharCode(...uint8arr));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Uint8Array.from(atob(str), c => c.charCodeAt(0));
}

function encodeForShare(data) {
  const raw = msgpack.encode(data);
  const deflated = pako.deflate(raw);
  return base64UrlEncode(deflated);
}

function decodeFromShare(b64url) {
  const deflated = base64UrlDecode(b64url);
  const raw = pako.inflate(deflated);
  return msgpack.decode(raw);
}

// textarea 오토그로우 함수
function autoGrowTextarea(el) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = (el.scrollHeight) + 'px';
}

// 계산 함수
const calculate = () => {
  resultHtml.value = '';

  const totalMembers = memberDrink.value + memberNoDrink.value;
  const totalGuests = guestDrink.value + guestNoDrink.value;
  const totalPeople = totalMembers + totalGuests;
  const totalDrinkers = memberDrink.value + guestDrink.value;

  if (totalPeople === 0) {
    alert('전체 인원이 0명입니다.');
    return;
  }
  if (totalMembers === 0) {
    alert('부원 수가 0명입니다.');
    return;
  }

  // 1. 음식값 n분의 1
  const foodPerPerson = foodPrice.value / totalPeople;
  // 2. 부원당 지원금
  const supportPerMember = totalSupport.value / totalMembers;
  // 3. 술값 n분의 1 (술 마신 인원만)
  const alcoholPerDrinker = totalDrinkers > 0 ? alcoholPrice.value / totalDrinkers : 0;

  // 4가지 유형별 금액 계산
  const memberDrinkPay = foodPerPerson - supportPerMember + alcoholPerDrinker;
  const memberNoDrinkPay = foodPerPerson - supportPerMember;
  const guestDrinkPay = foodPerPerson + alcoholPerDrinker;
  const guestNoDrinkPay = foodPerPerson;

  // 0원 미만 방지
  const memberDrinkPayFinal = Math.max(0, memberDrinkPay);
  const memberNoDrinkPayFinal = Math.max(0, memberNoDrinkPay);

  // 결과 데이터
  const results = [
    {
      label: '술 마신 부원',
      count: memberDrink.value,
      pay: memberDrinkPayFinal,
      support: supportPerMember
    },
    {
      label: '술 안 마신 부원',
      count: memberNoDrink.value,
      pay: memberNoDrinkPayFinal,
      support: supportPerMember
    },
    {
      label: '술 마신 난입',
      count: guestDrink.value,
      pay: guestDrinkPay,
      support: null
    },
    {
      label: '술 안 마신 난입',
      count: guestNoDrink.value,
      pay: guestNoDrinkPay,
      support: null
    }
  ];

  displayResults({ results, supportPerMember });
};

const sum = array => array.reduce((acc, cur) => acc + cur, 0);

// 결과 표시 함수
const displayResults = ({ results, supportPerMember }) => {
  let html = `<h2>정산 결과</h2>`;
  html += `<div class="support-per-person">부원 1인당 지원금: ${Math.round(supportPerMember).toLocaleString()}원</div>`;
  html += `<table style="width:100%;margin-top:1rem;border-collapse:collapse;">
    <thead>
      <tr style="background:#f0f4fa;">
        <th>구분</th>
        <th>인원</th>
        <th>1인당 금액</th>
        <th>지원금</th>
      </tr>
    </thead>
    <tbody>
      ${results.map(r => `
        <tr>
          <td>${r.label}</td>
          <td>${r.count}명</td>
          <td>${Math.round(r.pay).toLocaleString()}원</td>
          <td>${r.support !== null ? Math.round(r.support).toLocaleString() + '원' : '-'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>`;
  resultHtml.value = html;
};

// 폼 제출 핸들러
const handleSubmit = () => {
  calculate();
};

// 링크로 공유 함수
const shareLink = () => {
  const data = getFormData();
  if (!data) {
    alert('공유할 데이터가 없습니다.');
    return;
  }
  const b64url = encodeForShare(data);
  const url = `${window.location.origin}${route.path}?data=${encodeURIComponent(b64url)}`;
  window.history.replaceState(null, '', url);
  navigator.clipboard.writeText(url).then(() => {
    alert('공유 링크가 클립보드에 복사되었습니다!');
  });
};

// 쿼리에서 data 있으면 복원 (복원 성공 시 true 반환)
function tryRestoreFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const b64url = params.get('data');
  if (b64url) {
    try {
      const parsed = decodeFromShare(b64url);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      loadFromLocalStorage(parsed);
      alert('공유된 데이터를 불러왔습니다.');
      return true;
    } catch {
      alert('공유 데이터 복원에 실패했습니다.');
    }
  }
  return false;
}

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

// 폼 데이터 저장 함수
const saveToLocalStorage = () => {
  const data = getFormData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  // 쿼리스트링에 data가 있을 경우, 최신 데이터로 갱신
  const params = new URLSearchParams(window.location.search);
  if (params.get('data')) {
    const b64url = encodeForShare(data);
    const url = `${window.location.origin}${route.path}?data=${encodeURIComponent(b64url)}`;
    window.history.replaceState(null, '', url);
  }
};

// 폼 데이터 불러오기 함수
const loadFromLocalStorage = async (dataObj) => {
  let data = dataObj;
  if (!data) {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    if (!confirm('기존에 작성중이던 데이터를 불러올까요?')) return;
    data = JSON.parse(raw);
  }
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
  await nextTick();
  if (memberDrinkMemoRef.value) autoGrowTextarea(memberDrinkMemoRef.value);
  if (guestDrinkMemoRef.value) autoGrowTextarea(guestDrinkMemoRef.value);
  if (memberNoDrinkMemoRef.value) autoGrowTextarea(memberNoDrinkMemoRef.value);
  if (guestNoDrinkMemoRef.value) autoGrowTextarea(guestNoDrinkMemoRef.value);
};

// 폼 전체 초기화 함수
const resetForm = () => {
  if (!confirm(`정말 초기화 하시겠습니까? 초기화시 임시저장된 데이터는 삭제되고 되돌릴 수 없습니다.`)) return;
  localStorage.removeItem(STORAGE_KEY);
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
  resultHtml.value = '';
};

// JSON 내보내기 함수
const exportJson = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    alert('내보낼 데이터가 없습니다.');
    return;
  }
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  downloadUrl.value = url;
  downloadFilename.value = 'jungsan_data.json';
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
};

// JSON 가져오기 함수
const handleFileImport = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const json = JSON.parse(event.target.result);
      // 데이터 유효성 간단 체크
      if (typeof json.totalSupport === 'undefined') {
        alert('올바르지 않은 파일입니다.');
        return;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(json));
      loadFromLocalStorage(json);
      alert('데이터를 성공적으로 불러왔습니다.');
    } catch {
      alert('올바르지 않은 JSON 파일입니다.');
    }
  };
  reader.readAsText(file);
  // Reset input
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const importJson = () => {
  fileInput.value?.click();
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
  saveToLocalStorage();
});

// 초기화
onMounted(async () => {
  if (tryRestoreFromQuery()) {
    return;
  }
  if (localStorage.getItem(STORAGE_KEY)) {
    await loadFromLocalStorage();
  }
  // 초기 textarea 오토그로우 적용
  await nextTick();
  if (memberDrinkMemoRef.value) autoGrowTextarea(memberDrinkMemoRef.value);
  if (guestDrinkMemoRef.value) autoGrowTextarea(guestDrinkMemoRef.value);
  if (memberNoDrinkMemoRef.value) autoGrowTextarea(memberNoDrinkMemoRef.value);
  if (guestNoDrinkMemoRef.value) autoGrowTextarea(guestNoDrinkMemoRef.value);
});
</script>

<style scoped>
/* Design Theme: Material Design */
:root {
  --primary-color: #1976d2;
  --primary-light: #4791db;
  --primary-dark: #115293;
  --error-color: #d32f2f;
  --text-primary: rgba(0, 0, 0, 0.87);
  --text-secondary: rgba(0, 0, 0, 0.6);
  --background-color: #f5f5f5;
  --green-color: #43A047;
  --green-light: #66BB6A;
  --green-dark: #2E7D32;
}

.jungsan-alchol-container {
  font-family: 'Roboto', sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: var(--background-color);
  color: var(--text-primary);
}

h1 {
  color: var(--primary-color);
  font-weight: 500;
  margin-bottom: 24px;
}

.table-container {
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.table-container:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
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
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: grid;
  gap: .5rem;
}

button {
  padding: 10px 20px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  transition: background-color 0.3s ease;
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
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s ease;
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
  background: var(--background-color);
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
}

.support-per-person {
  color: var(--green-color);
  font-weight: 500;
  margin-top: 12px;
  padding: 8px;
  background-color: rgba(25, 118, 210, 0.1);
  border-radius: 4px;
}

.error {
  color: var(--error-color);
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
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  text-decoration: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: background-color 0.3s, box-shadow 0.3s;
}

a.md-btn:hover,
a.md-btn:focus {
  background-color: var(--primary-dark);
  text-decoration: none;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
  color: #fff;
}

/* 반응형 flex 레이아웃 for form#input-fields */
form#input-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  padding: 24px 20px 20px 20px;
  margin-top: 24px;
  margin-bottom: 24px;
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
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  width: 100%;
}

.input-group-cell {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 6px;
  padding: 12px 10px 10px 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  min-width: 0;
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
</style>
