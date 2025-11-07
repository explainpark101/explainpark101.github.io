import { ref, nextTick } from 'vue';

/**
 * confirm dialog를 제공하는 composable
 * @returns {Object}
 */
export function useConfirmDialog() {
  const showDialog = ref(false);
  const dialogTitle = ref('');
  const dialogMessage = ref('');
  const dialogResolve = ref(null);
  const dialogRef = ref(null);
  const confirmButtonRef = ref(null);
  const isAlert = ref(false); // alert 모드인지 확인 모드인지 구분

  /**
   * confirm dialog 표시
   * @param {string} title - 다이얼로그 제목
   * @param {string} message - 다이얼로그 메시지
   * @returns {Promise<boolean>} 사용자가 확인을 누르면 true, 취소를 누르면 false
   */
  const showConfirm = async (title, message) => {
    isAlert.value = false;
    dialogTitle.value = title;
    dialogMessage.value = message;
    showDialog.value = true;
    
    await nextTick();
    if (dialogRef.value) {
      dialogRef.value.showModal();
      // confirm 버튼에 포커스 설정
      if (confirmButtonRef.value) {
        confirmButtonRef.value.focus();
      }
    }

    return new Promise((resolve) => {
      dialogResolve.value = resolve;
    });
  };

  /**
   * alert dialog 표시
   * @param {string} message - 다이얼로그 메시지
   * @param {string} title - 다이얼로그 제목 (선택, 기본값: '알림')
   * @returns {Promise<void>} 사용자가 확인을 누르면 resolve
   */
  const showAlert = async (message, title = '알림') => {
    isAlert.value = true;
    dialogTitle.value = title;
    dialogMessage.value = message;
    showDialog.value = true;
    
    await nextTick();
    if (dialogRef.value) {
      dialogRef.value.showModal();
      // confirm 버튼에 포커스 설정
      if (confirmButtonRef.value) {
        confirmButtonRef.value.focus();
      }
    }

    return new Promise((resolve) => {
      dialogResolve.value = () => {
        resolve();
      };
    });
  };

  /**
   * 확인 버튼 클릭 핸들러
   */
  const handleConfirm = () => {
    if (dialogRef.value) {
      dialogRef.value.close();
    }
    showDialog.value = false;
    if (dialogResolve.value) {
      if (isAlert.value) {
        // alert 모드: 단순히 resolve 호출
        dialogResolve.value();
      } else {
        // confirm 모드: true 반환
        dialogResolve.value(true);
      }
      dialogResolve.value = null;
    }
  };

  /**
   * 취소 버튼 클릭 핸들러
   */
  const handleCancel = () => {
    if (dialogRef.value) {
      dialogRef.value.close();
    }
    showDialog.value = false;
    if (dialogResolve.value) {
      dialogResolve.value(false);
      dialogResolve.value = null;
    }
  };

  /**
   * 다이얼로그 외부 클릭 핸들러 (ESC 키도 처리)
   */
  const handleDialogClick = (event) => {
    if (event.target === dialogRef.value) {
      handleCancel();
    }
  };

  return {
    showDialog,
    dialogTitle,
    dialogMessage,
    dialogRef,
    confirmButtonRef,
    isAlert,
    showConfirm,
    showAlert,
    handleConfirm,
    handleCancel,
    handleDialogClick
  };
}

