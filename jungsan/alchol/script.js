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
const STORAGE_KEY = 'jungsanFormData-alchol';

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
    // 입력값 수집
    const totalSupport = parseInt(document.getElementById('totalSupport').value) || 0;
    const memberDrink = parseInt(document.getElementById('memberDrink').value) || 0;
    const guestDrink = parseInt(document.getElementById('guestDrink').value) || 0;
    const memberNoDrink = parseInt(document.getElementById('memberNoDrink').value) || 0;
    const guestNoDrink = parseInt(document.getElementById('guestNoDrink').value) || 0;
    const foodPrice = parseInt(document.getElementById('foodPrice').value) || 0;
    const alcoholPrice = parseInt(document.getElementById('alcoholPrice').value) || 0;

    const totalMembers = memberDrink + memberNoDrink;
    const totalGuests = guestDrink + guestNoDrink;
    const totalPeople = totalMembers + totalGuests;
    const totalDrinkers = memberDrink + guestDrink;

    if (totalPeople === 0) {
        alert('전체 인원이 0명입니다.');
        return;
    }
    if (totalMembers === 0) {
        alert('부원 수가 0명입니다.');
        return;
    }

    // 1. 음식값 n분의 1
    const foodPerPerson = foodPrice / totalPeople;
    // 2. 부원당 지원금
    const supportPerMember = totalSupport / totalMembers;
    // 3. 술값 n분의 1 (술 마신 인원만)
    const alcoholPerDrinker = totalDrinkers > 0 ? alcoholPrice / totalDrinkers : 0;

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
            count: memberDrink,
            pay: memberDrinkPayFinal,
            support: supportPerMember
        },
        {
            label: '술 안 마신 부원',
            count: memberNoDrink,
            pay: memberNoDrinkPayFinal,
            support: supportPerMember
        },
        {
            label: '술 마신 난입',
            count: guestDrink,
            pay: guestDrinkPay,
            support: null
        },
        {
            label: '술 안 마신 난입',
            count: guestNoDrink,
            pay: guestNoDrinkPay,
            support: null
        }
    ];

    displayResults({results, supportPerMember});
};

const sum = array => array.reduce((acc, cur)=>acc+cur, 0);

// 결과 표시 함수
const resultDiv = document.getElementById('result');
const displayResults = ({results, supportPerMember}) => {
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

// textarea 오토그로우 함수
function autoGrowTextarea(el) {
    el.style.height = 'auto';
    el.style.height = (el.scrollHeight) + 'px';
}

// 폼 데이터 저장 함수
const saveToLocalStorage = () => {
    const data = {
        totalSupport: parseInt(document.getElementById('totalSupport').value) || 0,
        memberDrink: parseInt(document.getElementById('memberDrink').value) || 0,
        guestDrink: parseInt(document.getElementById('guestDrink').value) || 0,
        memberNoDrink: parseInt(document.getElementById('memberNoDrink').value) || 0,
        guestNoDrink: parseInt(document.getElementById('guestNoDrink').value) || 0,
        foodPrice: parseInt(document.getElementById('foodPrice').value) || 0,
        alcoholPrice: parseInt(document.getElementById('alcoholPrice').value) || 0,
        memberDrinkMemo: document.getElementById('memberDrinkMemo').value || '',
        guestDrinkMemo: document.getElementById('guestDrinkMemo').value || '',
        memberNoDrinkMemo: document.getElementById('memberNoDrinkMemo').value || '',
        guestNoDrinkMemo: document.getElementById('guestNoDrinkMemo').value || ''
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
    document.getElementById('totalSupport').value = data.totalSupport;
    document.getElementById('memberDrink').value = data.memberDrink;
    document.getElementById('guestDrink').value = data.guestDrink;
    document.getElementById('memberNoDrink').value = data.memberNoDrink;
    document.getElementById('guestNoDrink').value = data.guestNoDrink;
    document.getElementById('foodPrice').value = data.foodPrice;
    document.getElementById('alcoholPrice').value = data.alcoholPrice;
    document.getElementById('memberDrinkMemo').value = data.memberDrinkMemo || '';
    document.getElementById('guestDrinkMemo').value = data.guestDrinkMemo || '';
    document.getElementById('memberNoDrinkMemo').value = data.memberNoDrinkMemo || '';
    document.getElementById('guestNoDrinkMemo').value = data.guestNoDrinkMemo || '';
    // textarea 오토그로우 적용
    autoGrowTextarea(document.getElementById('memberDrinkMemo'));
    autoGrowTextarea(document.getElementById('guestDrinkMemo'));
    autoGrowTextarea(document.getElementById('memberNoDrinkMemo'));
    autoGrowTextarea(document.getElementById('guestNoDrinkMemo'));
};

// 입력 리스너 부착 함수
const setInputListeners = () => {
    document.getElementById('totalSupport').addEventListener('input', saveToLocalStorage);
    document.getElementById('memberDrink').addEventListener('input', saveToLocalStorage);
    document.getElementById('guestDrink').addEventListener('input', saveToLocalStorage);
    document.getElementById('memberNoDrink').addEventListener('input', saveToLocalStorage);
    document.getElementById('guestNoDrink').addEventListener('input', saveToLocalStorage);
    document.getElementById('foodPrice').addEventListener('input', saveToLocalStorage);
    document.getElementById('alcoholPrice').addEventListener('input', saveToLocalStorage);
    // textarea 입력 리스너 및 오토그로우
    const textareas = [
        document.getElementById('memberDrinkMemo'),
        document.getElementById('guestDrinkMemo'),
        document.getElementById('memberNoDrinkMemo'),
        document.getElementById('guestNoDrinkMemo')
    ];
    textareas.forEach(textarea => {
        textarea.addEventListener('input', function() {
            autoGrowTextarea(this);
            saveToLocalStorage();
        });
        // 최초 로드 시 오토그로우 적용
        autoGrowTextarea(textarea);
    });
};

// 폼 전체 초기화 함수
const resetForm = () => {
    if (!confirm(`정말 초기화 하시겠습니까? 초기화시 임시저장된 데이터는 삭제되고 되돌릴 수 없습니다.`)) return;
    localStorage.removeItem(STORAGE_KEY);
    document.getElementById('totalSupport').value = 0;
    document.getElementById('memberDrink').value = 0;
    document.getElementById('guestDrink').value = 0;
    document.getElementById('memberNoDrink').value = 0;
    document.getElementById('guestNoDrink').value = 0;
    document.getElementById('foodPrice').value = 0;
    document.getElementById('alcoholPrice').value = 0;
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
    document.getElementById('input-fields').addEventListener('submit', function(e) {
        e.preventDefault();
        resultDiv.innerHTML = '';
        calculate();
    });
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
    setInputListeners();
    setupEventListeners();
};

// 페이지 로드시 초기화
window.addEventListener('load', init);