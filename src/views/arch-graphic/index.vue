<template>
  <div class="font-[Roboto] box-border m-0 bg-[var(--background)] text-[var(--text-primary)] leading-relaxed transition-colors duration-500 min-h-screen p-5" :data-theme="theme">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">

    <nav class="bg-transparent p-4 mb-8 flex justify-between items-center">
      <div class="max-w-[1200px] mx-auto flex-1">
        <router-link to="/" class="text-[var(--text-primary)] no-underline inline-flex items-center gap-2 text-xl font-medium">
          <span class="material-icons text-2xl">home</span>
        </router-link>
        <router-link to="/arch-graphic/endterm" class="text-[var(--primary-color)] no-underline ml-6 text-lg font-normal">기말고사</router-link>
      </div>
      <button type="button" class="py-2 px-4 rounded-lg border border-[var(--border-color)] bg-[var(--surface)] text-[var(--text-primary)] transition-colors duration-300 hover:bg-[var(--background)]" @click="showSettings = true">설정</button>
    </nav>

    <dialog ref="settingsDialog" class="arch-dialog border-none rounded-lg p-0 max-w-md w-[90%] bg-[var(--surface)] shadow-lg fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 m-0 [&::backdrop]:bg-[var(--overlay-color)] [&::backdrop]:backdrop-blur-sm">
      <div class="p-6">
        <h3 class="m-0 mb-4 text-[var(--primary-color)] text-lg font-medium">설정</h3>
        <div class="flex items-center gap-3 mb-2">
          <input type="checkbox" id="themeSwitch" v-model="isDarkMode" @change="toggleTheme" class="w-5 h-5 accent-[var(--primary-color)]">
          <label for="themeSwitch" class="cursor-pointer text-[var(--text-primary)]">다크 모드</label>
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <button type="button" class="py-2 px-4 rounded border border-[var(--border-color)] bg-transparent text-[var(--text-secondary)] text-sm font-medium cursor-pointer transition-colors duration-300 hover:bg-[var(--background)]" @click="showSettings = false">닫기</button>
        </div>
      </div>
    </dialog>

    <div class="fixed top-5 right-5 z-[1000] bg-[var(--surface)] p-4 rounded-lg shadow min-w-[200px] transition-all duration-500">
      <h3 class="text-[var(--primary-color)] mb-2 text-lg font-medium">진행 상황</h3>
      <div class="w-full h-2 bg-[var(--border-color)] rounded overflow-hidden my-2">
        <div class="h-full bg-[var(--primary-color)] transition-all duration-300" :style="{ width: progress + '%' }"></div>
      </div>
      <div class="flex justify-between text-sm text-[var(--text-secondary)]">
        <span>{{ Math.round(progress) }}%</span>
        <span>정답률: {{ Math.round(accuracy) }}%</span>
      </div>
    </div>

    <div class="max-w-[1200px] mx-auto bg-[var(--surface)] p-8 rounded-lg shadow transition-all duration-500 relative">
      <h1 class="text-2xl font-bold text-[var(--text-primary)] mb-2">중간고사: Graphical Communications in Construction</h1>
      <p class="text-[var(--text-secondary)] mb-6">범위: A ~ H 약어</p>

      <form @submit.prevent="gradeAll">
        <div id="questions" class="flex flex-col gap-4">
          <QuestionItem v-for="question in questions" :key="question.abbr"
            :ref="(el) => setQuestionRef(question.abbr, el)" :question="question" @focus="handleQuestionFocus"
            @blur="handleQuestionBlur" @input="handleQuestionInput" @grade="handleQuestionGrade"
            @enter-correct="handleEnterCorrect" />
        </div>
        <div class="flex gap-4 justify-center mt-8">
          <button type="button" class="py-2.5 px-5 rounded-lg border-none cursor-pointer font-medium text-[var(--surface)] bg-[var(--primary-color)] transition-colors duration-300 hover:bg-[var(--primary-dark)]" @click="handleReset">리셋</button>
          <button type="button" class="py-2.5 px-5 rounded-lg border-none cursor-pointer font-medium text-white bg-red-600 transition-colors duration-300 hover:bg-red-700" @click="handleHardReset">하드 리셋</button>
          <button type="submit" class="py-2.5 px-5 rounded-lg border-none cursor-pointer font-medium text-[var(--surface)] bg-[var(--primary-color)] transition-colors duration-300 hover:bg-[var(--primary-dark)]">제출</button>
        </div>
      </form>

      <div id="score" ref="scoreElement" class="mt-6 p-4 rounded-lg text-center text-[var(--text-primary)] font-medium">{{ scoreText }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import QuestionItem from '@/components/QuestionItem.vue';

const answers = {
  "ABV": "Above", "AB": "Anchor Bolt", "A/C": "Air Conditioner", "AD": "Access Door",
  "ADD": "Addition", "ADJ": "Adjust", "AFF": "Above Finished Floor", "AFG": "Above Finished Grade",
  "ALT": "Alternate", "APP'D": "Approved", "ARCH": "Architect, Architectural", "ASPH": "Asphalt",
  "AWG": "American wire gauge", "BC": "Bookcase", "BD": "Board", "BL": "Building Line",
  "BLDG": "Building", "BLK": "Block", "BM": "Beam", "BOF": "Bottom of footing",
  "BOW": "Bottom of wall", "BRG": "Bearing", "BU": "Built up", "BTM": "Bottom",
  "CSMNT": "Casement", "CABT": "Cabinet", "CC": "Center-to-Center", "CD": "Construction document",
  "CEM": "Cement", "CL": "Center line", "CH": "Channel", "CI": "Cast Iron",
  "CIP": "Cast in place", "CLG": "Ceiling", "CMU": "Concrete Masonry Unit", "CO": "Clean Out",
  "COL": "Column", "CONT": "Continuous", "CONTR": "Contractor", "CONC": "Concrete",
  "CPT": "Carpet", "CT": "Ceramic Tile", "D/W": "Dishwasher", "DBL": "Double",
  "DEMO": "Demolition", "DIA": "Diameter", "DIM": "Dimension", "DL": "Dead Load",
  "DN": "Down", "DR": "Door", "EA": "Each", "ED": "Edge distance",
  "EJ": "Expansion joint", "ELEV": "Elevation", "ELECT": "Electric, electrical", "EQ": "Equal",
  "EQUIP": "Equipment", "EST": "Estimate", "EW": "Each way", "EXC": "Excavate",
  "EXIST": "Existing", "EXT": "Exterior", "FA": "Fire alarm", "FAO": "Finish all over",
  "FCO": "Floor clean out", "FD": "Floor drain", "FE": "Fire extinguisher", "FAB": "Fabricate",
  "FDN": "Foundation", "FFL": "Finished floor level", "FIN": "Finish", "FL": "Floor level",
  "FLR": "Floor", "FRPF": "Fireproof", "GA": "Gauge", "GALV": "Galvanized",
  "GAR": "Garage", "GC": "General Contractor", "GFCI": "Ground Fault Circuit Interrupt",
  "GL": "Glass", "GM": "Grade mark", "GT": "Glazed tile", "GYP": "Gypsum",
  "HB": "Hose bib", "HC": "Hollow core", "HDBD": "Hardboard", "HDW": "Hardware",
  "HGT": "Height", "HOR": "Horizontal", "HR": "Hour or Handrail", "HTR": "Heater",
  "HV": "High voltage", "HVAC": "Heating, Venting and Air Conditioning, heating venting air conditioning", "HW": "Hot water"
};

const questionsContainer = ref(null);
const scoreElement = ref(null);
const settingsDialog = ref(null);
const showSettings = ref(false);
const theme = ref('light');
const isDarkMode = ref(false);
const progress = ref(0);
const accuracy = ref(0);
const questions = ref([]);
const isIncorrectOnlyMode = ref(false);
const questionRefs = ref({});
const scoreText = ref('');

// Question ref 설정
const setQuestionRef = (abbr, el) => {
  if (el) {
    questionRefs.value[abbr] = el;
  }
};

const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    theme.value = savedTheme;
    isDarkMode.value = savedTheme === 'dark';
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    isDarkMode.value = prefersDark;
    theme.value = prefersDark ? 'dark' : 'light';
  }
  document.body.setAttribute('data-theme', theme.value);
};

const toggleTheme = () => {
  theme.value = isDarkMode.value ? 'dark' : 'light';
  document.body.setAttribute('data-theme', theme.value);
  localStorage.setItem('theme', theme.value);
};

watch(showSettings, (newVal) => {
  if (newVal && settingsDialog.value) {
    settingsDialog.value.showModal();
  } else if (settingsDialog.value) {
    settingsDialog.value.close();
  }
});

const updateProgress = () => {
  const answeredCount = questions.value.filter(q => {
    const ref = questionRefs.value[q.abbr];
    return ref && ref.inputValue?.trim() !== "";
  }).length;
  const totalQuestions = questions.value.length;
  progress.value = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  const correctCount = questions.value.filter(q => {
    const ref = questionRefs.value[q.abbr];
    return ref && ref.grade() === true;
  }).length;
  accuracy.value = answeredCount > 0 ? (correctCount / answeredCount) * 100 : 0;
};

const updateTotalScore = () => {
  const correctCount = questions.value.reduce((count, question) => {
    const ref = questionRefs.value[question.abbr];
    if (ref) {
      const result = ref.grade();
      return result === true ? count + 1 : count;
    }
    return count;
  }, 0);

  scoreText.value = `총점: ${correctCount} / ${questions.value.length}`;
};

const gradeAll = () => {
  updateTotalScore();
  if (scoreElement.value) {
    scoreElement.value.scrollIntoView({ behavior: 'smooth' });
  }
};

const saveState = () => {
  const state = {
    // 단어 배치 순서 저장 (abbr 배열)
    questionOrder: questions.value.map(q => q.abbr),
    questions: questions.value.map(question => {
      const ref = questionRefs.value[question.abbr];
      return ref ? ref.saveState() : { abbr: question.abbr, value: '', isGraded: false, isIncorrect: false, isVisible: true };
    }),
    lastFocusedInput: localStorage.getItem('lastFocusedInput'),
    isIncorrectOnlyMode: isIncorrectOnlyMode.value
  };
  localStorage.setItem('examState', JSON.stringify(state));
};

const loadState = async () => {
  const savedState = localStorage.getItem('examState');
  if (savedState) {
    const state = JSON.parse(savedState);
    isIncorrectOnlyMode.value = state.isIncorrectOnlyMode || false;

    // 저장된 단어 배치 순서가 있으면 그 순서대로 재배치
    if (state.questionOrder && Array.isArray(state.questionOrder)) {
      const questionMap = new Map(questions.value.map(q => [q.abbr, q]));
      const orderedQuestions = [];

      // 저장된 순서대로 questions 재배치
      state.questionOrder.forEach(abbr => {
        const question = questionMap.get(abbr);
        if (question) {
          orderedQuestions.push(question);
        }
      });

      // 저장되지 않은 새로운 문제들 추가 (혹시 모를 경우)
      questions.value.forEach(question => {
        if (!state.questionOrder.includes(question.abbr)) {
          orderedQuestions.push(question);
        }
      });

      questions.value = orderedQuestions;
    }

    await nextTick();

    // 저장된 상태를 abbr로 매핑
    const stateMap = {};
    if (state.questions) {
      state.questions.forEach(qState => {
        if (qState.abbr) stateMap[qState.abbr] = qState;
      });
    }

    questions.value.forEach((question) => {
      const ref = questionRefs.value[question.abbr];
      if (ref) {
        if (stateMap[question.abbr]) {
          ref.loadState(stateMap[question.abbr]);
        } else {
          ref.loadState({
            value: '',
            isGraded: false,
            isIncorrect: false,
            isVisible: true
          });
        }
      }
    });

    if (isIncorrectOnlyMode.value) {
      let visibleIndex = 1;
      questions.value.forEach(question => {
        const ref = questionRefs.value[question.abbr];
        if (ref && ref.grade() === false) {
          ref.reset(true);
          ref.setVisible(true);
          question.index = visibleIndex++;
        } else if (ref) {
          ref.setVisible(false);
        }
      });
    } else {
      questions.value.forEach(question => {
        question.index = question.originalIndex;
        const ref = questionRefs.value[question.abbr];
        if (ref) {
          ref.setVisible(true);
        }
      });
    }

    updateTotalScore();
    updateProgress();
  } else {
    await nextTick();
    questions.value.forEach(question => {
      const ref = questionRefs.value[question.abbr];
      if (ref) {
        ref.loadState({
          value: '',
          isGraded: false,
          isIncorrect: false,
          isVisible: true
        });
      }
    });
  }
};

const checkCompletion = () => {
  const allAnswered = questions.value.every(q => {
    const ref = questionRefs.value[q.abbr];
    return ref && ref.inputValue?.trim() !== "";
  });
  if (allAnswered) {
    const incorrectQuestions = questions.value.filter(q => {
      const ref = questionRefs.value[q.abbr];
      return ref && ref.grade() === false;
    });
    if (incorrectQuestions.length > 0) {
      setTimeout(() => {
        if (confirm(`${incorrectQuestions.length}개의 문제를 틀렸습니다. 틀린 문제만 다시 풀어보시겠습니까?`)) {
          showIncorrectOnly();
        }
      }, 500);
    }
  }
};

const showIncorrectOnly = async () => {
  isIncorrectOnlyMode.value = true;
  let visibleIndex = 1;

  await nextTick();

  questions.value.forEach(question => {
    const ref = questionRefs.value[question.abbr];
    if (ref && ref.grade() === false) {
      ref.reset(true);
      ref.setVisible(true);
      question.index = visibleIndex++;
    } else if (ref) {
      ref.setVisible(false);
    }
  });

  saveState();

  await nextTick();
  const firstIncorrect = questions.value.find(q => {
    const ref = questionRefs.value[q.abbr];
    return ref && ref.grade() === false && ref.isVisible;
  });
  if (firstIncorrect) {
    const ref = questionRefs.value[firstIncorrect.abbr];
    if (ref) {
      const input = document.getElementById(`ans-${firstIncorrect.abbr}`);
      if (input) {
        setTimeout(() => {
          input.focus();
          input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }
};

const handleReset = () => {
  const forceReset = confirm('모든 문제를 초기화하시겠습니까? (Ctrl + R을 누르면 틀린 문제만 유지됩니다)');
  resetAll(forceReset);
  saveState();
};

const handleHardReset = async () => {
  if (confirm('모든 진행 상황이 초기화됩니다. 계속하시겠습니까?')) {
    // 단어 순서는 유지하기 위해 현재 순서 저장
    const currentOrder = questions.value.map(q => q.abbr);

    // examState만 삭제하고, questionOrder는 유지
    localStorage.removeItem('examState');
    localStorage.removeItem('lastFocusedInput');

    // 단어 순서는 다시 저장
    const state = {
      questionOrder: currentOrder,
      questions: [],
      isIncorrectOnlyMode: false
    };
    localStorage.setItem('examState', JSON.stringify(state));

    await nextTick();
    questions.value.forEach(question => {
      const ref = questionRefs.value[question.abbr];
      if (ref) {
        ref.loadState({
          value: '',
          isGraded: false,
          isIncorrect: false,
          isVisible: true
        });
      }
      question.index = question.originalIndex;
    });
    isIncorrectOnlyMode.value = false;
    updateTotalScore();
    updateProgress();
    saveState(); // 상태 저장
  }
};

const resetAll = async (forceReset = false) => {
  if (forceReset) {
    await nextTick();
    questions.value.forEach(question => {
      const ref = questionRefs.value[question.abbr];
      if (ref) {
        ref.setVisible(true);
      }
      question.index = question.originalIndex;
    });
    isIncorrectOnlyMode.value = false;
  }

  await nextTick();
  questions.value.forEach(question => {
    const ref = questionRefs.value[question.abbr];
    if (!ref) return;

    if (ref.grade() === false) {
      ref.reset(true);
      ref.setVisible(true);
    } else if (ref.inputValue?.trim() === '') {
      ref.setVisible(true);
    } else {
      ref.setVisible(false);
    }
  });

  updateTotalScore();
  updateProgress();

  await nextTick();
  const firstEmptyQuestion = questions.value.find(q => {
    const ref = questionRefs.value[q.abbr];
    return ref && ref.isVisible && ref.inputValue?.trim() === '';
  });
  if (firstEmptyQuestion) {
    const input = document.getElementById(`ans-${firstEmptyQuestion.abbr}`);
    if (input) {
      setTimeout(() => {
        input.focus();
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }
};

const handleKeyDown = (e) => {
  if (e.ctrlKey && e.key === 'r') {
    e.preventDefault();
    resetAll(false);
    saveState();
  }
  if (e.ctrlKey && e.shiftKey && e.key === 'R') {
    e.preventDefault();
    handleHardReset();
  }
};

// 이벤트 핸들러
const handleQuestionFocus = (question) => {
  localStorage.setItem('lastFocusedInput', question.abbr);
  const input = document.getElementById(`ans-${question.abbr}`);
  if (input) {
    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

const handleQuestionBlur = (question) => {
  updateTotalScore();
  updateProgress();
  saveState();
  checkCompletion();
};

const handleQuestionInput = () => {
  saveState();
};

const handleQuestionGrade = () => {
  updateTotalScore();
  updateProgress();
};

const handleEnterCorrect = (question) => {
  // 정답이면 다음 빈 입력 필드로 이동
  const currentIdx = questions.value.findIndex(q => q.abbr === question.abbr);
  let next = null;

  // 현재 다음부터 빈 입력 필드 찾기
  for (let i = currentIdx + 1; i < questions.value.length; i++) {
    const ref = questionRefs.value[questions.value[i].abbr];
    if (ref && ref.isVisible && ref.inputValue?.trim() === '') {
      next = questions.value[i];
      break;
    }
  }

  // 다음에 없으면 처음부터 빈 입력 필드 찾기
  if (!next) {
    for (let i = 0; i < questions.value.length; i++) {
      const ref = questionRefs.value[questions.value[i].abbr];
      if (ref && ref.isVisible && ref.inputValue?.trim() === '') {
        next = questions.value[i];
        break;
      }
    }
  }

  // 다음 입력 필드로 포커스 이동
  if (next) {
    const input = document.getElementById(`ans-${next.abbr}`);
    if (input) {
      setTimeout(() => {
        input.focus();
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }
};

onMounted(async () => {
  initializeTheme();

  // 저장된 상태 확인
  const savedState = localStorage.getItem('examState');
  let shouldShuffle = true;
  let savedOrder = null;

  if (savedState) {
    try {
      const state = JSON.parse(savedState);
      if (state.questionOrder && Array.isArray(state.questionOrder)) {
        savedOrder = state.questionOrder;
        shouldShuffle = false;
      }
    } catch (e) {
      console.error('Failed to parse saved state:', e);
    }
  }

  if (shouldShuffle) {
    // 저장된 순서가 없으면 새로 섞기
    const shuffledAnswers = Object.entries(answers).sort(() => Math.random() - 0.5);
    let index = 1;

    shuffledAnswers.forEach(([abbr, answer]) => {
      questions.value.push({
        abbr,
        answer,
        index: index++,
        originalIndex: index - 1,
        inputValue: ''
      });
    });
  } else {
    // 저장된 순서대로 questions 생성
    const answerMap = new Map(Object.entries(answers));
    let index = 1;

    savedOrder.forEach(abbr => {
      const answer = answerMap.get(abbr);
      if (answer) {
        questions.value.push({
          abbr,
          answer,
          index: index++,
          originalIndex: index - 1,
          inputValue: ''
        });
      }
    });

    // 저장되지 않은 새로운 문제들 추가 (혹시 모를 경우)
    Object.entries(answers).forEach(([abbr, answer]) => {
      if (!savedOrder.includes(abbr)) {
        questions.value.push({
          abbr,
          answer,
          index: index++,
          originalIndex: index - 1,
          inputValue: ''
        });
      }
    });
  }

  await nextTick();
  await loadState();

  // 가장 앞쪽 번호의 비어있는 입력 필드 찾기
  const firstEmptyQuestion = questions.value
    .filter(q => {
      const ref = questionRefs.value[q.abbr];
      return ref && ref.isVisible && (!ref.inputValue || ref.inputValue.trim() === '');
    })
    .sort((a, b) => a.index - b.index)[0];

  if (firstEmptyQuestion) {
    const input = document.getElementById(`ans-${firstEmptyQuestion.abbr}`);
    if (input) {
      setTimeout(() => {
        input.focus();
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  } else if (questions.value.length > 0) {
    // 비어있는 것이 없으면 첫 번째 visible question으로 포커스
    const firstVisibleQuestion = questions.value
      .filter(q => {
        const ref = questionRefs.value[q.abbr];
        return ref && ref.isVisible;
      })
      .sort((a, b) => a.index - b.index)[0];

    if (firstVisibleQuestion) {
      const input = document.getElementById(`ans-${firstVisibleQuestion.abbr}`);
      if (input) {
        setTimeout(() => {
          input.focus();
          input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }

  document.addEventListener('keydown', handleKeyDown);
  window.addEventListener('beforeunload', saveState);
  updateProgress();
});

onUnmounted(() => {
  saveState();
  document.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('beforeunload', saveState);
});
</script>
