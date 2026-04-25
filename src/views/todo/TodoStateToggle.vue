<template>
  <button
    type="button"
    class="shrink-0 inline-flex items-center justify-center w-[22px] h-[22px] mr-4 p-0 border border-(--border-color) rounded bg-(--surface) text-base font-bold text-(--text-primary) cursor-pointer transition-colors hover:border-(--primary-color) hover:bg-(--row-progress-bg)"
    :class="{
      'border-(--primary-color) text-(--primary-color) bg-(--row-progress-bg)': state === 'in-progress',
      'border-(--state-done-fg) text-(--state-done-fg) bg-(--state-done-bg)': state === 'completed'
    }"
    :title="stateTitle"
    aria-label="상태 변경"
    @click.stop="handleClick"
  >
    <span class="leading-none select-none" aria-hidden="true">
      {{ icon }}
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue';

const STATE_ORDER = ['not-started', 'in-progress', 'completed'];
const STATE_TITLES = {
  'not-started': '시작하지 않음',
  'in-progress': '진행중',
  completed: '완료'
};
const STATE_ICONS = {
  'not-started': '',
  'in-progress': '~',
  completed: '✓'
};

const props = defineProps({
  state: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['change']);

const icon = computed(() => STATE_ICONS[props.state] ?? '');
const stateTitle = computed(() => STATE_TITLES[props.state] ?? props.state);

const handleClick = () => {
  const idx = STATE_ORDER.indexOf(props.state);
  const nextIdx = idx < 0 ? 0 : (idx + 1) % STATE_ORDER.length;
  emit('change', STATE_ORDER[nextIdx]);
};
</script>
