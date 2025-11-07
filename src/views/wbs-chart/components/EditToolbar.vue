<template>
  <div
    class="edit-toolbar"
    :class="{ hidden: !isVisible, '-translate-x-full': !isVisible }"
  >
    <div class="toolbar-header">
      <h2>노드 편집</h2>
      <button @click="handleClose" class="close-btn">×</button>
    </div>
    <div class="toolbar-content">
      <div>
        <label for="node-name-input">노드 이름</label>
        <textarea
          id="node-name-input"
          v-model="nodeName"
          rows="3"
          @keydown="handleKeydown"
        />
      </div>
      <div>
        <label for="node-parent-select">부모 노드 변경</label>
        <select
          id="node-parent-select"
          v-model="selectedParentId"
          :disabled="isRootNode"
        >
          <option v-for="option in parentOptions" :key="option.id" :value="option.id">
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>
    <div class="toolbar-actions">
      <button @click="handleSave" class="btn-save">변경 사항 저장</button>
      <button v-if="!isTaskOrLower" @click="handleAddChild" class="btn-add-child">
        자식 노드 추가
      </button>
      <button v-if="!isRootNode" @click="handleAddSibling" class="btn-add-sibling">
        형제 노드 추가
      </button>
      <button @click="handleDelete" class="btn-delete" :disabled="isRootNode">
        노드 삭제
      </button>
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

<style scoped>
.edit-toolbar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 320px;
  background: white;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  z-index: 20;
  padding: 24px;
  transform: translateX(0);
  transition: transform 0.3s, background-color 0.3s ease, color 0.3s ease;
  overflow-y: auto;
}

[data-theme="dark"] .edit-toolbar {
  background: #1e1e1e;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
  color: #e2e8f0;
}

.edit-toolbar.hidden {
  display: none;
}

.toolbar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.toolbar-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  transition: color 0.3s ease;
}

[data-theme="dark"] .toolbar-header h2 {
  color: #e2e8f0;
}

.close-btn {
  color: #6b7280;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: #1f2937;
}

[data-theme="dark"] .close-btn {
  color: #9ca3af;
}

[data-theme="dark"] .close-btn:hover {
  color: #e2e8f0;
}

.toolbar-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.toolbar-content label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
  transition: color 0.3s ease;
}

[data-theme="dark"] .toolbar-content label {
  color: #cbd5e0;
}

.toolbar-content textarea,
.toolbar-content select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background-color: white;
  color: #1f2937;
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

[data-theme="dark"] .toolbar-content textarea,
[data-theme="dark"] .toolbar-content select {
  background-color: #2d2d2d;
  color: #e2e8f0;
  border-color: #4a5568;
}

.toolbar-content textarea {
  resize: vertical;
  min-height: 60px;
}

.toolbar-actions {
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toolbar-actions button {
  width: 100%;
  padding: 8px 16px;
  border-radius: 6px;
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  font-weight: 500;
}

.btn-save {
  background-color: #2563eb;
}

.btn-save:hover {
  background-color: #1d4ed8;
}

.btn-add-child {
  background-color: #16a34a;
}

.btn-add-child:hover {
  background-color: #15803d;
}

.btn-add-sibling {
  background-color: #4f46e5;
}

.btn-add-sibling:hover {
  background-color: #4338ca;
}

.btn-delete {
  background-color: #dc2626;
}

.btn-delete:hover {
  background-color: #b91c1c;
}

.btn-delete:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}
</style>

