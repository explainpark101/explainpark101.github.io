<template>
  <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
    <div class="modal">
      <h3>{{ modalTitle }}</h3>
      <p>{{ modalMessage }}</p>
      <input
        v-if="modalShowInput"
        ref="modalInput"
        type="text"
        :value="modalInputValue"
        @input="handleInput"
        @keydown.enter="handleModalOk"
        @keydown.escape="handleModalCancel"
      />
      <div class="modal-actions">
        <button @click="handleModalCancel" class="btn-cancel">취소</button>
        <button @click="handleModalOk" class="btn-ok">확인</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';

const props = defineProps({
  showModal: {
    type: Boolean,
    required: true
  },
  modalTitle: {
    type: String,
    default: ''
  },
  modalMessage: {
    type: String,
    default: ''
  },
  modalShowInput: {
    type: Boolean,
    default: false
  },
  modalInputValue: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['ok', 'cancel', 'update:modalInputValue']);

const modalInput = ref(null);

const handleInput = (event) => {
  emit('update:modalInputValue', event.target.value);
};

const handleModalOk = () => {
  emit('ok');
};

const handleModalCancel = () => {
  emit('cancel');
};

const closeModal = () => {
  handleModalCancel();
};

watch(() => props.showModal, (newVal) => {
  if (newVal && props.modalShowInput) {
    nextTick(() => {
      if (modalInput.value) {
        modalInput.value.focus();
      }
    });
  }
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(75, 85, 99, 0.5);
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

[data-theme="dark"] .modal-overlay {
  background-color: rgba(0, 0, 0, 0.7);
}

.modal {
  background: white;
  border-radius: 8px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  padding: 24px;
  width: 100%;
  max-width: 28rem;
  transition: background-color 0.3s ease, color 0.3s ease;
}

[data-theme="dark"] .modal {
  background: #1e1e1e;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
  color: #e2e8f0;
}

.modal h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 16px;
  transition: color 0.3s ease;
}

[data-theme="dark"] .modal h3 {
  color: #e2e8f0;
}

.modal p {
  font-size: 0.875rem;
  color: #4b5563;
  margin-bottom: 16px;
  transition: color 0.3s ease;
}

[data-theme="dark"] .modal p {
  color: #cbd5e0;
}

.modal input {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px;
  margin-bottom: 16px;
  background-color: white;
  color: #1f2937;
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

[data-theme="dark"] .modal input {
  background-color: #2d2d2d;
  color: #e2e8f0;
  border-color: #4a5568;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-cancel {
  background-color: #e5e7eb;
  color: #1f2937;
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-cancel:hover {
  background-color: #d1d5db;
}

.btn-ok {
  background-color: #2563eb;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-ok:hover {
  background-color: #1d4ed8;
}
</style>

