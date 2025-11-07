<template>
  <div class="dijkstra-app">
    <nav class="container-fluid">
      <ul>
        <li>
          <router-link to="/" style="display: inline-flex; align-items: center; gap: 0.5rem; font-size: 1.2rem;">
            <span class="material-icons" style="font-size: 1.5rem;">home</span>
          </router-link>
        </li>
      </ul>
    </nav>
    
    <main class="container">
      <h1>Dijkstra 알고리즘 계산기</h1>
      <p>
        다익스트라 알고리즘은 가중치가 있는 그래프에서 한 노드로부터 다른 노드까지의 최단 경로를 찾는 알고리즘입니다.<br>
        각 Iteration마다 노드까지의 비용이 어떻게 변화하는지 표와 로그로 확인할 수 있으며, 입력한 데이터로 구성된 그래프를 시각적으로도 볼 수 있습니다.
      </p>
      
      <form @submit.prevent="runDijkstra">
        <label for="nodes">노드 정보 (예: A,B,C,D):</label><br>
        <input type="text" id="nodes" v-model="nodes" placeholder="A,B,C,D" required><br>

        <label for="edges">링크 정보 (예: A,B,3&#10;A,C,5&#10;B,C,2&#10;C,D,1):</label><br>
        <textarea id="edges" v-model="edges" placeholder="A,B,3&#10;A,C,5&#10;B,C,2&#10;C,D,1" required></textarea><br>

        <label for="start">시작 노드:</label><br>
        <input type="text" id="start" v-model="startNode" placeholder="A" required><br>

        <label for="end">도착 노드:</label><br>
        <input type="text" id="end" v-model="endNode" placeholder="D" required><br>

        <label for="undirected">
          <input type="checkbox" id="undirected" v-model="isUndirected">
          양방향 링크 (체크 시 양방향, 해제 시 단방향)
        </label><br>

        <button type="submit">최단 경로 계산</button>
      </form>

      <div id="graph" ref="graphContainer"></div>

      <div class="result" v-html="resultHtml"></div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
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
  // CSS 로드
  if (!document.querySelector('link[href*="picocss"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/@picocss/pico@latest/css/pico.min.css';
    document.head.appendChild(link);
  }

  // vis-network 스크립트 로드
  if (!window.vis) {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/vis-network/standalone/umd/vis-network.min.js';
    script.onload = () => {
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
    document.head.appendChild(script);
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
</script>

<style scoped>
.dijkstra-app {
  font-family: Arial, sans-serif;
  margin: 20px;
}

textarea {
  width: 100%;
  height: 100px;
}

input, button {
  margin: 5px 0;
}

.result {
  margin-top: 20px;
  border: 1px solid #ccc;
  padding: 10px;
}

table {
  border-collapse: collapse;
  margin-top: 10px;
}

table, th, td {
  border: 1px solid #ccc;
}

th, td {
  padding: 8px;
  text-align: center;
}

th {
  background-color: #f5f5f5;
}

#graph {
  width: 100%;
  height: 400px;
  border: 1px solid #ccc;
  margin-top: 20px;
}
</style>
