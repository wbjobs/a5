export type BTNodeType = 'selector' | 'sequence' | 'condition' | 'action'

export type ConditionType = 'hp_above' | 'hp_below' | 'enemy_hp_above' | 'enemy_hp_below' | 'skill_ready' | 'energy_above' | 'cooldown_ready'

export type ActionType = 'attack' | 'skill' | 'defend' | 'heal' | 'wait' | 'charge'

export type NodeStatus = 'idle' | 'running' | 'success' | 'failure'

export type EventType = 'attack' | 'skill' | 'defend' | 'heal' | 'buff' | 'damage' | 'death' | 'node_result'

export type FighterSide = 'ai1' | 'ai2' | 'draw'

export interface Position {
  x: number
  y: number
}

export interface Condition {
  type: ConditionType
  value?: number
  skillId?: string
}

export interface ActionData {
  type: ActionType
  skillId?: string
  target?: 'self' | 'enemy'
}

export interface BTNodeData {
  nodeType: BTNodeType
  label: string
  condition?: Condition
  action?: ActionData
}

export interface BTNode {
  id: string
  type: string
  position: Position
  data: BTNodeData
}

export interface BTEdge {
  id: string
  source: string
  target: string
}

export interface BehaviorTree {
  id: string
  name: string
  rootNodeId: string
  nodes: Record<string, BTNode>
  edges: BTEdge[]
}

export interface SkillState {
  id: string
  name: string
  cooldown: number
  maxCooldown: number
  energyCost: number
  damage: number
  heal: number
}

export interface Buff {
  id: string
  name: string
  duration: number
  effect: string
  value: number
}

export interface ExecutionStackFrame {
  nodeId: string
  nodeType: BTNodeType
  status: NodeStatus
  timestamp: number
  depth: number
}

export interface AimPrediction {
  skillId: string
  predictedX: number
  predictedY: number
  confidence: number
  leadTime: number
}

export interface FighterState {
  id: FighterSide
  name: string
  hp: number
  maxHp: number
  energy: number
  maxEnergy: number
  attack: number
  defense: number
  skills: SkillState[]
  buffs: Buff[]
  isDefending: boolean
  x: number
  y: number
  vx: number
  vy: number
}

export interface BattleEvent {
  id: string
  timestamp: number
  type: EventType
  side?: FighterSide
  message: string
  data?: Record<string, unknown>
  nodeId?: string
  nodeStatus?: NodeStatus
  prediction?: AimPrediction
}

export interface BattleState {
  battleId: string
  frame: number
  round: number
  isRunning: boolean
  isPaused: boolean
  isFinished: boolean
  winner: FighterSide | null
  ai1: FighterState
  ai2: FighterState
  ai1CurrentNodeId?: string
  ai2CurrentNodeId?: string
  ai1Path: string[]
  ai2Path: string[]
  ai1NodeStatus: Record<string, NodeStatus>
  ai2NodeStatus: Record<string, NodeStatus>
  events: BattleEvent[]
  executionStack: string[]
  stepMode: boolean
  currentStep: number
}

export interface BattleRequest {
  ai1Tree: BehaviorTree
  ai2Tree: BehaviorTree
  maxRounds?: number
}

export interface BattleResponse {
  battleId: string
  success: boolean
  message?: string
}

export interface BattleStats {
  totalBattles: number
  ai1Wins: number
  ai2Wins: number
  draws: number
  avgRounds: number
  mostUsedActions: Record<ActionType, number>
  winRateHistory: Array<{
    battleId: string
    ai1WinRate: number
    ai2WinRate: number
  }>
}
