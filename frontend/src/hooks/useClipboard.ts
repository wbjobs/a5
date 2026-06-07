import { useState, useCallback } from 'react'
import { BTNode, Position } from '../types'
import { generateId } from '../utils/btUtils'

interface UseClipboardReturn {
  copiedNode: BTNode | null
  hasCopiedNode: boolean
  copyNode: (node: BTNode) => void
  pasteNode: (position: Position) => BTNode | null
}

export function useClipboard(): UseClipboardReturn {
  const [copiedNode, setCopiedNode] = useState<BTNode | null>(null)

  const hasCopiedNode = copiedNode !== null

  const deepCloneNode = useCallback((node: BTNode): BTNode => {
    return {
      ...node,
      data: {
        ...node.data,
        condition: node.data.condition ? { ...node.data.condition } : undefined,
        action: node.data.action ? { ...node.data.action } : undefined,
      },
    }
  }, [])

  const copyNode = useCallback((node: BTNode) => {
    const cloned = deepCloneNode(node)
    setCopiedNode(cloned)
  }, [deepCloneNode])

  const pasteNode = useCallback((position: Position): BTNode | null => {
    if (!copiedNode) return null

    const pastedNode: BTNode = {
      ...deepCloneNode(copiedNode),
      id: generateId(),
      position: {
        x: position.x + 30,
        y: position.y + 30,
      },
    }

    return pastedNode
  }, [copiedNode, deepCloneNode])

  return {
    copiedNode,
    hasCopiedNode,
    copyNode,
    pasteNode,
  }
}
