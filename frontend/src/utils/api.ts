import { BehaviorTree, BattleRequest, BattleResponse, BattleState, BattleEvent, BattleStats } from '../types'

const BASE_URL = 'http://localhost:8080/api'

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export function getBehaviorTrees(): Promise<BehaviorTree[]> {
  return request<BehaviorTree[]>('/behavior-trees')
}

export function getBehaviorTree(id: string): Promise<BehaviorTree> {
  return request<BehaviorTree>(`/behavior-trees/${id}`)
}

export function saveBehaviorTree(tree: Omit<BehaviorTree, 'id'>): Promise<BehaviorTree> {
  return request<BehaviorTree>('/behavior-trees', {
    method: 'POST',
    body: JSON.stringify(tree),
  })
}

export function updateBehaviorTree(id: string, tree: Partial<BehaviorTree>): Promise<BehaviorTree> {
  return request<BehaviorTree>(`/behavior-trees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(tree),
  })
}

export function deleteBehaviorTree(id: string): Promise<void> {
  return request<void>(`/behavior-trees/${id}`, {
    method: 'DELETE',
  })
}

export function startBattle(battleRequest: BattleRequest): Promise<BattleResponse> {
  return request<BattleResponse>('/battle/start', {
    method: 'POST',
    body: JSON.stringify(battleRequest),
  })
}

export function getBattle(id: string): Promise<BattleState> {
  return request<BattleState>(`/battle/${id}`)
}

export function getBattleLogs(id: string): Promise<BattleEvent[]> {
  return request<BattleEvent[]>(`/battle/${id}/logs`)
}

export function getStats(): Promise<BattleStats> {
  return request<BattleStats>('/stats')
}

export interface WebSocketHandlers {
  onMessage: (data: BattleState | BattleEvent) => void
  onError?: (error: Event) => void
  onClose?: () => void
}

export function createBattleWS(
  battleId: string,
  onMessage: WebSocketHandlers['onMessage'],
  onError?: WebSocketHandlers['onError'],
  onClose?: WebSocketHandlers['onClose']
): WebSocket {
  const wsUrl = BASE_URL.replace('http://', 'ws://').replace('/api', '')
  const ws = new WebSocket(`${wsUrl}/ws/battle/${battleId}`)

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      onMessage(data)
    } catch (e) {
      console.error('Failed to parse WebSocket message:', e)
    }
  }

  if (onError) {
    ws.onerror = onError
  }

  if (onClose) {
    ws.onclose = onClose
  }

  return ws
}
