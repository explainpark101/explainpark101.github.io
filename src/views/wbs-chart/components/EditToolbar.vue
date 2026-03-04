<template>
  <div
    class="absolute top-0 left-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl z-20 p-6 overflow-y-auto transition-all duration-300"
    :class="[!isVisible ? 'hidden -translate-x-full' : 'translate-x-0']"
  >
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold text-gray-800 dark:text-gray-200">노드 편집</h2>
      <button @click="handleClose" class="text-gray-500 dark:text-gray-400 bg-transparent border-none cursor-pointer text-2xl p-0 w-6 h-6 flex items-center justify-center hover:text-gray-800 dark:hover:text-gray-200">×</button>
    </div>
    <div class="flex flex-col gap-4">
      <div>
        <label for="node-name-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">노드 이름</label>
        <textarea
          id="node-name-input"
          v-model="nodeName"
          rows="3"
          class="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 min-h-[60px] resize-y"
          @keydown="handleKeydown"
        />
      </div>
      <div>
        <label for="node-parent-select" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">부모 노드 변경</label>
        <select
          id="node-parent-select"
          v-model="selectedParentId"
          :disabled="isRootNode"
          class="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
        >
          <option v-for="option in parentOptions" :key="option.id" :value="option.id">
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>
    <div class="mt-8 flex flex-col gap-3">
      <button @click="handleSave" class="w-full py-2 px-4 rounded-md text-white font-medium border-none cursor-pointer transition-colors bg-blue-600 hover:bg-blue-700">변경 사항 저장</button>
      <button v-if="!isTaskOrLower" @click="handleAddChild" class="w-full py-2 px-4 rounded-md text-white font-medium border-none cursor-pointer transition-colors bg-green-600 hover:bg-green-700">자식 노드 추가</button>
      <button v-if="!isRootNode" @click="handleAddSibling" class="w-full py-2 px-4 rounded-md text-white font-medium border-none cursor-pointer transition-colors bg-indigo-600 hover:bg-indigo-700">형제 노드 추가</button>
      <button @click="handleDelete" class="w-full py-2 px-4 rounded-md text-white font-medium border-none cursor-pointer transition-colors bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed" :disabled="isRootNode">노드 삭제</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  selectedNode: {
    type: Object,
    default: null
  },
  parentOptions: {
    type: Array,
    default: () => []
  },
  selectedParentId: {
    type: String,
    default: ''
  },
  nodeName: {
    type: String,
    default: ''
  }
});

const emit = defineEmits([
  'update:nodeName',
  'update:selectedParentId',
  'close',
  'save',
  'add-child',
  'add-sibling',
  'delete'
]);

const isRootNode = computed(() => props.selectedNode?.depth === 0);
const isTaskOrLower = computed(() => props.selectedNode?.depth >= 2);

const nodeName = computed({
  get: () => props.nodeName,
  set: (value) => emit('update:nodeName', value)
});

const selectedParentId = computed({
  get: () => props.selectedParentId,
  set: (value) => emit('update:selectedParentId', value)
});

const handleClose = () => {
  emit('close');
};

const handleSave = () => {
  emit('save');
};

const handleAddChild = () => {
  emit('add-child');
};

const handleAddSibling = () => {
  emit('add-sibling');
};

const handleDelete = () => {
  emit('delete');
};

const handleKeydown = (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault();
    handleSave();
  }
  if (event.key === 'Escape') {
    handleClose();
  }
};

watch(() => props.isVisible, (newVal) => {
  if (newVal) {
    nextTick(() => {
      const nameInput = document.getElementById('node-name-input');
      if (nameInput) {
        nameInput.focus();
      }
    });
  }
});
</script>

