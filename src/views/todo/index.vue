<template>
  <div class="todo-app">
    <div class="container">
      <h1 @dblclick="editTitle" id="mainTitle">{{ appTitle }}</h1>

      <div id="tabsContainer" class="tabs-container">
        <div v-for="tab in sortedTabs" :key="tab.id" class="tab-item" :class="{ active: tab.id === currentTabId }"
          :draggable="true" @dragstart="handleTabDragStart($event, tab.id)" @dragend="handleTabDragEnd"
          @dragover.prevent="handleTabDragOver($event, tab.id)" @dragleave="handleTabDragLeave($event, tab.id)"
          @drop.prevent="handleTabDrop($event, tab.id)" @click="switchTab(tab.id)">
          <span @dblclick.stop="renameTab(tab)">{{ tab.name }}</span>
          <button class="delete-tab-btn" @click.stop="deleteTab(tab.id)">×</button>
        </div>
        <button id="addTabBtn" @click="addNewTab">+</button>
      </div>

      <div class="controls-container">
        <button @click="openMarkdownModal">할일 목록 불러오기</button>
        <button @click="exportTodos">할일 목록 수정 및 내보내기</button>
        <button @click="resetAllTodosToNotStarted">모두 시작전으로</button>
        <button @click="deleteCompletedTodos">완료항목 삭제</button>
        <input type="text" v-model="searchQuery" placeholder="할일 검색..." aria-label="할일 검색" />
      </div>

      <ul id="todoList" v-if="displayedTodos.length > 0">
        <TodoItem v-for="todo in displayedTodoTree" :key="todo.id" :todo="todo" :collapsed-subtasks="collapsedSubtasks"
          @toggle-state="handleStateChange" @add-subtask="addSubtask" @delete-todo="deleteTodo"
          @edit-text="editTodoText" @toggle-collapse="toggleSubtaskCollapse" @drag-start="handleTodoDragStart"
          @drag-end="handleTodoDragEnd" @drag-over="handleTodoDragOver" @drag-leave="handleTodoDragLeave"
          @drop="handleTodoDrop" />
      </ul>
      <div v-else class="empty-list-message">
        <template v-if="searchQuery">
          '{{ searchQuery }}'에 대한 검색 결과가 없습니다.
        </template>
        <template v-else-if="currentTabId">
          할일 목록이 없습니다.<br />'할일 목록 불러오기' 버튼으로 목록을추가하세요.
        </template>
        <template v-else>
          탭을 선택하거나 '+' 버튼을 눌러 새 탭을 만드세요.
        </template>
      </div>
    </div>

    <!-- Markdown Import Modal -->
    <dialog ref="markdownModal" class="modal">
      <h2>새 할일 목록 불러오기</h2>
      <textarea ref="modalMarkdownInput" v-model="markdownInput"
        placeholder="여기에 할일 목록을 마크다운 형식으로 입력하세요.&#10;들여쓰기를 사용하여 하위 작업을 만들 수 있습니다."
        @keydown="handleMarkdownKeydown"></textarea>
      <div class="dialog-actions">
        <button @click="loadTodosFromMarkdown" id="confirmLoadBtn">불러오기</button>
        <button @click="closeMarkdownModal" id="closeModalBtn">취소</button>
      </div>
    </dialog>

    <!-- Export Todos Modal (진행상황 포함 마크다운, 편집 후 적용 가능) -->
    <dialog ref="exportModal" class="modal">
      <h2>할일 목록 수정 및 내보내기</h2>
      <p>진행상황 포함 마크다운: <code>- [ ]</code> 시작전, <code>- [o]</code> 진행중, <code>- [x]</code> 완료. 내용을 수정한 뒤 적용할 수 있습니다.</p>
      <p
        class="export-textarea-hint"
        title="Tab: 들여쓰기 · Shift+Tab: 내어쓰기 · Alt+↑/↓: 줄 이동 · Ctrl+Shift+K / Ctrl+D: 줄 삭제"
      >
        <mark>Tab</mark> / <mark>Shift</mark>+<mark>Tab</mark>: 들여쓰기 ·
        <mark>Alt</mark>+<mark>↑</mark> / <mark>Alt</mark>+<mark>↓</mark>: 줄 이동 ·
        <mark>Ctrl</mark>+<mark>Shift</mark>+<mark>K</mark> / <mark>Ctrl</mark>+<mark>D</mark>: 줄 삭제
      </p>
      <textarea
        ref="exportTextarea"
        v-model="exportText"
        placeholder="내보낼 할일 목록이 여기에 표시됩니다."
        title="Tab: 들여쓰기 · Shift+Tab: 내어쓰기 · Alt+↑/↓: 줄 이동 · Ctrl+Shift+K / Ctrl+D: 줄 삭제"
        @keydown="handleExportTextareaKeydown"
      ></textarea>
      <div class="dialog-actions">
        <button @click="applyExportMarkdown" class="apply-export-btn">편집 내용 적용</button>
        <button @click="copyToClipboard">클립보드에 복사</button>
        <button @click="closeExportModal">닫기</button>
      </div>
    </dialog>

    <!-- Custom Interaction Modal -->
    <dialog ref="customModal" class="modal">
      <h3>{{ customModalTitle }}</h3>
      <p>{{ customModalMessage }}</p>
      <input v-if="customModalType === 'prompt'" type="text" ref="customModalInput" v-model="customModalInputValue"
        @keydown.enter="handleCustomModalOk" />
      <div class="dialog-actions">
        <button v-if="showCustomModalOk" ref="customModalOkBtn" class="custom-modal-ok" @click="handleCustomModalOk">
          {{ customModalOkText }}
        </button>
        <button v-if="showCustomModalCancel" class="custom-modal-cancel" @click="handleCustomModalCancel">
          {{ customModalCancelText }}
        </button>
      </div>
    </dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import TodoItem from '@/views/todo/TodoItem.vue';

const DB_NAME = 'ABCI_TodoList_Tabs';
const DB_VERSION = 2;
const TODO_STORE_NAME = 'todos';
const TAB_STORE_NAME = 'tabs';

const db = ref(null);
const currentTodos = ref([]);
const currentTabId = ref(null);
const tabs = ref([]);
const collapsedSubtasks = ref(new Set());
const searchQuery = ref('');
const appTitle = ref('임시 할일 리스트');
const markdownModal = ref(null);
const exportModal = ref(null);
const customModal = ref(null);
const modalMarkdownInput = ref(null);
const exportTextarea = ref(null);
const customModalInput = ref(null);
const customModalOkBtn = ref(null);
const markdownInput = ref('');
const exportText = ref('');
const customModalTitle = ref('');
const customModalMessage = ref('');
const customModalType = ref('alert');
const customModalInputValue = ref('');
const customModalResolve = ref(null);
const showCustomModalOk = ref(false);
const showCustomModalCancel = ref(false);
const customModalOkText = ref('확인');
const customModalCancelText = ref('취소');
const draggedTabId = ref(null);
const draggedTodoId = ref(null);

const sortedTabs = computed(() => {
  return [...tabs.value].sort((a, b) => (a.order || 0) - (b.order || 0));
});

const displayedTodos = computed(() => {
  if (!searchQuery.value) {
    return currentTodos.value;
  }
  const filter = searchQuery.value.toLowerCase();
  const filtered = currentTodos.value.filter(todo => todo.text.toLowerCase().includes(filter));
  const itemsToShow = new Set();
  filtered.forEach(item => {
    let current = item;
    while (current) {
      itemsToShow.add(current.id);
      current = currentTodos.value.find(t => t.id === current.parentId);
    }
  });
  return currentTodos.value.filter(t => itemsToShow.has(t.id));
});

const displayedTodoTree = computed(() => {
  return buildTodoTree(displayedTodos.value);
});

function buildTodoTree(flatList) {
  const map = new Map(flatList.map(item => [item.id, { ...item, subtasks: [] }]));
  const tree = [];
  for (const item of map.values()) {
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId).subtasks.push(item);
    } else {
      tree.push(item);
    }
  }
  const sortTasks = (tasks) => tasks.sort((a, b) => (a.order || 0) - (b.order || 0));
  for (const item of map.values()) {
    if (item.subtasks.length > 0) {
      sortTasks(item.subtasks);
    }
  }
  sortTasks(tree);
  return tree;
}

// Database functions
const openDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = event => {
      const database = event.target.result;
      if (!database.objectStoreNames.contains(TODO_STORE_NAME)) {
        const todoStore = database.createObjectStore(TODO_STORE_NAME, { keyPath: 'id' });
        todoStore.createIndex('tabId', 'tabId', { unique: false });
      }
      if (!database.objectStoreNames.contains(TAB_STORE_NAME)) {
        database.createObjectStore(TAB_STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = event => {
      db.value = event.target.result;
      resolve(db.value);
    };
    request.onerror = event => reject(event.target.errorCode);
  });
};

const getFromDb = (storeName) => {
  return new Promise((resolve) => {
    db.value.transaction(storeName).objectStore(storeName).getAll().onsuccess = event => resolve(event.target.result);
  });
};

const getTodosByTab = (tabId) => {
  return new Promise((resolve) => {
    db.value.transaction(TODO_STORE_NAME).objectStore(TODO_STORE_NAME).index('tabId').getAll(tabId).onsuccess = event => resolve(event.target.result);
  });
};

const putInDb = (storeName, item) => {
  return new Promise((resolve) => {
    db.value.transaction(storeName, 'readwrite').objectStore(storeName).put(item).onsuccess = resolve;
  });
};

const deleteFromDb = (storeName, id) => {
  return new Promise((resolve) => {
    db.value.transaction(storeName, 'readwrite').objectStore(storeName).delete(id).onsuccess = resolve;
  });
};

// Custom Modal
const showCustomModal = (options) => {
  return new Promise(resolve => {
    customModalTitle.value = options.title;
    customModalMessage.value = options.message;
    customModalType.value = options.type || 'alert';
    customModalInputValue.value = options.defaultValue || '';
    customModalResolve.value = resolve;
    customModalOkText.value = options.okText || '확인';
    customModalCancelText.value = options.cancelText || '취소';

    // 버튼 표시/숨김 제어
    showCustomModalOk.value = true;
    showCustomModalCancel.value = options.type === 'confirm' || options.type === 'prompt';

    if (customModal.value) {
      customModal.value.showModal();
      nextTick(() => {
        if (options.type === 'prompt' && customModalInput.value) {
          customModalInput.value.focus();
        } else if (customModalOkBtn.value) {
          customModalOkBtn.value.focus();
        }
      });
    }
  });
};

const handleCustomModalOk = () => {
  if (customModal.value) {
    customModal.value.close();
  }
  const value = customModalType.value === 'prompt' ? customModalInputValue.value : true;
  if (customModalResolve.value) {
    customModalResolve.value(value);
    customModalResolve.value = null;
  }
};

const handleCustomModalCancel = () => {
  if (customModal.value) {
    customModal.value.close();
  }
  const value = customModalType.value === 'prompt' ? null : false;
  if (customModalResolve.value) {
    customModalResolve.value(value);
    customModalResolve.value = null;
  }
};

const customAlert = (message, title = '알림') => showCustomModal({ title, message, type: 'alert' });
const customConfirm = (message, title = '확인') => showCustomModal({ title, message, type: 'confirm' });
const customPrompt = (message, defaultValue, title = '입력') => showCustomModal({ title, message, defaultValue, type: 'prompt' });

// Tab Management
const renderTabs = async () => {
  const allTabs = await getFromDb(TAB_STORE_NAME);

  const tabsToUpdate = [];
  allTabs.forEach((tab, index) => {
    if (tab.order === undefined) {
      tab.order = index;
      tabsToUpdate.push(tab);
    }
  });

  if (tabsToUpdate.length > 0) {
    const tx = db.value.transaction(TAB_STORE_NAME, 'readwrite');
    tabsToUpdate.forEach(tab => tx.objectStore(TAB_STORE_NAME).put(tab));
    await new Promise(resolve => tx.oncomplete = resolve);
  }

  tabs.value = allTabs;
};

const addNewTab = async () => {
  const name = await customPrompt('새 탭의 이름을 입력하세요:', '새 목록');
  if (name && name.trim()) {
    const allTabs = await getFromDb(TAB_STORE_NAME);
    const trimmedName = name.trim();
    const existingTab = allTabs.find(tab => tab.name === trimmedName);
    if (existingTab) {
      await customAlert(`'${trimmedName}' 이름의 탭이 이미 존재합니다. 다른 이름을 사용해주세요.`, '중복된 탭 이름');
      return;
    }
    const newOrder = allTabs.length;
    const newTab = { id: `tab-${Date.now()}`, name: trimmedName, order: newOrder };
    await putInDb(TAB_STORE_NAME, newTab);
    await switchTab(newTab.id);
  }
};

const renameTab = async (tab) => {
  const newName = await customPrompt('탭의 새 이름을 입력하세요:', tab.name);
  if (newName && newName.trim() && newName.trim() !== tab.name) {
    const trimmedName = newName.trim();
    const allTabs = await getFromDb(TAB_STORE_NAME);
    const existingTab = allTabs.find(t => t.name === trimmedName && t.id !== tab.id);
    if (existingTab) {
      await customAlert(`'${trimmedName}' 이름의 탭이 이미 존재합니다. 다른 이름을 사용해주세요.`, '중복된 탭 이름');
      return;
    }
    const updatedTab = { id: tab.id, name: trimmedName, order: tab.order ?? 0 };
    await putInDb(TAB_STORE_NAME, updatedTab);
    const freshTabs = await getFromDb(TAB_STORE_NAME);
    tabs.value = freshTabs;
  }
};

const deleteTab = async (tabId) => {
  const confirmed = await customConfirm('이 탭과 모든 할 일을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.');
  if (!confirmed) return;

  const tx = db.value.transaction([TODO_STORE_NAME, TAB_STORE_NAME], 'readwrite');
  const todoStore = tx.objectStore(TODO_STORE_NAME);
  const tabStore = tx.objectStore(TAB_STORE_NAME);

  const todoIndex = todoStore.index('tabId');
  const todoRequest = todoIndex.openCursor(tabId);
  todoRequest.onsuccess = event => {
    const cursor = event.target.result;
    if (cursor) {
      cursor.delete();
      cursor.continue();
    }
  };
  tabStore.delete(tabId);

  tx.oncomplete = async () => {
    if (currentTabId.value === tabId) {
      const remainingTabs = await getFromDb(TAB_STORE_NAME);
      const newTabId = remainingTabs.length > 0 ? remainingTabs[0].id : null;
      await switchTab(newTabId);
    } else {
      await renderTabs();
    }
  };
};

const switchTab = async (tabId) => {
  currentTabId.value = tabId;
  localStorage.setItem('currentTabId', tabId);
  await renderTabs();
  await renderCurrentTodos();
};

// Tab Drag and Drop
const handleTabDragStart = (e, tabId) => {
  draggedTabId.value = tabId;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', tabId);
  e.target.classList.add('dragging');
};

const handleTabDragEnd = (e) => {
  e.target.classList.remove('dragging');
  document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
  draggedTabId.value = null;
};

const handleTabDragOver = (e, tabId) => {
  if (tabId !== draggedTabId.value) {
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    e.target.closest('.tab-item')?.classList.add('drag-over');
  }
};

const handleTabDragLeave = (e, tabId) => {
  e.target.closest('.tab-item')?.classList.remove('drag-over');
};

const handleTabDrop = async (e, targetTabId) => {
  e.preventDefault();
  document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
  const draggedId = draggedTabId.value;
  if (!targetTabId || draggedId === targetTabId) return;
  await reorderTabs(draggedId, targetTabId);
};

const reorderTabs = async (draggedId, targetId) => {
  const allTabs = await getFromDb(TAB_STORE_NAME);
  const sortedTabs = allTabs.sort((a, b) => (a.order || 0) - (b.order || 0));
  const draggedIndex = sortedTabs.findIndex(tab => tab.id === draggedId);
  const targetIndex = sortedTabs.findIndex(tab => tab.id === targetId);
  if (draggedIndex === -1 || targetIndex === -1) return;
  const [draggedTab] = sortedTabs.splice(draggedIndex, 1);
  sortedTabs.splice(targetIndex, 0, draggedTab);
  const updates = [];
  sortedTabs.forEach((tab, index) => {
    if (tab.order !== index) {
      tab.order = index;
      updates.push(putInDb(TAB_STORE_NAME, tab));
    }
  });
  if (updates.length > 0) {
    await Promise.all(updates);
    await renderTabs();
  }
};

// Todo Management
const renderCurrentTodos = async () => {
  if (!currentTabId.value) {
    currentTodos.value = [];
    return;
  }
  let todos = await getTodosByTab(currentTabId.value);

  const todosToUpdate = [];
  const todosByParent = new Map();
  todos.forEach(todo => {
    const parentId = todo.parentId || null;
    if (!todosByParent.has(parentId)) {
      todosByParent.set(parentId, []);
    }
    todosByParent.get(parentId).push(todo);
  });

  todosByParent.forEach(siblings => {
    siblings.forEach((todo, index) => {
      if (todo.order === undefined) {
        todo.order = index;
        todosToUpdate.push(todo);
      }
    });
  });

  if (todosToUpdate.length > 0) {
    const tx = db.value.transaction(TODO_STORE_NAME, 'readwrite');
    todosToUpdate.forEach(todo => tx.objectStore(TODO_STORE_NAME).put(todo));
    await new Promise(resolve => tx.oncomplete = resolve);
    todos = await getTodosByTab(currentTabId.value);
  }

  currentTodos.value = todos;
};

const addSubtask = async (parentId) => {
  const text = await customPrompt('새 하위 할일의 내용을 입력하세요:', '');
  if (text && text.trim()) {
    const siblings = currentTodos.value.filter(t => t.parentId === parentId);
    const newTodo = {
      id: `todo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      text: text.trim(),
      state: 'not-started',
      parentId: parentId,
      tabId: currentTabId.value,
      order: siblings.length
    };
    await putInDb(TODO_STORE_NAME, newTodo);
    const parentTodo = currentTodos.value.find(t => t.id === parentId);
    if (parentTodo && parentTodo.state === 'completed') {
      parentTodo.state = 'in-progress';
      await putInDb(TODO_STORE_NAME, parentTodo);
      await syncParentState(parentTodo.parentId);
    }
    await renderCurrentTodos();
  }
};

const deleteTodo = async (todoId) => {
  const confirmed = await customConfirm('이 할 일과 모든 하위 할 일을 삭제하시겠습니까?');
  if (!confirmed) return;

  const idsToDelete = new Set([todoId]);
  const findChildrenRecursive = (parentId) => {
    const children = currentTodos.value.filter(t => t.parentId === parentId);
    children.forEach(child => {
      idsToDelete.add(child.id);
      findChildrenRecursive(child.id);
    });
  };
  findChildrenRecursive(todoId);

  const tx = db.value.transaction(TODO_STORE_NAME, 'readwrite');
  const store = tx.objectStore(TODO_STORE_NAME);
  idsToDelete.forEach(id => store.delete(id));

  tx.oncomplete = async () => {
    await renderCurrentTodos();
  };
};

const editTodoText = async (todoId) => {
  const todo = currentTodos.value.find(t => t.id === todoId);
  if (!todo) return;
  const newText = await customPrompt('할일 내용을 수정하세요:', todo.text, '할일 수정');
  if (newText && newText.trim() && newText.trim() !== todo.text) {
    todo.text = newText.trim();
    await putInDb(TODO_STORE_NAME, todo);
    await renderCurrentTodos();
  }
};

const toggleSubtaskCollapse = (todoId) => {
  if (collapsedSubtasks.value.has(todoId)) {
    collapsedSubtasks.value.delete(todoId);
  } else {
    collapsedSubtasks.value.add(todoId);
  }
};

const handleStateChange = async (id, newState) => {
  const todo = currentTodos.value.find(t => t.id === id);
  if (todo && todo.state !== newState) {
    todo.state = newState;
    await putInDb(TODO_STORE_NAME, todo);
    await syncParentState(todo.parentId);
    if (newState === 'completed') {
      await syncChildStates(id, 'completed');
    }
    await renderCurrentTodos();
  }
};

const syncParentState = async (parentId) => {
  if (!parentId) return;
  const parent = currentTodos.value.find(t => t.id === parentId);
  const siblings = currentTodos.value.filter(t => t.parentId === parentId);
  if (parent && siblings.length > 0) {
    const allCompleted = siblings.every(s => s.state === 'completed');
    const anyInProgress = siblings.some(s => s.state === 'in-progress');
    let newParentState = allCompleted ? 'completed' : (anyInProgress || siblings.some(s => s.state === 'completed')) ? 'in-progress' : 'not-started';
    if (parent.state !== newParentState) {
      parent.state = newParentState;
      await putInDb(TODO_STORE_NAME, parent);
      await syncParentState(parent.parentId);
    }
  }
};

const syncChildStates = async (parentId, state) => {
  const children = currentTodos.value.filter(t => t.parentId === parentId);
  for (const child of children) {
    if (child.state !== state) {
      child.state = state;
      await putInDb(TODO_STORE_NAME, child);
      await syncChildStates(child.id, state);
    }
  }
};

const resetAllTodosToNotStarted = async () => {
  if (!currentTabId.value || currentTodos.value.length === 0) {
    await customAlert('초기화할 할일이 없습니다.');
    return;
  }
  const confirmed = await customConfirm('현재 탭의 모든 할일을 "시작하지 않음" 상태로 변경하시겠습니까?');
  if (!confirmed) return;
  const updates = [];
  currentTodos.value.forEach(todo => {
    if (todo.state !== 'not-started') {
      todo.state = 'not-started';
      updates.push(putInDb(TODO_STORE_NAME, todo));
    }
  });
  if (updates.length > 0) {
    await Promise.all(updates);
    await renderCurrentTodos();
    await customAlert(`${updates.length}개의 할일이 초기화되었습니다.`);
  } else {
    await customAlert('이미 모든 할일이 "시작하지 않음" 상태입니다.');
  }
};

const deleteCompletedTodos = async () => {
  if (!currentTabId.value || currentTodos.value.length === 0) {
    await customAlert('삭제할 완료된 할일이 없습니다.');
    return;
  }
  const completedTodos = currentTodos.value.filter(todo => todo.state === 'completed');
  if (completedTodos.length === 0) {
    await customAlert('완료된 할일이 없습니다.');
    return;
  }
  const confirmed = await customConfirm(`완료된 ${completedTodos.length}개의 할일을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`);
  if (!confirmed) return;
  const tx = db.value.transaction(TODO_STORE_NAME, 'readwrite');
  const store = tx.objectStore(TODO_STORE_NAME);
  completedTodos.forEach(todo => store.delete(todo.id));
  tx.oncomplete = async () => {
    await renderCurrentTodos();
    await customAlert(`${completedTodos.length}개의 완료된 할일이 삭제되었습니다.`);
  };
};

// Markdown Import/Export (진행상황 포함: - [ ] 시작전, - [o] 진행중, - [x] 완료)
const stateToMarkdownCheckbox = (state) => {
  if (state === 'completed') return '[x]';
  if (state === 'in-progress') return '[o]';
  return '[ ]';
};

const convertTodosToMarkdown = (todos) => {
  if (!todos || todos.length === 0) return '';
  const todoTree = buildTodoTree(todos);
  let markdown = '';
  const addTodoToMarkdown = (todo, level = 0) => {
    const indent = '  '.repeat(level);
    const checkbox = stateToMarkdownCheckbox(todo.state);
    markdown += indent + '- ' + checkbox + ' ' + todo.text + '\n';
    if (todo.subtasks && todo.subtasks.length > 0) {
      todo.subtasks.forEach(subtask => {
        addTodoToMarkdown(subtask, level + 1);
      });
    }
  };
  todoTree.forEach(todo => addTodoToMarkdown(todo));
  return markdown.trim();
};

const exportTodos = async () => {
  if (!currentTabId.value) {
    await customAlert('먼저 탭을 선택해주세요.');
    return;
  }
  if (currentTodos.value.length === 0) {
    await customAlert('내보낼 할일이 없습니다.');
    return;
  }
  exportText.value = convertTodosToMarkdown(currentTodos.value);
  if (exportModal.value) {
    exportModal.value.showModal();
  }
};

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(exportText.value);
    await customAlert('할일 목록이 클립보드에 복사되었습니다.');
  } catch (err) {
    console.error('클립보드 복사 실패:', err);
    if (exportTextarea.value) {
      exportTextarea.value.select();
      document.execCommand('copy');
    }
    await customAlert('할일 목록이 클립보드에 복사되었습니다.');
  }
};

const applyExportMarkdown = async () => {
  if (!currentTabId.value) {
    await customAlert('먼저 탭을 선택해주세요.');
    return;
  }
  const newTodos = parseMarkdownToTodos(exportText.value, currentTabId.value);
  if (newTodos.length === 0) {
    await customAlert('적용할 항목이 없습니다. 마크다운 형식(- [ ] / - [o] / - [x] + 내용)을 확인해주세요.');
    return;
  }
  const tx = db.value.transaction(TODO_STORE_NAME, 'readwrite');
  const store = tx.objectStore(TODO_STORE_NAME);
  const existing = currentTodos.value.map(t => t.id);
  existing.forEach(id => store.delete(id));
  newTodos.forEach(todo => store.put(todo));
  await new Promise(resolve => tx.oncomplete = resolve);
  await renderCurrentTodos();
  closeExportModal();
  await customAlert(`편집 내용 ${newTodos.length}개 항목으로 적용되었습니다.`);
};

// 진행상황 마크다운 한 줄 파싱: - [ ] / - [o] / - [x] + 내용
const parseStateMarkdownLine = (line) => {
  const stateCheckboxMatch = line.match(/^\s*-\s*\[\s*([ xo])\]\s*(.*)$/i);
  if (stateCheckboxMatch) {
    const ch = stateCheckboxMatch[1].toLowerCase();
    const state = ch === 'x' ? 'completed' : ch === 'o' ? 'in-progress' : 'not-started';
    const text = stateCheckboxMatch[2].trim();
    const indent = line.match(/^\s*/)[0].length;
    return { indent, state, text };
  }
  const legacyMatch = line.match(/^\s*((?:[-*+]|\d+\.)\s+)(.*)$/);
  if (legacyMatch) {
    const indent = line.match(/^\s*/)[0].length;
    const text = legacyMatch[2].trim();
    return { indent, state: 'not-started', text };
  }
  return null;
};

const parseMarkdownToTodos = (markdownText, tabId) => {
  const lines = markdownText.split('\n');
  const newTodos = [];
  const parentStack = [];
  const siblingCounters = new Map();

  lines.forEach(line => {
    const parsed = parseStateMarkdownLine(line);
    if (!parsed || !parsed.text) return;
    const { indent, state, text } = parsed;
    const id = `todo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    while (parentStack.length > 0 && parentStack[parentStack.length - 1].indent >= indent) {
      parentStack.pop();
    }
    const parentId = parentStack.length > 0 ? parentStack[parentStack.length - 1].id : null;
    const order = siblingCounters.get(parentId) || 0;

    newTodos.push({ id, text, state, parentId, tabId, order });
    siblingCounters.set(parentId, order + 1);
    parentStack.push({ id, indent });
  });
  return newTodos;
};

const loadTodosFromMarkdown = async () => {
  if (!currentTabId.value) {
    await customAlert("먼저 탭을 선택하거나 생성해주세요.");
    return;
  }
  const markdownText = markdownInput.value;
  const newTodos = parseMarkdownToTodos(markdownText, currentTabId.value);

  if (newTodos.length > 0) {
    const tx = db.value.transaction(TODO_STORE_NAME, 'readwrite');
    newTodos.forEach(todo => tx.objectStore(TODO_STORE_NAME).put(todo));
    await new Promise(resolve => tx.oncomplete = resolve);
    markdownInput.value = '';
    closeMarkdownModal();
    await renderCurrentTodos();
  }
};

const openMarkdownModal = () => {
  if (markdownModal.value) {
    markdownModal.value.showModal();
    nextTick(() => {
      if (modalMarkdownInput.value) {
        modalMarkdownInput.value.focus();
      }
    });
  }
};

const closeMarkdownModal = () => {
  if (markdownModal.value) {
    markdownModal.value.close();
  }
};

const closeExportModal = () => {
  if (exportModal.value) {
    exportModal.value.close();
  }
};

const getLineIndexFromOffset = (text, offset) => {
  if (offset <= 0) return 0;
  const before = text.slice(0, offset);
  return (before.match(/\n/g) || []).length;
};

const getOffsetOfLineStart = (text, lineIndex) => {
  const lines = text.split('\n');
  if (lineIndex <= 0) return 0;
  let offset = 0;
  for (let i = 0; i < lineIndex && i < lines.length; i++) {
    offset += lines[i].length + 1;
  }
  return offset;
};

const EXPORT_INDENT = '  ';

const handleExportTextareaKeydown = (e) => {
  const textarea = exportTextarea.value;
  if (!textarea) return;

  const value = exportText.value;
  const lines = value.split('\n');
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const startLine = getLineIndexFromOffset(value, start);
  const endLine = getLineIndexFromOffset(value, end > 0 ? end - 1 : 0);
  const lineCount = endLine - startLine + 1;

  if (e.key === 'Tab') {
    e.preventDefault();
    if (lines.length === 0) return;
    const lineStartOffset = getOffsetOfLineStart(value, startLine);
    const lineEndOffset = getOffsetOfLineStart(value, endLine + 1);
    const selectedLines = lines.slice(startLine, endLine + 1);
    const newLines = e.shiftKey
      ? selectedLines.map(line => line.startsWith(EXPORT_INDENT) ? line.substring(EXPORT_INDENT.length) : line)
      : selectedLines.map(line => EXPORT_INDENT + line);
    const newBlock = newLines.join('\n');
    const newValue = value.substring(0, lineStartOffset) + newBlock + value.substring(lineEndOffset);
    exportText.value = newValue;
    nextTick(() => {
      if (!exportTextarea.value) return;
      exportTextarea.value.selectionStart = getOffsetOfLineStart(newValue, startLine);
      exportTextarea.value.selectionEnd = getOffsetOfLineStart(newValue, endLine + 1);
      exportTextarea.value.focus();
    });
    return;
  }

  const isDeleteLine = (e.ctrlKey && e.shiftKey && e.key === 'K') || (e.ctrlKey && e.key === 'D');
  if (isDeleteLine) {
    e.preventDefault();
    if (lines.length === 0) return;
    lines.splice(startLine, lineCount);
    const newValue = lines.join('\n');
    exportText.value = newValue;
    nextTick(() => {
      if (!exportTextarea.value) return;
      const newLine = Math.min(startLine, lines.length - 1);
      const newOffset = newLine >= 0 ? getOffsetOfLineStart(newValue, newLine) : 0;
      exportTextarea.value.selectionStart = newOffset;
      exportTextarea.value.selectionEnd = newOffset;
      exportTextarea.value.focus();
    });
    return;
  }

  if (!e.altKey || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
  e.preventDefault();
  if (lines.length === 0) return;

  if (e.key === 'ArrowUp') {
    if (startLine === 0) return;
    const block = lines.splice(startLine, lineCount);
    lines.splice(startLine - 1, 0, ...block);
  } else {
    if (endLine >= lines.length - 1) return;
    const block = lines.splice(startLine, lineCount);
    lines.splice(startLine + 1, 0, ...block);
  }

  const newValue = lines.join('\n');
  exportText.value = newValue;
  nextTick(() => {
    if (!exportTextarea.value) return;
    const newStartLine = e.key === 'ArrowUp' ? startLine - 1 : startLine + 1;
    const newEndLine = newStartLine + lineCount - 1;
    exportTextarea.value.selectionStart = getOffsetOfLineStart(newValue, newStartLine);
    exportTextarea.value.selectionEnd = getOffsetOfLineStart(newValue, newEndLine + 1);
    exportTextarea.value.focus();
  });
};

const handleMarkdownKeydown = (e) => {
  if (e.key === 'Tab') {
    e.preventDefault();
    const textarea = e.target;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    const indent = '  ';

    let lineStartIndex = start;
    while (lineStartIndex > 0 && value[lineStartIndex - 1] !== '\n') {
      lineStartIndex--;
    }

    let lineEndIndex = end;
    if (end > start && value[end - 1] === '\n') {
      lineEndIndex = end - 1;
    }
    while (lineEndIndex < value.length && value[lineEndIndex] !== '\n') {
      lineEndIndex++;
    }

    const selectedText = value.substring(lineStartIndex, lineEndIndex);
    const selectedLines = selectedText.split('\n');
    let newText;

    if (e.shiftKey) {
      const newLines = selectedLines.map(line => line.startsWith(indent) ? line.substring(indent.length) : line);
      newText = newLines.join('\n');
      textarea.value = value.substring(0, lineStartIndex) + newText + value.substring(lineEndIndex);
      const firstLineChange = selectedLines[0].startsWith(indent) ? indent.length : 0;
      textarea.selectionStart = Math.max(lineStartIndex, start - firstLineChange);
      textarea.selectionEnd = end + (newText.length - selectedText.length);
    } else {
      const newLines = selectedLines.map(line => indent + line);
      newText = newLines.join('\n');
      textarea.value = value.substring(0, lineStartIndex) + newText + value.substring(lineEndIndex);
      textarea.selectionStart = start + indent.length;
      textarea.selectionEnd = end + (newLines.length * indent.length);
    }
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    loadTodosFromMarkdown();
  }
};

// Todo Drag and Drop
const handleTodoDragStart = (e, todoId) => {
  draggedTodoId.value = todoId;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', todoId);
};

const handleTodoDragEnd = (e) => {
  e.target.closest('li')?.classList.remove('dragging');
  document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
  draggedTodoId.value = null;
};

const handleTodoDragOver = (e, todoId) => {
  if (todoId !== draggedTodoId.value) {
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    e.target.closest('li')?.classList.add('drag-over');
  }
};

const handleTodoDragLeave = (e) => {
  e.target.closest('li')?.classList.remove('drag-over');
};

const handleTodoDrop = async (e, targetTodoId) => {
  e.preventDefault();
  document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
  const draggedId = draggedTodoId.value;
  if (!targetTodoId || draggedId === targetTodoId) return;
  await reorderTodos(draggedId, targetTodoId);
};

const reorderTodos = async (draggedId, targetId) => {
  const draggedTodo = currentTodos.value.find(t => t.id === draggedId);
  const targetTodo = currentTodos.value.find(t => t.id === targetId);
  if (!draggedTodo || !targetTodo) return;

  const parentIdA = draggedTodo.parentId ?? null;
  const parentIdB = targetTodo.parentId ?? null;
  if (parentIdA === parentIdB) {
    const siblings = currentTodos.value
      .filter(t => (t.parentId ?? null) === parentIdA)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    const draggedIndex = siblings.findIndex(t => t.id === draggedId);
    const targetIndexNew = siblings.findIndex(t => t.id === targetId);
    if (draggedIndex === -1 || targetIndexNew === -1) return;
    const [draggedItem] = siblings.splice(draggedIndex, 1);
    siblings.splice(targetIndexNew, 0, draggedItem);
    const updates = [];
    siblings.forEach((todo, index) => {
      if (todo.order !== index) {
        todo.order = index;
        updates.push(putInDb(TODO_STORE_NAME, todo));
      }
    });
    if (updates.length > 0) {
      await Promise.all(updates);
      await renderCurrentTodos();
    }
  } else {
    await changeHierarchy(draggedId, targetId);
  }
};

const changeHierarchy = async (draggedId, targetId) => {
  const draggedTodo = currentTodos.value.find(t => t.id === draggedId);
  const targetTodo = currentTodos.value.find(t => t.id === targetId);
  if (!draggedTodo || !targetTodo) return;
  if (draggedId === targetId) return;

  const isDescendant = (parentId, childId) => {
    const children = currentTodos.value.filter(t => t.parentId === parentId);
    for (const child of children) {
      if (child.id === childId) return true;
      if (isDescendant(child.id, childId)) return true;
    }
    return false;
  };

  if (isDescendant(draggedId, targetId)) {
    await customAlert("하위 할일을 상위 할일로 만들 수 없습니다.");
    return;
  }

  const draggedText = draggedTodo.text.length > 30 ? draggedTodo.text.substring(0, 30) + '...' : draggedTodo.text;
  const targetText = targetTodo.text.length > 30 ? targetTodo.text.substring(0, 30) + '...' : targetTodo.text;
  const confirmMessage = `"${draggedText}"을(를) "${targetText}"의 하위 할일로 만들겠습니까?`;
  const confirmed = await customConfirm(confirmMessage, '계층 구조 변경');
  if (!confirmed) return;

  const oldParentId = draggedTodo.parentId;
  const oldSiblings = currentTodos.value.filter(t => t.parentId === oldParentId);
  draggedTodo.parentId = targetId;
  const newSiblings = currentTodos.value.filter(t => t.parentId === targetId);
  draggedTodo.order = newSiblings.length;

  const updates = [putInDb(TODO_STORE_NAME, draggedTodo)];
  oldSiblings.forEach((sibling, index) => {
    if (sibling.order !== index) {
      sibling.order = index;
      updates.push(putInDb(TODO_STORE_NAME, sibling));
    }
  });

  await Promise.all(updates);
  await renderCurrentTodos();
};

const editTitle = async () => {
  const currentTitle = appTitle.value;
  const newTitle = await customPrompt('새 제목을 입력하세요:', currentTitle, '제목 편집');
  if (newTitle && newTitle.trim() && newTitle.trim() !== currentTitle) {
    appTitle.value = newTitle.trim();
    document.title = newTitle.trim();
    localStorage.setItem('todoAppTitle', newTitle.trim());
  }
};

// Initialization
const initializeApp = async () => {
  try {
    const savedTitle = localStorage.getItem('todoAppTitle');
    if (savedTitle) {
      appTitle.value = savedTitle;
      document.title = savedTitle;
    }
    await openDatabase();
    let allTabs = await getFromDb(TAB_STORE_NAME);
    if (allTabs.length === 0) {
      const defaultTab = { id: `tab-${Date.now()}`, name: '기본 목록', order: 0 };
      await putInDb(TAB_STORE_NAME, defaultTab);
      allTabs.push(defaultTab);
    }
    let lastTabId = localStorage.getItem('currentTabId');
    if (!lastTabId || !allTabs.some(t => t.id === lastTabId)) {
      lastTabId = allTabs[0].id;
    }
    await switchTab(lastTabId);
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
};

onMounted(() => {
  initializeApp();
});
</script>

<style scoped>
.todo-app {
  font-family: 'Inter', Arial, sans-serif;
  line-height: 1.6;
  padding: 20px;
  background-color: #f4f4f4;
  color: #333;
  box-sizing: border-box;
  min-height: 100vh;
}

.container {
  max-width: 800px;
  margin: auto;
  background: #fff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  color: #2c3e50;
  border-bottom: 2px solid #2c3e50;
  padding-bottom: 15px;
  margin-bottom: 30px;
  font-size: 2em;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

h1:hover {
  background-color: #f8f9fa;
  border-radius: 8px;
}

.tabs-container {
  display: flex;
  align-items: center;
  gap: 5px;
  border-bottom: 1px solid #ddd;
  margin-bottom: 20px;
  padding-bottom: 10px;
  overflow-x: auto;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px 8px 0 0;
  cursor: grab;
  background-color: #f0f0f0;
  color: #555;
  transition: all 0.2s ease;
  white-space: nowrap;
  border: 1px solid transparent;
  border-bottom: none;
  user-select: none;
}

.tab-item:active {
  cursor: grabbing;
}

.tab-item:hover {
  background-color: #e0e0e0;
}

.tab-item.active {
  background-color: #fff;
  color: #007bff;
  border-color: #ddd;
  border-bottom: 1px solid #fff;
  transform: translateY(1px);
}

.tab-item.dragging {
  opacity: 0.5;
  background: #cce5ff;
  transform: rotate(5deg);
  z-index: 1000;
}

.tab-item.drag-over {
  border-left: 3px solid #007bff;
  background-color: #e7f3ff;
}

.delete-tab-btn {
  background: none;
  border: none;
  color: #aaa;
  font-size: 1.2em;
  cursor: pointer;
  padding: 0 4px;
  border-radius: 50%;
}

.delete-tab-btn:hover {
  color: #dc3545;
  background-color: #f0f0f0;
}

#addTabBtn {
  padding: 5px 10px;
  font-size: 1.2em;
  border-radius: 50%;
  border: none;
  background-color: #28a745;
  color: white;
  cursor: pointer;
  margin-left: 10px;
}

.controls-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  gap: 10px;
  flex-wrap: wrap;
}

.controls-container button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
}

.controls-container button:hover {
  background-color: #0056b3;
}

.controls-container input {
  flex-grow: 1;
  min-width: 200px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.08);
}

ul {
  list-style: none;
  padding: 0;
}

.empty-list-message {
  text-align: center;
  color: #7f8c8d;
  padding: 40px 20px;
  font-size: 1.1em;
}

.modal {
  border: none;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 600px;
  background-color: #fff;
  max-height: 80vh;
  overflow-y: auto;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
}

.modal[open] {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.modal::backdrop {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
}

.modal h2 {
  margin-top: 0;
  color: #2c3e50;
  text-align: center;
}

.modal textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
  min-height: 300px;
  resize: vertical;
  font-family: monospace;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.dialog-actions button {
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  border: none;
}

#confirmLoadBtn {
  background-color: #28a745;
  color: white;
}

#confirmLoadBtn:hover {
  background-color: #218838;
}

.apply-export-btn {
  background-color: #007bff;
  color: white;
}

.apply-export-btn:hover {
  background-color: #0056b3;
}

.modal code {
  font-family: monospace;
  background: rgba(0, 0, 0, 0.08);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
}

.export-textarea-hint {
  margin: 0 0 8px 0;
  font-size: 0.85em;
  color: #6c757d;
}

.export-textarea-hint mark {
  display: inline-block;
  padding: 2px 6px;
  margin: 0 1px;
  font-family: inherit;
  font-size: 0.9em;
  font-weight: 600;
  line-height: 1.3;
  color: #333;
  background: linear-gradient(180deg, #f7f7f7 0%, #e8e8e8 100%);
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 1px 0 0 rgba(255, 255, 255, 0.8) inset, 0 1px 2px rgba(0, 0, 0, 0.1);
}

.export-textarea-hint mark + mark {
  margin-left: 0;
}

#closeModalBtn {
  background-color: #dc3545;
  color: white;
}

#closeModalBtn:hover {
  background-color: #c82333;
}

.custom-modal-ok {
  background-color: #28a745;
  color: white;
}

.custom-modal-ok:hover {
  background-color: #218838;
}

.custom-modal-cancel {
  background-color: #dc3545;
  color: white;
}

.custom-modal-cancel:hover {
  background-color: #c82333;
}

/* 다크모드: 시스템 설정 */
@media (prefers-color-scheme: dark) {
  .todo-app {
    background-color: #121212;
    color: #e0e0e0;
  }

  .container {
    background: #1e1e1e;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  }

  h1 {
    color: #e0e0e0;
    border-bottom-color: #424242;
  }

  h1:hover {
    background-color: #2d2d2d;
  }

  .tabs-container {
    border-bottom-color: #424242;
  }

  .tab-item {
    background-color: #2d2d2d;
    color: #b0bec5;
  }

  .tab-item:hover {
    background-color: #383838;
  }

  .tab-item.active {
    background-color: #1e1e1e;
    color: #90caf9;
    border-color: #424242;
    border-bottom-color: #1e1e1e;
  }

  .tab-item.dragging {
    background: #1e3a5f;
  }

  .tab-item.drag-over {
    border-left-color: #90caf9;
    background-color: #1e3a5f;
  }

  .delete-tab-btn {
    color: #757575;
  }

  .delete-tab-btn:hover {
    color: #ef5350;
    background-color: #2d2d2d;
  }

  #addTabBtn {
    background-color: #66bb6a;
  }

  .controls-container button {
    background-color: #1976d2;
  }

  .controls-container button:hover {
    background-color: #1565c0;
  }

  .controls-container input {
    border-color: #424242;
    background-color: #2d2d2d;
    color: #e0e0e0;
  }

  .controls-container input::placeholder {
    color: #757575;
  }

  .empty-list-message {
    color: #b0bec5;
  }

  .modal {
    background-color: #1e1e1e;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
  }

  .modal h2,
  .modal h3 {
    color: #e0e0e0;
  }

  .modal p {
    color: #b0bec5;
  }

  .modal textarea {
    border-color: #424242;
    background-color: #2d2d2d;
    color: #e0e0e0;
  }

  .modal input[type="text"] {
    border-color: #424242;
    background-color: #2d2d2d;
    color: #e0e0e0;
  }

  .export-textarea-hint {
    color: #b0bec5;
  }

  .export-textarea-hint mark {
    color: #e0e0e0;
    background: linear-gradient(180deg, #3d3d3d 0%, #2d2d2d 100%);
    border-color: #555;
    box-shadow: 0 1px 0 0 rgba(255, 255, 255, 0.05) inset, 0 1px 2px rgba(0, 0, 0, 0.3);
  }
}

/* 다크모드: 사용자 테마 (data-theme="dark") */
body[data-theme="dark"] .todo-app,
[data-theme="dark"] .todo-app {
  background-color: #121212;
  color: #e0e0e0;
}

body[data-theme="dark"] .todo-app .container,
[data-theme="dark"] .todo-app .container {
  background: #1e1e1e;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

body[data-theme="dark"] .todo-app h1,
[data-theme="dark"] .todo-app h1 {
  color: #e0e0e0;
  border-bottom-color: #424242;
}

body[data-theme="dark"] .todo-app h1:hover,
[data-theme="dark"] .todo-app h1:hover {
  background-color: #2d2d2d;
}

body[data-theme="dark"] .todo-app .tabs-container,
[data-theme="dark"] .todo-app .tabs-container {
  border-bottom-color: #424242;
}

body[data-theme="dark"] .todo-app .tab-item,
[data-theme="dark"] .todo-app .tab-item {
  background-color: #2d2d2d;
  color: #b0bec5;
}

body[data-theme="dark"] .todo-app .tab-item:hover,
[data-theme="dark"] .todo-app .tab-item:hover {
  background-color: #383838;
}

body[data-theme="dark"] .todo-app .tab-item.active,
[data-theme="dark"] .todo-app .tab-item.active {
  background-color: #1e1e1e;
  color: #90caf9;
  border-color: #424242;
  border-bottom-color: #1e1e1e;
}

body[data-theme="dark"] .todo-app .tab-item.dragging,
[data-theme="dark"] .todo-app .tab-item.dragging {
  background: #1e3a5f;
}

body[data-theme="dark"] .todo-app .tab-item.drag-over,
[data-theme="dark"] .todo-app .tab-item.drag-over {
  border-left-color: #90caf9;
  background-color: #1e3a5f;
}

body[data-theme="dark"] .todo-app .delete-tab-btn,
[data-theme="dark"] .todo-app .delete-tab-btn {
  color: #757575;
}

body[data-theme="dark"] .todo-app .delete-tab-btn:hover,
[data-theme="dark"] .todo-app .delete-tab-btn:hover {
  color: #ef5350;
  background-color: #2d2d2d;
}

body[data-theme="dark"] .todo-app #addTabBtn,
[data-theme="dark"] .todo-app #addTabBtn {
  background-color: #66bb6a;
}

body[data-theme="dark"] .todo-app .controls-container button,
[data-theme="dark"] .todo-app .controls-container button {
  background-color: #1976d2;
}

body[data-theme="dark"] .todo-app .controls-container button:hover,
[data-theme="dark"] .todo-app .controls-container button:hover {
  background-color: #1565c0;
}

body[data-theme="dark"] .todo-app .controls-container input,
[data-theme="dark"] .todo-app .controls-container input {
  border-color: #424242;
  background-color: #2d2d2d;
  color: #e0e0e0;
}

body[data-theme="dark"] .todo-app .empty-list-message,
[data-theme="dark"] .todo-app .empty-list-message {
  color: #b0bec5;
}

body[data-theme="dark"] .todo-app .modal,
[data-theme="dark"] .todo-app .modal {
  background-color: #1e1e1e;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
}

body[data-theme="dark"] .todo-app .modal h2,
body[data-theme="dark"] .todo-app .modal h3,
[data-theme="dark"] .todo-app .modal h2,
[data-theme="dark"] .todo-app .modal h3 {
  color: #e0e0e0;
}

body[data-theme="dark"] .todo-app .modal p,
[data-theme="dark"] .todo-app .modal p {
  color: #b0bec5;
}

body[data-theme="dark"] .todo-app .modal textarea,
body[data-theme="dark"] .todo-app .modal input[type="text"],
[data-theme="dark"] .todo-app .modal textarea,
[data-theme="dark"] .todo-app .modal input[type="text"] {
  border-color: #424242;
  background-color: #2d2d2d;
  color: #e0e0e0;
}

body[data-theme="dark"] .todo-app .export-textarea-hint,
[data-theme="dark"] .todo-app .export-textarea-hint {
  color: #b0bec5;
}

body[data-theme="dark"] .todo-app .export-textarea-hint mark,
[data-theme="dark"] .todo-app .export-textarea-hint mark {
  color: #e0e0e0;
  background: linear-gradient(180deg, #3d3d3d 0%, #2d2d2d 100%);
  border-color: #555;
  box-shadow: 0 1px 0 0 rgba(255, 255, 255, 0.05) inset, 0 1px 2px rgba(0, 0, 0, 0.3);
}
</style>
