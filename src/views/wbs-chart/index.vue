<template>
  <div class="wbs-chart-app">
    <!-- 편집 툴바 -->
    <EditToolbar :is-visible="isToolbarVisible" :selected-node="selectedNode" :parent-options="parentOptions"
      :selected-parent-id="selectedParentId" :node-name="nodeNameInput" @update:nodeName="nodeNameInput = $event"
      @update:selectedParentId="selectedParentId = $event" @close="hideEditToolbar" @save="saveChanges"
      @add-child="addChild" @add-sibling="addSibling" @delete="deleteNode" />

    <!-- 툴바 -->
    <Toolbar :is-dark-mode="isDarkMode" @toggle-dark-mode="toggleDarkMode" @import-json="importJSON"
      @export-json="exportJSON" @export-png="exportPNG" @fit-to-view="fitToView" />

    <!-- 차트 -->
    <WbsChart ref="chartRef" :hierarchical-data="hierarchicalData" :selected-node="selectedNode"
      :is-dark-mode="isDarkMode" :chart-instance="chartInstance" @node-click="handleNodeClick" />

    <!-- 모달 -->
    <WbsModal :show-modal="showModal" :modal-title="modalTitle" :modal-message="modalMessage"
      :modal-show-input="modalShowInput" :modal-input-value="modalInputValue"
      @update:modalInputValue="wbs.modalInputValue = $event" @ok="handleModalOk" @cancel="handleModalCancel" />

    <!-- Hidden download link -->
    <a ref="downloadLink" :href="downloadUrl" :download="downloadFilename" style="display: none" />

    <!-- Hidden file input -->
    <input ref="fileInput" type="file" accept=".json,application/json" style="display: none"
      @change="handleFileImport" />
  </div>
</template>

<script setup>
import { onMounted, nextTick } from 'vue';
import WbsChart from './components/WbsChart.vue';
import EditToolbar from './components/EditToolbar.vue';
import Toolbar from './components/Toolbar.vue';
import WbsModal from './components/WbsModal.vue';
import { useWBS } from '../../composables/useWBS.js';

const wbs = useWBS();
const {
  hierarchicalData,
  selectedNode,
  isToolbarVisible,
  nodeNameInput,
  selectedParentId,
  parentOptions,
  isDarkMode,
  chartRef,
  downloadLink,
  downloadUrl,
  downloadFilename,
  fileInput,
  showModal,
  modalTitle,
  modalMessage,
  modalShowInput,
  modalInputValue,
  handleNodeClick,
  hideEditToolbar,
  saveChanges,
  addChild,
  addSibling,
  deleteNode,
  handleModalOk,
  handleModalCancel,
  toggleDarkMode,
  exportJSON,
  importJSON,
  handleFileImport,
  exportPNG,
  fitToView,
  initialize
} = wbs;

// 차트 인스턴스를 WbsChart에 전달하기 위한 객체
const chartInstance = {
  initializeChart: wbs.initializeChart,
  updateChart: wbs.updateChart,
  exportPNG: wbs.exportPNG
};

onMounted(() => {
  initialize();

  // 차트 초기화는 WbsChart 컴포넌트에서 처리
  nextTick(() => {
    if (chartRef.value && chartRef.value.initializeChart) {
      chartRef.value.initializeChart();
    }
  });
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');

.wbs-chart-app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
  position: relative;
}
</style>
