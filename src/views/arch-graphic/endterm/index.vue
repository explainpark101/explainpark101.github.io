<template>
  <div class="arch-graphic-app" :data-theme="theme">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">

    <nav style="background-color: transparent; padding: 1rem; margin-bottom: 2rem;">
      <div style="max-width: 1200px; margin: 0 auto;">
        <router-link to="/"
          style="color: var(--text-primary); text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem; font-size: 1.2rem; font-weight: 500;">
          <span class="material-icons" style="font-size: 1.5rem;">home</span>
        </router-link>
        <router-link to="/arch-graphic"
          style="color: var(--primary-color); text-decoration: none; margin-left: 1.5rem; font-size: 1.1rem; font-weight: 400;">중간고사</router-link>
      </div>
    </nav>

    <button class="settings-button" @click="showSettings = true">설정</button>

    <dialog ref="settingsDialog" class="settings-dialog">
      <div class="settings-content">
        <h3 class="settings-title">설정</h3>
        <div class="theme-switch">
          <input type="checkbox" id="themeSwitch" v-model="isDarkMode" @change="toggleTheme">
          <label for="themeSwitch">다크 모드</label>
        </div>
        <div class="dialog-buttons">
          <button class="secondary" @click="showSettings = false">닫기</button>
        </div>
      </div>
    </dialog>

    <div class="progress-box">
      <h3>진행 상황</h3>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>
      <div class="progress-stats">
        <span>{{ Math.round(progress) }}%</span>
        <span>정답률: {{ Math.round(accuracy) }}%</span>
      </div>
    </div>

    <div class="container">
      <h1>기말고사: GRAPHIC COMMUNICATIONS IN CONSTRUCTION</h1>
      <p class="subtitle">범위: A ~ Z 약어</p>

      <form @submit.prevent="gradeAll">
        <div id="questions" class="questions-container">
          <QuestionItem v-for="question in questions" :key="question.abbr"
            :ref="(el) => setQuestionRef(question.abbr, el)" :question="question" @focus="handleQuestionFocus"
            @blur="handleQuestionBlur" @input="handleQuestionInput" @grade="handleQuestionGrade"
            @keydown="handleQuestionKeydown" @enter-correct="handleEnterCorrect" />
        </div>
        <div class="button-group">
          <button type="button" @click="handleReset">리셋</button>
          <button type="button" class="danger" @click="handleHardReset">하드 리셋</button>
          <button type="submit">제출</button>
        </div>
      </form>

      <div id="score" ref="scoreElement">{{ scoreText }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import QuestionItem from '../../../components/QuestionItem.vue';

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
  "HV": "High voltage", "HVAC": "Heating Venting and Air Conditioning", "HW": "Hot water",
  "ICF": "Insulated Concrete Form", "ID": "Inside diameter", "IF": "Inside Face",
  "INCL": "Inclusive, including", "INV": "Invert", "INSUL": "Insulation", "INT": "Interior",
  "JCT": "Junction", "JST": "Joist", "kW": "Killowatt", "LFT": "Linear feet",
  "LAM": "Laminate", "LAT": "Lateral", "LH": "Left hand", "LIN": "Linear",
  "LL": "Live load", "LT": "Light", "LVL": "Laminated Veneer Lumber", "MB": "Machine bolt",
  "MO": "Masonry opening", "MAR": "Marble", "MAS": "Masonry", "MTL": "Material",
  "MAX": "Maximum", "MECH": "Mechanical", "MED": "Medium", "MFG": "Manufacturing",
  "MH": "Manhole", "MIN": "Minimum", "MOD": "Modular", "MTL": "Metal, steel",
  "MUL": "Mullion", "NTS": "Not to scale", "NCM": "Non-corrosive metal", "NFC": "Not for construction",
  "NIC": "Not in contract", "NO": "Number", "NOM": "Nominal", "OAL": "Overall length",
  "OC": "On-Center", "OD": "Outside diameter", "OR": "Outside radius", "OH": "Overhead",
  "OPNG": "Opening", "P": "Paint", "PART": "Partition", "PAV": "Pavement",
  "PC": "Pre-Cast Concrete", "PL": "Plaster or Property line", "PLT": "Plate", "PLAS": "Plastic",
  "PLV": "Plastic laminate veneer", "PLYWD": "Plywood", "PSF": "Pounds per square foot",
  "PSI": "Pounds per square inch", "PTD": "Painted", "PVC": "Polyvinyl chloride", "PWR": "Power",
  "QTY": "Quantity", "RAD": "Radius", "RC": "Reinforced Concrete", "RD": "Roof Drain",
  "RO": "Rough Opening", "ROW": "Right of Way", "REFG": "Refrigerator", "REF": "Reference",
  "REINF": "Reinforced", "RET": "Return", "REV": "Revision", "RH": "Right hand",
  "RM": "Room", "RMV": "Remove", "SAN": "Sanitary", "SC": "Solid Core",
  "SCHED": "Schedule", "SD": "Smoke Detector", "SECT": "Section", "SHT": "Sheet",
  "SHT'G": "Sheathing", "SIM": "Similar", "SPECS": "Specifications", "SPK": "Sprinkler",
  "SQ.FT.": "Square feet", "SQ. IN.": "Square inches", "STD": "Standard", "STL": "Steel",
  "SY": "Square yard", "SYS": "System", "T&B": "Top and bottom", "TO": "Top of",
  "TOB": "Top of beam", "TOC": "Top of curb", "TOF": "Top of footing", "TOJ": "Top of joist",
  "TOM": "Top of masonry", "TOW": "Top of wall", "TS": "Tube steel", "TH": "Threshold",
  "TYP": "Typical", "UNF": "Unfinished", "VA": "Voltage", "VB": "Vapor barrier",
  "VIF": "Verify in field", "VCT": "Vinyl composition tile", "WC": "Toilet,water closet",
  "WDW": "Window", "WL": "Water level", "WP": "Weatherproof", "WT": "Weight",
  "WTR. HTR": "Water Heater", "WD": "Wood", "WIC": "Walk In Closet", "W/O": "Without",
  "YD": "Yard"
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
    lastFocusedInput: localStorage.getItem('lastFocusedInput-endterm'),
    isIncorrectOnlyMode: isIncorrectOnlyMode.value
  };
  localStorage.setItem('examState-endterm', JSON.stringify(state));
};

const loadState = async () => {
  const savedState = localStorage.getItem('examState-endterm');
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

    const stateMap = {};
    if (state.questions) {
      state.questions.forEach(qState => {
        if (qState.abbr) stateMap[qState.abbr] = qState;
      });
    }

    await nextTick();

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

    // examState-endterm만 삭제하고, questionOrder는 유지
    localStorage.removeItem('examState-endterm');
    localStorage.removeItem('lastFocusedInput-endterm');

    // 단어 순서는 다시 저장
    const state = {
      questionOrder: currentOrder,
      questions: [],
      isIncorrectOnlyMode: false
    };
    localStorage.setItem('examState-endterm', JSON.stringify(state));

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
  localStorage.setItem('lastFocusedInput-endterm', question.abbr);
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

const handleQuestionKeydown = (question, event) => {
  // Enter 키 처리는 QuestionItem에서 하고, 여기서는 다른 키 처리만
  // 정답이면 handleEnterCorrect가 호출됨
};

onMounted(async () => {
  initializeTheme();

  // 저장된 상태 확인
  const savedState = localStorage.getItem('examState-endterm');
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

<style scoped>
:root {
  --primary-color: #1976d2;
  --primary-light: #42a5f5;
  --primary-dark: #1565c0;
  --text-primary: #212121;
  --text-secondary: #757575;
  --background: #f5f5f5;
  --surface: #ffffff;
  --error: #d32f2f;
  --success: #388e3c;
  --border-color: #e0e0e0;
  --shadow-color: rgba(0, 0, 0, 0.1);
  --overlay-color: rgba(0, 0, 0, 0.5);
  transition: background-color 500ms ease-in-out, color 500ms ease-in-out, border-color 500ms ease-in-out, box-shadow 500ms ease-in-out;
}

@media (prefers-color-scheme: dark) {
  :root {
    --primary-color: #90caf9;
    --primary-light: #42a5f5;
    --primary-dark: #1565c0;
    --text-primary: #ffffff;
    --text-secondary: #b0bec5;
    --background: #121212;
    --surface: #1e1e1e;
    --error: #ef5350;
    --success: #66bb6a;
    --border-color: #424242;
    --shadow-color: rgba(0, 0, 0, 0.3);
    --overlay-color: rgba(0, 0, 0, 0.7);
  }
}

[data-theme="light"] {
  --primary-color: #1976d2;
  --primary-light: #42a5f5;
  --primary-dark: #1565c0;
  --text-primary: #212121;
  --text-secondary: #757575;
  --background: #f5f5f5;
  --surface: #ffffff;
  --error: #d32f2f;
  --success: #388e3c;
  --border-color: #e0e0e0;
  --shadow-color: rgba(0, 0, 0, 0.1);
  --overlay-color: rgba(0, 0, 0, 0.5);
}

[data-theme="dark"] {
  --primary-color: #90caf9;
  --primary-light: #42a5f5;
  --primary-dark: #1565c0;
  --text-primary: #ffffff;
  --text-secondary: #b0bec5;
  --background: #121212;
  --surface: #1e1e1e;
  --error: #ef5350;
  --success: #66bb6a;
  --border-color: #424242;
  --shadow-color: rgba(0, 0, 0, 0.3);
  --overlay-color: rgba(0, 0, 0, 0.7);
}

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

.arch-graphic-app {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  transition: background-color 500ms ease-in-out, color 500ms ease-in-out, border-color 500ms ease-in-out, box-shadow 500ms ease-in-out;
}

.arch-graphic-app * {
  box-sizing: border-box;
  transition: background-color 500ms ease-in-out, color 500ms ease-in-out, border-color 500ms ease-in-out, box-shadow 500ms ease-in-out;
}

.arch-graphic-app {
  font-family: 'Roboto', sans-serif;
  background-color: var(--background);
  color: var(--text-primary);
  line-height: 1.6;
  padding: 20px;
  transition: background-color 500ms ease-in-out, color 500ms ease-in-out;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  background-color: var(--surface);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px var(--shadow-color);
  position: relative;
  transition: background-color 500ms ease-in-out, box-shadow 500ms ease-in-out;
}

.progress-box {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: var(--surface);
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px var(--shadow-color);
  z-index: 1000;
  min-width: 200px;
  transition: background-color 500ms ease-in-out, box-shadow 500ms ease-in-out;
  pointer-events: auto;
}

.progress-box h3 {
  color: var(--primary-color);
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
  transition: color 500ms ease-in-out;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: var(--border-color);
  border-radius: 4px;
  margin: 0.5rem 0;
  overflow: hidden;
  transition: background-color 500ms ease-in-out;
}

.progress-fill {
  height: 100%;
  background-color: var(--primary-color);
  transition: width 0.3s ease, background-color 500ms ease-in-out;
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--text-secondary);
  transition: color 500ms ease-in-out;
}

.button-group {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem !important;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 500ms ease-in-out;
}

button:hover {
  background-color: var(--primary-dark);
}

button.secondary {
  background-color: var(--text-secondary);
}

button.secondary:hover {
  background-color: var(--text-primary);
}

button.danger {
  background-color: var(--error);
}

button.danger:hover {
  background-color: #b71c1c;
}

h1 {
  text-align: center;
  color: var(--primary-color);
  margin-bottom: 1.5rem;
  font-weight: 500;
  transition: color 500ms ease-in-out;
}

.subtitle {
  text-align: center;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  transition: color 500ms ease-in-out;
}

#questions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

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

#score {
  text-align: center;
  font-size: 1.2rem;
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: var(--surface);
  border-radius: 4px;
  box-shadow: 0 1px 3px var(--shadow-color);
  transition: background-color 500ms ease-in-out, box-shadow 500ms ease-in-out;
}

@keyframes dialogSlideIn {
  from {
    transform: translateY(-100px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes backdropFadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.settings-dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--surface);
  border: none;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px var(--shadow-color);
  min-width: 300px;
  animation: dialogSlideIn 0.3s ease-out;
}

.settings-dialog::backdrop {
  background-color: var(--overlay-color);
  animation: backdropFadeIn 0.3s ease-out;
}

.settings-button {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: transparent;
  color: var(--text-primary);
  border: none;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 500ms ease-in-out, color 500ms ease-in-out;
  z-index: 1001;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.settings-button:hover {
  background-color: var(--shadow-color);
}

.settings-button::before {
  content: '⚙️';
  font-size: 1.2rem;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.settings-title {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1.2rem;
  font-weight: 500;
}

.theme-switch {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.theme-switch label {
  color: var(--text-primary);
  font-size: 1rem;
}

.theme-switch input[type="checkbox"] {
  width: 40px;
  height: 20px;
  appearance: none;
  background-color: var(--border-color);
  border-radius: 10px;
  position: relative;
  cursor: pointer;
  transition: background-color 500ms ease-in-out;
}

.theme-switch input[type="checkbox"]:checked {
  background-color: var(--primary-color);
}

.theme-switch input[type="checkbox"]::before {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: white;
  top: 2px;
  left: 2px;
  transition: transform 500ms ease-in-out;
}

.theme-switch input[type="checkbox"]:checked::before {
  transform: translateX(20px);
}

.dialog-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.dialog-buttons button {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.dialog-buttons button.secondary {
  background-color: var(--text-secondary);
}

.dialog-buttons button.secondary:hover {
  background-color: var(--text-primary);
}
</style>
