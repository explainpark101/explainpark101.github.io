<template>
  <div class="love-lang-survey">
    <div class="container">
      <router-link to="/surveys" class="back-link">검사 목록으로 가기</router-link>
      <h1>5가지 사랑의 언어 평가지</h1>

      <div class="instructions">
        <p>각 문항을 읽고, 두 가지 보기 중 자신에게 더 와닿는 것을 선택해주세요.</p>
      </div>

      <form @submit.prevent="calculateResults">
        <ol>
          <li v-for="(question, index) in questions" :key="index">
            <div class="question-number">{{ index + 1 }}</div>
            <label 
              v-for="(option, optIndex) in question.options" 
              :key="optIndex"
              :class="{ selected: selectedAnswers[index] === option.value, 'fade-other': selectedAnswers[index] && selectedAnswers[index] !== option.value }"
              @click="selectAnswer(index, option.value)">
              <input type="radio" :name="`q${index + 1}`" :value="option.value" v-model="selectedAnswers[index]">
              {{ option.text }}
            </label>
          </li>
        </ol>
        <button type="submit" class="submit-btn">결과 보기</button>
      </form>

      <div v-if="showResults" id="results">
        <h2>❤️ 나의 사랑의 언어는?</h2>
        <div class="score-summary">
          인정하는 말(A): <span>{{ scores.A }}</span>점 &nbsp;|&nbsp;
          함께하는 시간(B): <span>{{ scores.B }}</span>점 &nbsp;|&nbsp;
          선물(C): <span>{{ scores.C }}</span>점 &nbsp;|&nbsp;
          봉사(D): <span>{{ scores.D }}</span>점 &nbsp;|&nbsp;
          스킨십(E): <span>{{ scores.E }}</span>점
        </div>

        <div v-for="(result, type) in resultTypes" :key="type" 
             :id="`result-${type}`" 
             :class="['result-type', { highlight: highlightedTypes.includes(type) }]">
          <h3>{{ result.title }}</h3>
          <p>{{ result.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const questions = [
  { options: [
    { text: '나는 상대로부터 인정받는 말 듣는 것을 좋아한다.', value: 'A' },
    { text: '나는 상대가 안아주는 것을 좋아한다.', value: 'E' }
  ]},
  { options: [
    { text: '나는 상대와 단둘이 보는 시간을 좋아한다.', value: 'B' },
    { text: '나는 상대가 실질적인 도움을 줄 때 사랑을 느낀다.', value: 'D' }
  ]},
  { options: [
    { text: '나는 상대에게 선물을 받는 것을 좋아한다.', value: 'C' },
    { text: '나는 상대와 함께 산책하는 시간을 좋아한다.', value: 'B' }
  ]},
  { options: [
    { text: '나는 상대가 나를 도와 줄 때 사랑을 느낀다.', value: 'D' },
    { text: '나는 상대에게 가벼운 신체 접촉을 받을 때 사랑을 느낀다.', value: 'E' }
  ]},
  { options: [
    { text: '나는 상대가 감싸 안아 줄 때 사랑을 느낀다.', value: 'E' },
    { text: '나는 상대에게 선물을 받을 때 사랑을 느낀다.', value: 'C' }
  ]},
  { options: [
    { text: '나는 상대와 함께 외출하는 것을 좋아한다.', value: 'B' },
    { text: '나는 상대와 손을 잡는 것을 좋아한다.', value: 'E' }
  ]},
  { options: [
    { text: '나는 상대가 나를 인정해 줄 때 사랑을 느낀다.', value: 'A' },
    { text: '나에게는 눈에 보이는 선물이 매우 의미가 있다.', value: 'C' }
  ]},
  { options: [
    { text: '나는 상대와 함께 붙어 앉는 것을 좋아한다.', value: 'E' },
    { text: '나는 상대가 나에 대해 매력적이라고 할 때 좋아한다.', value: 'A' }
  ]},
  { options: [
    { text: '나는 상대와 함께 시간 보내는 것을 좋아한다.', value: 'B' },
    { text: '나는 상대에게 작지만 선물 받는 것을 좋아한다.', value: 'C' }
  ]},
  { options: [
    { text: '나는 상대가 나를 도와 줄 때 사랑을 느낀다.', value: 'D' },
    { text: '나를 이해해 주는 말들이 나에게는 중요하다.', value: 'A' }
  ]},
  { options: [
    { text: '나는 상대와 뭔가 함께 하는 것을 좋아한다.', value: 'B' },
    { text: '나는 상대가 해주는 친절한 말들을 좋아한다.', value: 'A' }
  ]},
  { options: [
    { text: '나는 상대와 포옹할 때 완전함을 느낀다.', value: 'E' },
    { text: '나는 상대의 말보다 행동을 볼 때 더 감동한다.', value: 'D' }
  ]},
  { options: [
    { text: '나는 상대의 칭찬을 좋아하고 비판을 회피하는 편이다.', value: 'A' },
    { text: '나는 커다란 선물보다는 작지만 자주 받는 것을 좋아한다.', value: 'C' }
  ]},
  { options: [
    { text: '나는 상대가 자주 신체접촉해 줄 때 더 친근함을 느낀다.', value: 'E' },
    { text: '나는 상대와 함께 뭔가 하거나 이야기 할 때 친밀함을 느낀다.', value: 'B' }
  ]},
  { options: [
    { text: '나는 상대가 내가 해낸 일에 대해 칭찬하는 것을 좋아한다.', value: 'A' },
    { text: '나는 상대가 나를 위해 기꺼이 하기 싫은 일을 해 줄 때 진정한 사랑을 느낀다.', value: 'D' }
  ]},
  { options: [
    { text: '나는 상대와 걸을 때 손잡아(어깨 감싸)주는 것을 좋아한다.', value: 'E' },
    { text: '나는 상대가 내 이야기에 공감하면서 들어주는 것을 좋아한다.', value: 'B' }
  ]},
  { options: [
    { text: '나는 상대에게 선물 받는 것을 정말 즐거워한다.', value: 'C' },
    { text: '나는 상대가 집안일을 도와줄 때 사랑을 느낀다.', value: 'D' }
  ]},
  { options: [
    { text: '나는 상대방이 내 외모에 대해 칭찬해주는 것을 좋아한다.', value: 'A' },
    { text: '나는 상대가 내 기분을 이해하기 위해 시간을 내 줄 때 사랑을 느낀다.', value: 'B' }
  ]},
  { options: [
    { text: '나는 상대가 나를 어루만져 줄 때 평안함을 느낀다.', value: 'E' },
    { text: '나를 돕는 상대의 수고에 사랑을 느낀다.', value: 'D' }
  ]},
  { options: [
    { text: '나를 위해 수고하는 상대에게 고마움을 느낀다.', value: 'D' },
    { text: '나는 상대가 만든(준비한) 선물 받는 것을 좋아한다.', value: 'C' }
  ]},
  { options: [
    { text: '나는 상대가 나에게 전념(집중)할 때 그 느낌을 굉장히 좋아한다.', value: 'B' },
    { text: '나는 상대가 나를 위해 실제로 행할 때 느낌을 굉장히 좋아한다.', value: 'D' }
  ]},
  { options: [
    { text: '나는 상대가 선물과 함께 내 생일을 축하해 줄 때 사랑을 느낀다.', value: 'C' },
    { text: '나는 내 생일 때 의미 있는 말(카드에 쓰거나 직접)과 함께 축하해 줄 때 사랑을 느낀다.', value: 'A' }
  ]},
  { options: [
    { text: '나는 상대가 집안일을 도와줄 때 사랑을 느낀다.', value: 'D' },
    { text: '나는 상대가 선물을 줄 때 나를 생각해주는 것이라고 느낀다.', value: 'C' }
  ]},
  { options: [
    { text: '나는 상대가 선물과 함께 특별한 날을 기억해 줄 때 고마움을 느낀다.', value: 'C' },
    { text: '나는 상대가 끝까지 인내를 가지고 이야기를 들어줄 때 고마움을 느낀다.', value: 'B' }
  ]},
  { options: [
    { text: '나는 상대와 장기간 여행을 즐긴다(원한다).', value: 'B' },
    { text: '나는 상대가 내가 하는 일상적인 일에 충분히 관심을 기울여 주기를 바란다.', value: 'D' }
  ]},
  { options: [
    { text: '기대하지 않은 입맞춤이 나를 흥분시킨다.', value: 'E' },
    { text: '특별하지 않은 때라도 받는 선물은 나를 흥분시킨다.', value: 'C' }
  ]},
  { options: [
    { text: '나는 상대에게 고맙다는 말 듣는 것을 좋아한다.', value: 'A' },
    { text: '나는 상대가 이야기 하는 동안 나를 바라보는 것을 좋아한다.', value: 'B' }
  ]},
  { options: [
    { text: '나는 상대가 얼마나 나에게 고마워하고 있는지 말해줄 때 사랑을 느낀다.', value: 'D' },
    { text: '나는 상대가 가벼운 신체 접촉해주는 것을 좋아한다.', value: 'E' }
  ]},
  { options: [
    { text: '나는 상대가 얼마나 나에게 고마워하고 있는지 말해줄 때 사랑을 느낀다.', value: 'A' },
    { text: '나는 상대가 내가 부탁한 일에 최선을 다해줄 때 사랑을 느낀다.', value: 'D' }
  ]},
  { options: [
    { text: '나는 매일 가벼운 신체 접촉을 원한다.', value: 'E' },
    { text: '나는 매일 상대방의 지지하는 말이 필요하다.', value: 'A' }
  ]}
];

const selectedAnswers = ref({});
const showResults = ref(false);
const highlightedTypes = ref([]);

const scores = computed(() => {
  const score = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  Object.values(selectedAnswers.value).forEach(value => {
    if (value) {
      score[value]++;
    }
  });
  return score;
});

const resultTypes = {
  A: {
    title: 'A. 사랑의 제 1 언어: 인정하는 말 (상대에 대한 칭찬 격려)',
    description: '이 사랑의 언어를 가진 사람은 상대방의 자발적인 칭찬에 감격합니다. "사랑해"라는 말을 듣는 것이 중요합니다.  인간에게 가장 심오한 욕구는 누군가로부터 인정받고 싶은 욕구이며, 인정은 다음과 같은 언어를 통해 전달됩니다.  잘한 일을 칭찬하고 , 구체적으로 칭찬하는 것이 중요합니다.  친절한 행동에 감사해야 하며 , 작은 일에도 반드시 고맙다는 표현을 해야 서로 기쁨이 있습니다.  함께 시간을 보내며 발전하게 된 잠재력을 표현하고 알려주는 것도 중요합니다.'
  },
  B: {
    title: 'B. 사랑의 제 2 언어: 함께 하는 시간 (진정한 대화, 취미활동 공유)',
    description: '온전히 집중해 주는 것을 최고의 사랑으로 여기는 사람입니다.  TV를 끄고, 서로를 바라보며 대화하는 것이 중요합니다.  함께 하는 시간은 서로 감정적으로 관심을 집중시키면서 보내는 것이며 , 진정한 대화에서는 충고보다 자신의 감정을 이해받기 원합니다. [cite: 11, 12] 함께 장을 보거나, 음악을 듣거나, 산책을 가거나, 봉사를 하는 등 함께 하는 활동이 중요합니다.'
  },
  C: {
    title: 'C. 사랑의 제 3 언어: 선물 (가장 배우기 쉬운 사랑의 언어)',
    description: '선물의 크기를 떠나 선물에 담겨 있는 사랑과 사려 깊음과 노력을 소중히 여깁니다.  선물을 주고받는 일은 문화를 초월하여 사랑을 전하는 데 매우 중요합니다.  선물은 상징에 불과하고 선물을 준 사람과 그때의 느낌은 오래 기억됩니다.  마음이 중요하다고 생각하여 선물하지 않으면 나중에는 마음까지 멀어지고 맙니다.  사랑과 정성이 깃든 것이면 무엇이든 좋으며 상대가 원하는 것이면 더욱 좋습니다.'
  },
  D: {
    title: 'D. 사랑의 제 4 언어: 봉사 (원하는 것 몸으로 봉사해주기)',
    description: '이런 사람들에게는 말보다 행동이 더 중요하며, 가장 원하는 말은 "당신을 위해 이걸 해주겠소."입니다.  상대를 도와줌으로써 기쁘게 하고 무엇인가를 함으로써 당신의 사랑을 표현하는 것을 말합니다.  부부 사이라면 집을 청소하고, 아기 기저귀를 갈아주고, 설거지를 도와주는 일 등은 노력과 정성을 요구합니다.  자발적으로 이런 일을 하면 놀라운 사랑의 표현이 될 수 있습니다.  사랑은 선택이므로 도움을 정중하게 요청하는 것은 좋지만, 억지로 하게 만들면 안됩니다. [cite: 21, 22] 사랑은 언제나 마음에서 우러나와야 합니다.'
  },
  E: {
    title: 'E. 사랑의 제 5 언어: 스킨십',
    description: '이 언어를 가진 사람은 자신도 다른 사람들을 잘 만지는 경향이 있습니다.  포옹, 머리 쓰다듬기, 손잡기 등을 통해 자신의 감정을 표현합니다.  연구에 따르면, 육체적인 접촉을 한 아이들이 훨씬 건강하게 자랍니다.  서로 손을 잡아주거나, 키스하거나, 껴안는 것은 배우자에게 사랑을 전달하는 매우 중요한 수단입니다.  접촉은 온 정성을 다해야 하는 경우도 있고, 잠시 만지는 가벼운 접촉도 중요합니다.'
  }
};

function selectAnswer(index, value) {
  selectedAnswers.value[index] = value;
}

function calculateResults() {
  const totalQuestions = 30;
  const answeredCount = Object.keys(selectedAnswers.value).filter(k => selectedAnswers.value[k]).length;

  if (answeredCount < totalQuestions) {
    alert(`모든 ${totalQuestions}개 문항에 답변해주세요!`);
    return;
  }

  const currentScores = scores.value;
  const maxScore = Math.max(...Object.values(currentScores));
  
  highlightedTypes.value = [];
  Object.keys(currentScores).forEach(type => {
    if (currentScores[type] === maxScore && maxScore > 0) {
      highlightedTypes.value.push(type);
    }
  });
  
  showResults.value = true;
  setTimeout(() => {
    const resultsDiv = document.getElementById('results');
    if (resultsDiv) {
      resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 100);
}
</script>

<style scoped>
.love-lang-survey {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: #fdf2f2;
  color: #444;
  line-height: 1.7;
  margin: 0;
  padding: 20px;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.08);
}

h1, h2 {
  text-align: center;
  color: #d9534f;
}

.instructions {
  text-align: center;
  color: #555;
  background-color: #f9e6e5;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 30px;
}

ol {
  list-style: none;
  padding: 0;
}

li {
  background: #fff9f9;
  margin-bottom: 18px;
  padding: 20px;
  border-radius: 8px;
  border-left: 5px solid #f0ad4e;
}

.question-number {
  font-weight: bold;
  font-size: 1.1em;
  color: #c9302c;
  margin-bottom: 10px;
}

li label {
  display: block;
  margin: 8px 0;
  padding: 15px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid #e0e0e0;
  background: #ffffff;
  position: relative;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

li label:hover {
  background-color: #f8f9fa;
  border-color: #d9534f;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

li label.selected {
  background-color: #d9534f;
  color: #ffffff;
  border-color: #c9302c;
  box-shadow: 0 4px 12px rgba(217, 83, 79, 0.3);
}

li label.selected::after {
  content: "✓";
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  font-weight: bold;
}

li label:not(.selected) {
  opacity: 0.6;
  filter: grayscale(20%);
}

li label:not(.selected):hover {
  opacity: 0.8;
  filter: grayscale(10%);
}

li label.fade-other {
  opacity: 0.5;
  filter: grayscale(40%);
  transform: scale(0.95);
  transition: all 0.3s ease;
}

input[type="radio"] {
  margin-right: 12px;
  transform: scale(1.2);
}

.submit-btn {
  display: block;
  width: 100%;
  padding: 15px;
  font-size: 1.2em;
  font-weight: bold;
  color: #fff;
  background-color: #d9534f;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 30px;
  transition: background-color 0.3s;
}

.submit-btn:hover {
  background-color: #c9302c;
}

#results {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 2px solid #f0ad4e;
}

.score-summary {
  font-size: 1.2em;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30px;
  padding: 15px;
  background-color: #fef5e7;
  border-radius: 5px;
}

.result-type {
  margin-bottom: 20px;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #ddd;
  transition: all 0.3s ease-in-out;
}

.result-type h3 {
  margin-top: 0;
  color: #d9534f;
  border-bottom: 2px solid #f9e6e5;
  padding-bottom: 10px;
}

.result-type.highlight {
  background-color: #fff6f6;
  border: 2px solid #d9534f;
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.back-link {
  display: inline-block;
  text-align: left;
  margin-bottom: 20px;
  padding: 10px 20px;
  background-color: #d9534f;
  color: #fff;
  text-decoration: none;
  border-radius: 5px;
  font-weight: bold;
  transition: background-color 0.3s;
}

.back-link:hover {
  background-color: #c9302c;
}
</style>
