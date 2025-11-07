<template>
  <div class="wbs-chart-app">
    <!-- 편집 툴바 -->
    <div id="edit-toolbar" class="edit-toolbar"
      :class="{ hidden: !isToolbarVisible, '-translate-x-full': !isToolbarVisible }">
      <div class="toolbar-header">
        <h2>노드 편집</h2>
        <button @click="hideEditToolbar" class="close-btn">×</button>
      </div>
      <div class="toolbar-content">
        <div>
          <label for="node-name-input">노드 이름</label>
          <textarea id="node-name-input" v-model="nodeNameInput" rows="3" @keydown="handleNameInputKeydown"></textarea>
        </div>
        <div>
          <label for="node-parent-select">부모 노드 변경</label>
          <select id="node-parent-select" v-model="selectedParentId" :disabled="isRootNode">
            <option v-for="option in parentOptions" :key="option.id" :value="option.id">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>
      <div class="toolbar-actions">
        <button @click="saveChanges" class="btn-save">변경 사항 저장</button>
        <button v-if="!isTaskOrLower" @click="addChild" class="btn-add-child">
          자식 노드 추가
        </button>
        <button v-if="!isRootNode" @click="addSibling" class="btn-add-sibling">
          형제 노드 추가
        </button>
        <button @click="deleteNode" class="btn-delete" :disabled="isRootNode">
          노드 삭제
        </button>
      </div>
    </div>

    <!-- 툴바 -->
    <div id="toolbar" class="toolbar">
      <button @click="importJSON" class="toolbar-btn">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
        </svg>
        <span>불러오기</span>
      </button>
      <button @click="exportJSON" class="toolbar-btn">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
        </svg>
        <span>내보내기</span>
      </button>
      <button @click="exportPNG" class="toolbar-btn">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z">
          </path>
        </svg>
        <span>PNG로 저장</span>
      </button>
    </div>

    <!-- D3.js가 SVG 차트를 렌더링할 컨테이너 -->
    <div id="chart-container" ref="chartContainer"></div>

    <!-- Custom Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3>{{ modalTitle }}</h3>
        <p>{{ modalMessage }}</p>
        <input v-if="modalShowInput" ref="modalInput" type="text" v-model="modalInputValue"
          @keydown.enter="handleModalOk" @keydown.escape="handleModalCancel" />
        <div class="modal-actions">
          <button @click="handleModalCancel" class="btn-cancel">취소</button>
          <button @click="handleModalOk" class="btn-ok">확인</button>
        </div>
      </div>
    </div>

    <!-- Hidden download link -->
    <a ref="downloadLink" :href="downloadUrl" :download="downloadFilename" style="display: none"></a>

    <!-- Hidden file input -->
    <input ref="fileInput" type="file" accept=".json,application/json" style="display: none"
      @change="handleFileImport" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';

const chartContainer = ref(null);
const hierarchicalData = ref(null);
const selectedNode = ref(null);
const isToolbarVisible = ref(false);
const nodeNameInput = ref('');
const selectedParentId = ref('');
const parentOptions = ref([]);
const showModal = ref(false);
const modalTitle = ref('');
const modalMessage = ref('');
const modalShowInput = ref(false);
const modalInputValue = ref('');
const modalResolve = ref(null);
const modalInput = ref(null);
const downloadLink = ref(null);
const downloadUrl = ref('');
const downloadFilename = ref('');
const fileInput = ref(null);

let svg = null;
let g = null;
let zoom = null;
const LOCAL_STORAGE_KEY = 'wbsChartData';

const isRootNode = computed(() => selectedNode.value?.depth === 0);
const isTaskOrLower = computed(() => selectedNode.value?.depth >= 2);

function initializeData() {
  hierarchicalData.value = { name: "새 프로젝트", id: crypto.randomUUID(), children: [] };
}

function saveDataToLocalStorage() {
  if (hierarchicalData.value) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(hierarchicalData.value));
  }
}

function loadDataFromLocalStorage() {
  const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (savedData) {
    hierarchicalData.value = JSON.parse(savedData);
    return true;
  }
  return false;
}

function updateChart() {
  if (!g || !hierarchicalData.value) return;

  g.selectAll('*').remove();

  const nodeWidth = 200;
  const nodeHeight = 60;
  const root = window.d3.hierarchy(hierarchicalData.value, d => d.children);

  const horizontalGap = nodeWidth + 150;
  const verticalGap = nodeHeight + 40;
  const levelGap = 150;
  const branchOffset = 130;

  root.x = 0;
  root.y = 0;

  if (root.children) {
    const numPhases = root.children.length;
    const totalWidth = (numPhases - 1) * horizontalGap;
    const startX = -totalWidth / 2;

    root.children.forEach((phaseNode, i) => {
      phaseNode.x = startX + i * horizontalGap;
      phaseNode.y = root.y + levelGap;
      if (phaseNode.children) {
        phaseNode.children.forEach((taskNode, j) => {
          taskNode.y = phaseNode.y + levelGap * 0.8 + j * verticalGap;
          taskNode.x = phaseNode.x + branchOffset;
        });
      }
    });
  }

  const links = root.links();
  const nodes = root.descendants();

  g.selectAll(".link")
    .data(links).enter().append("path")
    .attr("class", "link")
    .attr("d", d => {
      if (d.source.depth === 0) {
        return `M ${d.source.x},${d.source.y + nodeHeight / 2}` +
          `L ${d.target.x},${d.target.y - nodeHeight / 2}`;
      }
      const sourceX = d.source.x;
      const sourceY = d.source.y + nodeHeight / 2;
      const targetX = d.target.x - nodeWidth / 2;
      const targetY = d.target.y;
      return `M ${sourceX},${sourceY} V ${targetY} H ${targetX}`;
    });

  const node = g.selectAll(".node")
    .data(nodes).enter().append("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.x},${d.y})`)
    .on('click', (event, d) => {
      g.selectAll('rect.selected').classed('selected', false);
      window.d3.select(event.currentTarget).select('rect').classed('selected', true);
      selectedNode.value = d;
      showEditToolbar(d);
    });

  node.append("rect")
    .attr("width", nodeWidth).attr("height", nodeHeight)
    .attr("x", -nodeWidth / 2).attr("y", -nodeHeight / 2)
    .attr("rx", 5)
    .style("fill", d => (d.depth === 0 ? "#E2E8F0" : d.children ? "#F1F5F9" : "#FFFFFF"))
    .style("stroke", d => (d.depth === 0 ? "#4A5568" : "#A0AEC0"))
    .classed('selected', d => d.data.id === selectedNode.value?.data.id);

  node.append("text")
    .style("text-anchor", "middle")
    .text(d => d.data.name)
    .call(wrap, nodeWidth - 20);
}

function showEditToolbar(node) {
  nodeNameInput.value = node.data.name;
  populateParentSelect(node);
  isToolbarVisible.value = true;
  nextTick(() => {
    const nameInput = document.getElementById('node-name-input');
    if (nameInput) nameInput.focus();
  });
}

function hideEditToolbar() {
  isToolbarVisible.value = false;
  if (g) {
    g.selectAll('rect.selected').classed('selected', false);
  }
  selectedNode.value = null;
}

function populateParentSelect(node) {
  const descendants = new Set();
  function getDescendantIds(d) {
    descendants.add(d.id);
    if (d.children) d.children.forEach(getDescendantIds);
  }
  getDescendantIds(node.data);

  const options = [];
  function buildOptions(d, depth = 0) {
    if (descendants.has(d.id)) return;
    const label = '—'.repeat(depth) + ' ' + d.name;
    const currentParent = findParentOfNode(hierarchicalData.value, node.data.id);
    options.push({
      id: d.id,
      label: label,
      selected: currentParent && currentParent.id === d.id
    });
    if (d.children) d.children.forEach(child => buildOptions(child, depth + 1));
  }
  buildOptions(hierarchicalData.value);
  parentOptions.value = options;
  selectedParentId.value = options.find(opt => opt.selected)?.id || '';
}

function saveChanges() {
  if (!selectedNode.value) return;
  const nodeData = findNodeById(hierarchicalData.value, selectedNode.value.data.id);
  if (!nodeData) return;

  nodeData.name = nodeNameInput.value;

  const newParentId = selectedParentId.value;
  const oldParent = findParentOfNode(hierarchicalData.value, nodeData.id);
  if (oldParent && oldParent.id !== newParentId) {
    const newParent = findNodeById(hierarchicalData.value, newParentId);
    if (newParent) {
      oldParent.children = oldParent.children.filter(child => child.id !== nodeData.id);
      if (!newParent.children) newParent.children = [];
      newParent.children.push(nodeData);
    }
  }
  updateChart();
  saveDataToLocalStorage();
}

function addChild() {
  showModalPrompt("자식 노드 추가", "새 자식 노드의 이름을 입력하세요:", "").then(childName => {
    if (childName) {
      const nodeData = findNodeById(hierarchicalData.value, selectedNode.value.data.id);
      if (!nodeData.children) nodeData.children = [];
      nodeData.children.push({ name: childName, id: crypto.randomUUID() });
      updateChart();
      saveDataToLocalStorage();
    }
  });
}

function addSibling() {
  const parent = findParentOfNode(hierarchicalData.value, selectedNode.value.data.id);
  if (!parent) {
    showModalAlert("오류", "루트 노드에는 형제 노드를 추가할 수 없습니다.");
    return;
  }
  showModalPrompt("형제 노드 추가", "새 형제 노드의 이름을 입력하세요:", "").then(siblingName => {
    if (siblingName) {
      const newNode = { name: siblingName, id: crypto.randomUUID() };
      const selectedNodeIndex = parent.children.findIndex(child => child.id === selectedNode.value.data.id);
      if (selectedNodeIndex > -1) {
        parent.children.splice(selectedNodeIndex + 1, 0, newNode);
      }
      updateChart();
      saveDataToLocalStorage();
    }
  });
}

function deleteNode() {
  if (!selectedNode.value) return;
  showModalConfirm("노드 삭제", `'${selectedNode.value.data.name}' 노드를 정말 삭제하시겠습니까? 모든 자식 노드도 함께 삭제됩니다.`).then(confirmed => {
    if (confirmed) {
      const parent = findParentOfNode(hierarchicalData.value, selectedNode.value.data.id);
      if (parent) {
        parent.children = parent.children.filter(child => child.id !== selectedNode.value.data.id);
        hideEditToolbar();
        updateChart();
        saveDataToLocalStorage();
      } else {
        showModalAlert("오류", "루트 노드는 삭제할 수 없습니다.");
      }
    }
  });
}

function handleNameInputKeydown(event) {
  if (event.ctrlKey && event.key === 'Enter') {
    event.preventDefault();
    saveChanges();
  }
  if (event.key === 'Escape') {
    hideEditToolbar();
  }
}

function exportPNG() {
  const wasToolbarVisible = isToolbarVisible.value;
  if (wasToolbarVisible) hideEditToolbar();

  setTimeout(() => {
    const svgEl = svg.node();
    const gBounds = g.node().getBBox();
    const padding = 50;
    const width = gBounds.width + padding * 2;
    const height = gBounds.height + padding * 2;
    const svgString = getSVGString(svgEl, gBounds, padding);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = function () {
      ctx.fillStyle = '#f7fafc';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0);
      const a = document.createElement('a');
      a.download = 'wbs-chart.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
      if (wasToolbarVisible && selectedNode.value) {
        showEditToolbar(selectedNode.value);
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
  }, 350);
}

function exportJSON() {
  const jsonString = JSON.stringify(hierarchicalData.value, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  downloadUrl.value = url;
  downloadFilename.value = 'wbs-data.json';
  nextTick(() => {
    if (downloadLink.value) {
      downloadLink.value.click();
      setTimeout(() => {
        URL.revokeObjectURL(url);
        downloadUrl.value = '';
        downloadFilename.value = '';
      }, 100);
    }
  });
}

function handleFileImport(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async readerEvent => {
    try {
      const content = readerEvent.target.result;
      const jsonData = JSON.parse(content);

      if (jsonData.name && jsonData.id) {
        hierarchicalData.value = jsonData;
        hideEditToolbar();
        updateChart();
        saveDataToLocalStorage();
        await showModalAlert("성공", "JSON 데이터를 성공적으로 불러왔습니다.");
      } else {
        throw new Error("Invalid JSON format. Missing 'name' or 'id' property.");
      }
    } catch (error) {
      console.error("Error parsing JSON:", error);
      await showModalAlert("오류", "JSON 파일을 불러오는 중 오류가 발생했습니다. 파일 형식을 확인해주세요.");
    }
  };
  reader.readAsText(file);
  // Reset input
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

function importJSON() {
  fileInput.value?.click();
}

function showModalPrompt(title, message, placeholder) {
  return new Promise(resolve => {
    modalTitle.value = title;
    modalMessage.value = message;
    modalShowInput.value = true;
    modalInputValue.value = placeholder;
    showModal.value = true;
    modalResolve.value = resolve;
    nextTick(() => {
      if (modalInput.value) modalInput.value.focus();
    });
  });
}

function showModalConfirm(title, message) {
  return new Promise(resolve => {
    modalTitle.value = title;
    modalMessage.value = message;
    modalShowInput.value = false;
    showModal.value = true;
    modalResolve.value = resolve;
  });
}

function showModalAlert(title, message) {
  return new Promise(resolve => {
    modalTitle.value = title;
    modalMessage.value = message;
    modalShowInput.value = false;
    showModal.value = true;
    modalResolve.value = resolve;
  });
}

function handleModalOk() {
  if (modalResolve.value) {
    showModal.value = false;
    const value = modalShowInput.value ? modalInputValue.value : true;
    modalResolve.value(value);
    modalResolve.value = null;
  }
}

function handleModalCancel() {
  if (modalResolve.value) {
    showModal.value = false;
    const value = modalShowInput.value ? null : false;
    modalResolve.value(value);
    modalResolve.value = null;
  }
}

function closeModal() {
  handleModalCancel();
}

function findNodeById(node, id) {
  if (node.id === id) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
  }
  return null;
}

function findParentOfNode(parent, childId) {
  if (!parent.children) return null;
  for (const child of parent.children) {
    if (child.id === childId) return parent;
    const foundParent = findParentOfNode(child, childId);
    if (foundParent) return foundParent;
  }
  return null;
}

function getSVGString(svgNode, bounds, padding) {
  const clone = svgNode.cloneNode(true);
  window.d3.select(clone).selectAll('rect.selected').classed('selected', false);
  const innerG = window.d3.select(clone).select('g');
  const style = document.createElement('style');
  style.textContent = Array.from(document.styleSheets)
    .map(s => {
      try { return Array.from(s.cssRules).map(r => r.cssText).join('\n'); }
      catch (e) { return ''; }
    }).join('\n');
  clone.insertBefore(style, clone.firstChild);
  window.d3.select(clone)
    .attr('width', bounds.width + padding * 2)
    .attr('height', bounds.height + padding * 2);
  innerG.attr('transform', `translate(${-bounds.x + padding}, ${-bounds.y + padding})`);
  return new XMLSerializer().serializeToString(clone);
}

function wrap(text, width) {
  text.each(function () {
    const textElement = window.d3.select(this);
    const words = textElement.text().split(/\s+/).reverse();
    textElement.text(null);
    let word, line = [], lines = [], lineHeight = 1.1;
    const tspan = textElement.append("tspan").attr("x", 0);
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width && line.length > 1) {
        line.pop();
        lines.push(line.join(" "));
        line = [word];
      }
    }
    lines.push(line.join(" "));
    tspan.remove();
    const numLines = lines.length;
    const startYOffset = -((numLines - 1) * lineHeight) / 2;
    lines.forEach((l, i) => {
      textElement.append("tspan")
        .attr("x", 0)
        .attr("dy", (i === 0 ? startYOffset : lineHeight) + "em")
        .text(l);
    });
  });
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

onMounted(async () => {
  // 외부 스크립트 동적 로드
  try {
    await loadScript('https://cdn.tailwindcss.com');
    await loadScript('https://d3js.org/d3.v7.min.js');
  } catch (error) {
    console.error('스크립트 로드 실패:', error);
    return;
  }

  if (!window.d3) {
    console.error('D3.js가 로드되지 않았습니다.');
    return;
  }

  if (!chartContainer.value) return;

  svg = window.d3.select(chartContainer.value).append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .style("cursor", "grab")
    .on('mousedown', (event) => {
      if (event.button === 1) {
        svg.style('cursor', 'grabbing');
      }
    });

  window.d3.select(window).on('mouseup', (event) => {
    if (event.button === 1) {
      svg.style('cursor', 'grab');
    }
  });

  g = svg.append("g");

  zoom = window.d3.zoom()
    .scaleExtent([0.1, 3])
    .on("zoom", (event) => g.attr("transform", event.transform))
    .filter(event => {
      const isPanButton = event.button === 0 || event.button === 1;
      return (!event.ctrlKey || event.type === 'wheel') && isPanButton;
    });

  svg.call(zoom)
    .on("dblclick.zoom", null);

  if (!loadDataFromLocalStorage()) {
    initializeData();
  }

  updateChart();

  nextTick(() => {
    const bounds = g.node().getBBox();
    const parent = chartContainer.value;
    const fullWidth = parent.clientWidth;
    const fullHeight = parent.clientHeight;
    const scale = 0.6;
    const initialX = fullWidth / 2 - (bounds.x + bounds.width / 2) * scale;
    const initialY = 100;
    const initialTransform = window.d3.zoomIdentity.translate(initialX, initialY).scale(scale);
    svg.call(zoom.transform, initialTransform);
  });
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');

.wbs-chart-app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
  position: relative;
}

#chart-container {
  width: 100%;
  height: 100%;
  background-color: #f7fafc;
}

.node rect {
  stroke-width: 2px;
  cursor: pointer;
  transition: stroke 0.3s, stroke-width 0.3s;
}

.node rect.selected {
  stroke: #3182CE;
  stroke-width: 3px;
}

.node text {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  fill: #2D3748;
  pointer-events: none;
}

.link {
  fill: none;
  stroke: #CBD5E0;
  stroke-width: 1.5px;
}

.edit-toolbar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 320px;
  background: white;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  z-index: 20;
  padding: 24px;
  transform: translateX(0);
  transition: transform 0.3s;
  overflow-y: auto;
}

.edit-toolbar.hidden {
  display: none;
}

.toolbar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.toolbar-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.close-btn {
  color: #6b7280;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #1f2937;
}

.toolbar-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.toolbar-content label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
}

.toolbar-content textarea,
.toolbar-content select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
}

.toolbar-content textarea {
  resize: vertical;
  min-height: 60px;
}

.toolbar-actions {
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toolbar-actions button {
  width: 100%;
  padding: 8px 16px;
  border-radius: 6px;
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  font-weight: 500;
}

.btn-save {
  background-color: #2563eb;
}

.btn-save:hover {
  background-color: #1d4ed8;
}

.btn-add-child {
  background-color: #16a34a;
}

.btn-add-child:hover {
  background-color: #15803d;
}

.btn-add-sibling {
  background-color: #4f46e5;
}

.btn-add-sibling:hover {
  background-color: #4338ca;
}

.btn-delete {
  background-color: #dc2626;
}

.btn-delete:hover {
  background-color: #b91c1c;
}

.btn-delete:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.toolbar {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
  display: flex;
  gap: 8px;
}

.toolbar-btn {
  background: white;
  color: #374151;
  font-weight: 600;
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.toolbar-btn:hover {
  background-color: #f9fafb;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(75, 85, 99, 0.5);
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background: white;
  border-radius: 8px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  padding: 24px;
  width: 100%;
  max-width: 28rem;
}

.modal h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 16px;
}

.modal p {
  font-size: 0.875rem;
  color: #4b5563;
  margin-bottom: 16px;
}

.modal input {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px;
  margin-bottom: 16px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-cancel {
  background-color: #e5e7eb;
  color: #1f2937;
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-cancel:hover {
  background-color: #d1d5db;
}

.btn-ok {
  background-color: #2563eb;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-ok:hover {
  background-color: #1d4ed8;
}
</style>
