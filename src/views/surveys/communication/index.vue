<template>
  <div class="communication-survey">
    <div class="container">
      <router-link to="/surveys" class="back-link">검사 목록으로 가기</router-link>
      <h1>의사소통 유형 검사</h1>
      <h2>Verginia Satir 버지니아 사티어</h2>

      <div class="instructions">
        <p>⚛ 다음 문장을 읽고 자신에게 해당되면 오른쪽의 동그라미(체크박스)에 표시 하세요.</p>
      </div>

      <form @submit.prevent="calculateResults">
        <ol>
          <li v-for="(question, index) in questions" :key="index" 
              :class="{ selected: selectedQuestions[index] }"
              @click="toggleQuestion(index, $event)">
            {{ question.text }}
            <input type="checkbox" :value="question.value" v-model="selectedQuestions[index]" @change="updateSelectedState(index)">
          </li>
        </ol>
        <button type="submit" class="submit-btn">결과 보기</button>
      </form>

      <div v-if="showResults" id="results">
        <h2>📊 검사 결과</h2>
        <div class="score-summary">
          회유형(a): <span>{{ scores.a }}</span>개 &nbsp;/&nbsp;
          비난형(b): <span>{{ scores.b }}</span>개 &nbsp;/&nbsp;
          초이성형(c): <span>{{ scores.c }}</span>개 &nbsp;/&nbsp;
          산만형(d): <span>{{ scores.d }}</span>개 &nbsp;/&nbsp;
          일치형(e): <span>{{ scores.e }}</span>개
        </div>

        <div v-for="(result, type) in resultTypes" :key="type" 
             :id="`result-${type}`" 
             :class="['result-type', { highlight: highlightedTypes.includes(type) }]">
          <h3>{{ result.title }}</h3>
          <p>{{ result.description }}</p>
        </div>

        <div class="footer-note">
          <p>유형별로 합산하여 높은 점수가 나올수록 그 사람이 주로 쓰는 의사소통 유형 방식입니다. <strong>일치형 외에는 역기능적 의사소통 방식</strong>입니다. 역기능적 의사소통 방식(a, b, c, d)을 반복적으로 사용하여 관계를 그르칠 때는 자신의 의사소통을 변화시키도록 노력하여야 합니다. 두 개의 유형이 동점일 경우도 있으며, 이는 상황이나 대상에 따라 선별하여 사용하는 것을 의미합니다.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const questions = [
  { text: '1. 나는 상대방이 불편하게 보이면 비위를 맞추려고 한다.', value: 'a' },
  { text: '2. 나는 일이 잘못되었을 때 자주 상대방의 탓으로 돌린다.', value: 'b' },
  { text: '3. 나는 무슨 일이든지 조목조목 따지는 편이다.', value: 'c' },
  { text: '4. 나는 생각이 자주 바뀌고 동시에 여러 가지 행동을 하는 편이다.', value: 'd' },
  { text: '5. 나는 타인의 평가에 구애받지 않고 내 의견을 말한다.', value: 'e' },
  { text: '6. 나는 관계나 일이 잘못 되었을 때 자주 내 탓으로 돌린다.', value: 'a' },
  { text: '7. 나는 다른 사람들의 의견을 무시하고 내 의견을 주장하는 편이다.', value: 'b' },
  { text: '8. 나는 이성적이고 차분하며 냉정하게 생각한다.', value: 'c' },
  { text: '9. 나는 다른 사람들로부터 정신이 없거나 산만하다는 소리를 듣는다.', value: 'd' },
  { text: '10. 나는 부정적인 감정도 솔직하게 표현한다.', value: 'e' },
  { text: '11. 나는 지나치게 남을 의식해서 나의 생각이나 감정을 표현하는 것을 두려워한다.', value: 'a' },
  { text: '12. 나는 내 의견이 받아들여지지 않으면 화가 나서 언성을 높인다.', value: 'b' },
  { text: '13. 나는 나의 견해를 분명하게 표현하기 위해 객관적인 자료를 자주 인용한다.', value: 'c' },
  { text: '14. 나는 상황에 적절하지 못한 말이나 행동을 자주 하고 딴전을 피우는 편이다.', value: 'd' },
  { text: '15. 나는 다른 사람이 내게 부탁을 할 때 내가 원하지 않으면 거절한다.', value: 'e' },
  { text: '16. 나는 사람들의 얼굴 표정, 감정, 말투에 신경을 많이 쓴다.', value: 'a' },
  { text: '17. 나는 타인의 결점이나 잘못을 잘 찾아내어 비판한다.', value: 'b' },
  { text: '18. 나는 실수하지 않으려고 애를 쓰는 편이다.', value: 'c' },
  { text: '19. 나는 곤란하거나 난처할 때는 농담이나 유머로 그 상황을 바꾸려하는 편이다.', value: 'd' },
  { text: '20. 나는 나 자신에 대해 편안하게 느낀다.', value: 'e' },
  { text: '21. 나는 타인을 배려하고 잘 돌보아 주는 편이다.', value: 'a' },
  { text: '22. 나는 명령적이고 지시적인 말투를 자주 사용하기 때문에 상대가 공격받았다는 느낌을 받을 때가 있다.', value: 'b' },
  { text: '23. 나는 불편한 상황을 그대로 넘기지 못하고 시시비비를 따지는 편이다.', value: 'c' },
  { text: '24. 나는 불편한 상황에서는 안절부절 못하거나 가만히 있지를 못한다.', value: 'd' },
  { text: '25. 나는 모험하는 것을 두려워하지 않는다.', value: 'e' },
  { text: '26. 나는 다른 사람들이 나를 싫어할까 두려워해서 위축되거나 불안을 느낄 때가 많다.', value: 'a' },
  { text: '27. 나는 사소한 일에도 잘 흥분하거나 화를 낸다.', value: 'b' },
  { text: '28. 나는 현명하고 침착하지만 냉정하다는 말을 자주 듣는다.', value: 'c' },
  { text: '29. 나는 한 주제에 집중하기보다는 화제를 자주 바꾼다.', value: 'd' },
  { text: '30. 나는 다양한 경험에 개방적이다.', value: 'e' },
  { text: '31. 나는 자주 근육이 긴장되고 목이 뻣뻣하며 혈압이 오르는 것을 느끼곤 한다.', value: 'a' },
  { text: '32. 나는 나의 감정을 표현하는 것이 힘들고, 혼자인 느낌이 들 때가 많다.', value: 'b' },
  { text: '33. (※ 원문에 33번 문항이 없어 건너뜁니다. 자동으로 초이성형 항목이 1개 추가됩니다.)', value: 'c' },
  { text: '34. 나는 분위기가 침체되거나 지루해지면 분위기를 바꾸려 한다.', value: 'd' },
  { text: '35. 나는 나만의 독특한 개성을 존중한다.', value: 'e' },
  { text: '36. 나는 나 자신이 가치가 없는 것 같아 우울하게 느껴질 때가 많다.', value: 'a' },
  { text: '37. 나는 타인으로부터 비판적이거나 융통성이 없다는 말을 듣기도 한다.', value: 'b' },
  { text: '38. 나는 목소리가 단조롭고 무표정하며 경직된 자세를 취하는 편이다.', value: 'c' },
  { text: '39. 나는 불안하면 호흡이 고르지 못하고 머리가 어지러운 경험을 하기도 한다.', value: 'd' },
  { text: '40. 나는 누가 나의 의견에 반대해도 감정이 상하지 않는다.', value: 'e' }
];

const selectedQuestions = ref({});
const showResults = ref(false);
const highlightedTypes = ref([]);

const scores = computed(() => {
  const score = { a: 0, b: 0, c: 0, d: 0, e: 0 };
  questions.forEach((q, index) => {
    if (selectedQuestions.value[index]) {
      score[q.value]++;
    }
  });
  // 33번 문항 자동 추가 (초이성형)
  score.c++;
  return score;
});

const resultTypes = {
  a: {
    title: '1) 회유형 (Placate)',
    description: '자기 자신의 가치나 진정한 감정은 무시하며 자신을 부인하고 자신은 별로 중요하지 않다는 메시지를 타인에게 줍니다. 자신의 힘을 타인에게 넘겨주며, 그들의 모든 요구를 거의 다 수용하고 들어줍니다. 즉 타인을 위해 희생 봉사하며, 모든 사람의 만족을 위해 즐겁게 행동하려고 노력합니다. (모두 다 내 잘못, 난 아무것도 아니야, (당신 없이는)난 중요치 않아, 당신은 무엇을 하고 싶으세요? 아무거나 다 좋아)'
  },
  b: {
    title: '2) 비난형 (Blame)',
    description: '타인을 무시하고 자신만을 생각하며, 자신을 방어하기 위하여 타인을 비난하고 괴롭혀서 난폭한 폭군으로 여겨집니다. 그러나 내면에는 외로움과 긴장감이 가득 차 있고, 실패자라는 패배감을 갖고 있으며 거친 비난은 도움을 요청하는 호소입니다. (다 네 잘못이야, 너는 뭐가 문제야?, 넌 제대로 하는 게 하나도 없어, 네가 ~만 했어도 나에게 잘못된 것은 아무것도 없어)'
  },
  c: {
    title: '3) 초이성형 (Super-reasonable)',
    description: '비인간적인 객관성과 논리성의 소유자로서 감정을 거부하고 과소평가하며 상황만을 중요시합니다. 매우 이성적이고 권위적이며, 항상 논리적이고 옳아야 하며, 경직되고 강박적입니다. 인정이 없고 융통성이 없으며, 지나치게 합리적이고 강한 자존심과 책임감으로 타인의 장점을 인정하지 않습니다. 상처받기 쉽고 감정을 표현하지 못하며 외로움과 고립감을 느낍니다.(논리적이고 객관적인 규칙, 추상적인 개념을 언급, 긴 설명, 개인적, 감정적 주제를 피함. 복잡한 횡설수설 "사람은 논리적이어야 한다")'
  },
  d: {
    title: '4) 산만형 (Irrelevant)',
    description: '끊임없이 움직이며 토론하고, 특정한 주제에 주의집중을 하지 못합니다. 자신과 타인, 상황에 관심이 없고 중요시하지 않으며, 버릇없는 행동을 하고 분주하며 산만하고, 눈 깜박이기, 다리 흔들기, 머리카락 만지기 등 신체의 한 부분을 계속 사용합니다. (주위를 흩뜨리기 위해 주제를 바꿈, 한 가지에 집중할 수 없다. 개인적 또는 감정적 주제를 피한다. 농담을 하거나 넌센스를 말함, 끼어들기)'
  },
  e: {
    title: '5) 일치형 (Congruent)',
    description: '자신과 타인의 상황과 감정을 모두 존중하며 신뢰합니다. 개인의 특성을 존중하고 내적, 외적 자원들을 사용하며 대화가 개방적입니다. 자신과 타인을 사랑하며, 변화에 대하여 융통적이고, 상황을 아는 위치에서 반응하기를 원합니다. 일치된 언어와 정서로 현재의 메시지를 일관성 있게 정확히 전달합니다. 이러한 일치적 반응은 자신의 선택이며 책임과 수용을 의미합니다.'
  }
};

function toggleQuestion(index, event) {
  if (event.target.type === 'checkbox') {
    return;
  }
  selectedQuestions.value[index] = !selectedQuestions.value[index];
}

function updateSelectedState(index) {
  // 상태 업데이트는 v-model로 자동 처리됨
}

function calculateResults() {
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
.communication-survey {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: #f4f4f9;
  color: #333;
  line-height: 1.6;
  margin: 0;
  padding: 20px;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

h1, h2 {
  text-align: center;
  color: #2c3e50;
}

h1 {
  margin-bottom: 10px;
}

.instructions {
  text-align: center;
  color: #555;
  background-color: #eaf2f8;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 30px;
}

ol {
  list-style-type: none;
  padding: 0;
}

li {
  background: #f9f9f9;
  margin-bottom: 12px;
  padding: 15px;
  border-radius: 5px;
  border-left: 5px solid #bdc3c7;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

li:hover {
  border-left-color: #3498db;
}

li.selected {
  background: #e3f2fd;
  border-left: 5px solid #2196f3;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.15);
  transform: translateX(2px);
}

input[type="checkbox"] {
  transform: scale(1.5);
  margin-left: 20px;
  cursor: pointer;
  accent-color: #2196f3;
}

li.selected input[type="checkbox"] {
  accent-color: #2196f3;
}

.submit-btn {
  display: block;
  width: 100%;
  padding: 15px;
  font-size: 1.2em;
  font-weight: bold;
  color: #fff;
  background-color: #3498db;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 30px;
  transition: background-color 0.3s;
}

.submit-btn:hover {
  background-color: #2980b9;
}

#results {
  margin-top: 40px;
  padding: 20px;
  background: #fdfefe;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.score-summary {
  font-size: 1.2em;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30px;
  padding: 15px;
  background-color: #ecf0f1;
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
  color: #2980b9;
}

.result-type.highlight {
  background-color: #e8f6fd;
  border-left: 5px solid #3498db;
  transform: scale(1.02);
  box-shadow: 0 4px 10px rgba(0,0,0,0.08);
}

.footer-note {
  margin-top: 30px;
  padding: 15px;
  background-color: #fcf3cf;
  border-left: 5px solid #f1c40f;
  border-radius: 5px;
  text-align: center;
}

.back-link {
  display: inline-block;
  text-align: left;
  margin-bottom: 20px;
  padding: 10px 20px;
  background-color: #3498db;
  color: #fff;
  text-decoration: none;
  border-radius: 5px;
  font-weight: bold;
  transition: background-color 0.3s;
}

.back-link:hover {
  background-color: #2980b9;
}
</style>
