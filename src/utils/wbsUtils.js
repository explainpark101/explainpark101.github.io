/**
 * WBS 차트 관련 유틸리티 함수들
 */

/**
 * ID로 노드 찾기
 * @param {Object} node - 검색할 노드
 * @param {string} id - 찾을 노드의 ID
 * @returns {Object|null} 찾은 노드 또는 null
 */
export function findNodeById(node, id) {
  if (node.id === id) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * 자식 노드의 부모 노드 찾기
 * @param {Object} parent - 부모 노드
 * @param {string} childId - 자식 노드의 ID
 * @returns {Object|null} 부모 노드 또는 null
 */
export function findParentOfNode(parent, childId) {
  if (!parent.children) return null;
  for (const child of parent.children) {
    if (child.id === childId) return parent;
    const foundParent = findParentOfNode(child, childId);
    if (foundParent) return foundParent;
  }
  return null;
}

