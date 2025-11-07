import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { encodeForShare, decodeFromShare } from '../utils/jungsanEncryption.js';

/**
 * localStorage 및 URL 공유 기능을 제공하는 composable
 * @param {string} storageKey - localStorage 저장 키
 * @param {Function} getFormData - 폼 데이터를 가져오는 함수
 * @param {Function} loadData - 데이터를 로드하는 함수
 * @param {Function} showConfirm - confirm dialog를 표시하는 함수 (선택)
 * @param {Function} showAlert - alert dialog를 표시하는 함수 (선택)
 * @returns {Object}
 */
export function useJungsanStorage(storageKey, getFormData, loadData, showConfirm = null, showAlert = null) {
  const route = useRoute();
  const isRestoring = ref(false);

  /**
   * localStorage에 데이터 저장
   */
  const saveToLocalStorage = () => {
    if (isRestoring.value) return;
    
    const data = getFormData();
    if (!data) return;
    
    localStorage.setItem(storageKey, JSON.stringify(data));
    
    // 쿼리스트링에 data가 있을 경우, 최신 데이터로 갱신
    const params = new URLSearchParams(window.location.search);
    if (params.get('data')) {
      const b64url = encodeForShare(data);
      const url = `${window.location.origin}${route.path}?data=${encodeURIComponent(b64url)}`;
      window.history.replaceState(null, '', url);
    }
  };

  /**
   * localStorage에서 데이터 불러오기
   * @param {any} dataObj - 직접 전달된 데이터 객체 (선택)
   */
  const loadFromLocalStorage = async (dataObj) => {
    let data = dataObj;
    if (!data) {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      
      // confirm dialog 사용 (제공된 경우)
      if (showConfirm) {
        const confirmed = await showConfirm('데이터 불러오기', '기존에 작성중이던 데이터를 불러올까요?');
        if (!confirmed) return;
      } else {
        // fallback to native confirm
        if (!confirm('기존에 작성중이던 데이터를 불러올까요?')) return;
      }
      
      data = JSON.parse(raw);
    }
    
    isRestoring.value = true;
    loadData(data);
    // 다음 틱에서 isRestoring 해제
    setTimeout(() => {
      isRestoring.value = false;
    }, 0);
  };

  /**
   * URL 쿼리 파라미터에서 데이터 복원
   * @returns {boolean} 복원 성공 여부
   */
  const tryRestoreFromQuery = async () => {
    const params = new URLSearchParams(window.location.search);
    const b64url = params.get('data');
    if (b64url) {
      try {
        const parsed = decodeFromShare(b64url);
        localStorage.setItem(storageKey, JSON.stringify(parsed));
        loadFromLocalStorage(parsed);
        if (showAlert) {
          await showAlert('공유된 데이터를 불러왔습니다.', '알림');
        } else {
          alert('공유된 데이터를 불러왔습니다.');
        }
        return true;
      } catch {
        if (showAlert) {
          await showAlert('공유 데이터 복원에 실패했습니다.', '오류');
        } else {
          alert('공유 데이터 복원에 실패했습니다.');
        }
      }
    }
    return false;
  };

  /**
   * 링크로 공유하기
   */
  const shareLink = async () => {
    const data = getFormData();
    if (!data) {
      if (showAlert) {
        await showAlert('공유할 데이터가 없습니다.', '알림');
      } else {
        alert('공유할 데이터가 없습니다.');
      }
      return;
    }
    const b64url = encodeForShare(data);
    const url = `${window.location.origin}${route.path}?data=${encodeURIComponent(b64url)}`;
    window.history.replaceState(null, '', url);
    navigator.clipboard.writeText(url).then(async () => {
      if (showAlert) {
        await showAlert('공유 링크가 클립보드에 복사되었습니다!', '알림');
      } else {
        alert('공유 링크가 클립보드에 복사되었습니다!');
      }
    });
  };

  /**
   * localStorage 초기화
   */
  const clearStorage = () => {
    localStorage.removeItem(storageKey);
  };

  return {
    saveToLocalStorage,
    loadFromLocalStorage,
    tryRestoreFromQuery,
    shareLink,
    clearStorage,
    isRestoring
  };
}

