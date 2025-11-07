import { computed } from 'vue';
import { sum } from '../utils/jungsanValidation.js';

/**
 * 테이블 기반 정산 계산
 * @param {Array} tables - 테이블 데이터 배열
 * @param {number} totalSupport - 총 회식 지원비
 * @returns {Object} 계산 결과
 */
export function calculateTableBased(tables, totalSupport) {
  // 총 부원 수 계산
  const totalMembers = tables.reduce((sum, table) => {
    return sum + (table.memberCount || 0);
  }, 0);

  if (totalMembers === 0) {
    return { error: '부원 수가 0명입니다.' };
  }

  // 부원당 지원금 계산
  const supportPerMember = totalSupport / totalMembers;

  // 각 테이블별 계산
  const results = tables.map((table, index) => {
    const memberCount = table.memberCount || 0;
    const guestCount = table.guestCount || 0;
    const foodPrice = table.foodPrice || 0;
    const totalPeople = memberCount + guestCount;

    if (totalPeople === 0) return null;

    const pricePerPerson = foodPrice / totalPeople;
    let remainingSupport = 0;
    const memberPayment = Math.max(pricePerPerson - supportPerMember, 0);
    const guestPayment = pricePerPerson;

    if (!memberPayment) {
      remainingSupport = supportPerMember * memberCount - (pricePerPerson * memberCount);
    }

    return {
      tableNumber: index + 1,
      memo: table.memo || '',
      memberPayment,
      memberCount,
      guestPayment,
      guestCount,
      hasAlcohol: table.hasAlcohol || false,
      remainingSupport
    };
  }).filter(Boolean);

  const remainingSupportSum = sum(results.map(el => el.remainingSupport ?? 0));

  return {
    supportPerMember,
    remainingSupportSum,
    results
  };
}

/**
 * 술 기반 정산 계산
 * @param {Object} params - 계산 파라미터
 * @returns {Object} 계산 결과
 */
export function calculateAlcoholBased({
  totalSupport,
  foodPrice,
  alcoholPrice,
  memberDrink,
  guestDrink,
  memberNoDrink,
  guestNoDrink
}) {
  const totalMembers = memberDrink + memberNoDrink;
  const totalGuests = guestDrink + guestNoDrink;
  const totalPeople = totalMembers + totalGuests;
  const totalDrinkers = memberDrink + guestDrink;

  if (totalPeople === 0) {
    return { error: '전체 인원이 0명입니다.' };
  }
  if (totalMembers === 0) {
    return { error: '부원 수가 0명입니다.' };
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

  return {
    supportPerMember,
    results
  };
}

/**
 * 계산 결과를 포맷팅하는 computed 함수
 * @param {Object} resultData - 계산 결과 데이터
 * @returns {Object} 포맷팅된 결과
 */
export function useFormattedResults(resultData) {
  const formattedResults = computed(() => {
    if (!resultData.value) return null;

    const format = (value) => {
      if (value === null || value === undefined) return '-';
      return Math.round(value).toLocaleString() + '원';
    };

    if (resultData.value.results) {
      return {
        ...resultData.value,
        formattedSupportPerMember: format(resultData.value.supportPerMember),
        formattedRemainingSupportSum: resultData.value.remainingSupportSum 
          ? format(resultData.value.remainingSupportSum) 
          : null,
        formattedResults: resultData.value.results.map(r => ({
          ...r,
          formattedPay: format(r.pay || r.memberPayment || r.guestPayment),
          formattedSupport: r.support !== null && r.support !== undefined 
            ? format(r.support) 
            : '-',
          formattedMemberPayment: r.memberPayment ? format(r.memberPayment) : null,
          formattedGuestPayment: r.guestPayment ? format(r.guestPayment) : null,
          formattedRemainingSupport: r.remainingSupport ? format(r.remainingSupport) : null
        }))
      };
    }

    return resultData.value;
  });

  return { formattedResults };
}

