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

    <div id="result" class="result" v-html="resultHtml"></div>
    
    <!-- Hidden download link -->
    <a
      ref="downloadLink"
      :href="downloadUrl"
      :download="downloadFilename"
      style="display: none"
    ></a>
    
    <!-- Hidden file input -->
    <input
      ref="fileInput"
      type="file"
      accept="application/json"
      style="display: none"
      @change="handleFileImport"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import pako from 'pako';
import msgpack from 'msgpack-lite';

const STORAGE_KEY = 'jungsanFormData';

const route = useRoute();
const tableCount = ref(1);
const totalSupport = ref(0);
const tables = ref([]);
const resultHtml = ref('');
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

// 계산 함수
const calculate = () => {
  resultHtml.value = '';
  
  // 총 부원 수 계산
  const totalMembers = tables.value.reduce((sum, table) => {
    return sum + (table.memberCount || 0);
  }, 0);

  if (totalMembers === 0) {
    alert('부원 수가 0명입니다.');
    return;
  }

  // 부원당 지원금 계산
  const supportPerMember = totalSupport.value / totalMembers;

  // 각 테이블별 계산
  const results = tables.value.map((table, index) => {
    const data = collectTableData(table);
    const totalPeople = data.memberCount + data.guestCount;

    if (totalPeople === 0) return null;

    const pricePerPerson = data.foodPrice / totalPeople;
    let remainingSupport = 0;
    const memberPayment = Math.max(pricePerPerson - supportPerMember, 0);
    const guestPayment = pricePerPerson;

    if (!memberPayment) {
      remainingSupport = supportPerMember * data.memberCount - (pricePerPerson * data.memberCount);
    }

    return {
      tableNumber: index + 1,
      memo: data.memo,
      memberPayment,
      memberCount: data.memberCount,
      guestPayment,
      guestCount: data.guestCount,
      hasAlcohol: data.hasAlcohol,
      remainingSupport
    };
  }).filter(Boolean);

  displayResults({ results, supportPerMember });
};

const sum = array => array.reduce((acc, cur) => acc + cur, 0);

// 결과 표시 함수
const displayResults = ({ results, supportPerMember }) => {
  const remainingSupportSum = sum(results.map(el => el.remainingSupport ?? 0)) > 0
    ? `<div class="remaining-support" style="font-size: 1.2rem;"><strong>총 남은 지원금: </strong> ${sum(results.map(el => el.remainingSupport)).toLocaleString()}원 </div>`
    : '';
  
  const resultHTML = results.map(result => `
    <div class="table-container">
      <h3>테이블 ${result.tableNumber} ${result.hasAlcohol ? '🍺' : ''}</h3>
      <p><strong>메모:</strong> ${result.memo || '없음'}</p>
      <p><strong>부원(${result.memberCount}명) 정산금액:</strong> ${Math.round(result.memberPayment).toLocaleString()}원</p>
      <p><strong>난입(${result.guestCount}명) 정산금액:</strong> ${Math.round(result.guestPayment).toLocaleString()}원</p>
      ${result.hasAlcohol ? '<p><strong>술 섭취:</strong> 예</p>' : ''}
      ${result.remainingSupport > 0 ? `<p class="remaining-support"><strong>남은 지원금:</strong> ${Math.round(result.remainingSupport).toLocaleString()}원</p>` : ''}
    </div>
  `).join('');
  
  resultHtml.value = `
    <h2>정산 결과</h2>
    <div class="support-per-person">인당 지원금: ${supportPerMember.toLocaleString()}원 </div>
    ${remainingSupportSum}
    ${resultHTML}
  `;
};

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
  if (tables.value.length === 0) return null;
  return {
    tableCount: tableCount.value,
    totalSupport: totalSupport.value,
    tableData: tables.value.map(table => collectTableData(table))
  };
};

// 폼 데이터 저장 함수
const saveToLocalStorage = () => {
  const data = getFormData();
  if (!data) return;
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
const loadFromLocalStorage = (dataObj) => {
  let data = dataObj;
  if (!data) {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    if (!confirm('기존에 작성중이던 데이터를 불러올까요?')) return;
    data = JSON.parse(raw);
  }
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

// 폼 전체 초기화 함수
const resetForm = () => {
  if (!confirm(`정말 초기화 하시겠습니까? 초기화시 임시저장된 데이터는 삭제되고 되돌릴 수 없습니다.`)) return;

  localStorage.removeItem(STORAGE_KEY);
  tableCount.value = 1;
  totalSupport.value = 0;
  createTables();
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
      if (!json.tableCount || !Array.isArray(json.tableData)) {
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
watch([tableCount, totalSupport, tables], () => {
  saveToLocalStorage();
}, { deep: true });

// 초기화
onMounted(() => {
  if (tryRestoreFromQuery()) {
    return;
  }
  if (localStorage.getItem(STORAGE_KEY)) {
    loadFromLocalStorage();
  } else {
    createTables();
  }
});
</script>

<style scoped>
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

.jungsan-container {
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
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: box-shadow 0.3s ease;
}

.table-container:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
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
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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

input, textarea {
  width: 100%;
  padding: 12px;
  margin: 4px 0;
  border: 1px solid rgba(0,0,0,0.12);
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

input:focus, textarea:focus {
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
  box-shadow: 0 2px 4px rgba(0,0,0,0.08);
  cursor: pointer;
  transition: background-color 0.3s, box-shadow 0.3s;
}

a.md-btn:hover, a.md-btn:focus {
  background-color: var(--primary-dark);
  text-decoration: none;
  box-shadow: 0 4px 8px rgba(0,0,0,0.12);
  color: #fff;
}

.home-button {
  padding: 10px 20px;
  background-color: #7B1FA2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-transform: none;
}

.home-button:hover {
  background-color: #6A1B9A;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(123, 31, 162, 0.3);
}

.home-button .material-icons {
  font-size: 20px;
}
</style>
