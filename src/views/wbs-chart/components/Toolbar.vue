<template>
  <div class="toolbar">
    <button
      @click="toggleDarkMode"
      class="toolbar-btn"
      :title="isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'"
    >
      <svg v-if="isDarkMode" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
      <svg v-else class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
      <span>{{ isDarkMode ? '라이트 모드' : '다크 모드' }}</span>
    </button>
    <button @click="importJSON" class="toolbar-btn">
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
        />
      </svg>
      <span>불러오기</span>
    </button>
    <button @click="exportJSON" class="toolbar-btn">
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      <span>내보내기</span>
    </button>
    <button @click="exportPNG" class="toolbar-btn">
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <span>PNG로 저장</span>
    </button>
    <button @click="fitToView" class="toolbar-btn" title="전체 보기">
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
        />
      </svg>
      <span>전체 보기</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  isDarkMode: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['toggle-dark-mode', 'import-json', 'export-json', 'export-png', 'fit-to-view']);

const toggleDarkMode = () => {
  emit('toggle-dark-mode');
};

const importJSON = () => {
  emit('import-json');
};

const exportJSON = () => {
  emit('export-json');
};

const exportPNG = () => {
  emit('export-png');
};

const fitToView = () => {
  emit('fit-to-view');
};
</script>

<style scoped>
.toolbar {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
  display: flex;
  gap: 8px;
}

.toolbar-btn {
  background: white;
  color: #374151;
  font-weight: 600;
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;
}

.toolbar-btn:hover {
  background-color: #f9fafb;
}

[data-theme="dark"] .toolbar-btn {
  background: #1e1e1e;
  color: #e2e8f0;
  border-color: #4a5568;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2);
}

[data-theme="dark"] .toolbar-btn:hover {
  background-color: #2d2d2d;
}
</style>

