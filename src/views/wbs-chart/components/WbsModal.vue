<template>
  <div v-if="showModal" class="fixed inset-0 bg-gray-600/50 dark:bg-black/70 z-30 flex items-center justify-center transition-colors" @click.self="closeModal">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md transition-colors">
      <h3 class="text-lg font-bold text-gray-900 dark:text-gray-200 mb-4">{{ modalTitle }}</h3>
      <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">{{ modalMessage }}</p>
      <input
        v-if="modalShowInput"
        ref="modalInput"
        type="text"
        :value="modalInputValue"
        class="w-full border border-gray-300 dark:border-gray-600 rounded-md py-2 px-2 mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
        @input="handleInput"
        @keydown.enter="handleModalOk"
        @keydown.escape="handleModalCancel"
      />
      <div class="flex justify-end gap-3">
        <button @click="handleModalCancel" class="py-2 px-4 rounded-md bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-200 border-none cursor-pointer transition-colors hover:bg-gray-300 dark:hover:bg-gray-500">취소</button>
        <button @click="handleModalOk" class="py-2 px-4 rounded-md bg-blue-600 text-white border-none cursor-pointer transition-colors hover:bg-blue-700">확인</button>
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

