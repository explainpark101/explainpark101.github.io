import { ref, computed, watch, nextTick } from 'vue';
import * as d3 from 'd3';
import { findNodeById, findParentOfNode } from '../utils/wbsUtils.js';

const LOCAL_STORAGE_KEY = 'wbsChartData';
const THEME_STORAGE_KEY = 'wbsChartTheme';

/**
 * WBS 차트의 모든 상태와 로직을 통합한 composable
 */
export function useWBS() {
  // ========== 상태 ==========
  const hierarchicalData = ref(null);
  const selectedNode = ref(null);
  const isToolbarVisible = ref(false);
  const nodeNameInput = ref('');
  const selectedParentId = ref('');
  const parentOptions = ref([]);
  const isDarkMode = ref(false);
  const chartRef = ref(null);
  const downloadLink = ref(null);
  const downloadUrl = ref('');
  const downloadFilename = ref('');
  const fileInput = ref(null);

  // D3.js 관련
  const svg = ref(null);
  const g = ref(null);
  const chartContainer = ref(null);
  const zoom = ref(null);
  const currentTransform = ref(d3.zoomIdentity);

  // 모달 상태
  const showModal = ref(false);
  const modalTitle = ref('');
  const modalMessage = ref('');
  const modalShowInput = ref(false);
  const modalInputValue = ref('');
  const modalResolve = ref(null);

  // 차트 상수
  const nodeWidth = 200;
  const nodeHeight = 60;
  const horizontalGap = nodeWidth + 150;
  const verticalGap = nodeHeight + 40;
  const levelGap = 150;
  const branchOffset = 130;

  // ========== Computed ==========
  const isRootNode = computed(() => selectedNode.value?.depth === 0);
  const isTaskOrLower = computed(() => selectedNode.value?.depth >= 2);

  // ========== LocalStorage 관리 ==========
  function saveDataToLocalStorage() {
    if (hierarchicalData.value) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(hierarchicalData.value));
    }
  }

  function loadDataFromLocalStorage() {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      try {
        hierarchicalData.value = JSON.parse(savedData);
        return true;
      } catch (error) {
        console.error('Failed to parse saved data:', error);
        return false;
      }
    }
    return false;
  }

  function initializeData() {
    hierarchicalData.value = {
      name: "새 프로젝트",
      id: crypto.randomUUID(),
      children: []
    };
  }

  // 데이터 변경 시 자동 저장
  watch(
    hierarchicalData,
    () => {
      saveDataToLocalStorage();
    },
    { deep: true }
  );

  // ========== 모달 관리 ==========
  async function showModalPrompt(title, message, placeholder = '') {
    modalTitle.value = title;
    modalMessage.value = message;
    modalShowInput.value = true;
    modalInputValue.value = placeholder;
    showModal.value = true;

    await nextTick();
    const modalInput = document.querySelector('.modal input');
    if (modalInput) {
      modalInput.focus();
    }

    return new Promise((resolve) => {
      modalResolve.value = resolve;
    });
  }

  async function showModalConfirm(title, message) {
    modalTitle.value = title;
    modalMessage.value = message;
    modalShowInput.value = false;
    showModal.value = true;

    return new Promise((resolve) => {
      modalResolve.value = resolve;
    });
  }

  async function showModalAlert(title, message) {
    modalTitle.value = title;
    modalMessage.value = message;
    modalShowInput.value = false;
    showModal.value = true;

    return new Promise((resolve) => {
      modalResolve.value = () => {
        resolve();
      };
    });
  }

  function handleModalOk() {
    if (modalResolve.value) {
      showModal.value = false;
      const value = modalShowInput.value ? modalInputValue.value : true;
      modalResolve.value(value);
      modalResolve.value = null;
      modalInputValue.value = '';
    }
  }

  function handleModalCancel() {
    if (modalResolve.value) {
      showModal.value = false;
      const value = modalShowInput.value ? null : false;
      modalResolve.value(value);
      modalResolve.value = null;
      modalInputValue.value = '';
    }
  }

  // ========== 차트 렌더링 ==========
  function calculateLayout(root) {
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
  }

  function wrap(text, width) {
    text.each(function () {
      const textElement = d3.select(this);
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

  function updateChart() {
    if (!g.value || !hierarchicalData.value) {
      console.warn('Chart not ready:', { g: !!g.value, data: !!hierarchicalData.value });
      return;
    }

    g.value.selectAll('*').remove();

    const root = d3.hierarchy(hierarchicalData.value, d => d.children);
    calculateLayout(root);

    const links = root.links();
    const nodes = root.descendants();

    // 링크 색상 설정
    const linkColor = isDarkMode.value ? "#4A5568" : "#CBD5E0";

    // 링크 그리기
    g.value.selectAll(".link")
      .data(links).enter().append("path")
      .attr("class", "link")
      .style("stroke", linkColor)
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

    // 노드 색상 설정
    const nodeFillColors = isDarkMode.value
      ? { root: "#2D3748", parent: "#1A202C", leaf: "#1E293B" }
      : { root: "#E2E8F0", parent: "#F1F5F9", leaf: "#FFFFFF" };
    const nodeStrokeColors = isDarkMode.value
      ? { root: "#718096", default: "#4A5568" }
      : { root: "#4A5568", default: "#A0AEC0" };
    const textColor = isDarkMode.value ? "#E2E8F0" : "#2D3748";

    // 노드 그리기
    const node = g.value.selectAll(".node")
      .data(nodes).enter().append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .on('click', (event, d) => {
        g.value.selectAll('rect.selected').classed('selected', false);
        d3.select(event.currentTarget).select('rect').classed('selected', true);
        selectedNode.value = d;
        handleNodeClick(d);
      });

    node.append("rect")
      .attr("width", nodeWidth).attr("height", nodeHeight)
      .attr("x", -nodeWidth / 2).attr("y", -nodeHeight / 2)
      .attr("rx", 5)
      .style("fill", d => (d.depth === 0 ? nodeFillColors.root : d.children ? nodeFillColors.parent : nodeFillColors.leaf))
      .style("stroke", d => (d.depth === 0 ? nodeStrokeColors.root : nodeStrokeColors.default))
      .classed('selected', d => d.data.id === selectedNode.value?.data.id);

    node.append("text")
      .style("text-anchor", "middle")
      .style("fill", textColor)
      .text(d => d.data.name.trim())
      .call(wrap, nodeWidth - 20);
  }

  function initializeChart(container) {
    if (!container) {
      console.warn('Chart container not provided');
      return;
    }

    chartContainer.value = container;

    // 기존 SVG 제거
    d3.select(container).selectAll('svg').remove();

    // SVG 생성
    svg.value = d3.select(container).append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .style("cursor", "grab");

    // 그룹 생성
    g.value = svg.value.append("g");

    // ========== D3 Zoom 설정 (원본 HTML 스타일) ==========
    zoom.value = d3.zoom()
      .scaleExtent([0.1, 3])
      .on("zoom", (event) => {
        if (g.value) {
          currentTransform.value = event.transform;
          g.value.attr("transform", event.transform);
        }
      })
      .filter(event => {
        // Allows panning with the primary (0) and middle (1) mouse buttons,
        // and wheel-based zooming.
        // Disallows panning when ctrl is pressed (to allow for other interactions if needed).
        const isPanButton = event.button === 0 || event.button === 1;
        return (!event.ctrlKey || event.type === 'wheel') && isPanButton;
      });

    svg.value.call(zoom.value)
      .on("dblclick.zoom", null); // Disable double-click zoom behavior

    // 데이터가 있으면 차트 업데이트
    if (hierarchicalData.value) {
      updateChart();
      // 초기 줌 설정
      nextTick(() => {
        setTimeout(() => {
          setInitialZoom(container);
        }, 100);
      });
    } else {
      // 데이터가 없으면 데이터 로드를 기다림
      const unwatch = watch(hierarchicalData, (newData) => {
        if (newData) {
          updateChart();
          nextTick(() => {
            setTimeout(() => {
              setInitialZoom(container);
            }, 100);
          });
          unwatch();
        }
      });
    }
  }

  function setInitialZoom(container) {
    if (g.value && g.value.node() && svg.value && zoom.value) {
      try {
        const bounds = g.value.node().getBBox();
        const fullWidth = container.clientWidth || window.innerWidth;
        const fullHeight = container.clientHeight || window.innerHeight;
        const scale = 0.6;
        const initialX = fullWidth / 2 - (bounds.x + bounds.width / 2) * scale;
        const initialY = 100;
        const initialTransform = d3.zoomIdentity.translate(initialX, initialY).scale(scale);
        
        currentTransform.value = initialTransform;
        if (g.value) {
          g.value.attr("transform", initialTransform);
        }
        if (zoom.value && svg.value) {
          svg.value.call(zoom.value.transform, initialTransform);
        }
      } catch (e) {
        console.warn('Failed to set initial zoom:', e);
      }
    }
  }

  // ========== Transform 적용 헬퍼 함수 ==========
  function applyTransform(transform, container) {
    const constrained = constrainTransform(transform, container);
    currentTransform.value = constrained;
    if (g.value) {
      g.value.attr("transform", constrained);
    }
  }

  // 경계 체크 함수 (외부에서도 사용 가능하도록)
  function constrainTransform(transform, container) {
    if (!g.value || !g.value.node() || !hierarchicalData.value || !container) {
      return transform;
    }

    try {
      const bounds = g.value.node().getBBox();
      
      // 빈 차트 처리 (bounds가 0일 때)
      if (bounds.width === 0 && bounds.height === 0) {
        return transform;
      }
      
      const containerWidth = container.clientWidth || window.innerWidth;
      const containerHeight = container.clientHeight || window.innerHeight;

      // 스케일된 차트 크기
      const scaledWidth = bounds.width * transform.k;
      const scaledHeight = bounds.height * transform.k;

      let constrainedX = transform.x;
      let constrainedY = transform.y;

      // 차트가 화면보다 작으면 중앙 정렬
      if (scaledWidth < containerWidth) {
        constrainedX = (containerWidth - scaledWidth) / 2 - bounds.x * transform.k;
      } else {
        // 차트가 화면보다 크면 경계 체크
        const minX = -bounds.x * transform.k - scaledWidth + containerWidth;
        const maxX = -bounds.x * transform.k;
        constrainedX = Math.max(minX, Math.min(maxX, transform.x));
      }

      // Y축도 동일하게 처리
      if (scaledHeight < containerHeight) {
        constrainedY = (containerHeight - scaledHeight) / 2 - bounds.y * transform.k;
      } else {
        const minY = -bounds.y * transform.k - scaledHeight + containerHeight;
        const maxY = -bounds.y * transform.k;
        constrainedY = Math.max(minY, Math.min(maxY, transform.y));
      }

      return d3.zoomIdentity
        .translate(constrainedX, constrainedY)
        .scale(transform.k);
    } catch (e) {
      console.warn('Failed to constrain transform:', e);
      return transform;
    }
  }

  // 전체 보기 기능
  function fitToView() {
    if (!g.value || !g.value.node() || !svg.value || !chartContainer.value) {
      return;
    }

    try {
      const bounds = g.value.node().getBBox();
      const container = chartContainer.value;
      const containerWidth = container.clientWidth || window.innerWidth;
      const containerHeight = container.clientHeight || window.innerHeight;

      // 패딩 추가 (여백)
      const padding = 50;
      const availableWidth = containerWidth - padding * 2;
      const availableHeight = containerHeight - padding * 2;

      // 적절한 스케일 계산
      const scaleX = availableWidth / bounds.width;
      const scaleY = availableHeight / bounds.height;
      const scale = Math.min(scaleX, scaleY, 3); // 최대 3배까지만

      // 중앙 정렬을 위한 위치 계산
      const scaledWidth = bounds.width * scale;
      const scaledHeight = bounds.height * scale;
      const x = (containerWidth - scaledWidth) / 2 - bounds.x * scale;
      const y = (containerHeight - scaledHeight) / 2 - bounds.y * scale;

      const fitTransform = d3.zoomIdentity.translate(x, y).scale(scale);
      applyTransform(fitTransform, container);
    } catch (e) {
      console.warn('Failed to fit to view:', e);
    }
  }

  // ========== 노드 관리 ==========
  function handleNodeClick(node) {
    selectedNode.value = node;
    nodeNameInput.value = node.data.name;
    populateParentSelect(node);
    isToolbarVisible.value = true;
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

  function showEditToolbar(node) {
    selectedNode.value = node;
    nodeNameInput.value = node.data.name;
    populateParentSelect(node);
    isToolbarVisible.value = true;
  }

  function hideEditToolbar() {
    isToolbarVisible.value = false;
    selectedNode.value = null;
  }

  function saveChanges() {
    if (!selectedNode.value) return;
    const nodeData = findNodeById(hierarchicalData.value, selectedNode.value.data.id);
    if (!nodeData) return;

    nodeData.name = nodeNameInput.value.trim();

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
  }

  async function addChild() {
    if (!selectedNode.value) return;
    const childName = await showModalPrompt("자식 노드 추가", "새 자식 노드의 이름을 입력하세요:", "");
    if (childName) {
      const nodeData = findNodeById(hierarchicalData.value, selectedNode.value.data.id);
      if (!nodeData.children) nodeData.children = [];
      nodeData.children.push({ name: childName.trim(), id: crypto.randomUUID() });
      updateChart();
    }
  }

  async function addSibling() {
    if (!selectedNode.value) return;
    const parent = findParentOfNode(hierarchicalData.value, selectedNode.value.data.id);
    if (!parent) {
      await showModalAlert("오류", "루트 노드에는 형제 노드를 추가할 수 없습니다.");
      return;
    }
    const siblingName = await showModalPrompt("형제 노드 추가", "새 형제 노드의 이름을 입력하세요:", "");
    if (siblingName) {
      const newNode = { name: siblingName.trim(), id: crypto.randomUUID() };
      const selectedNodeIndex = parent.children.findIndex(child => child.id === selectedNode.value.data.id);
      if (selectedNodeIndex > -1) {
        parent.children.splice(selectedNodeIndex + 1, 0, newNode);
      }
      updateChart();
    }
  }

  async function deleteNode() {
    if (!selectedNode.value) return;
    const confirmed = await showModalConfirm("노드 삭제", `'${selectedNode.value.data.name}' 노드를 정말 삭제하시겠습니까? 모든 자식 노드도 함께 삭제됩니다.`);
    if (confirmed) {
      const parent = findParentOfNode(hierarchicalData.value, selectedNode.value.data.id);
      if (parent) {
        parent.children = parent.children.filter(child => child.id !== selectedNode.value.data.id);
        hideEditToolbar();
        updateChart();
      } else {
        await showModalAlert("오류", "루트 노드는 삭제할 수 없습니다.");
      }
    }
  }

  // ========== 테마 관리 ==========
  function initializeTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'dark' || savedTheme === 'light') {
      isDarkMode.value = savedTheme === 'dark';
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      isDarkMode.value = prefersDark;
    }
    updateTheme();
  }

  function toggleDarkMode() {
    isDarkMode.value = !isDarkMode.value;
    updateTheme();
    localStorage.setItem(THEME_STORAGE_KEY, isDarkMode.value ? 'dark' : 'light');
    updateChart();
  }

  function updateTheme() {
    const theme = isDarkMode.value ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
  }

  // ========== 파일 관리 ==========
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

  async function handleFileImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (readerEvent) => {
      try {
        const content = readerEvent.target.result;
        const jsonData = JSON.parse(content);

        if (jsonData.name && jsonData.id) {
          hierarchicalData.value = jsonData;
          hideEditToolbar();
          updateChart();
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
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  }

  function importJSON() {
    fileInput.value?.click();
  }

  function getSVGString(svgNode, bounds, padding) {
    const clone = svgNode.cloneNode(true);
    d3.select(clone).selectAll('rect.selected').classed('selected', false);
    const innerG = d3.select(clone).select('g');
    const style = document.createElement('style');
    style.textContent = Array.from(document.styleSheets)
      .map(s => {
        try { return Array.from(s.cssRules).map(r => r.cssText).join('\n'); }
        catch (e) { return ''; }
      }).join('\n');
    clone.insertBefore(style, clone.firstChild);
    d3.select(clone)
      .attr('width', bounds.width + padding * 2)
      .attr('height', bounds.height + padding * 2);
    innerG.attr('transform', `translate(${-bounds.x + padding}, ${-bounds.y + padding})`);
    return new XMLSerializer().serializeToString(clone);
  }

  async function exportPNG() {
    const wasToolbarVisible = isToolbarVisible.value;
    if (wasToolbarVisible) hideEditToolbar();

    await nextTick();
    if (!svg.value || !g.value) {
      console.warn('Chart not ready for PNG export');
      return;
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        const svgEl = svg.value.node();
        const gBounds = g.value.node().getBBox();
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
          ctx.fillStyle = isDarkMode.value ? '#1a1a1a' : '#f7fafc';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0);
          const a = document.createElement('a');
          a.download = 'wbs-chart.png';
          a.href = canvas.toDataURL('image/png');
          a.click();
          if (wasToolbarVisible && selectedNode.value) {
            showEditToolbar(selectedNode.value);
          }
          resolve();
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
      }, 100);
    });
  }

  // ========== 키보드 단축키 ==========
  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault();
        if (event.shiftKey) {
          exportPNG();
        } else {
          exportJSON();
        }
      }
      if ((event.metaKey || event.ctrlKey) && event.key === 'o') {
        event.preventDefault();
        importJSON();
      }
    });
  }

  // ========== 초기화 ==========
  function initialize() {
    initializeTheme();

    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleThemeChange = (e) => {
        if (!localStorage.getItem(THEME_STORAGE_KEY)) {
          isDarkMode.value = e.matches;
          updateTheme();
          updateChart();
        }
      };
      mediaQuery.addEventListener('change', handleThemeChange);
    }

    if (!loadDataFromLocalStorage()) {
      initializeData();
    }

    setupKeyboardShortcuts();
  }

  // ========== 반환값 ==========
  return {
    // 상태
    hierarchicalData,
    selectedNode,
    isToolbarVisible,
    nodeNameInput,
    selectedParentId,
    parentOptions,
    isDarkMode,
    chartRef,
    downloadLink,
    downloadUrl,
    downloadFilename,
    fileInput,
    showModal,
    modalTitle,
    modalMessage,
    modalShowInput,
    modalInputValue,
    // Computed
    isRootNode,
    isTaskOrLower,
    // 차트
    initializeChart,
    updateChart,
    // 노드 관리
    handleNodeClick,
    showEditToolbar,
    hideEditToolbar,
    saveChanges,
    addChild,
    addSibling,
    deleteNode,
    // 모달
    showModalPrompt,
    showModalConfirm,
    showModalAlert,
    handleModalOk,
    handleModalCancel,
    // 테마
    toggleDarkMode,
    // 파일
    exportJSON,
    importJSON,
    handleFileImport,
    exportPNG,
    // 뷰 조절
    fitToView,
    // 초기화
    initialize
  };
}

