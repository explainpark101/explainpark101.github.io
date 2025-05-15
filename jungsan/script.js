// DOM 요소 선택자
const selectors = {
    tableCount: '#tableCount',
    tablesContainer: '#tablesContainer',
    totalSupport: '#totalSupport',
    result: '#result',
    calcButton: '#calc-button',
    createTablesButton: '#createTables'
};

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
                <input type="checkbox" id="alcohol${i}" class="alcoholCheck">
                <label for="alcohol${i}">술 섭취</label>
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

    return displayResults(results);
};

const sum = array => array.reduce((acc, cur)=>acc+cur, 0);

// 결과 표시 함수
const resultDiv = document.querySelector(selectors.result);
const displayResults = (results) => {
    let remainingSupportSum = sum(results.map(el=>el.remainingSupport ?? 0)) > 0 ? `<div class="remaining-support" style="font-size: 1.2rem; margin-bottom: .5rem;"><strong>총 남은 지원금: </strong> ${sum(results.map(el=>el.remainingSupport)).toLocaleString()}원 </div>` : '';

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
        ${remainingSupportSum}
        ${resultHTML}
    `;

    resultDiv.innerHTML = html;
};

// 이벤트 리스너 설정
const setupEventListeners = () => {
    document.querySelector(selectors.calcButton).addEventListener('click', ()=>{resultDiv.innerHTML = '';calculate();});
    document.querySelector(selectors.createTablesButton).addEventListener('click', createTables);
};

// 초기화
const init = () => {
    createTables();
    setupEventListeners();
};

// 페이지 로드시 초기화
window.addEventListener('load', init);