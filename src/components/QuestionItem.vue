<template>
  <div v-show="isVisible" class="question">
    <label :for="`ans-${question.abbr}`">{{ question.index }}. {{ question.abbr }}</label>
    <input
      :id="`ans-${question.abbr}`"
      type="text"
      v-model="inputValue"
      autocomplete="off"
      @focus="handleFocus"
      @blur="handleBlur"
      @input="handleInput"
      @keydown="handleKeydown"
    />
    <div :class="resultClass">{{ resultText }}</div>
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
const resultClass = computed(() => isGraded.value ? gradeResult.value.class : 'result');

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

<style scoped>
.question {
  width: calc(50% - 0.5rem);
  background-color: var(--surface);
  padding: 1rem;
  border-radius: 4px;
  box-shadow: 0 1px 3px var(--shadow-color);
  transition: box-shadow 500ms ease-in-out, background-color 500ms ease-in-out;
}

.question:focus-within {
  box-shadow: 0 0 0 2px var(--primary-color);
}

.question label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  transition: color 500ms ease-in-out;
}

.question input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 500ms ease-in-out, background-color 500ms ease-in-out, color 500ms ease-in-out;
}

.question input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
}

.result {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 500ms ease-in-out, color 500ms ease-in-out;
}

.correct {
  color: var(--success);
  background-color: rgba(56, 142, 60, 0.1);
  transition: background-color 500ms ease-in-out, color 500ms ease-in-out;
}

.incorrect {
  color: var(--error);
  background-color: rgba(211, 47, 47, 0.1);
  transition: background-color 500ms ease-in-out, color 500ms ease-in-out;
}

/* Dark mode input styles */
[data-theme="dark"] .question input {
  background-color: #2d2d2d;
  color: var(--text-primary);
}

[data-theme="dark"] .question input:focus {
  background-color: #333333;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) .question input {
    background-color: #2d2d2d;
    color: var(--text-primary);
  }

  :root:not([data-theme]) .question input:focus {
    background-color: #333333;
  }
}
</style>

