import { BehaviorTree, BattleRequest, BattleResponse, BattleState, BattleEvent, BattleStats } from '../types'

const BASE_URL = 'http://localhost:8080/api'
const PING_INTERVAL = 25000
const PONG_TIMEOUT = 35000
const INITIAL_RECONNECT_DELAY = 1000
const MAX_RECONNECT_DELAY = 300000
const MAX_RECONNECT_ATTEMPTS = 20

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
  onClose?: (willReconnect: boolean) => void
  onReconnect?: (attempt: number) => void
  onOpen?: () => void
}

export interface ReconnectingWebSocket {
  ws: WebSocket | null
  close: () => void
  reconnect: () => void
  isOpen: () => boolean
}

export function createBattleWS(
  battleId: string,
  handlers: WebSocketHandlers
): ReconnectingWebSocket {
  let ws: WebSocket | null = null
  let reconnectAttempts = 0
  let reconnectDelay = INITIAL_RECONNECT_DELAY
  let shouldReconnect = true
  let pingTimer: ReturnType<typeof setInterval> | null = null
  let pongTimer: ReturnType<typeof setTimeout> | null = null

  const wsUrl = BASE_URL.replace('http://', 'ws://').replace('/api', '')

  function clearTimers() {
    if (pingTimer) {
      clearInterval(pingTimer)
      pingTimer = null
    }
    if (pongTimer) {
      clearTimeout(pongTimer)
      pongTimer = null
    }
  }

  function startHeartbeat() {
    clearTimers()

    pingTimer = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }))
        } catch (e) {
        }

        pongTimer = setTimeout(() => {
          if (ws) {
            ws.close()
          }
        }, PONG_TIMEOUT)
      }
    }, PING_INTERVAL)
  }

  function connect() {
    clearTimers()

    ws = new WebSocket(`${wsUrl}/ws/battle/${battleId}`)

    ws.onopen = () => {
      reconnectAttempts = 0
      reconnectDelay = INITIAL_RECONNECT_DELAY
      startHeartbeat()
      handlers.onOpen?.()
    }

    ws.onmessage = (event) => {
      if (pongTimer) {
        clearTimeout(pongTimer)
        pongTimer = null
      }

      try {
        const data = JSON.parse(event.data)
        handlers.onMessage(data)
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e)
      }
    }

    ws.onerror = (error) => {
      handlers.onError?.(error)
    }

    ws.onclose = (event) => {
      clearTimers()

      if (!shouldReconnect) {
        handlers.onClose?.(false)
        return
      }

      if (event.code === 1000 || event.code === 1001) {
        handlers.onClose?.(false)
        return
      }

      reconnectAttempts++

      if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        handlers.onClose?.(false)
        return
      }

      handlers.onClose?.(true)
      handlers.onReconnect?.(reconnectAttempts)

      const delay = Math.min(reconnectDelay * Math.pow(1.5, reconnectAttempts - 1), MAX_RECONNECT_DELAY)
      const jitter = delay * 0.1 * (Math.random() * 2 - 1)

      setTimeout(() => {
        if (shouldReconnect) {
          connect()
        }
      }, delay + jitter)
    }
  }

  connect()

  return {
    get ws() {
      return ws
    },
    close: () => {
      shouldReconnect = false
      clearTimers()
      if (ws) {
        ws.close(1000, 'Client closing')
        ws = null
      }
    },
    reconnect: () => {
      reconnectAttempts = 0
      reconnectDelay = INITIAL_RECONNECT_DELAY
      shouldReconnect = true
      if (ws) {
        ws.close()
      } else {
        connect()
      }
    },
    isOpen: () => ws !== null && ws.readyState === WebSocket.OPEN,
  }
}
