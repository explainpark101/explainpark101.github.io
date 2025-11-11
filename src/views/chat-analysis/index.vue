<template>
    <div class="container">
        <div class="card">
            <div class="header">
                <h1 class="title">말 많은 사람 찾아내기</h1>
                <p class="description">
                    카카오톡 등에서 백업한 <code class="code-text">.txt</code> 파일을 업로드하면, 대화 라인에서 이름을 추출하여 채팅횟수를 집계합니다.
                </p>
            </div>

            <!-- 파일 업로드 영역 -->
            <div class="upload-section">
                <div class="file-input-wrapper">
                    <label for="file-upload" class="file-label">
                        텍스트 파일 (.txt)
                    </label>
                    <!-- @change로 파일 선택 이벤트를 감지 -->
                    <input id="file-upload" name="file-upload" type="file" accept=".txt" @change="onFileChange"
                        class="file-input">
                    <div v-if="selectedFile" class="selected-file">
                        <span class="file-indicator"></span>
                        {{ selectedFile.name }}
                    </div>
                </div>

                <!-- @click으로 분석 함수 호출 -->
                <button @click="processFile" :disabled="!selectedFile" class="analyze-button">
                    분석 시작
                </button>
            </div>

            <!-- 결과 표시 영역 -->
            <div class="results-section">
                <!-- v-if로 메시지가 있을 때만 표시 -->
                <div v-if="message" :class="['message', messageClasses]">
                    <span class="message-icon" v-if="messageType === 'error'">⚠️</span>
                    <span class="message-icon" v-else>ℹ️</span>
                    <span>{{ message }}</span>
                </div>

                <!-- v-if로 결과가 있을 때만 테이블 표시 -->
                <div v-if="results.length > 0" class="table-wrapper">
                    <table class="results-table">
                        <thead>
                            <tr>
                                <th scope="col" class="table-header">순위</th>
                                <th scope="col" class="table-header">이름</th>
                                <th scope="col" class="table-header">횟수</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- v-for로 결과 배열을 순회하며 행 생성 -->
                            <tr v-for="([name, count], index) in results" :key="name" class="table-row">
                                <td class="table-cell rank-cell">
                                    <span v-if="index < 3" :class="['rank-badge', `rank-${index + 1}`]">
                                        {{ index + 1 }}
                                    </span>
                                    <span v-else class="rank-badge rank-other">
                                        {{ index + 1 }}
                                    </span>
                                </td>
                                <td class="table-cell name-cell">{{ name }}</td>
                                <td class="table-cell count-cell">
                                    <span class="count-badge">{{ count }}개</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
// Vue 3 Composition API에서 ref와 computed를 가져옵니다.
import { ref, computed } from 'vue';

// --- Reactive State (ref) ---
// 선택된 파일을 저장
const selectedFile = ref(null);
// 분석 결과를 저장 (e.g., [['김지후', 2], ['김해인', 1]])
const results = ref([]);
// 사용자에게 보여줄 정보 또는 오류 메시지
const message = ref('');
// 메시지 종류 ('info' 또는 'error')
const messageType = ref('info');

// --- Computed Properties ---
// 메시지 종류에 따라 동적으로 CSS 클래스를 반환
const messageClasses = computed(() => {
    return messageType.value === 'error'
        ? 'message-error'
        : 'message-info';
});

// --- Methods ---

/**
 * 파일 입력이 변경될 때 호출
 * @param {Event} event - 파일 입력 이벤트
 */
function onFileChange(event) {
    selectedFile.value = event.target.files[0];
    // 파일이 새로 선택되면 이전 결과와 메시지를 초기화
    results.value = [];
    message.value = '';
}

/**
 * '분석 시작' 버튼 클릭 시 호출
 */
function processFile() {
    // 파일이 선택되지 않았으면 오류 메시지 표시
    if (!selectedFile.value) {
        message.value = "파일을 먼저 선택해주세요.";
        messageType.value = "error";
        results.value = [];
        return;
    }

    const reader = new FileReader();

    // 파일 읽기 완료 시
    reader.onload = (event) => {
        const logContent = event.target.result;
        processLog(logContent);
    };

    // 파일 읽기 오류 시
    reader.onerror = () => {
        message.value = "파일을 읽는 중 오류가 발생했습니다.";
        messageType.value = "error";
        results.value = [];
    };

    // 파일 읽기 시작
    reader.readAsText(selectedFile.value, 'UTF-8');
}

/**
 * 로그 내용을 처리하여 이름 횟수를 집계
 * @param {string} logContent - .txt 파일의 전체 내용
 */
function processLog(logContent) {
    const nameCounts = new Map();

    // 정규식
    const regex = /^\d{4}년 \d{1,2}월 \d{1,2}일 (?:오전|오후) \d{1,2}:\d{1,2}, (.*?)\s*:\s*.*/;

    const lines = logContent.split('\n');

    lines.forEach(line => {
        const match = line.match(regex);
        if (match && match[1]) {
            const name = match[1].trim();
            if (name) {
                const count = (nameCounts.get(name) || 0) + 1;
                nameCounts.set(name, count);
            }
        }
    });

    // 결과 처리
    if (nameCounts.size === 0) {
        message.value = "분석할 수 있는 유효한 대화 라인을 찾지 못했습니다. 파일 형식을 확인해주세요.";
        messageType.value = "info";
        results.value = [];
    } else {
        // 횟수를 기준으로 내림차순 정렬
        const sorted = Array.from(nameCounts.entries()).sort((a, b) => b[1] - a[1]);
        // results ref를 업데이트하여 화면에 반영
        results.value = sorted;
        message.value = ''; // 성공 시 메시지 제거
    }
}
</script>

<style scoped>
/* 컨테이너 */
.container {
    min-height: 100vh;
    background: linear-gradient(135deg, #eef2ff 0%, #f3e8ff 50%, #fce7f3 100%);
    padding: 3rem 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
}

/* 카드 */
.card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    padding: 2.5rem;
    border-radius: 1.5rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    width: 100%;
    max-width: 48rem;
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 헤더 */
.header {
    text-align: center;
    margin-bottom: 2rem;
}

.title {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 0.75rem;
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.description {
    color: #4b5563;
    font-size: 1rem;
    line-height: 1.75;
}

.code-text {
    padding: 0.25rem 0.5rem;
    background-color: #f3f4f6;
    border-radius: 0.25rem;
    color: #4f46e5;
    font-family: 'Courier New', monospace;
    font-size: 0.875rem;
}

/* 업로드 섹션 */
.upload-section {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    margin-bottom: 2rem;
}

.file-input-wrapper {
    position: relative;
}

.file-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.5rem;
}

.file-input {
    display: block;
    width: 100%;
    font-size: 0.875rem;
    color: #6b7280;
    padding: 1rem;
    border: 2px dashed #d1d5db;
    border-radius: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.file-input:hover {
    border-color: #818cf8;
    background-color: rgba(99, 102, 241, 0.05);
}

.file-input::file-selector-button {
    margin-right: 1rem;
    padding: 0.75rem 1.5rem;
    border-radius: 0.75rem;
    border: 0;
    font-size: 0.875rem;
    font-weight: 600;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.3);
}

.file-input::file-selector-button:hover {
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    transform: translateY(-1px);
    box-shadow: 0 6px 8px -1px rgba(99, 102, 241, 0.4);
}

.selected-file {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: #4f46e5;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.file-indicator {
    display: inline-block;
    width: 0.5rem;
    height: 0.5rem;
    background-color: #6366f1;
    border-radius: 50%;
    animation: pulse 2s infinite;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}

/* 분석 버튼 */
.analyze-button {
    width: 100%;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
    color: white;
    font-weight: 700;
    padding: 1rem 1.5rem;
    border-radius: 0.75rem;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.analyze-button:hover:not(:disabled) {
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%);
    transform: translateY(-2px);
    box-shadow: 0 15px 20px -3px rgba(99, 102, 241, 0.4);
}

.analyze-button:active:not(:disabled) {
    transform: translateY(0);
}

.analyze-button:focus {
    outline: none;
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2), 0 10px 15px -3px rgba(99, 102, 241, 0.3);
}

.analyze-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
}

/* 결과 섹션 */
.results-section {
    margin-top: 2rem;
}

/* 메시지 */
.message {
    padding: 1rem;
    border-radius: 0.75rem;
    text-align: center;
    transition: all 0.3s ease;
    border: 2px solid;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    animation: fadeIn 0.3s ease;
}

.message-info {
    background-color: #dbeafe;
    color: #1e40af;
    border-color: #93c5fd;
}

.message-error {
    background-color: #fee2e2;
    color: #991b1b;
    border-color: #fca5a5;
}

.message-icon {
    font-size: 1.25rem;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 테이블 래퍼 */
.table-wrapper {
    margin-top: 1.5rem;
    animation: fadeIn 0.3s ease;
}

/* 테이블 */
.results-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 0.75rem;
    overflow: hidden;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    border: 1px solid #f3f4f6;
}

.table-header {
    padding: 1rem 1.5rem;
    text-align: left;
    font-size: 0.75rem;
    font-weight: 700;
    color: #374151;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
    border-bottom: 2px solid #e5e7eb;
}

.table-row {
    transition: all 0.2s ease;
}

.table-row:hover {
    background: linear-gradient(90deg, #eef2ff 0%, #f3e8ff 100%);
}

.table-cell {
    padding: 1rem 1.5rem;
    white-space: nowrap;
    border-bottom: 1px solid #f3f4f6;
}

.rank-cell {
    text-align: center;
}

.name-cell {
    font-size: 0.875rem;
    font-weight: 600;
    color: #111827;
}

.table-row:hover .name-cell {
    color: #4f46e5;
}

.count-cell {
    text-align: left;
}

/* 순위 배지 */
.rank-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    font-weight: 700;
    font-size: 0.875rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.rank-1 {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    color: white;
}

.rank-2 {
    background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
    color: white;
}

.rank-3 {
    background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
    color: white;
}

.rank-other {
    background-color: #f3f4f6;
    color: #4b5563;
}

.table-row:hover .rank-other {
    background-color: #e5e7eb;
}

/* 횟수 배지 */
.count-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 700;
    background: linear-gradient(135deg, #eef2ff 0%, #f3e8ff 100%);
    color: #4f46e5;
    transition: all 0.2s ease;
}

.table-row:hover .count-badge {
    background: linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
    .container {
        padding: 1.5rem 0.75rem;
    }

    .card {
        padding: 1.5rem;
        border-radius: 1rem;
    }

    .title {
        font-size: 2rem;
    }

    .description {
        font-size: 0.875rem;
    }

    .table-header,
    .table-cell {
        padding: 0.75rem 1rem;
        font-size: 0.75rem;
    }

    .rank-badge {
        width: 1.75rem;
        height: 1.75rem;
        font-size: 0.75rem;
    }
}
</style>