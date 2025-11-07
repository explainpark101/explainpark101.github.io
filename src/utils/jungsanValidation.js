/**
 * 테이블 기반 정산 데이터 유효성 검증
 * @param {any} json
 * @returns {boolean}
 */
export function validateTableBasedData(json) {
  return json && 
         typeof json.tableCount === 'number' && 
         Array.isArray(json.tableData);
}

/**
 * 술 기반 정산 데이터 유효성 검증
 * @param {any} json
 * @returns {boolean}
 */
export function validateAlcoholBasedData(json) {
  return json && typeof json.totalSupport !== 'undefined';
}

/**
 * 배열의 합계 계산
 * @param {number[]} array
 * @returns {number}
 */
export function sum(array) {
  return array.reduce((acc, cur) => acc + cur, 0);
}

