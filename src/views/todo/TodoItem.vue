<template>
  <li
    :class="[todo.state, { dragging: isDragging }]"
    :draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @dragover.prevent="handleDragOver"
    @dragleave="handleDragLeave"
    @drop.prevent="handleDrop"
  >
    <div class="todo-item-content">
      <div>
        <button
          v-if="todo.subtasks && todo.subtasks.length > 0"
          class="collapse-subtask-btn"
          :class="{ collapsed: collapsedSubtasks.has(todo.id) }"
          @click.stop="$emit('toggle-collapse', todo.id)"
          title="하위 할일 접기/펼치기"
        >
          ▼
        </button>
        <label>
          <input
            type="checkbox"
            :checked="todo.state === 'completed'"
            @change="handleCheckboxChange"
          />
          <span class="todo-text" @dblclick="$emit('edit-text', todo.id)">{{ todo.text }}</span>
        </label>
      </div>
      <div>
        <select class="todo-state" :value="todo.state" @change="handleStateChange">
          <option value="not-started">시작하지 않음</option>
          <option value="in-progress">진행중</option>
          <option value="completed">완료</option>
        </select>
        <button class="add-subtask-btn" @click.stop="$emit('add-subtask', todo.id)" title="하위 할일 추가">+</button>
        <button class="delete-todo-btn" @click.stop="$emit('delete-todo', todo.id)" title="할일 삭제">×</button>
      </div>
    </div>
    <ul
      v-if="todo.subtasks && todo.subtasks.length > 0"
      class="subtask-list"
      :class="{ collapsed: collapsedSubtasks.has(todo.id) }"
    >
      <TodoItem
        v-for="subtask in todo.subtasks"
        :key="subtask.id"
        :todo="subtask"
        :collapsed-subtasks="collapsedSubtasks"
        @toggle-state="$emit('toggle-state', $event, $event)"
        @add-subtask="$emit('add-subtask', $event)"
        @delete-todo="$emit('delete-todo', $event)"
        @edit-text="$emit('edit-text', $event)"
        @toggle-collapse="$emit('toggle-collapse', $event)"
        @drag-start="$emit('drag-start', $event, $event)"
        @drag-end="$emit('drag-end', $event)"
        @drag-over="$emit('drag-over', $event, $event)"
        @drag-leave="$emit('drag-leave', $event)"
        @drop="$emit('drop', $event, $event)"
      />
    </ul>
  </li>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  todo: {
    type: Object,
    required: true
  },
  collapsedSubtasks: {
    type: Set,
    required: true
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

const handleCheckboxChange = (e) => {
  const newState = e.target.checked ? 'completed' : 'not-started';
  emit('toggle-state', props.todo.id, newState);
};

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

<style scoped>
li {
  display: flex;
  flex-direction: column;
  padding: 10px 0;
  position: relative;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

li:last-child {
  border-bottom: none;
}

ul.subtask-list {
  padding-left: 42px;
  margin-top: 10px;
  position: relative;
}

.subtask-list > li::before {
  content: '';
  position: absolute;
  top: 24px;
  left: -25px;
  width: 15px;
  height: 2px;
  background-color: #e0e0e0;
}

.subtask-list > li::after {
  content: '';
  position: absolute;
  top: 0;
  left: -25px;
  width: 2px;
  height: 100%;
  background-color: #e0e0e0;
}

.subtask-list > li:last-child::after {
  height: 24px;
}

.todo-item-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.todo-item-content > div {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 10px;
}

.todo-item-content > div:first-child {
  flex-grow: 1;
}

li label {
  flex-grow: 1;
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-right: 15px;
}

input[type="checkbox"] {
  margin-right: 15px;
  transform: scale(1.3);
  min-width: 20px;
  min-height: 20px;
}

.todo-text {
  flex-grow: 1;
  font-size: 1.1em;
  word-break: break-word;
  cursor: pointer;
}

.todo-state {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background-color: #fff;
  font-size: 0.9em;
  cursor: pointer;
  margin-left: 10px;
}

.add-subtask-btn,
.delete-todo-btn {
  background: none;
  border: none;
  color: #aaa;
  font-size: 1.5em;
  cursor: pointer;
  padding: 0 8px;
  margin-left: 5px;
  border-radius: 50%;
  line-height: 1;
}

.add-subtask-btn:hover {
  color: #28a745;
  background-color: #f0f0f0;
}

.delete-todo-btn:hover {
  color: #dc3545;
  background-color: #f0f0f0;
}

.collapse-subtask-btn {
  background: none;
  border: none;
  color: #aaa;
  font-size: 1.2em;
  cursor: pointer;
  padding: 0 4px;
  margin-left: 5px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.collapse-subtask-btn:hover {
  color: #007bff;
  background-color: #f0f0f0;
}

.collapse-subtask-btn.collapsed {
  transform: rotate(-90deg);
}

.subtask-list.collapsed {
  display: none;
}

.completed .todo-text {
  text-decoration: line-through;
  color: #7f8c8d;
}

.completed {
  opacity: 0.8;
  background-color: #f8f9fa;
}

.in-progress {
  background-color: #e7f3ff;
  border-left: 4px solid #007bff;
  padding-left: 10px;
}

.in-progress .todo-text {
  color: #0056b3;
  font-weight: 500;
}

li.dragging {
  opacity: 0.5;
  background: #cce5ff;
}

li.drag-over {
  border-top: 2px dashed #007bff !important;
}
</style>

