import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Trash2, X, Target } from 'lucide-react'
import { useEditorStore } from '../../store/editorStore'
import { BTNode, ConditionType, ActionType } from '../../types'

const conditionTypes: { value: ConditionType; label: string; description: string }[] = [
  { value: 'hp_above', label: 'HP高于', description: '自身HP大于阈值' },
  { value: 'hp_below', label: 'HP低于', description: '自身HP小于阈值' },
  { value: 'enemy_hp_above', label: '敌人HP高于', description: '敌人HP大于阈值' },
  { value: 'enemy_hp_below', label: '敌人HP低于', description: '敌人HP小于阈值' },
  { value: 'skill_ready', label: '技能就绪', description: '指定技能冷却完成' },
  { value: 'energy_above', label: '能量高于', description: '能量大于阈值' },
  { value: 'cooldown_ready', label: '冷却就绪', description: '指定技能冷却完成' },
]

const actionTypes: { value: ActionType; label: string; description: string }[] = [
  { value: 'attack', label: '普通攻击', description: '造成基础伤害' },
  { value: 'skill', label: '使用技能', description: '释放指定技能' },
  { value: 'defend', label: '防御', description: '减少受到的伤害' },
  { value: 'heal', label: '治疗', description: '恢复生命值' },
  { value: 'wait', label: '等待', description: '跳过当前回合' },
  { value: 'charge', label: '蓄力', description: '下回合伤害提升' },
]

const skillOptions = [
  { value: 'skill_1', label: '技能1 - 烈焰斩' },
  { value: 'skill_2', label: '技能2 - 冰霜盾' },
  { value: 'skill_3', label: '技能3 - 雷霆击' },
  { value: 'skill_4', label: '技能4 - 治愈术' },
]

export const PropertyPanel: React.FC = () => {
  const { selectedNodeId, nodes, updateNodeData, deleteNode, setSelectedNode } = useEditorStore()

  const selectedNode = selectedNodeId ? nodes.get(selectedNodeId) : null

  const handleLabelChange = (label: string) => {
    if (selectedNodeId) {
      updateNodeData(selectedNodeId, { label })
    }
  }

  const handleConditionTypeChange = (type: ConditionType) => {
    if (selectedNodeId) {
      const node = nodes.get(selectedNodeId)
      updateNodeData(selectedNodeId, {
        condition: {
          ...node?.data.condition,
          type,
        },
      })
    }
  }

  const handleConditionValueChange = (value: number) => {
    if (selectedNodeId) {
      const node = nodes.get(selectedNodeId)
      updateNodeData(selectedNodeId, {
        condition: {
          type: 'hp_above',
          ...node?.data.condition,
          value,
        },
      })
    }
  }

  const handleSkillIdChange = (skillId: string, isCondition: boolean) => {
    if (selectedNodeId) {
      const node = nodes.get(selectedNodeId)
      if (isCondition) {
        updateNodeData(selectedNodeId, {
          condition: {
            type: 'skill_ready',
            ...node?.data.condition,
            skillId,
          },
        })
      } else {
        updateNodeData(selectedNodeId, {
          action: {
            type: 'skill',
            ...node?.data.action,
            skillId,
          },
        })
      }
    }
  }

  const handleActionTypeChange = (type: ActionType) => {
    if (selectedNodeId) {
      const node = nodes.get(selectedNodeId)
      updateNodeData(selectedNodeId, {
        action: {
          ...node?.data.action,
          type,
        },
      })
    }
  }

  const handleActionTargetChange = (target: 'self' | 'enemy') => {
    if (selectedNodeId) {
      const node = nodes.get(selectedNodeId)
      updateNodeData(selectedNodeId, {
        action: {
          type: 'heal',
          ...node?.data.action,
          target,
        },
      })
    }
  }

  const handleDelete = () => {
    if (selectedNodeId) {
      deleteNode(selectedNodeId)
    }
  }

  const handleClose = () => {
    setSelectedNode(null)
  }

  const needsValue = (type: ConditionType): boolean => {
    return ['hp_above', 'hp_below', 'enemy_hp_above', 'enemy_hp_below', 'energy_above'].includes(type)
  }

  const needsSkillId = (type: ConditionType | ActionType): boolean => {
    return ['skill_ready', 'cooldown_ready', 'skill'].includes(type)
  }

  const getNodeColor = (node: BTNode) => {
    switch (node.data.nodeType) {
      case 'selector':
        return { border: 'border-cyan-400/50', bg: 'from-cyan-500/20 to-cyan-600/10', text: 'text-cyan-400' }
      case 'sequence':
        return { border: 'border-purple-400/50', bg: 'from-purple-500/20 to-purple-600/10', text: 'text-purple-400' }
      case 'condition':
        return { border: 'border-yellow-400/50', bg: 'from-yellow-500/20 to-yellow-600/10', text: 'text-yellow-400' }
      case 'action':
        return { border: 'border-pink-400/50', bg: 'from-pink-500/20 to-pink-600/10', text: 'text-pink-400' }
      default:
        return { border: 'border-gray-400/50', bg: 'from-gray-500/20 to-gray-600/10', text: 'text-gray-400' }
    }
  }

  return (
    <div className="w-72 bg-gray-900/95 border-l border-cyan-500/30 flex flex-col h-full">
      <div className="p-4 border-b border-cyan-500/30 bg-gradient-to-r from-transparent to-cyan-900/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          <h2 className="text-cyan-400 font-bold text-lg tracking-wider">
            属性面板
          </h2>
        </div>
        {selectedNode && (
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-700/50 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          {selectedNode ? (
            <motion.div
              key="selected"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className={`p-3 rounded-lg border ${getNodeColor(selectedNode).border} bg-gradient-to-br ${getNodeColor(selectedNode).bg}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-bold ${getNodeColor(selectedNode).text}`}>
                    {selectedNode.data.nodeType.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">
                    ID: {selectedNode.id.slice(-8)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs text-gray-400 font-medium tracking-wide">
                  节点名称
                </label>
                <input
                  type="text"
                  value={selectedNode.data.label}
                  onChange={(e) => handleLabelChange(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-cyan-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all"
                />
              </div>

              {selectedNode.data.nodeType === 'condition' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4 pt-2"
                >
                  <div className="h-px bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent" />

                  <div className="space-y-2">
                    <label className="block text-xs text-yellow-400 font-medium tracking-wide">
                      条件类型
                    </label>
                    <select
                      value={selectedNode.data.condition?.type || 'hp_above'}
                      onChange={(e) => handleConditionTypeChange(e.target.value as ConditionType)}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-yellow-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/50 transition-all"
                    >
                      {conditionTypes.map((ct) => (
                        <option key={ct.value} value={ct.value}>
                          {ct.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500">
                      {conditionTypes.find((ct) => ct.value === selectedNode.data.condition?.type)?.description}
                    </p>
                  </div>

                  {selectedNode.data.condition?.type && needsValue(selectedNode.data.condition.type) && (
                    <div className="space-y-2">
                      <label className="block text-xs text-yellow-400 font-medium tracking-wide">
                        阈值 (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={selectedNode.data.condition?.value || 0}
                        onChange={(e) => handleConditionValueChange(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-gray-800/50 border border-yellow-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/50 transition-all"
                      />
                    </div>
                  )}

                  {selectedNode.data.condition?.type && needsSkillId(selectedNode.data.condition.type) && (
                    <div className="space-y-2">
                      <label className="block text-xs text-yellow-400 font-medium tracking-wide">
                        <div className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          技能ID
                        </div>
                      </label>
                      <select
                        value={selectedNode.data.condition?.skillId || ''}
                        onChange={(e) => handleSkillIdChange(e.target.value, true)}
                        className="w-full px-3 py-2 bg-gray-800/50 border border-yellow-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/50 transition-all"
                      >
                        {skillOptions.map((skill) => (
                          <option key={skill.value} value={skill.value}>
                            {skill.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </motion.div>
              )}

              {selectedNode.data.nodeType === 'action' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4 pt-2"
                >
                  <div className="h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent" />

                  <div className="space-y-2">
                    <label className="block text-xs text-pink-400 font-medium tracking-wide">
                      动作类型
                    </label>
                    <select
                      value={selectedNode.data.action?.type || 'attack'}
                      onChange={(e) => handleActionTypeChange(e.target.value as ActionType)}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-pink-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400/50 transition-all"
                    >
                      {actionTypes.map((at) => (
                        <option key={at.value} value={at.value}>
                          {at.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500">
                      {actionTypes.find((at) => at.value === selectedNode.data.action?.type)?.description}
                    </p>
                  </div>

                  {selectedNode.data.action?.type && needsSkillId(selectedNode.data.action.type) && (
                    <div className="space-y-2">
                      <label className="block text-xs text-pink-400 font-medium tracking-wide">
                        <div className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          技能ID
                        </div>
                      </label>
                      <select
                        value={selectedNode.data.action?.skillId || ''}
                        onChange={(e) => handleSkillIdChange(e.target.value, false)}
                        className="w-full px-3 py-2 bg-gray-800/50 border border-pink-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400/50 transition-all"
                      >
                        {skillOptions.map((skill) => (
                          <option key={skill.value} value={skill.value}>
                            {skill.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {selectedNode.data.action?.type === 'heal' && (
                    <div className="space-y-2">
                      <label className="block text-xs text-pink-400 font-medium tracking-wide">
                        目标
                      </label>
                      <select
                        value={selectedNode.data.action?.target || 'self'}
                        onChange={(e) => handleActionTargetChange(e.target.value as 'self' | 'enemy')}
                        className="w-full px-3 py-2 bg-gray-800/50 border border-pink-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400/50 transition-all"
                      >
                        <option value="self">自身</option>
                        <option value="enemy">敌人</option>
                      </select>
                    </div>
                  )}
                </motion.div>
              )}

              <div className="pt-4">
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400 text-sm hover:bg-red-900/50 hover:border-red-400 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  删除节点
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full text-center"
            >
              <div className="w-16 h-16 mb-4 rounded-full bg-gray-800/50 border border-gray-700 flex items-center justify-center">
                <Settings className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-500 text-sm">选择一个节点</p>
              <p className="text-gray-600 text-xs mt-1">查看和编辑属性</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-3 border-t border-cyan-500/30 bg-gray-900/50">
        <div className="text-xs text-gray-500 text-center">
          <p>节点数量: {nodes.size}</p>
        </div>
      </div>
    </div>
  )
}
