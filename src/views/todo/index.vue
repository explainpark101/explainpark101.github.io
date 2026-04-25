<template>
  <div class="min-h-screen p-5 bg-(--background) text-(--text-primary) leading-relaxed transition-[background-color,color] duration-500">
    <div class="max-w-[800px] mx-auto w-full flex flex-wrap justify-between items-center gap-2 mb-4">
      <router-link
        to="/"
        class="inline-flex items-center py-2 px-4 rounded-lg text-sm font-medium no-underline border border-(--border-color) bg-(--surface) text-(--text-primary) transition-colors shadow-sm hover:bg-(--control-muted) hover:text-(--primary-color)"
      >← 홈</router-link>
      <button
        type="button"
        class="py-2 px-4 bg-(--primary-color) text-white border-none rounded-lg cursor-pointer text-sm font-medium transition-colors shadow-md hover:bg-(--primary-dark) whitespace-nowrap"
        @click="openTodoWebhookModal"
      >Webhook 백업</button>
    </div>
    <div class="max-w-[800px] mx-auto min-w-0 w-full bg-(--surface) px-3 py-6 sm:p-8 rounded-xl shadow-[0_4px_15px_var(--shadow-color)] transition-[background-color,box-shadow] duration-500">
      <h1
        @dblclick="editTitle"
        id="mainTitle"
        class="text-center text-(--text-primary) border-b-2 border-(--text-primary) pb-4 mb-8 text-3xl cursor-pointer transition-colors rounded-lg hover:bg-(--background)"
      >{{ appTitle }}</h1>

      <div
        id="tabsContainer"
        class="flex items-center gap-1.5 border-b border-(--border-color) mb-5 pb-2.5 overflow-x-auto"
      >
        <div
          v-for="tab in sortedTabs"
          :key="tab.id"
          class="flex items-center gap-2 px-4 py-2 rounded-t-lg cursor-grab select-none whitespace-nowrap border border-transparent border-b-0 transition-all active:cursor-grabbing"
          :class="[
            tab.id === currentTabId
              ? 'bg-(--surface) text-(--primary-color) border border-(--border-color) border-b border-(--surface) translate-y-px font-bold'
              : 'bg-(--control-muted) text-(--text-secondary) hover:bg-(--control-muted-hover)',
            { 'opacity-50 bg-(--drag-tint) rotate-[5deg] z-[1000]': tab.id === draggedTabId },
            { 'border-l-[3px] border-l-(--primary-color) bg-(--row-progress-bg)': tab.id === dragOverTabId && tab.id !== currentTabId }
          ]"
          :draggable="true"
          @dragstart="handleTabDragStart($event, tab.id)"
          @dragend="handleTabDragEnd"
          @dragover.prevent="handleTabDragOver($event, tab.id)"
          @dragleave="handleTabDragLeave($event, tab.id)"
          @drop.prevent="handleTabDrop($event, tab.id)"
          @click="switchTab(tab.id)"
        >
          <span @dblclick.stop="renameTab(tab)">{{ tab.name }}</span>
          <button
            type="button"
            class="bg-transparent border-none text-(--text-secondary) text-xl cursor-pointer p-0 px-1 rounded-full hover:text-(--error) hover:bg-(--control-muted)"
            @click.stop="deleteTab(tab.id)"
          >×</button>
        </div>
        <button
          id="addTabBtn"
          type="button"
          @click="addNewTab"
          class="w-8 h-8 flex items-center justify-center rounded-full border-none bg-(--success) text-(--background) text-xl font-semibold cursor-pointer ml-2.5 shadow-sm hover:opacity-90"
        >+</button>
      </div>

      <div class="flex justify-between items-center mb-6 gap-2.5 flex-wrap">
        <button
          type="button"
          class="py-2.5 px-5 bg-(--primary-color) text-white border-none rounded-lg cursor-pointer text-base transition-colors shadow-md hover:bg-(--primary-dark) whitespace-nowrap"
          @click="openMarkdownModal"
        >할 일 추가</button>
        <button
          type="button"
          class="py-2.5 px-5 bg-(--primary-color) text-white border-none rounded-lg cursor-pointer text-base transition-colors shadow-md hover:bg-(--primary-dark) whitespace-nowrap"
          @click="exportTodos"
        >할일 목록 수정 및 내보내기</button>
        <button
          type="button"
          class="py-2.5 px-5 bg-(--primary-color) text-white border-none rounded-lg cursor-pointer text-base transition-colors shadow-md hover:bg-(--primary-dark) whitespace-nowrap"
          @click="resetAllTodosToNotStarted"
        >모두 시작전으로</button>
        <button
          type="button"
          class="py-2.5 px-5 bg-(--primary-color) text-white border-none rounded-lg cursor-pointer text-base transition-colors shadow-md hover:bg-(--primary-dark) whitespace-nowrap"
          @click="deleteCompletedTodos"
        >완료항목 삭제</button>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="할일 검색..."
          aria-label="할일 검색"
          class="flex-grow min-w-[200px] py-3 px-3 border border-(--border-color) rounded-lg text-base bg-(--surface) text-(--text-primary) shadow-[inset_0_1px_3px_rgba(0,0,0,0.08)] focus:outline-none focus:border-(--primary-color)"
        />
      </div>

      <ul id="todoList" class="list-none min-w-0 w-full p-0" v-if="displayedTodos.length > 0">
        <TodoItem v-for="todo in displayedTodoTree" :key="todo.id" :todo="todo" :collapsed-subtasks="collapsedSubtasks" :drag-over-todo-id="dragOverTodoId"
          @toggle-state="handleStateChange" @add-subtask="addSubtask" @delete-todo="deleteTodo"
          @edit-text="editTodoText" @toggle-collapse="toggleSubtaskCollapse" @drag-start="handleTodoDragStart"
          @drag-end="handleTodoDragEnd" @drag-over="handleTodoDragOver" @drag-leave="handleTodoDragLeave"
          @drop="handleTodoDrop" />
      </ul>
      <div v-else class="text-center text-(--text-secondary) py-10 px-5 text-lg">
        <template v-if="searchQuery">
          '{{ searchQuery }}'에 대한 검색 결과가 없습니다.
        </template>
        <template v-else-if="currentTabId">
          할일 목록이 없습니다.<br />'할 일 추가' 버튼으로 목록을추가하세요.
        </template>
        <template v-else>
          탭을 선택하거나 '+' 버튼을 눌러 새 탭을 만드세요.
        </template>
      </div>
    </div>

    <!-- Markdown Import Modal -->
    <dialog
      ref="markdownModal"
      class="border-none rounded-xl p-8 shadow-[0_8px_25px_rgba(0,0,0,0.2)] w-[90%] max-w-[600px] bg-(--surface) text-(--text-primary) max-h-[80vh] overflow-y-auto fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 m-0 [&[open]]:flex [&[open]]:flex-col [&[open]]:gap-2.5 [&::backdrop]:bg-black/50 [&::backdrop]:backdrop-blur-[5px]"
    >
      <h2 class="mt-0 text-(--text-primary) text-center">새 할 일 추가</h2>
      <p
        class="m-0 mb-2 text-[0.85em] text-(--text-secondary) flex flex-wrap items-baseline justify-center gap-x-1.5 gap-y-1 [&_mark]:inline-block [&_mark]:px-1.5 [&_mark]:py-0.5 [&_mark]:mx-0.5 [&_mark]:font-sans [&_mark]:text-sm [&_mark]:font-semibold [&_mark]:leading-snug [&_mark]:text-(--text-primary) [&_mark]:bg-(--control-muted) [&_mark]:border [&_mark]:border-(--border-color) [&_mark]:rounded [&_mark]:shadow-sm"
        title="Ctrl+Enter: 불러오기 · Tab/Shift+Tab: 들여쓰기 · Alt+↑/↓: 줄 순서"
      >
        <span class="whitespace-nowrap"><mark>Ctrl</mark>+<mark>Enter</mark>: 불러오기</span>
        <span class="shrink-0 text-(--text-secondary)">·</span>
        <span class="whitespace-nowrap"><mark>Tab</mark> / <mark>Shift</mark>+<mark>Tab</mark>: 들여쓰기</span>
        <span class="shrink-0 text-(--text-secondary)">·</span>
        <span class="whitespace-nowrap"><mark>Alt</mark>+<mark>↑</mark> / <mark>Alt</mark>+<mark>↓</mark>: 줄 순서 이동</span>
      </p>
      <textarea
        ref="modalMarkdownInput"
        v-model="markdownInput"
        class="w-full p-3 border border-(--border-color) rounded-lg text-base box-border min-h-[300px] resize-y font-mono bg-(--surface) text-(--text-primary)"
        placeholder="여기에 할일 목록을 마크다운 형식으로 입력하세요.&#10;들여쓰기를 사용하여 하위 작업을 만들 수 있습니다."
        title="Ctrl+Enter: 불러오기 · Tab/Shift+Tab: 들여쓰기 · Alt+↑/↓: 줄 순서"
        @keydown="handleMarkdownKeydown"
      ></textarea>
      <div class="flex justify-end gap-2.5 mt-2.5">
        <button type="button" class="py-2.5 px-5 rounded-lg cursor-pointer text-base transition-colors shadow-[0_2px_5px_rgba(0,0,0,0.1)] border-none bg-green-600 text-white hover:bg-[#218838]" @click="loadTodosFromMarkdown" id="confirmLoadBtn">불러오기</button>
        <button type="button" class="py-2.5 px-5 rounded-lg cursor-pointer text-base transition-colors shadow-[0_2px_5px_rgba(0,0,0,0.1)] border-none bg-red-600 text-white hover:bg-[#c82333]" @click="closeMarkdownModal" id="closeModalBtn">취소</button>
      </div>
    </dialog>

    <!-- Export Todos Modal (진행상황 포함 마크다운, 편집 후 적용 가능) -->
    <dialog
      ref="exportModal"
      class="border-none rounded-xl p-8 shadow-[0_8px_25px_rgba(0,0,0,0.2)] w-[90%] max-w-[600px] bg-(--surface) text-(--text-primary) max-h-[80vh] overflow-y-auto fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 m-0 [&[open]]:flex [&[open]]:flex-col [&[open]]:gap-2.5 [&::backdrop]:bg-black/50 [&::backdrop]:backdrop-blur-[5px]"
    >
      <h2 class="mt-0 text-(--text-primary) text-center">할일 목록 수정 및 내보내기</h2>
      <p class="[&_code]:font-mono [&_code]:bg-(--control-muted) [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[0.9em] [&_code]:text-(--text-primary)">진행상황 포함 마크다운: <code>- [ ]</code> 시작전, <code>- [o]</code> 진행중, <code>- [x]</code> 완료. 내용을 수정한 뒤 적용할 수 있습니다.</p>
      <p
        class="m-0 mb-2 text-[0.85em] text-(--text-secondary) [&_mark]:inline-block [&_mark]:px-1.5 [&_mark]:py-0.5 [&_mark]:mx-0.5 [&_mark]:font-sans [&_mark]:text-sm [&_mark]:font-semibold [&_mark]:leading-snug [&_mark]:text-(--text-primary) [&_mark]:bg-(--control-muted) [&_mark]:border [&_mark]:border-(--border-color) [&_mark]:rounded [&_mark]:shadow-sm"
        title="Ctrl+Enter: 편집 내용 적용 · Esc: 닫기 · Tab/Shift+Tab: 들여쓰기 · Alt+↑/↓: 줄 이동 · Ctrl+Shift+K/Ctrl+D: 줄 삭제"
      >
        <mark>Ctrl</mark>+<mark>Enter</mark>: 적용 ·
        <mark>Esc</mark>: 닫기 ·
        <mark>Tab</mark> / <mark>Shift</mark>+<mark>Tab</mark>: 들여쓰기 ·
        <mark>Alt</mark>+<mark>↑</mark> / <mark>Alt</mark>+<mark>↓</mark>: 줄 이동 ·
        <mark>Ctrl</mark>+<mark>Shift</mark>+<mark>K</mark> / <mark>Ctrl</mark>+<mark>D</mark>: 줄 삭제
      </p>
      <textarea
        ref="exportTextarea"
        v-model="exportText"
        class="w-full p-3 border border-(--border-color) rounded-lg text-base box-border min-h-[300px] resize-y font-mono bg-(--surface) text-(--text-primary)"
        placeholder="내보낼 할일 목록이 여기에 표시됩니다."
        title="Ctrl+Enter: 편집 내용 적용 · Esc: 닫기 · Tab/Shift+Tab: 들여쓰기 · Alt+↑/↓: 줄 이동 · Ctrl+Shift+K/Ctrl+D: 줄 삭제"
        @keydown="handleExportTextareaKeydown"
      ></textarea>
      <div class="flex justify-end gap-2.5 mt-2.5">
        <button type="button" class="py-2.5 px-5 rounded-lg cursor-pointer text-base transition-colors shadow-[0_2px_5px_rgba(0,0,0,0.1)] border-none bg-blue-600 text-white hover:bg-[#0056b3]" @click="applyExportMarkdown">편집 내용 적용</button>
        <button type="button" class="py-2.5 px-5 rounded-lg cursor-pointer text-base transition-colors shadow-[0_2px_5px_rgba(0,0,0,0.1)] border-none bg-gray-600 text-white hover:bg-gray-700" @click="copyToClipboard">클립보드에 복사</button>
        <button type="button" class="py-2.5 px-5 rounded-lg cursor-pointer text-base transition-colors shadow-[0_2px_5px_rgba(0,0,0,0.1)] border-none bg-gray-500 text-white hover:bg-gray-600" @click="closeExportModal">닫기</button>
      </div>
    </dialog>

    <!-- Custom Interaction Modal -->
    <dialog
      ref="customModal"
      class="border-none rounded-xl p-8 shadow-[0_8px_25px_rgba(0,0,0,0.2)] w-[90%] max-w-[600px] bg-(--surface) text-(--text-primary) max-h-[80vh] overflow-y-auto fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 m-0 [&[open]]:flex [&[open]]:flex-col [&[open]]:gap-2.5 [&::backdrop]:bg-black/50 [&::backdrop]:backdrop-blur-[5px]"
    >
      <h3>{{ customModalTitle }}</h3>
      <p>{{ customModalMessage }}</p>
      <input
        v-if="customModalType === 'prompt'"
        type="text"
        ref="customModalInput"
        v-model="customModalInputValue"
        class="w-full p-3 border border-(--border-color) rounded-lg bg-(--surface) text-(--text-primary)"
        @keydown.enter="handleCustomModalOk"
      />
      <div class="flex justify-end gap-2.5 mt-2.5">
        <button v-if="showCustomModalOk" ref="customModalOkBtn" type="button" class="py-2.5 px-5 rounded-lg cursor-pointer text-base transition-colors shadow-[0_2px_5px_rgba(0,0,0,0.1)] border-none bg-green-600 text-white hover:bg-[#218838]" @click="handleCustomModalOk">
          {{ customModalOkText }}
        </button>
        <button v-if="showCustomModalCancel" type="button" class="py-2.5 px-5 rounded-lg cursor-pointer text-base transition-colors shadow-[0_2px_5px_rgba(0,0,0,0.1)] border-none bg-red-600 text-white hover:bg-[#c82333]" @click="handleCustomModalCancel">
          {{ customModalCancelText }}
        </button>
      </div>
    </dialog>

    <TodoWebhookBackupModal
      ref="todoWebhookModalRef"
      :backup-context="todoBackupContext"
      @synced="refreshStateAfterSync"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import TodoItem from '@/views/todo/TodoItem.vue';
import TodoWebhookBackupModal from '@/views/todo/TodoWebhookBackupModal.vue';
import {
  TODO_WEBHOOK_URL_KEY,
  restoreTodoFromWebhook,
  tryKeepaliveTodoBackupOnPageHide,
} from '@/views/todo/todoDiscordWebhook.js';

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
const todoWebhookModalRef = ref(null);
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
const dragOverTabId = ref(null);
const draggedTodoId = ref(null);
const dragOverTodoId = ref(null);

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
  const plain = JSON.parse(JSON.stringify(item));
  return new Promise((resolve) => {
    db.value.transaction(storeName, 'readwrite').objectStore(storeName).put(plain).onsuccess = resolve;
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
  const value = customModalType.value === 'prompt' ? customModalInputValue.value : true;
  if (customModal.value) {
    customModal.value.close();
  }
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

const readTodoLocalState = () => ({
  todoAppTitle: localStorage.getItem('todoAppTitle') || undefined,
  currentTabId: localStorage.getItem('currentTabId') || undefined,
});

const todoBackupContext = computed(() => ({
  db: db.value,
  getFromDb,
  tabStore: TAB_STORE_NAME,
  todoStore: TODO_STORE_NAME,
  putInDb,
  readTodoLocalState,
}));

const openTodoWebhookModal = () => {
  todoWebhookModalRef.value?.showModal();
};

const refreshStateAfterSync = async () => {
  const savedTitle = localStorage.getItem('todoAppTitle');
  if (savedTitle) {
    appTitle.value = savedTitle;
    document.title = savedTitle;
  } else {
    appTitle.value = '임시 할일 리스트';
    document.title = 'Todo';
  }
  let allTabs = await getFromDb(TAB_STORE_NAME);
  if (allTabs.length === 0) {
    const defaultTab = { id: `tab-${Date.now()}`, name: '기본 목록', order: 0 };
    await putInDb(TAB_STORE_NAME, defaultTab);
    allTabs = await getFromDb(TAB_STORE_NAME);
  }
  let lastTabId = localStorage.getItem('currentTabId');
  if (!lastTabId || !allTabs.some(t => t.id === lastTabId)) {
    lastTabId = allTabs[0].id;
  }
  await switchTab(lastTabId);
};

const tryAutoRestoreFromWebhook = async () => {
  if (!db.value) return false;
  if (!localStorage.getItem(TODO_WEBHOOK_URL_KEY)) return false;
  const r = await restoreTodoFromWebhook(
    {
      db: db.value,
      getFromDb,
      tabStore: TAB_STORE_NAME,
      todoStore: TODO_STORE_NAME,
      putInDb,
    },
    { replace: true, silent: true },
  );
  if (r.ok) {
    await refreshStateAfterSync();
    return true;
  }
  return false;
};

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
};

const handleTabDragEnd = () => {
  draggedTabId.value = null;
  dragOverTabId.value = null;
};

const handleTabDragOver = (e, tabId) => {
  if (tabId !== draggedTabId.value) {
    dragOverTabId.value = tabId;
  }
};

const handleTabDragLeave = () => {
  dragOverTabId.value = null;
};

const handleTabDrop = async (e, targetTabId) => {
  e.preventDefault();
  dragOverTabId.value = null;
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
  const trimmed = newText != null ? String(newText).trim() : '';
  if (trimmed === '' || trimmed === todo.text) return;
  const updated = {
    id: todo.id,
    text: trimmed,
    state: todo.state,
    parentId: todo.parentId ?? null,
    tabId: todo.tabId,
    order: todo.order ?? 0
  };
  await putInDb(TODO_STORE_NAME, updated);
  await renderCurrentTodos();
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

/**
 * Alt+↑ / Alt+↓ 로 선택된 줄(들) 위치 이동. 처리하면 true.
 */
const tryMoveLinesWithAltArrows = (e, textRef, textarea) => {
  if (!e.altKey || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) {
    return false;
  }
  e.preventDefault();
  const value = textRef.value;
  const lines = value.split('\n');
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const startLine = getLineIndexFromOffset(value, start);
  const endLine = getLineIndexFromOffset(value, end > 0 ? end - 1 : 0);
  const lineCount = endLine - startLine + 1;
  if (lines.length === 0) {
    return true;
  }

  if (e.key === 'ArrowUp') {
    if (startLine === 0) return true;
    const block = lines.splice(startLine, lineCount);
    lines.splice(startLine - 1, 0, ...block);
  } else {
    if (endLine >= lines.length - 1) return true;
    const block = lines.splice(startLine, lineCount);
    lines.splice(startLine + 1, 0, ...block);
  }

  const newValue = lines.join('\n');
  textRef.value = newValue;
  const newStartLine = e.key === 'ArrowUp' ? startLine - 1 : startLine + 1;
  const newEndLine = newStartLine + lineCount - 1;
  nextTick(() => {
    if (!textarea || !textarea.isConnected) return;
    textarea.selectionStart = getOffsetOfLineStart(newValue, newStartLine);
    textarea.selectionEnd = getOffsetOfLineStart(newValue, newEndLine + 1);
    textarea.focus();
  });
  return true;
};

const EXPORT_INDENT = '  ';

const handleExportTextareaKeydown = (e) => {
  const textarea = exportTextarea.value;
  if (!textarea) return;

  if (e.key === 'Escape') {
    e.preventDefault();
    closeExportModal();
    return;
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    applyExportMarkdown();
    return;
  }

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

  if (tryMoveLinesWithAltArrows(e, exportText, textarea)) {
    return;
  }
};

const handleMarkdownKeydown = (e) => {
  const textarea = e.target;
  if (tryMoveLinesWithAltArrows(e, markdownInput, textarea)) {
    return;
  }
  if (e.key === 'Tab') {
    e.preventDefault();
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

const handleTodoDragEnd = () => {
  draggedTodoId.value = null;
  dragOverTodoId.value = null;
};

const handleTodoDragOver = (e, todoId) => {
  if (todoId !== draggedTodoId.value) {
    dragOverTodoId.value = todoId;
  }
};

const handleTodoDragLeave = () => {
  dragOverTodoId.value = null;
};

const handleTodoDrop = async (e, targetTodoId) => {
  e.preventDefault();
  dragOverTodoId.value = null;
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
    await openDatabase();
    if (await tryAutoRestoreFromWebhook()) {
      return;
    }
    const savedTitle = localStorage.getItem('todoAppTitle');
    if (savedTitle) {
      appTitle.value = savedTitle;
      document.title = savedTitle;
    } else {
      document.title = 'Todo';
    }
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

const onPageHideForWebhookBackup = () => {
  if (!db.value) return;
  tryKeepaliveTodoBackupOnPageHide(todoBackupContext.value);
};

onMounted(() => {
  window.addEventListener('pagehide', onPageHideForWebhookBackup, { capture: true });
  initializeApp();
});

onBeforeUnmount(() => {
  window.removeEventListener('pagehide', onPageHideForWebhookBackup, { capture: true });
});
</script>
