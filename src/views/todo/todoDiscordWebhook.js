/**
 * Discord Webhook-based backup/restore for the Todo app (localStorage + IndexedDB).
 * Pattern: root message content holds the latest backup message id (see Discord-Webhook-Backup skill).
 */

export const TODO_WEBHOOK_URL_KEY = 'todo_webhook_url';
export const TODO_WEBHOOK_ROOT_KEY = 'todo_webhook_root_message_id';

const SNAPSHOT_VERSION = 1;

function normalizeWebhookBase(href) {
  if (!href || typeof href !== 'string') return '';
  const trimmed = href.trim();
  if (!trimmed) return '';
  const u = new URL(trimmed);
  if (!u.pathname.includes('/webhooks/')) {
    return '';
  }
  return `${u.origin}${u.pathname}`.replace(/\/$/, '');
}

function messageUrlFromUserWebhook(webhookUserUrl, messageId) {
  const u = new URL(webhookUserUrl.trim());
  const sp = u.search;
  u.search = '';
  const base = u.toString().replace(/\/$/, '');
  return `${base}/messages/${messageId}${sp}`;
}

function executeUrlFromUserWebhook(webhookUserUrl) {
  const u = new URL(webhookUserUrl.trim());
  u.searchParams.set('wait', 'true');
  return u.toString();
}

export function parseRootMessageId(content) {
  if (content == null || typeof content !== 'string') return null;
  const m = String(content).trim().match(/(\d{17,20})/);
  return m ? m[1] : null;
}

async function fetchJsonOrThrow(res) {
  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }
  if (!res.ok) {
    const err = new Error(
      (data && data.message) || `HTTP ${res.status} ${res.statusText}`,
    );
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

/**
 * @param {string} webhookUserUrl
 * @param {string} messageId
 */
export async function getWebhookMessage(webhookUserUrl, messageId) {
  const url = messageUrlFromUserWebhook(webhookUserUrl, messageId);
  const res = await fetch(url, { method: 'GET' });
  return fetchJsonOrThrow(res);
}

/**
 * @param {string} webhookUserUrl
 * @param {string} messageId
 * @param {object} body
 */
export async function patchWebhookMessage(webhookUserUrl, messageId, body) {
  const url = messageUrlFromUserWebhook(webhookUserUrl, messageId);
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return fetchJsonOrThrow(res);
}

/**
 * @param {string} webhookUserUrl
 * @param {Blob|File} file
 * @param {string} contentLine
 * @param {string} [filename]
 */
export async function postBackupMessage(webhookUserUrl, file, contentLine, filename) {
  const label = filename || 'todo-backup.json';
  const form = new FormData();
  const payload = {
    content: contentLine,
    attachments: [{ id: 0, filename: label, description: 'ABCI Todo backup' }],
  };
  form.append('files[0]', file, label);
  form.append('payload_json', JSON.stringify(payload));
  const res = await fetch(executeUrlFromUserWebhook(webhookUserUrl), {
    method: 'POST',
    body: form,
  });
  return fetchJsonOrThrow(res);
}

/**
 * @param {string} webhookUserUrl
 * @param {string} newBackupMessageId
 */
export async function postRootPointerMessage(webhookUserUrl, newBackupMessageId) {
  const res = await fetch(executeUrlFromUserWebhook(webhookUserUrl), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: String(newBackupMessageId) }),
  });
  return fetchJsonOrThrow(res);
}

export async function buildTodoSnapshot(
  getFromDb,
  tabStore,
  todoStore,
  readTodoLocalState,
) {
  const [tabs, todos] = await Promise.all([
    getFromDb(tabStore),
    getFromDb(todoStore),
  ]);
  return {
    version: SNAPSHOT_VERSION,
    localStorage: { ...readTodoLocalState() },
    tabs: Array.isArray(tabs) ? tabs : [],
    todos: Array.isArray(todos) ? todos : [],
  };
}

/**
 * @param {IDBDatabase} db
 * @param {string} name
 */
export function clearObjectStore(db, name) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(name, 'readwrite');
    tx.objectStore(name).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function applyTodoSnapshot(
  data,
  {
    db,
    tabStore,
    todoStore,
    clearObjectStore: clearFn,
    putInDb,
  },
  replace,
) {
  if (!data || typeof data !== 'object') throw new Error('Invalid backup file.');

  if (data.version != null && data.version > SNAPSHOT_VERSION) {
    throw new Error('Backup version is newer than this app. Please update the app.');
  }

  const tabs = data.tabs;
  const todos = data.todos;
  if (!Array.isArray(tabs) || !Array.isArray(todos)) {
    throw new Error('Invalid backup: tabs and todos are required as arrays.');
  }

  if (replace) {
    await clearFn(db, tabStore);
    await clearFn(db, todoStore);
  }

  for (const tab of tabs) {
    if (tab && tab.id) await putInDb(tabStore, tab);
  }
  for (const todo of todos) {
    if (todo && todo.id) await putInDb(todoStore, todo);
  }

  if (data.localStorage && typeof data.localStorage === 'object') {
    if (data.localStorage.todoAppTitle != null) {
      localStorage.setItem('todoAppTitle', String(data.localStorage.todoAppTitle));
    }
    if (data.localStorage.currentTabId != null) {
      localStorage.setItem('currentTabId', String(data.localStorage.currentTabId));
    }
  }
}

/**
 * @param {object} context
 * @param {{ url?: string, replace: boolean, silent?: boolean }} options
 * @returns {Promise<{ ok: boolean, reason?: string, error?: string }>}
 */
export async function restoreTodoFromWebhook(context, options) {
  const url = options.url || localStorage.getItem(TODO_WEBHOOK_URL_KEY);
  const replace = options.replace;

  if (!url || !normalizeWebhookBase(url)) {
    if (!options.silent) return { ok: false, reason: 'no_url' };
    return { ok: false, reason: 'no_url' };
  }

  const rootId = localStorage.getItem(TODO_WEBHOOK_ROOT_KEY);
  if (!rootId) {
    return { ok: false, reason: 'no_root' };
  }

  try {
    let rootMsg;
    try {
      rootMsg = await getWebhookMessage(url, rootId);
    } catch (e) {
      if (e.status === 404) {
        localStorage.removeItem(TODO_WEBHOOK_ROOT_KEY);
        return { ok: false, reason: 'root_gone' };
      }
      throw e;
    }

    const latestId = parseRootMessageId(rootMsg.content);
    if (!latestId) {
      return { ok: false, reason: 'bad_root_content' };
    }

    const backupMsg = await getWebhookMessage(url, latestId);
    const a0 = backupMsg.attachments && backupMsg.attachments[0];
    if (!a0 || !a0.url) {
      return { ok: false, reason: 'no_attachment' };
    }

    const jres = await fetch(a0.url, { method: 'GET' });
    if (!jres.ok) {
      return { ok: false, reason: 'download_failed' };
    }
    const data = await jres.json();
    await applyTodoSnapshot(
      data,
      {
        db: context.db,
        tabStore: context.tabStore,
        todoStore: context.todoStore,
        clearObjectStore,
        putInDb: context.putInDb,
      },
      replace,
    );
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      reason: 'exception',
      error: e && e.message ? e.message : String(e),
    };
  }
}

/**
 * @param {object} context
 * @param {{ reason?: string } | undefined} meta
 * @param {string} [urlOverride]
 */
export async function performTodoWebhookBackup(
  context,
  meta = {},
  urlOverride = null,
) {
  const url = urlOverride || localStorage.getItem(TODO_WEBHOOK_URL_KEY);
  if (!url || !normalizeWebhookBase(url)) {
    return { ok: false, error: 'Webhook URL is not set or invalid.' };
  }

  const snapshot = await buildTodoSnapshot(
    context.getFromDb,
    context.tabStore,
    context.todoStore,
    context.readTodoLocalState,
  );

  const body = JSON.stringify(snapshot);
  const file = new File(
    [body],
    `todo-backup-${Date.now()}.json`,
    { type: 'application/json' },
  );

  const line = `Todo app backup — ${new Date().toISOString()}${
    meta && meta.reason ? ` — ${String(meta.reason)}` : ''
  }`;

  let newMsg;
  try {
    newMsg = await postBackupMessage(url, file, line, file.name);
  } catch (e) {
    return { ok: false, error: e && e.message ? e.message : String(e) };
  }

  const newId = newMsg && newMsg.id;
  if (!newId) {
    return { ok: false, error: 'No message id returned. Use ?wait=true (handled internally).' };
  }

  const root = localStorage.getItem(TODO_WEBHOOK_ROOT_KEY);
  try {
    if (root) {
      await patchWebhookMessage(url, root, { content: String(newId) });
    } else {
      const r = await postRootPointerMessage(url, newId);
      if (r && r.id) {
        localStorage.setItem(TODO_WEBHOOK_ROOT_KEY, r.id);
      } else {
        return { ok: false, error: 'Could not create root message.' };
      }
    }
  } catch (e) {
    return {
      ok: false,
      error: e && e.message ? e.message : String(e),
    };
  }

  return { ok: true, backupMessageId: newId };
}

const KEEPALIVE_MAX_BYTES = 60 * 1000;

/**
 * Fires a backup when the user leaves: uses fetch with keepalive (small payloads only).
 * @param {object} context
 * @param {string} [urlOverride]
 * @returns {void}
 */
export function tryKeepaliveTodoBackupOnPageHide(context, urlOverride) {
  const url = urlOverride || localStorage.getItem(TODO_WEBHOOK_URL_KEY);
  if (!url || !normalizeWebhookBase(url)) return;

  void (async () => {
    const snapshot = await buildTodoSnapshot(
      context.getFromDb,
      context.tabStore,
      context.todoStore,
      context.readTodoLocalState,
    );
    const raw = JSON.stringify(snapshot);
    if (raw.length > KEEPALIVE_MAX_BYTES) return;

    const file = new File(
      [raw],
      'todo-backup-exit.json',
      { type: 'application/json' },
    );
    const line = `Todo app exit — ${new Date().toISOString()}`;
    const form = new FormData();
    form.append('files[0]', file, 'todo-backup-exit.json');
    form.append(
      'payload_json',
      JSON.stringify({
        content: line,
        attachments: [
          { id: 0, filename: 'todo-backup-exit.json' },
        ],
      }),
    );
    const res = await fetch(executeUrlFromUserWebhook(url), {
      method: 'POST',
      body: form,
      keepalive: true,
    });
    if (!res.ok) return;
    const newMsg = await res.json();
    if (!newMsg || !newMsg.id) return;
    const newId = newMsg.id;
    const root = localStorage.getItem(TODO_WEBHOOK_ROOT_KEY);
    try {
      if (root) {
        await patchWebhookMessage(url, root, { content: String(newId) });
      } else {
        const r = await postRootPointerMessage(url, newId);
        if (r && r.id) localStorage.setItem(TODO_WEBHOOK_ROOT_KEY, r.id);
      }
    } catch {
      // next manual backup can fix root
    }
  })();
}

export { normalizeWebhookBase, SNAPSHOT_VERSION };
