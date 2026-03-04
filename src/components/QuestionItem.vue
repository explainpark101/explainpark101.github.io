<template>
  <div v-show="isVisible" class="w-[calc(50%-0.5rem)] bg-[var(--surface)] p-4 rounded shadow-sm transition-all duration-500 focus-within:ring-2 focus-within:ring-[var(--primary-color)]">
    <label :for="`ans-${question.abbr}`" class="block font-medium mb-2 text-[var(--text-primary)]">{{ question.index }}. {{ question.abbr }}</label>
    <input
      :id="`ans-${question.abbr}`"
      type="text"
      v-model="inputValue"
      autocomplete="off"
      class="w-full py-3 px-3 border border-[var(--border-color)] rounded text-base bg-[var(--surface)] text-[var(--text-primary)] transition-all duration-500 focus:outline-none focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 dark:bg-gray-800 dark:focus:bg-gray-700"
      @focus="handleFocus"
      @blur="handleBlur"
      @input="handleInput"
      @keydown="handleKeydown"
    />
    <div :class="['mt-2 text-sm py-2 px-2 rounded transition-all duration-500', resultClass]">{{ resultText }}</div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  question: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['focus', 'blur', 'input', 'grade', 'keydown', 'enter-correct']);

const inputValue = ref(props.question.inputValue || '');
const isVisible = ref(true);
const isGraded = ref(false);
let debounceTimer = null;

// 정규화 함수
const normalizeAnswer = (answer) => {
  answer = answer.replace(/\s+/g, '');
  answer = answer.replace(/[-,]/g, '');
  return answer.toLowerCase();
};

// Levenshtein 거리 계산
const levenshteinDistance = (a, b) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

// 오타 체크
const isTypo = (userAns, correctAns) => {
  const normalizedUserAns = normalizeAnswer(userAns);
  const normalizedCorrectAns = normalizeAnswer(correctAns);

  if (normalizedUserAns === normalizedCorrectAns) {
    return false;
  }

  if (Math.abs(normalizedUserAns.length - normalizedCorrectAns.length) > 1) {
    return false;
  }

  const distance = levenshteinDistance(normalizedUserAns, normalizedCorrectAns);
  return distance === 1;
};

// 채점 결과 계산 함수
const calculateGrade = () => {
  const userAns = inputValue.value.trim();
  
  if (!userAns) {
    return { result: null, text: '', class: 'result', isIncorrect: false };
  }

  const possibleAnswers = props.question.answer.split(/[,]| or /).map(ans => ans.trim());
  const normalizedUserAns = normalizeAnswer(userAns);

  const isExactMatch = possibleAnswers.some(ans =>
    normalizeAnswer(ans) === normalizedUserAns
  );

  if (isExactMatch) {
    return { result: true, text: '정답', class: 'result correct', isIncorrect: false };
  }

  const typoAnswer = possibleAnswers.find(ans => isTypo(userAns, ans));
  if (typoAnswer) {
    const otherAnswers = possibleAnswers.filter(ans =>
      normalizeAnswer(ans) !== normalizedUserAns
    );
    let message = '정답(오타를 정정해주세요)';
    if (otherAnswers.length > 0) {
      message += ` (다른 정답: ${otherAnswers.join(', ')})`;
    }
    return { result: false, text: message, class: 'result incorrect', isIncorrect: true };
  }

  return { result: false, text: `오답 (정답: ${props.question.answer})`, class: 'result incorrect', isIncorrect: true };
};

// 채점 결과 상태
const gradeResult = ref({ result: null, text: '', class: 'result', isIncorrect: false });

const resultText = computed(() => isGraded.value ? gradeResult.value.text : '');
const resultClass = computed(() => {
  if (!isGraded.value) return '';
  return gradeResult.value.class === 'result correct'
    ? 'text-[var(--success)] bg-[var(--success)]/10'
    : gradeResult.value.class === 'result incorrect'
      ? 'text-[var(--error)] bg-[var(--error)]/10'
      : '';
});

// 채점 함수 (외부에서 호출 가능)
const grade = () => {
  if (!inputValue.value.trim()) {
    return null;
  }
  gradeResult.value = calculateGrade();
  isGraded.value = true;
  return gradeResult.value.result;
};

// 리셋 함수
const reset = (forceReset = false) => {
  if (!forceReset && gradeResult.value.isIncorrect) {
    return;
  }
  inputValue.value = '';
  isGraded.value = false;
  gradeResult.value = { result: null, text: '', class: 'result', isIncorrect: false };
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
};

// 상태 저장
const saveState = () => {
  return {
    abbr: props.question.abbr,
    value: inputValue.value,
    isGraded: isGraded.value,
    isIncorrect: gradeResult.value.isIncorrect,
    isVisible: isVisible.value
  };
};

// 상태 로드
const loadState = (state) => {
  if (state) {
    inputValue.value = state.value || '';
    isVisible.value = state.isVisible !== false;
    if (state.value && state.value.trim()) {
      // 저장된 값이 있으면 채점 수행
      gradeResult.value = calculateGrade();
      isGraded.value = state.isGraded !== false;
    } else {
      isGraded.value = false;
      gradeResult.value = { result: null, text: '', class: 'result', isIncorrect: false };
    }
  }
};

// 인덱스 업데이트
const updateIndex = (newIndex) => {
  props.question.index = newIndex;
};

// 가시성 업데이트
const setVisible = (visible) => {
  isVisible.value = visible;
};

const handleFocus = () => {
  emit('focus', props.question);
};

const handleBlur = () => {
  // blur 시 채점 수행
  if (inputValue.value.trim()) {
    grade();
  } else {
    isGraded.value = false;
    gradeResult.value = { result: null, text: '', class: 'result', isIncorrect: false };
  }
  emit('blur', props.question);
  emit('grade', gradeResult.value.result);
};

const handleInput = () => {
  // 입력 중에는 채점하지 않음
  isGraded.value = false;
  gradeResult.value = { result: null, text: '', class: 'result', isIncorrect: false };
  
  // debounce: 입력이 멈추면 채점
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  
  debounceTimer = setTimeout(() => {
    if (inputValue.value.trim()) {
      grade();
      emit('grade', gradeResult.value.result);
    }
    debounceTimer = null;
  }, 800); // 800ms 후에 채점
  
  emit('input', props.question);
};

const handleKeydown = (event) => {
  // Enter 키를 누르면 즉시 채점
  if (event.key === 'Enter') {
    event.preventDefault();
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    if (inputValue.value.trim()) {
      const result = grade();
      emit('grade', result);
      // 정답이면 다음으로 이동하도록 이벤트 전달
      if (result === true) {
        emit('enter-correct', props.question);
      }
    }
  }
  emit('keydown', props.question, event);
};

// 외부에서 접근 가능하도록 expose
defineExpose({
  grade,
  reset,
  saveState,
  loadState,
  updateIndex,
  setVisible,
  inputValue,
  isVisible
});

// inputValue 변경 감지하여 question 객체 업데이트
watch(inputValue, (newVal) => {
  props.question.inputValue = newVal;
});
</script>


