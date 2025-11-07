import { ref, nextTick } from 'vue';

/**
 * textarea 자동 크기 조절 기능을 제공하는 composable
 * @returns {Object}
 */
export function useAutoGrowTextarea() {
  /**
   * textarea 높이를 내용에 맞게 자동 조절
   * @param {HTMLElement} el - textarea 요소
   */
  const autoGrowTextarea = (el) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = (el.scrollHeight) + 'px';
  };

  /**
   * 여러 textarea ref에 자동 크기 조절 적용
   * @param {Array<Object>} refs - textarea ref 배열
   */
  const applyAutoGrowToRefs = async (refs) => {
    await nextTick();
    refs.forEach(refObj => {
      if (refObj.value) {
        autoGrowTextarea(refObj.value);
      }
    });
  };

  /**
   * 이벤트 핸들러로 사용할 수 있는 함수
   * @param {Event} event - input 이벤트
   */
  const handleAutoGrow = (event) => {
    autoGrowTextarea(event.target);
  };

  return {
    autoGrowTextarea,
    applyAutoGrowToRefs,
    handleAutoGrow
  };
}

