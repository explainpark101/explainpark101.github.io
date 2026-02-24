<template>
  <button
    type="button"
    class="todo-state-toggle"
    :class="`todo-state-${state}`"
    :title="stateTitle"
    aria-label="상태 변경"
    @click.stop="handleClick"
  >
    <span class="todo-state-toggle-icon" aria-hidden="true">
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

<style scoped>
.todo-state-toggle {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  margin-right: 15px;
  padding: 0;
  border: 1px solid #999;
  border-radius: 4px;
  background-color: #fff;
  font-size: 0.9em;
  font-weight: bold;
  color: #333;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s, color 0.2s;
}

.todo-state-toggle:hover {
  border-color: #007bff;
  background-color: #f0f8ff;
}

.todo-state-toggle-icon {
  line-height: 1;
  user-select: none;
}

.todo-state-toggle.todo-state-in-progress {
  border-color: #007bff;
  color: #007bff;
  background-color: #e7f3ff;
}

.todo-state-toggle.todo-state-completed {
  border-color: #28a745;
  color: #28a745;
  background-color: #e8f5e9;
}

@media (prefers-color-scheme: dark) {
  .todo-state-toggle {
    border-color: #555;
    background-color: #2d2d2d;
    color: #e0e0e0;
  }

  .todo-state-toggle:hover {
    border-color: #90caf9;
    background-color: #1e3a5f;
  }

  .todo-state-toggle.todo-state-in-progress {
    border-color: #90caf9;
    color: #90caf9;
    background-color: #1e3a5f;
  }

  .todo-state-toggle.todo-state-completed {
    border-color: #66bb6a;
    color: #66bb6a;
    background-color: #1b3d1f;
  }
}

body[data-theme='dark'] .todo-state-toggle,
[data-theme='dark'] .todo-state-toggle {
  border-color: #555;
  background-color: #2d2d2d;
  color: #e0e0e0;
}

body[data-theme='dark'] .todo-state-toggle:hover,
[data-theme='dark'] .todo-state-toggle:hover {
  border-color: #90caf9;
  background-color: #1e3a5f;
}

body[data-theme='dark'] .todo-state-toggle.todo-state-in-progress,
[data-theme='dark'] .todo-state-toggle.todo-state-in-progress {
  border-color: #90caf9;
  color: #90caf9;
  background-color: #1e3a5f;
}

body[data-theme='dark'] .todo-state-toggle.todo-state-completed,
[data-theme='dark'] .todo-state-toggle.todo-state-completed {
  border-color: #66bb6a;
  color: #66bb6a;
  background-color: #1b3d1f;
}
</style>

