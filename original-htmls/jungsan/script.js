// DOM 요소 선택자
const selectors = {
    tableCount: '#tableCount',
    tablesContainer: '#tablesContainer',
    totalSupport: '#totalSupport',
    result: '#result',
    calcButton: '#calc-button',
    createTablesButton: '#createTables'
};

// localStorage 저장 키
const STORAGE_KEY = 'jungsanFormData';

// 테이블 생성 함수
const createTables = () => {
    const tableCount = parseInt(document.querySelector(selectors.tableCount).value);
    const container = document.querySelector(selectors.tablesContainer);
    container.innerHTML = '';

    const tables = Array.from({ length: tableCount }, (_, i) => {
        const tableDiv = document.createElement('div');
        tableDiv.className = 'table-container';
        tableDiv.innerHTML = `
            <h3>테이블 ${i + 1}</h3>
            <div class="input-group">
                <label>부원 수</label>
                <input type="number" class="memberCount" min="0" value="0">
            </div>
            <div class="input-group">
                <label>난입 수</label>
                <input type="number" class="guestCount" min="0" value="0">
            </div>
            <div class="input-group">
                <label>메모</label>
                <textarea class="memo" rows="2" placeholder="부원, 난입 이름을 입력하세요"></textarea>
            </div>
            <div class="input-group">
                <label>음식 가격</label>
                <input type="number" class="foodPrice" min="0" value="0">
            </div>
            <div class="checkbox-group">
                <label for="alcohol${i}">
                    <input type="checkbox" id="alcohol${i}" class="alcoholCheck">
                술 섭취</label>
            </div>
        `;
        return tableDiv;
    });

    container.append(...tables);
};

// 테이블 데이터 수집 함수
const collectTableData = (table) => {
    const memberCount = parseInt(table.querySelector('.memberCount').value) || 0;
    const guestCount = parseInt(table.querySelector('.guestCount').value) || 0;
    const foodPrice = parseInt(table.querySelector('.foodPrice').value) || 0;
    const memo = table.querySelector('.memo').value;
    const hasAlcohol = table.querySelector('.alcoholCheck').checked;

    return {
        memberCount,
        guestCount,
        foodPrice,
        memo,
        hasAlcohol
    };
};

// 계산 함수
const calculate = () => {
    const totalSupport = parseInt(document.querySelector(selectors.totalSupport).value) || 0;
    const tables = document.getElementsByClassName('table-container');
    
    // 총 부원 수 계산
    const totalMembers = Array.from(tables).reduce((sum, table) => {
        const { memberCount } = collectTableData(table);
        return sum + memberCount;
    }, 0);

    if (totalMembers === 0) {
        alert('부원 수가 0명입니다.');
        return;
    }

    // 부원당 지원금 계산
    const supportPerMember = totalSupport / totalMembers;

    // 각 테이블별 계산
    const results = Array.from(tables).map((table, index) => {
        const { memberCount, guestCount, foodPrice, memo, hasAlcohol } = collectTableData(table);
        const totalPeople = memberCount + guestCount;

        if (totalPeople === 0) return null;

        const pricePerPerson = foodPrice / totalPeople;
        let remainingSupport = 0;
        const memberPayment = Math.max(pricePerPerson - supportPerMember, 0);
        const guestPayment = pricePerPerson;

        if (!memberPayment) remainingSupport = supportPerMember * memberCount - (pricePerPerson * memberCount);

        return {
            tableNumber: index + 1,
            memo,
            memberPayment,
            memberCount,
            guestPayment,
            guestCount,
            hasAlcohol,
            remainingSupport
        };
    }).filter(Boolean);

    return displayResults({results, supportPerMember});
};

const sum = array => array.reduce((acc, cur)=>acc+cur, 0);

// 결과 표시 함수
const resultDiv = document.querySelector(selectors.result);
const displayResults = ({results, supportPerMember}) => {
    const remainingSupportSum = sum(results.map(el=>el.remainingSupport ?? 0)) > 0 ? `<div class="remaining-support" style="font-size: 1.2rem;"><strong>총 남은 지원금: </strong> ${sum(results.map(el=>el.remainingSupport)).toLocaleString()}원 </div>` : '';
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
    const html = `
        <h2>정산 결과</h2>
        <div class="support-per-person">인당 지원금: ${supportPerMember.toLocaleString()}원 </div>
        ${remainingSupportSum}
        ${resultHTML}
    `;

    resultDiv.innerHTML = html;
};

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
    const raw = window.msgpack.encode(data);
    const deflated = window.pako.deflate(raw);
    return base64UrlEncode(deflated);
}
function decodeFromShare(b64url) {
    const deflated = base64UrlDecode(b64url);
    const raw = window.pako.inflate(deflated);
    return window.msgpack.decode(raw);
}

// 링크로 공유 함수
const shareLink = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
        alert('공유할 데이터가 없습니다.');
        return;
    }
    const obj = JSON.parse(data);
    const b64url = encodeForShare(obj);
    const url = `${location.origin}${location.pathname}?data=${encodeURIComponent(b64url)}`;
    window.history.replaceState(null, '', url);
    navigator.clipboard.writeText(url).then(() => {
        alert('공유 링크가 클립보드에 복사되었습니다!');
    });
};

// 쿼리에서 data 있으면 복원 (복원 성공 시 true 반환)
function tryRestoreFromQuery() {
    const params = new URLSearchParams(location.search);
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

// 폼 데이터 저장 함수
const saveToLocalStorage = () => {
    const tableCount = parseInt(document.querySelector(selectors.tableCount).value) || 0;
    const totalSupport = parseInt(document.querySelector(selectors.totalSupport).value) || 0;
    const tables = document.getElementsByClassName('table-container');
    const tableData = Array.from(tables).map(table => collectTableData(table));
    const data = {
        tableCount,
        totalSupport,
        tableData
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    // 쿼리스트링에 data가 있을 경우, 최신 데이터로 갱신
    const params = new URLSearchParams(location.search);
    if (params.get('data')) {
        const b64url = encodeForShare(data);
        const url = `${location.origin}${location.pathname}?data=${encodeURIComponent(b64url)}`;
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
    document.querySelector(selectors.tableCount).value = data.tableCount;
    document.querySelector(selectors.totalSupport).value = data.totalSupport;
    createTables();
    // 테이블 입력값 세팅
    const tables = document.getElementsByClassName('table-container');
    data.tableData.forEach((table, i) => {
        if (!tables[i]) return;
        tables[i].querySelector('.memberCount').value = table.memberCount;
        tables[i].querySelector('.guestCount').value = table.guestCount;
        tables[i].querySelector('.foodPrice').value = table.foodPrice;
        tables[i].querySelector('.memo').value = table.memo;
        tables[i].querySelector('.alcoholCheck').checked = table.hasAlcohol;
    });
    // 입력 리스너 재설정
    setInputListeners();
};

// 입력 리스너 부착 함수
const setInputListeners = () => {
    // 테이블 개수, 총 지원금
    document.querySelector(selectors.tableCount).addEventListener('input', saveToLocalStorage);
    document.querySelector(selectors.totalSupport).addEventListener('input', saveToLocalStorage);
    // 각 테이블 입력
    const tables = document.getElementsByClassName('table-container');
    Array.from(tables).forEach(table => {
        table.querySelector('.memberCount').addEventListener('input', saveToLocalStorage);
        table.querySelector('.guestCount').addEventListener('input', saveToLocalStorage); 
        table.querySelector('.foodPrice').addEventListener('input', saveToLocalStorage);
        table.querySelector('.memo').addEventListener('input', saveToLocalStorage);
        table.querySelector('.alcoholCheck').addEventListener('change', saveToLocalStorage);
    });
};

// createTables 확장: 테이블 생성 후 입력 리스너 부착
const _originalCreateTables = createTables;
const createTablesWithListeners = () => {
    _originalCreateTables();
    setInputListeners();
};

// 기존 createTables를 교체
window.createTables = createTablesWithListeners;

// 폼 전체 초기화 함수
const resetForm = () => {
    if (!confirm(`정말 초기화 하시겠습니까? 초기화시 임시저장된 데이터는 삭제되고 되돌릴 수 없습니다.`)) return;

    localStorage.removeItem(STORAGE_KEY);
    document.querySelector(selectors.tableCount).value = 1;
    document.querySelector(selectors.totalSupport).value = 0;
    createTablesWithListeners();
    resultDiv.innerHTML = '';
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
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jungsan_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// JSON 가져오기 함수
const importJson = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
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
    };
    input.click();
};

// 이벤트 리스너 설정 함수 수정
const setupEventListeners = () => {
    document.querySelector(selectors.calcButton).addEventListener('click', ()=>{resultDiv.innerHTML = '';calculate();});
    document.querySelector(selectors.createTablesButton).addEventListener('click', createTablesWithListeners);
    document.querySelector(`#tableCount`).addEventListener('input', createTablesWithListeners);
    document.getElementById('resetFormBtn').addEventListener('click', resetForm);
    document.getElementById('exportJsonBtn').addEventListener('click', exportJson);
    document.getElementById('importJsonBtn').addEventListener('click', importJson);
    document.getElementById('shareLinkBtn').addEventListener('click', shareLink);
    setInputListeners();
};

// 초기화 함수 수정
const init = () => {
    if (tryRestoreFromQuery()) {
        setupEventListeners();
        return;
    }
    if (localStorage.getItem(STORAGE_KEY)) 
        loadFromLocalStorage();
    else
        createTablesWithListeners();
    setupEventListeners();
};

// 페이지 로드시 초기화
window.addEventListener('load', init);