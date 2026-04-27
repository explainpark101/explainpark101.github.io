<template>
  <dialog
    ref="rootDialog"
    class="border-none rounded-xl p-8 shadow-[0_8px_25px_rgba(0,0,0,0.2)] w-[90%] max-w-[540px] bg-(--surface) text-(--text-primary) max-h-[85vh] overflow-y-auto fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 m-0 [&[open]]:flex [&[open]]:flex-col [&[open]]:gap-2.5 [&::backdrop]:bg-black/50 [&::backdrop]:backdrop-blur-[5px] z-50"
  >
    <h2 class="mt-0 text-(--text-primary) text-center">Webhook 백업</h2>
    <p class="text-sm text-(--text-secondary) m-0">
      Webhook URL이 노출되면 다른 사람이 데이터에 접근하거나 덮어쓸 수 있습니다. 비공개 채널과 전용 Webhook을 사용하세요.
    </p>
    <label class="text-sm font-medium" for="todoWebhookUrl">Webhook URL</label>
    <input
      id="todoWebhookUrl"
      v-model="urlInput"
      type="url"
      autocomplete="off"
      class="w-full p-3 border border-(--border-color) rounded-lg bg-(--surface) text-(--text-primary) text-sm box-border"
      placeholder="https://discord.com/api/webhooks/..."
    />
    <div class="flex flex-wrap gap-2">
      <button
        type="button"
        class="py-2 px-4 rounded-lg border-none text-white text-sm cursor-pointer bg-blue-600 hover:bg-blue-700"
        @click="saveUrl"
      >URL 저장</button>
    </div>
    <label class="text-sm font-medium" for="todoRootMessageId">루트 메시지 ID</label>
    <p class="text-xs text-(--text-secondary) m-0 -mt-1">
      최신 백업을 가리키는 Discord 메시지(snowflake)입니다. 백업·복원·루트 갱신에 사용됩니다. 비우면 ID가 제거됩니다.
    </p>
    <input
      id="todoRootMessageId"
      v-model="rootIdInput"
      type="text"
      inputmode="numeric"
      autocomplete="off"
      class="w-full p-3 border border-(--border-color) rounded-lg bg-(--surface) text-(--text-primary) text-sm font-mono box-border"
      placeholder="예: 1234567890123456789 (17~20자리)"
    />
    <div class="flex flex-wrap gap-2">
      <button
        type="button"
        class="py-2 px-4 rounded-lg border-none text-white text-sm cursor-pointer bg-(--primary-color) hover:bg-(--primary-dark) disabled:opacity-50"
        :disabled="loading"
        @click="saveRootId"
      >루트 ID 저장</button>
      <button
        type="button"
        class="py-2 px-4 rounded-lg border border-(--border-color) text-sm cursor-pointer bg-(--background) text-(--text-primary) disabled:opacity-50"
        :disabled="loading"
        @click="clearRoot"
      >루트 ID 비우기</button>
    </div>
    <hr class="w-full border-(--border-color)" />
    <div class="flex flex-wrap gap-2">
      <button
        type="button"
        class="py-2 px-4 rounded-lg border-none text-white text-sm cursor-pointer bg-green-600 hover:bg-[#218838] disabled:opacity-50"
        :disabled="loading"
        @click="doBackup"
      >지금 백업</button>
      <button
        type="button"
        class="py-2 px-4 rounded-lg border-none text-white text-sm cursor-pointer bg-(--primary-color) disabled:opacity-50"
        :disabled="loading"
        @click="() => doRestore(true)"
      >클라우드에서 복원 (덮어쓰기)</button>
      <button
        type="button"
        class="py-2 px-4 rounded-lg border border-(--border-color) text-sm cursor-pointer disabled:opacity-50"
        :disabled="loading"
        @click="() => doRestore(false)"
      >병합</button>
    </div>
    <p
      class="min-h-[1.5em] text-sm m-0"
      :class="statusIsError ? 'text-(--error)' : 'text-(--text-secondary)'"
    >{{ statusLine }}</p>
    <div class="flex justify-end">
      <button
        type="button"
        class="py-2.5 px-5 rounded-lg cursor-pointer text-base border-none bg-gray-500 text-white hover:bg-gray-600"
        @click="close"
      >닫기</button>
    </div>
  </dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {
  TODO_WEBHOOK_URL_KEY,
  TODO_WEBHOOK_ROOT_KEY,
  performTodoWebhookBackup,
  restoreTodoFromWebhook,
} from './todoDiscordWebhook.js';

const props = defineProps({
  backupContext: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['synced', 'error']);

const rootDialog = ref(null);
const urlInput = ref('');
const rootIdInput = ref('');
const statusLine = ref('');
const statusIsError = ref(false);
const loading = ref(false);

const syncStateFromStorage = () => {
  urlInput.value = localStorage.getItem(TODO_WEBHOOK_URL_KEY) || '';
  rootIdInput.value = localStorage.getItem(TODO_WEBHOOK_ROOT_KEY) || '';
};

onMounted(() => {
  syncStateFromStorage();
});

function setStatus(msg, isError = false) {
  statusLine.value = msg;
  statusIsError.value = isError;
}

function showModal() {
  syncStateFromStorage();
  if (rootDialog.value) {
    rootDialog.value.showModal();
  }
}

function close() {
  if (rootDialog.value) {
    rootDialog.value.close();
  }
}

defineExpose({ showModal, close });

function saveUrl() {
  const t = (urlInput.value || '').trim();
  if (t) {
    localStorage.setItem(TODO_WEBHOOK_URL_KEY, t);
  } else {
    localStorage.removeItem(TODO_WEBHOOK_URL_KEY);
  }
  syncStateFromStorage();
  setStatus('Webhook URL을 저장했습니다.');
}

function clearRoot() {
  localStorage.removeItem(TODO_WEBHOOK_ROOT_KEY);
  rootIdInput.value = '';
  setStatus('루트 ID를 비웠습니다. 다음 백업 시 필요하면 새 루트가 만들어집니다.');
}

function saveRootId() {
  const raw = (rootIdInput.value || '').trim();
  if (!raw) {
    localStorage.removeItem(TODO_WEBHOOK_ROOT_KEY);
    rootIdInput.value = '';
    setStatus('루트 ID를 비웠습니다. 다음 백업 시 필요하면 새 루트가 만들어집니다.');
    return;
  }
  if (!/^\d{17,20}$/.test(raw)) {
    setStatus('루트 메시지 ID는 17~20자리 숫자(눈송이)만 입력할 수 있습니다.', true);
    return;
  }
  localStorage.setItem(TODO_WEBHOOK_ROOT_KEY, raw);
  rootIdInput.value = raw;
  setStatus('루트 메시지 ID를 저장했습니다. 백업/복원 시 이 값이 사용됩니다.');
}

async function doBackup() {
  if (!localStorage.getItem(TODO_WEBHOOK_URL_KEY)) {
    setStatus('먼저 Webhook URL을 저장하세요.', true);
    return;
  }
  loading.value = true;
  setStatus('백업 중…');
  try {
    const r = await performTodoWebhookBackup(props.backupContext, { reason: 'manual' });
    if (r.ok) {
      setStatus('백업이 완료되었습니다.');
      syncStateFromStorage();
      emit('synced');
    } else {
      setStatus(r.error || '백업에 실패했습니다.', true);
      emit('error', r);
    }
  } catch (e) {
    setStatus(e && e.message ? e.message : String(e), true);
    emit('error', e);
  } finally {
    loading.value = false;
  }
}

async function doRestore(replace) {
  if (!localStorage.getItem(TODO_WEBHOOK_URL_KEY)) {
    setStatus('먼저 Webhook URL을 저장하세요.', true);
    return;
  }
  loading.value = true;
  setStatus('복원 중…');
  try {
    const r = await restoreTodoFromWebhook(props.backupContext, { replace, url: undefined });
    if (r.ok) {
      setStatus('복원이 완료되었습니다.');
      syncStateFromStorage();
      emit('synced');
    } else if (r.reason === 'no_root' || r.reason === 'no_url') {
      setStatus('복원하려면 루트 메시지가 있어야 합니다. 먼저 백업을 한 번 성공시키세요.', true);
    } else {
      setStatus(r.error || `복원 실패: ${r.reason || '알 수 없음'}`, true);
    }
  } catch (e) {
    setStatus(e && e.message ? e.message : String(e), true);
  } finally {
    loading.value = false;
  }
}
</script>
