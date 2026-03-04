<template>
  <div class="min-h-screen bg-(--background) text-(--text-primary) transition-[background-color,color] duration-500">
    <nav class="p-4 mb-8">
      <ul class="list-none p-0 m-0">
        <li>
          <router-link to="/" class="inline-flex items-center gap-2 text-lg text-(--text-primary) no-underline hover:text-(--primary-color)">
            <span class="material-icons text-2xl">home</span>
          </router-link>
        </li>
      </ul>
    </nav>
    
    <main class="max-w-4xl mx-auto px-4 sm:px-6 pb-8">
      <h1 class="text-2xl sm:text-3xl font-bold text-(--primary-color) mb-4">Dijkstra 알고리즘 계산기</h1>
      <p class="text-(--text-secondary) mb-6 leading-relaxed">
        다익스트라 알고리즘은 가중치가 있는 그래프에서 한 노드로부터 다른 노드까지의 최단 경로를 찾는 알고리즘입니다.<br>
        각 Iteration마다 노드까지의 비용이 어떻게 변화하는지 표와 로그로 확인할 수 있으며, 입력한 데이터로 구성된 그래프를 시각적으로도 볼 수 있습니다.
      </p>
      
      <form @submit.prevent="runDijkstra" class="space-y-4">
        <div>
          <label for="nodes" class="block text-sm font-medium text-(--text-secondary) mb-1">노드 정보 (예: A,B,C,D):</label>
          <input type="text" id="nodes" v-model="nodes" placeholder="A,B,C,D" required
            class="w-full px-4 py-2 border border-(--border-color) rounded-lg bg-(--surface) text-(--text-primary) focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20 outline-none transition-all">
        </div>

        <div>
          <label for="edges" class="block text-sm font-medium text-(--text-secondary) mb-1">링크 정보 (예: A,B,3&#10;A,C,5&#10;B,C,2&#10;C,D,1):</label>
          <textarea id="edges" v-model="edges" placeholder="A,B,3&#10;A,C,5&#10;B,C,2&#10;C,D,1" required rows="5"
            class="w-full px-4 py-2 border border-(--border-color) rounded-lg bg-(--surface) text-(--text-primary) focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20 outline-none transition-all resize-y"></textarea>
        </div>

        <div>
          <label for="start" class="block text-sm font-medium text-(--text-secondary) mb-1">시작 노드:</label>
          <input type="text" id="start" v-model="startNode" placeholder="A" required
            class="w-full px-4 py-2 border border-(--border-color) rounded-lg bg-(--surface) text-(--text-primary) focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20 outline-none transition-all">
        </div>

        <div>
          <label for="end" class="block text-sm font-medium text-(--text-secondary) mb-1">도착 노드:</label>
          <input type="text" id="end" v-model="endNode" placeholder="D" required
            class="w-full px-4 py-2 border border-(--border-color) rounded-lg bg-(--surface) text-(--text-primary) focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20 outline-none transition-all">
        </div>

        <label for="undirected" class="flex items-center gap-2 cursor-pointer text-(--text-primary)">
          <input type="checkbox" id="undirected" v-model="isUndirected" class="rounded border-(--border-color)">
          양방향 링크 (체크 시 양방향, 해제 시 단방향)
        </label>

        <button type="submit"
          class="px-6 py-3 bg-(--primary-color) text-white font-medium rounded-lg border-none cursor-pointer transition-colors hover:bg-(--primary-dark)">
          최단 경로 계산
        </button>
      </form>

      <div id="graph" ref="graphContainer" class="w-full h-[400px] border border-(--border-color) rounded-lg mt-6 bg-(--surface)"></div>

      <div class="mt-6 p-4 border border-(--border-color) rounded-lg bg-(--surface) [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-(--border-color) [&_th]:p-2 [&_th]:text-center [&_td]:border [&_td]:border-(--border-color) [&_td]:p-2 [&_td]:text-center [&_th]:bg-(--background)" v-html="resultHtml"></div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const nodes = ref('');
const edges = ref('');
const startNode = ref('');
const endNode = ref('');
const isUndirected = ref(true);
const resultHtml = ref('');
const graphContainer = ref(null);
let visNetworkScriptEl = null;

function dijkstra(graph, startNode, endNode) {
  const nodes = Object.keys(graph);
  let distances = {};
  let previous = {};
  let unvisited = new Set(nodes);
  nodes.forEach(node => {
    distances[node] = Infinity;
    previous[node] = null;
  });
  distances[startNode] = 0;

  let processLog = "";
  let iterationRecords = [];
  let iteration = 1;

  while (unvisited.size > 0) {
    let currentNode = null;
    unvisited.forEach(node => {
      if (currentNode === null || distances[node] < distances[currentNode]) {
        currentNode = node;
      }
    });

    if (distances[currentNode] === Infinity) break;

    unvisited.delete(currentNode);
    processLog += `<strong>Iteration ${iteration}:</strong> 현재 노드: ${currentNode} (거리: ${distances[currentNode]})<br>`;

    for (let neighbor in graph[currentNode]) {
      if (unvisited.has(neighbor)) {
        let alt = distances[currentNode] + graph[currentNode][neighbor];
        if (alt < distances[neighbor]) {
          distances[neighbor] = alt;
          previous[neighbor] = currentNode;
          processLog += `&emsp; 업데이트: ${neighbor}의 새로운 거리: ${alt} (이전 노드: ${currentNode})<br>`;
        }
      }
    }

    iterationRecords.push({
      iteration: iteration,
      currentNode: currentNode,
      distances: Object.assign({}, distances)
    });
    iteration++;
  }

  let path = [];
  let current = endNode;
  if (previous[current] !== null || current === startNode) {
    while (current) {
      path.unshift(current);
      current = previous[current];
    }
  }

  return { path, distances, processLog, iterationRecords };
}

function buildIterationTable(iterationRecords, nodes) {
  if (iterationRecords.length === 0) return "";

  let tableHtml = "<table>";
  tableHtml += "<tr>";
  tableHtml += "<th>Iteration</th>";
  tableHtml += "<th>Current Node</th>";
  nodes.forEach(node => {
    tableHtml += `<th>${node}</th>`;
  });
  tableHtml += "</tr>";

  iterationRecords.forEach(record => {
    tableHtml += "<tr>";
    tableHtml += `<td>${record.iteration}</td>`;
    tableHtml += `<td>${record.currentNode}</td>`;
    nodes.forEach(node => {
      const dist = record.distances[node];
      tableHtml += `<td>${dist === Infinity ? "∞" : dist}</td>`;
    });
    tableHtml += "</tr>";
  });

  tableHtml += "</table>";
  return tableHtml;
}

function drawGraph(nodesArr, graphObj, isUndirected) {
  if (!window.vis || !graphContainer.value) return;
  
  const visNodes = nodesArr.map(node => ({ id: node, label: node }));

  let visEdges = [];
  let addedEdges = new Set();
  for (let from in graphObj) {
    for (let to in graphObj[from]) {
      let key = isUndirected ? [from, to].sort().join('-') : [from, to].join('-');
      if (!addedEdges.has(key)) {
        addedEdges.add(key);
        visEdges.push({ from: from, to: to, label: String(graphObj[from][to]) });
      }
    }
  }

  const edgeArrowOptions = isUndirected
    ? { arrows: { to: { enabled: true, scaleFactor: 1 }, from: { enabled: true, scaleFactor: 1 } } }
    : { arrows: { to: { enabled: true, scaleFactor: 1 } } };

  const data = { nodes: visNodes, edges: visEdges };
  const options = {
    layout: { hierarchical: false },
    physics: { stabilization: false },
    edges: Object.assign({ font: { align: 'middle' } }, edgeArrowOptions)
  };
  new vis.Network(graphContainer.value, data, options);
}

function runDijkstra() {
  const nodesInput = nodes.value.trim();
  const edgesInput = edges.value.trim();
  const start = startNode.value.trim();
  const end = endNode.value.trim();

  const nodesArr = nodesInput.split(',').map(n => n.trim());
  const graph = {};
  nodesArr.forEach(node => { graph[node] = {}; });

  const edgesLines = edgesInput.split('\n');
  edgesLines.forEach(line => {
    const parts = line.split(/,|\|/).map(p => p.trim());
    if (parts.length < 3) return;
    const from = parts[0];
    const to = parts[1];
    const weight = parseFloat(parts[2]);
    graph[from][to] = weight;
    if (isUndirected.value) {
      graph[to][from] = weight;
    }
  });

  drawGraph(nodesArr, graph, isUndirected.value);

  const { path, distances, processLog, iterationRecords } = dijkstra(graph, start, end);

  if (path.length === 0 || distances[end] === Infinity) {
    resultHtml.value = "<p>경로를 찾을 수 없습니다.</p>";
  } else {
    let html = "";
    html += `<h3>최단 경로</h3><p>${path.join(" -> ")}</p>`;
    html += `<h3>총 거리</h3><p>${distances[end]}</p>`;
    html += `<h3>Iteration별 Node Cost</h3>`;
    html += buildIterationTable(iterationRecords, nodesArr);
    html += `<h3>계산 과정 (Log)</h3><p>${processLog}</p>`;
    resultHtml.value = html;
  }

  updateUrlParams();
}

function updateUrlParams() {
  router.replace({
    query: {
      nodes: nodes.value,
      edges: edges.value,
      start: startNode.value,
      end: endNode.value,
      undirected: isUndirected.value
    }
  });
}

watch([nodes, edges, startNode, endNode, isUndirected], () => {
  updateUrlParams();
});

onMounted(() => {
  // vis-network 스크립트 로드
  if (!window.vis) {
    visNetworkScriptEl = document.createElement('script');
    visNetworkScriptEl.src = 'https://unpkg.com/vis-network/standalone/umd/vis-network.min.js';
    visNetworkScriptEl.onload = () => {
      // 스크립트 로드 후 URL 파라미터 확인
      const params = route.query;
      if (params.nodes && params.edges && params.start && params.end) {
        nodes.value = params.nodes;
        edges.value = params.edges;
        startNode.value = params.start;
        endNode.value = params.end;
        isUndirected.value = params.undirected === 'true' || params.undirected === true;
        runDijkstra();
      }
    };
    document.head.appendChild(visNetworkScriptEl);
  } else {
    // 이미 로드된 경우
    const params = route.query;
    if (params.nodes && params.edges && params.start && params.end) {
      nodes.value = params.nodes;
      edges.value = params.edges;
      startNode.value = params.start;
      endNode.value = params.end;
      isUndirected.value = params.undirected === 'true' || params.undirected === true;
      runDijkstra();
    }
  }
});

onBeforeUnmount(() => {
  if (visNetworkScriptEl && visNetworkScriptEl.parentNode) {
    visNetworkScriptEl.parentNode.removeChild(visNetworkScriptEl);
    visNetworkScriptEl = null;
  }
});
</script>
