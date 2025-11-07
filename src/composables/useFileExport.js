import { ref, nextTick } from 'vue';

/**
 * 파일 내보내기/가져오기 기능을 제공하는 composable
 * @param {string} storageKey - localStorage 저장 키
 * @param {Function} loadData - 데이터를 로드하는 함수
 * @param {Function} validateData - 데이터 유효성 검증 함수
 * @param {Function} showAlert - alert dialog를 표시하는 함수 (선택)
 * @returns {Object}
 */
export function useFileExport(storageKey, loadData, validateData, showAlert = null) {
  const downloadLink = ref(null);
  const downloadUrl = ref('');
  const downloadFilename = ref('');
  const fileInput = ref(null);

  /**
   * JSON 파일로 내보내기
   */
  const exportJson = async () => {
    const data = localStorage.getItem(storageKey);
    if (!data) {
      if (showAlert) {
        await showAlert('내보낼 데이터가 없습니다.', '알림');
      } else {
        alert('내보낼 데이터가 없습니다.');
      }
      return;
    }
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    downloadUrl.value = url;
    downloadFilename.value = 'jungsan_data.json';
    nextTick(() => {
      if (downloadLink.value) {
        downloadLink.value.click();
        setTimeout(() => {
          URL.revokeObjectURL(url);
          downloadUrl.value = '';
          downloadFilename.value = '';
        }, 100);
      }
    });
  };

  /**
   * 파일 가져오기 핸들러
   * @param {Event} e - 파일 입력 이벤트
   */
  const handleFileImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);
        // 데이터 유효성 검증
        if (!validateData(json)) {
          if (showAlert) {
            await showAlert('올바르지 않은 파일입니다.', '오류');
          } else {
            alert('올바르지 않은 파일입니다.');
          }
          return;
        }
        localStorage.setItem(storageKey, JSON.stringify(json));
        loadData(json);
        if (showAlert) {
          await showAlert('데이터를 성공적으로 불러왔습니다.', '알림');
        } else {
          alert('데이터를 성공적으로 불러왔습니다.');
        }
      } catch {
        if (showAlert) {
          await showAlert('올바르지 않은 JSON 파일입니다.', '오류');
        } else {
          alert('올바르지 않은 JSON 파일입니다.');
        }
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  };

  /**
   * 파일 선택 다이얼로그 열기
   */
  const importJson = () => {
    fileInput.value?.click();
  };

  return {
    downloadLink,
    downloadUrl,
    downloadFilename,
    fileInput,
    exportJson,
    importJson,
    handleFileImport
  };
}

