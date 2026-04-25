<template>
  <li
    :class="[
      'flex min-w-0 flex-col py-2.5 relative border-b border-(--border-color) last:border-b-0 transition-colors pl-2.5 border-l-4',
      todo.state === 'completed' && 'opacity-80 bg-(--row-completed-bg) [&_.todo-text]:line-through [&_.todo-text]:text-(--text-secondary) border-l-emerald-600',
      todo.state === 'in-progress' && 'border-l-4 bg-(--row-progress-bg) border-l-(--primary-color) [&_.todo-text]:text-(--row-progress-fg) [&_.todo-text]:font-medium',
      { 'opacity-50 bg-(--drag-tint)': isDragging },
      { 'border-t-2 border-t-dashed border-t-(--primary-color)': dragOverTodoId === todo.id },
      isSubtask && 'before:content-[\'\'] before:absolute before:top-6 before:-left-[25px] before:w-[15px] before:h-0.5 before:bg-(--border-color) after:content-[\'\'] after:absolute after:top-0 after:-left-[25px] after:w-0.5 after:h-full after:bg-(--border-color) last:after:h-6'
    ]"
    :draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @dragover.prevent="handleDragOver"
    @dragleave="handleDragLeave"
    @drop.prevent="handleDrop"
  >
    <div
      class="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-2"
    >
      <div class="flex min-w-0 w-full flex-1 items-start gap-2 sm:items-center">
        <button
          v-if="todo.subtasks && todo.subtasks.length > 0"
          type="button"
          class="shrink-0 bg-transparent border-none text-(--text-secondary) text-xl cursor-pointer p-0 px-1 ml-1.5 rounded-full transition-all hover:text-(--primary-color) hover:bg-(--control-muted)"
          :class="{ '-rotate-90': collapsedSubtasks.has(todo.id) }"
          @click.stop="$emit('toggle-collapse', todo.id)"
          title="하위 할일 접기/펼치기"
        >
          ▼
        </button>
        <div class="flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5">
          <TodoStateToggle
            class="!mr-1.5 shrink-0 sm:!mr-3"
            :state="todo.state"
            @change="newState => emit('toggle-state', todo.id, newState)"
          />
          <div
            class="min-w-0 flex-1 touch-pan-x overflow-x-auto [scrollbar-width:thin] [-webkit-overflow-scrolling:touch]"
            @dblclick="$emit('edit-text', todo.id)"
          >
            <span
              class="todo-text block cursor-pointer pr-0.5 text-left text-base leading-snug sm:text-lg whitespace-nowrap"
              @click.stop
            >{{ todo.text }}</span>
          </div>
        </div>
      </div>
      <div
        class="flex w-full min-w-0 shrink-0 flex-nowrap items-center justify-end gap-1.5 self-end sm:ml-2 sm:w-auto sm:max-w-[min(100%,20rem)] sm:self-center sm:ps-0"
      >
        <select
          class="min-w-0 max-w-[9.5rem] flex-1 shrink py-1.5 px-2 sm:max-w-none sm:flex-none sm:py-2 sm:px-3 rounded-md border border-(--border-color) bg-(--surface) text-(--text-primary) text-xs sm:text-sm cursor-pointer"
          :value="todo.state"
          @change="handleStateChange"
        >
          <option value="not-started">시작하지 않음</option>
          <option value="in-progress">진행중</option>
          <option value="completed">완료</option>
        </select>
        <button type="button" class="shrink-0 bg-transparent border-none text-(--text-secondary) text-2xl cursor-pointer py-0 px-1.5 sm:px-2 sm:ml-1.5 rounded-full leading-none hover:text-(--success) hover:bg-(--control-muted)" @click.stop="$emit('add-subtask', todo.id)" title="하위 할일 추가">+</button>
        <button type="button" class="shrink-0 bg-transparent border-none text-(--text-secondary) text-2xl cursor-pointer py-0 px-1.5 sm:px-2 sm:ml-1.5 rounded-full leading-none hover:text-(--error) hover:bg-(--control-muted)" @click.stop="$emit('delete-todo', todo.id)" title="할일 삭제">×</button>
      </div>
    </div>
    <ul
      v-if="todo.subtasks && todo.subtasks.length > 0"
      class="pl-[42px] mt-2.5 relative list-none p-0"
      :class="{ hidden: collapsedSubtasks.has(todo.id) }"
    >
      <TodoItem
        v-for="subtask in todo.subtasks"
        :key="subtask.id"
        :todo="subtask"
        :collapsed-subtasks="collapsedSubtasks"
        :drag-over-todo-id="dragOverTodoId"
        :is-subtask="true"
        @toggle-state="(id, newState) => $emit('toggle-state', id, newState)"
        @add-subtask="$emit('add-subtask', $event)"
        @delete-todo="$emit('delete-todo', $event)"
        @edit-text="$emit('edit-text', $event)"
        @toggle-collapse="$emit('toggle-collapse', $event)"
        @drag-start="(e, id) => $emit('drag-start', e, id)"
        @drag-end="$emit('drag-end', $event)"
        @drag-over="(e, id) => $emit('drag-over', e, id)"
        @drag-leave="$emit('drag-leave', $event)"
        @drop="(e, targetId) => $emit('drop', e, targetId)"
      />
    </ul>
  </li>
</template>

<script setup>
import { ref } from 'vue';
import TodoStateToggle from '@/views/todo/TodoStateToggle.vue';

const props = defineProps({
  todo: {
    type: Object,
    required: true
  },
  collapsedSubtasks: {
    type: Set,
    required: true
  },
  dragOverTodoId: {
    type: String,
    default: null
  },
  isSubtask: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  'toggle-state',
  'add-subtask',
  'delete-todo',
  'edit-text',
  'toggle-collapse',
  'drag-start',
  'drag-end',
  'drag-over',
  'drag-leave',
  'drop'
]);

const isDragging = ref(false);

const handleStateChange = (e) => {
  emit('toggle-state', props.todo.id, e.target.value);
};

const handleDragStart = (e) => {
  isDragging.value = true;
  emit('drag-start', e, props.todo.id);
};

const handleDragEnd = (e) => {
  isDragging.value = false;
  emit('drag-end', e);
};

const handleDragOver = (e) => {
  emit('drag-over', e, props.todo.id);
};

const handleDragLeave = (e) => {
  emit('drag-leave', e);
};

const handleDrop = (e) => {
  emit('drop', e, props.todo.id);
};
</script>
