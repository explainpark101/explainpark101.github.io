<template>
    <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/30 dark:via-purple-950/30 dark:to-pink-950/30 flex justify-center items-center py-12 px-4 md:py-12 md:px-4">
        <div class="bg-[var(--surface)]/95 backdrop-blur-md p-6 md:p-10 rounded-2xl shadow-xl w-full max-w-3xl transition-all duration-300 border border-white/20 dark:border-white/10">
            <div class="text-center mb-8">
                <h1 class="text-3xl md:text-4xl font-extrabold mb-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">말 많은 사람 찾아내기</h1>
                <p class="text-[var(--text-secondary)] text-base leading-7">
                    카카오톡 등에서 백업한 <code class="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-indigo-600 dark:text-indigo-400 font-mono text-sm">.txt</code> 파일을 업로드하면, 대화 라인에서 이름을 추출하여 채팅횟수를 집계합니다.
                </p>
            </div>

            <!-- 파일 업로드 영역 -->
            <div class="flex flex-col gap-5 mb-8">
                <div class="relative">
                    <label for="file-upload" class="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                        텍스트 파일 (.txt)
                    </label>
                    <input id="file-upload" name="file-upload" type="file" accept=".txt" @change="onFileChange"
                        class="chat-analysis-file-input block w-full text-sm text-gray-500 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer transition-all duration-200 hover:border-indigo-400 hover:bg-indigo-50/5 dark:hover:bg-indigo-500/5">
                    <div v-if="selectedFile" class="mt-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-2">
                        <span class="file-indicator inline-block w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                        {{ selectedFile.name }}
                    </div>
                </div>

                <button @click="processFile" :disabled="!selectedFile"
                    class="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold py-4 px-6 rounded-xl border-none cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 hover:enabled:from-indigo-600 hover:enabled:via-purple-600 hover:enabled:to-pink-600 hover:enabled:-translate-y-0.5 hover:enabled:shadow-indigo-500/40 active:enabled:translate-y-0 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                    분석 시작
                </button>
            </div>

            <!-- 결과 표시 영역 -->
            <div class="mt-8">
                <div v-if="message" :class="['message flex items-center justify-center gap-2 p-4 rounded-xl text-center transition-all duration-300 border-2 animate-fade-in', messageClasses]">
                    <span class="text-xl" v-if="messageType === 'error'">⚠️</span>
                    <span class="text-xl" v-else>ℹ️</span>
                    <span>{{ message }}</span>
                </div>

                <div v-if="results.length > 0" class="mt-6 animate-fade-in">
                    <table class="w-full border-collapse bg-[var(--surface)] rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700">
                        <thead>
                            <tr>
                                <th scope="col" class="px-4 py-4 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b-2 border-gray-200 dark:border-gray-600">순위</th>
                                <th scope="col" class="px-4 py-4 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b-2 border-gray-200 dark:border-gray-600">이름</th>
                                <th scope="col" class="px-4 py-4 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b-2 border-gray-200 dark:border-gray-600">횟수</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="([name, count], index) in results" :key="name" class="transition-all duration-200 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-950/30 dark:hover:to-purple-950/30 group">
                                <td class="px-4 py-4 whitespace-nowrap border-b border-gray-100 dark:border-gray-700 text-center">
                                    <span v-if="index < 3" :class="['rank-badge inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full font-bold text-xs md:text-sm shadow', index === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' : index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600 text-white' : 'bg-gradient-to-br from-amber-600 to-amber-800 text-white']">
                                        {{ index + 1 }}
                                    </span>
                                    <span v-else class="rank-badge inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full font-bold text-xs md:text-sm shadow bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-600">
                                        {{ index + 1 }}
                                    </span>
                                </td>
                                <td class="px-4 py-4 whitespace-nowrap border-b border-gray-100 dark:border-gray-700 text-sm font-semibold text-[var(--text-primary)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{{ name }}</td>
                                <td class="px-4 py-4 whitespace-nowrap border-b border-gray-100 dark:border-gray-700 text-left">
                                    <span class="count-badge inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 text-indigo-600 dark:text-indigo-400 transition-all duration-200 group-hover:from-indigo-100 group-hover:to-purple-100 dark:group-hover:from-indigo-900/50 dark:group-hover:to-purple-900/50">{{ count }}개</span>
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
        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700'
        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700';
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

<style>
/* ::file-selector-button - Tailwind cannot style this */
.chat-analysis-file-input::file-selector-button {
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
.chat-analysis-file-input::file-selector-button:hover {
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    transform: translateY(-1px);
    box-shadow: 0 6px 8px -1px rgba(99, 102, 241, 0.4);
}

@keyframes fade-in {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
    animation: fade-in 0.3s ease;
}
</style>