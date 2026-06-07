import { BehaviorTree, BTNode, BTEdge, BTNodeType, BTNodeData, ConditionType, ActionType } from '../types'

export function generateId(): string {
  return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function getNodeChildren(nodeId: string, edges: BTEdge[]): string[] {
  return edges
    .filter((edge) => edge.source === nodeId)
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((edge) => edge.target)
}

function hasCycle(
  nodeId: string,
  edges: BTEdge[],
  visited: Set<string>,
  recursionStack: Set<string>
): boolean {
  visited.add(nodeId)
  recursionStack.add(nodeId)

  const children = getNodeChildren(nodeId, edges)
  for (const child of children) {
    if (!visited.has(child)) {
      if (hasCycle(child, edges, visited, recursionStack)) {
        return true
      }
    } else if (recursionStack.has(child)) {
      return true
    }
  }

  recursionStack.delete(nodeId)
  return false
}

export function validateTree(
  nodes: Map<string, BTNode>,
  edges: BTEdge[],
  rootId: string
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!rootId) {
    errors.push('缺少根节点')
    return { valid: false, errors }
  }

  if (!nodes.has(rootId)) {
    errors.push('根节点不存在')
    return { valid: false, errors }
  }

  const visited = new Set<string>()
  const recursionStack = new Set<string>()

  if (hasCycle(rootId, edges, visited, recursionStack)) {
    errors.push('行为树存在循环')
  }

  nodes.forEach((node, id) => {
    if (node.type !== node.data.nodeType) {
      errors.push(`节点 ${id} 类型不匹配`)
    }

    const incomingEdges = edges.filter((e) => e.target === id)
    if (incomingEdges.length > 1) {
      errors.push(`节点 ${id} 有多个父节点`)
    }

    if (id !== rootId && incomingEdges.length === 0) {
      errors.push(`节点 ${id} 未连接到树`)
    }

    const outgoingEdges = edges.filter((e) => e.source === id)

    if (node.data.nodeType === 'condition') {
      if (outgoingEdges.length !== 2) {
        errors.push(`条件节点 ${id} 必须有且仅有2个子节点`)
      }
      if (!node.data.condition) {
        errors.push(`条件节点 ${id} 缺少条件配置`)
      }
    }

    if (node.data.nodeType === 'action') {
      if (outgoingEdges.length !== 0) {
        errors.push(`动作节点 ${id} 不能有子节点`)
      }
      if (!node.data.action) {
        errors.push(`动作节点 ${id} 缺少动作配置`)
      }
    }

    if (node.data.nodeType === 'selector' || node.data.nodeType === 'sequence') {
      if (outgoingEdges.length < 1) {
        errors.push(`组合节点 ${id} 至少需要1个子节点`)
      }
    }
  })

  edges.forEach((edge) => {
    if (!nodes.has(edge.source)) {
      errors.push(`边 ${edge.id} 的源节点不存在`)
    }
    if (!nodes.has(edge.target)) {
      errors.push(`边 ${edge.id} 的目标节点不存在`)
    }
  })

  return { valid: errors.length === 0, errors }
}

function createNode(
  id: string,
  nodeType: BTNodeType,
  label: string,
  x: number,
  y: number,
  data: Partial<BTNodeData> = {}
): BTNode {
  return {
    id,
    type: nodeType,
    position: { x, y },
    data: {
      nodeType,
      label,
      ...data,
    },
  }
}

function createEdge(source: string, target: string, index: number): BTEdge {
  return {
    id: `edge_${source}_${target}_${index}`,
    source,
    target,
  }
}

export function createDefaultTree(): BehaviorTree {
  const rootId = generateId()
  const hpCheckId = generateId()
  const defendId = generateId()
  const sequenceId = generateId()
  const skillReadyId = generateId()
  const skillId = generateId()
  const attackId = generateId()

  const nodes: Record<string, BTNode> = {
    [rootId]: createNode(rootId, 'selector', '战士AI', 400, 50),
    [hpCheckId]: createNode(hpCheckId, 'condition', 'HP低于50%?', 200, 150, {
      condition: { type: 'hp_below' as ConditionType, value: 50 },
    }),
    [defendId]: createNode(defendId, 'action', '防御', 50, 250, {
      action: { type: 'defend' as ActionType },
    }),
    [sequenceId]: createNode(sequenceId, 'sequence', '攻击序列', 550, 150),
    [skillReadyId]: createNode(skillReadyId, 'condition', '技能就绪?', 450, 250, {
      condition: { type: 'cooldown_ready' as ConditionType, skillId: 'skill_1' },
    }),
    [skillId]: createNode(skillId, 'action', '使用技能', 300, 350, {
      action: { type: 'skill' as ActionType, skillId: 'skill_1' },
    }),
    [attackId]: createNode(attackId, 'action', '普通攻击', 600, 350, {
      action: { type: 'attack' as ActionType },
    }),
  }

  const edges: BTEdge[] = [
    createEdge(rootId, hpCheckId, 0),
    createEdge(rootId, sequenceId, 1),
    createEdge(hpCheckId, defendId, 0),
    createEdge(hpCheckId, sequenceId, 1),
    createEdge(sequenceId, skillReadyId, 0),
    createEdge(skillReadyId, skillId, 0),
    createEdge(skillReadyId, attackId, 1),
  ]

  return {
    id: generateId(),
    name: '默认战士AI',
    rootNodeId: rootId,
    nodes,
    edges,
  }
}

export function createAggressiveTree(): BehaviorTree {
  const rootId = generateId()
  const energyCheckId = generateId()
  const skillId = generateId()
  const enemyHpCheckId = generateId()
  const chargeId = generateId()
  const attackId = generateId()

  const nodes: Record<string, BTNode> = {
    [rootId]: createNode(rootId, 'selector', '激进AI', 400, 50),
    [energyCheckId]: createNode(energyCheckId, 'condition', '能量>30?', 200, 150, {
      condition: { type: 'energy_above' as ConditionType, value: 30 },
    }),
    [skillId]: createNode(skillId, 'action', '技能爆发', 50, 250, {
      action: { type: 'skill' as ActionType, skillId: 'skill_1' },
    }),
    [enemyHpCheckId]: createNode(enemyHpCheckId, 'condition', '敌人HP>80%?', 550, 150, {
      condition: { type: 'enemy_hp_above' as ConditionType, value: 80 },
    }),
    [chargeId]: createNode(chargeId, 'action', '蓄力攻击', 400, 250, {
      action: { type: 'charge' as ActionType },
    }),
    [attackId]: createNode(attackId, 'action', '连续攻击', 650, 250, {
      action: { type: 'attack' as ActionType },
    }),
  }

  const edges: BTEdge[] = [
    createEdge(rootId, energyCheckId, 0),
    createEdge(rootId, enemyHpCheckId, 1),
    createEdge(energyCheckId, skillId, 0),
    createEdge(energyCheckId, attackId, 1),
    createEdge(enemyHpCheckId, chargeId, 0),
    createEdge(enemyHpCheckId, attackId, 1),
  ]

  return {
    id: generateId(),
    name: '激进AI',
    rootNodeId: rootId,
    nodes,
    edges,
  }
}

export function createDefensiveTree(): BehaviorTree {
  const rootId = generateId()
  const hpCheckHighId = generateId()
  const hpCheckLowId = generateId()
  const healId = generateId()
  const defendId = generateId()
  const counterId = generateId()
  const waitId = generateId()

  const nodes: Record<string, BTNode> = {
    [rootId]: createNode(rootId, 'sequence', '防御AI', 400, 50),
    [hpCheckHighId]: createNode(hpCheckHighId, 'condition', 'HP>70%?', 250, 150, {
      condition: { type: 'hp_above' as ConditionType, value: 70 },
    }),
    [hpCheckLowId]: createNode(hpCheckLowId, 'condition', 'HP<30%?', 550, 150, {
      condition: { type: 'hp_below' as ConditionType, value: 30 },
    }),
    [healId]: createNode(healId, 'action', '治疗', 400, 250, {
      action: { type: 'heal' as ActionType },
    }),
    [defendId]: createNode(defendId, 'action', '防御', 200, 350, {
      action: { type: 'defend' as ActionType },
    }),
    [counterId]: createNode(counterId, 'action', '反击', 500, 350, {
      action: { type: 'attack' as ActionType },
    }),
    [waitId]: createNode(waitId, 'action', '等待', 650, 250, {
      action: { type: 'wait' as ActionType },
    }),
  }

  const edges: BTEdge[] = [
    createEdge(rootId, hpCheckHighId, 0),
    createEdge(rootId, hpCheckLowId, 1),
    createEdge(hpCheckHighId, counterId, 0),
    createEdge(hpCheckHighId, defendId, 1),
    createEdge(hpCheckLowId, healId, 0),
    createEdge(hpCheckLowId, waitId, 1),
  ]

  return {
    id: generateId(),
    name: '防御AI',
    rootNodeId: rootId,
    nodes,
    edges,
  }
}
