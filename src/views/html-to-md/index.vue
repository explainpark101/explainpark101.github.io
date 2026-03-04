<template>
  <div class="min-h-screen w-full bg-(--background) text-(--text-primary) transition-[background-color,color] duration-500">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <router-link
        to="/"
        class="home-btn mb-8 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-(--primary-color)/10 text-(--primary-color) font-medium no-underline transition-all hover:bg-(--primary-color)/20 w-fit"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9,22 9,12 15,12 15,22"/>
        </svg>
        앱 목록
      </router-link>
      <!-- Header -->
      <header class="mb-10">
        <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-(--primary-color)">
          HTML <span class="text-(--text-secondary)">to</span> MD
        </h1>
        <p class="mt-2 text-(--text-secondary) text-base sm:text-lg">
          Vue 3 기반의 고성능 태그 변환 도구입니다.
        </p>
        <div class="mt-6 flex flex-wrap items-center gap-3">
          <button
            class="px-4 py-2.5 text-sm font-semibold rounded-xl border border-(--border-color) bg-(--surface) text-(--text-primary) transition-all hover:opacity-90 active:scale-[0.98]"
            @click="clearAll"
          >
            초기화
          </button>
          <button
            class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-(--primary-color) text-white transition-all hover:opacity-90 active:scale-[0.98] shadow-lg shadow-black/10"
            @click="copyToClipboard"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
            </svg>
            결과 복사
          </button>
        </div>
      </header>

      <!-- Editor Section -->
      <main class="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-8">
        <!-- HTML Input -->
        <section class="flex flex-col min-w-0">
          <div class="flex items-center justify-between mb-2">
            <label class="text-xs font-bold uppercase tracking-widest text-(--text-secondary)">
              HTML Input
            </label>
            <span class="text-xs text-(--text-secondary)/80 tabular-nums">
              {{ htmlInput.length }} chars
            </span>
          </div>
          <textarea
            v-model="htmlInput"
            class="textarea-input w-full min-h-[360px] sm:min-h-[420px] p-5 sm:p-6 rounded-xl border-2 border-(--border-color) bg-(--surface) text-(--text-primary) font-mono text-sm sm:text-[15px] leading-relaxed placeholder:text-(--text-secondary)/60 focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20 outline-none transition-all resize-y [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-(--border-color)"
            placeholder="변환할 HTML 코드를 입력하세요... (Table 지원 가능)"
          ></textarea>
        </section>

        <!-- Markdown Output -->
        <section class="flex flex-col min-w-0">
          <div class="flex items-center justify-between mb-2">
            <label class="text-xs font-bold uppercase tracking-widest text-(--text-secondary)">
              Markdown Output
            </label>
            <button
              v-if="markdownOutput"
              type="button"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-(--primary-color)/15 text-(--primary-color) transition-colors hover:bg-(--primary-color)/25"
              @click="copyToClipboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
              </svg>
              복사
            </button>
          </div>
          <textarea
            :value="markdownOutput"
            readonly
            class="textarea-output w-full min-h-[360px] sm:min-h-[420px] p-5 sm:p-6 rounded-xl border-2 border-(--border-color) bg-(--surface) text-(--text-primary) font-mono text-sm sm:text-[15px] leading-relaxed placeholder:text-(--text-secondary)/60 outline-none transition-colors [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-(--border-color)"
            placeholder="마크다운 결과가 여기에 나타납니다..."
          ></textarea>
        </section>
      </main>

      <!-- Toast Message -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-3"
        leave-active-class="transition duration-300 ease-in"
        leave-to-class="opacity-0 translate-y-3"
      >
        <div
          v-if="showToast"
          class="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full text-sm font-medium bg-(--text-primary) text-(--background) shadow-2xl transition-all duration-300"
        >
          클립보드에 복사되었습니다! ✨
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const STORAGE_KEY = 'html-to-md-input';
const DEFAULT_INPUT =
  '<h1>Vue 3 변환기</h1>\n<p>HTML을 마크다운으로 <strong>쉽게</strong> 바꿔보세요.</p>\n<table>\n  <thead>\n    <tr><th>기능</th><th>상태</th></tr>\n  </thead>\n  <tbody>\n    <tr><td>Table 지원</td><td>✅ 완료</td></tr>\n    <tr><td>Vue 3 사용</td><td>✅ 완료</td></tr>\n  </tbody>\n</table>';

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ?? DEFAULT_INPUT;
  } catch {
    return DEFAULT_INPUT;
  }
}

const htmlInput = ref(loadFromStorage());
const showToast = ref(false);

watch(
  htmlInput,
  (val) => {
    try {
      localStorage.setItem(STORAGE_KEY, val);
    } catch {
      // ignore
    }
  },
  { deep: true }
);

function processTable(tableNode) {
  const rows = Array.from(tableNode.querySelectorAll('tr'));
  if (rows.length === 0) return '';

  let tableMd = '';
  let maxCols = 0;

  const tableData = rows.map((row) => {
    const cells = Array.from(row.querySelectorAll('th, td')).map((cell) => {
      return convertNodes(cell, '').replace(/\|/g, '\\|').trim();
    });
    maxCols = Math.max(maxCols, cells.length);
    return cells;
  });

  tableData.forEach((row, index) => {
    tableMd += `| ${row.join(' | ')} ${' |'.repeat(Math.max(0, maxCols - row.length))}\n`;
    if (index === 0) {
      tableMd += `| ${Array(maxCols).fill('---').join(' | ')} |\n`;
    }
  });

  return tableMd;
}

function convertNodes(node, indent) {
  let markdown = '';
  const children = Array.from(node.childNodes);

  children.forEach((child) => {
    if (child.nodeType === 3) {
      const text = child.textContent;
      markdown += text.replace(/\s+/g, ' ');
    } else if (child.nodeType === 1) {
      const tag = child.tagName.toLowerCase();

      switch (tag) {
        case 'h1':
          markdown += `\n# ${convertNodes(child, '')}\n`;
          break;
        case 'h2':
          markdown += `\n## ${convertNodes(child, '')}\n`;
          break;
        case 'h3':
          markdown += `\n### ${convertNodes(child, '')}\n`;
          break;
        case 'h4':
          markdown += `\n#### ${convertNodes(child, '')}\n`;
          break;
        case 'h5':
          markdown += `\n##### ${convertNodes(child, '')}\n`;
          break;
        case 'h6':
          markdown += `\n###### ${convertNodes(child, '')}\n`;
          break;
        case 'p':
          markdown += `\n${convertNodes(child, '')}\n`;
          break;
        case 'br':
          markdown += '\n';
          break;
        case 'strong':
        case 'b':
          markdown += `**${convertNodes(child, '')}**`;
          break;
        case 'em':
        case 'i':
          markdown += `*${convertNodes(child, '')}*`;
          break;
        case 'code':
          if (child.parentNode.tagName.toLowerCase() === 'pre') {
            markdown += convertNodes(child, '');
          } else {
            markdown += ` \`${convertNodes(child, '')}\` `;
          }
          break;
        case 'pre':
          markdown += `\n\`\`\`\n${convertNodes(child, '')}\n\`\`\`\n`;
          break;
        case 'blockquote':
          markdown += `\n> ${convertNodes(child, '').trim().replace(/\n/g, '\n> ')}\n`;
          break;
        case 'ul':
        case 'ol':
          markdown += `\n${convertNodes(child, indent)}\n`;
          break;
        case 'li': {
          const prefix = child.parentNode.tagName.toLowerCase() === 'ol' ? '1. ' : '- ';
          markdown += `${indent}${prefix}${convertNodes(child, indent + '  ')}\n`;
          break;
        }
        case 'a':
          markdown += `[${convertNodes(child, '')}](${child.getAttribute('href') || ''})`;
          break;
        case 'img':
          markdown += `![${child.getAttribute('alt') || ''}](${child.getAttribute('src') || ''})`;
          break;
        case 'table':
          markdown += `\n\n${processTable(child)}\n`;
          break;
        default:
          markdown += convertNodes(child, indent);
      }
    }
  });

  return markdown;
}

const markdownOutput = computed(() => {
  if (!htmlInput.value.trim()) return '';

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlInput.value, 'text/html');
  const result = convertNodes(doc.body, '');
  return result.replace(/\n\n\n+/g, '\n\n').trim();
});

function clearAll() {
  htmlInput.value = '';
}

async function copyToClipboard() {
  if (!markdownOutput.value) return;

  try {
    await navigator.clipboard.writeText(markdownOutput.value);
    showToast.value = true;
    setTimeout(() => (showToast.value = false), 2500);
  } catch {
    const el = document.createElement('textarea');
    el.value = markdownOutput.value;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    showToast.value = true;
    setTimeout(() => (showToast.value = false), 2500);
  }
}
</script>
