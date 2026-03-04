<template>
  <div ref="chartContainer" class="w-full h-full bg-slate-100 dark:bg-gray-900 overflow-visible relative transition-colors duration-300 chart-container"></div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';

const props = defineProps({
  hierarchicalData: {
    type: Object,
    required: true
  },
  selectedNode: {
    type: Object,
    default: null
  },
  isDarkMode: {
    type: Boolean,
    default: false
  },
  chartInstance: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['node-click']);

const chartContainer = ref(null);

onMounted(() => {
  nextTick(() => {
    if (chartContainer.value && props.chartInstance) {
      props.chartInstance.initializeChart(chartContainer.value);
    }
  });
});

watch(() => props.hierarchicalData, () => {
  if (props.chartInstance && props.hierarchicalData) {
    props.chartInstance.updateChart();
  }
}, { deep: true, immediate: true });

watch(() => props.selectedNode, () => {
  if (props.chartInstance) {
    props.chartInstance.updateChart();
  }
});

watch(() => props.isDarkMode, () => {
  if (props.chartInstance) {
    props.chartInstance.updateChart();
  }
});

defineExpose({
  exportPNG: () => props.chartInstance?.exportPNG()
});
</script>

<style scoped>
.chart-container :deep(svg) { display: block; }
.chart-container :deep(.node rect) {
  stroke-width: 2px;
  cursor: pointer;
  transition: stroke 0.3s, stroke-width 0.3s;
}
.chart-container :deep(.node rect.selected) {
  stroke: #3182CE;
  stroke-width: 3px;
}
.chart-container :deep(.node text) {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  fill: #2D3748;
  pointer-events: none;
}
[data-theme="dark"] .chart-container :deep(.node text) { fill: #E2E8F0; }
.chart-container :deep(.link) {
  fill: none;
  stroke: #CBD5E0;
  stroke-width: 1.5px;
}
[data-theme="dark"] .chart-container :deep(.link) { stroke: #4A5568; }
</style>
