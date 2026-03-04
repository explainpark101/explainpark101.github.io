<template>
  <li
    :class="[
      'flex flex-col py-2.5 relative border-b border-(--border-color) last:border-b-0 transition-colors',
      todo.state === 'completed' && 'opacity-80 bg-gray-100 [&_.todo-text]:line-through [&_.todo-text]:text-gray-500',
      todo.state === 'in-progress' && 'bg-blue-50 border-l-4 border-l-(--primary-color) pl-2.5 [&_.todo-text]:text-blue-800 [&_.todo-text]:font-medium',
      { 'opacity-50 bg-blue-100': isDragging },
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
    <div class="flex items-center justify-between">
      <div class="flex flex-nowrap items-center gap-2.5 flex-grow">
        <button
          v-if="todo.subtasks && todo.subtasks.length > 0"
          type="button"
          class="bg-transparent border-none text-gray-400 text-xl cursor-pointer p-0 px-1 ml-1.5 rounded-full transition-all hover:text-(--primary-color) hover:bg-gray-100"
          :class="{ '-rotate-90': collapsedSubtasks.has(todo.id) }"
          @click.stop="$emit('toggle-collapse', todo.id)"
          title="하위 할일 접기/펼치기"
        >
          ▼
        </button>
        <span class="flex items-center gap-2.5">
          <TodoStateToggle
            :state="todo.state"
            @change="newState => emit('toggle-state', todo.id, newState)"
          />
          <span class="todo-text flex-grow text-lg break-words cursor-pointer" @click.stop @dblclick="$emit('edit-text', todo.id)">{{ todo.text }}</span>
        </span>
      </div>
      <div class="flex flex-nowrap items-center gap-2.5">
        <select
          class="py-2 px-3 rounded-md border border-gray-300 bg-(--surface) text-sm cursor-pointer ml-2.5"
          :value="todo.state"
          @change="handleStateChange"
        >
          <option value="not-started">시작하지 않음</option>
          <option value="in-progress">진행중</option>
          <option value="completed">완료</option>
        </select>
        <button type="button" class="bg-transparent border-none text-gray-400 text-2xl cursor-pointer py-0 px-2 ml-1.5 rounded-full leading-none hover:text-green-600 hover:bg-gray-100" @click.stop="$emit('add-subtask', todo.id)" title="하위 할일 추가">+</button>
        <button type="button" class="bg-transparent border-none text-gray-400 text-2xl cursor-pointer py-0 px-2 ml-1.5 rounded-full leading-none hover:text-red-600 hover:bg-gray-100" @click.stop="$emit('delete-todo', todo.id)" title="할일 삭제">×</button>
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
