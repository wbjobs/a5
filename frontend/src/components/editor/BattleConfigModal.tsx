import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Swords, User, Bot, Settings, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useEditorStore } from '../../store/editorStore'
import { useBattleStore } from '../../store/battleStore'
import { getBehaviorTrees } from '../../utils/api'
import { BehaviorTree } from '../../types'

interface BattleConfigModalProps {
  isOpen: boolean
  onClose: () => void
}

export const BattleConfigModal: React.FC<BattleConfigModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const { exportToJSON, treeName } = useEditorStore()
  const { setTrees } = useBattleStore()

  const [savedTrees, setSavedTrees] = useState<BehaviorTree[]>([])
  const [ai1Source, setAi1Source] = useState<'current' | 'saved'>('current')
  const [ai2Source, setAi2Source] = useState<'current' | 'saved'>('saved')
  const [ai1TreeId, setAi1TreeId] = useState<string>('')
  const [ai2TreeId, setAi2TreeId] = useState<string>('')
  const [ai1Name, setAi1Name] = useState('战士AI')
  const [ai2Name, setAi2Name] = useState('对手AI')
  const [maxRounds, setMaxRounds] = useState(100)
  const [frameInterval, setFrameInterval] = useState(100)

  useEffect(() => {
    if (isOpen) {
      loadSavedTrees()
    }
  }, [isOpen])

  const loadSavedTrees = async () => {
    try {
      const trees = await getBehaviorTrees()
      setSavedTrees(trees)
      if (trees.length > 0) {
        setAi2TreeId(trees[0].id)
      }
    } catch (error) {
      console.error('加载保存的树失败:', error)
    }
  }

  const getCurrentTree = (): BehaviorTree => {
    const tree = exportToJSON()
    return {
      ...tree,
      name: ai1Source === 'current' ? ai1Name : tree.name,
    }
  }

  const getTreeById = (id: string): BehaviorTree | undefined => {
    return savedTrees.find((t) => t.id === id)
  }

  const handleStartBattle = () => {
    const ai1Tree = ai1Source === 'current' ? getCurrentTree() : getTreeById(ai1TreeId)
    const ai2Tree = ai2Source === 'current' ? getCurrentTree() : getTreeById(ai2TreeId)

    if (!ai1Tree || !ai2Tree) {
      alert('请选择有效的行为树')
      return
    }

    ai1Tree.name = ai1Name
    ai2Tree.name = ai2Name

    setTrees(ai1Tree, ai2Tree)
    onClose()
    navigate('/battle', {
      state: {
        ai1Tree,
        ai2Tree,
        maxRounds,
        frameInterval,
      },
    })
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-gray-900 border-2 border-cyan-500/50 rounded-xl shadow-2xl shadow-cyan-500/20 w-full max-w-2xl relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
            <div className="absolute top-0 bottom-0 left-0 w-px bg-gradient-to-b from-transparent via-cyan-500 to-transparent" />
            <div className="absolute top-0 bottom-0 right-0 w-px bg-gradient-to-b from-transparent via-cyan-500 to-transparent" />
          </div>

          <div className="p-6 relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-pink-500/30 to-purple-500/30 rounded-lg border border-pink-500/50">
                  <Swords className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-wider">
                    ╔══ 对战配置 ══╗
                  </h2>
                  <p className="text-gray-500 text-sm">配置AI对战参数</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-400 font-bold">
                  <User className="w-5 h-5" />
                  <span>AI 1 (蓝方)</span>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs text-gray-400">AI名称</label>
                  <input
                    type="text"
                    value={ai1Name}
                    onChange={(e) => setAi1Name(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-cyan-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs text-gray-400">行为树来源</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAi1Source('current')}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        ai1Source === 'current'
                          ? 'bg-cyan-600/30 border border-cyan-400 text-cyan-300'
                          : 'bg-gray-800/50 border border-gray-700 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      当前编辑器
                    </button>
                    <button
                      onClick={() => setAi1Source('saved')}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        ai1Source === 'saved'
                          ? 'bg-cyan-600/30 border border-cyan-400 text-cyan-300'
                          : 'bg-gray-800/50 border border-gray-700 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      已保存
                    </button>
                  </div>
                </div>

                {ai1Source === 'saved' && savedTrees.length > 0 && (
                  <div className="space-y-2">
                    <label className="block text-xs text-gray-400">选择行为树</label>
                    <select
                      value={ai1TreeId}
                      onChange={(e) => setAi1TreeId(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-cyan-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all"
                    >
                      {savedTrees.map((tree) => (
                        <option key={tree.id} value={tree.id}>
                          {tree.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {ai1Source === 'current' && (
                  <div className="p-3 bg-cyan-900/20 border border-cyan-500/30 rounded-lg">
                    <p className="text-cyan-300 text-xs">
                      使用当前编辑器中的行为树: <span className="font-mono">{treeName}</span>
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-pink-400 font-bold">
                  <Bot className="w-5 h-5" />
                  <span>AI 2 (红方)</span>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs text-gray-400">AI名称</label>
                  <input
                    type="text"
                    value={ai2Name}
                    onChange={(e) => setAi2Name(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-pink-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400/50 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs text-gray-400">行为树来源</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAi2Source('current')}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        ai2Source === 'current'
                          ? 'bg-pink-600/30 border border-pink-400 text-pink-300'
                          : 'bg-gray-800/50 border border-gray-700 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      当前编辑器
                    </button>
                    <button
                      onClick={() => setAi2Source('saved')}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        ai2Source === 'saved'
                          ? 'bg-pink-600/30 border border-pink-400 text-pink-300'
                          : 'bg-gray-800/50 border border-gray-700 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      已保存
                    </button>
                  </div>
                </div>

                {ai2Source === 'saved' && savedTrees.length > 0 && (
                  <div className="space-y-2">
                    <label className="block text-xs text-gray-400">选择行为树</label>
                    <select
                      value={ai2TreeId}
                      onChange={(e) => setAi2TreeId(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-pink-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400/50 transition-all"
                    >
                      {savedTrees.map((tree) => (
                        <option key={tree.id} value={tree.id}>
                          {tree.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {ai2Source === 'current' && (
                  <div className="p-3 bg-pink-900/20 border border-pink-500/30 rounded-lg">
                    <p className="text-pink-300 text-xs">
                      使用当前编辑器中的行为树: <span className="font-mono">{treeName}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent my-6" />

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2 text-purple-400 font-bold">
                <Settings className="w-5 h-5" />
                <span>战斗设置</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs text-gray-400">最大回合数</label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    value={maxRounds}
                    onChange={(e) => setMaxRounds(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-purple-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs text-gray-400">帧间隔 (毫秒)</label>
                  <input
                    type="number"
                    min="10"
                    max="2000"
                    step="10"
                    value={frameInterval}
                    onChange={(e) => setFrameInterval(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-purple-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-300 text-sm hover:bg-gray-700/50 hover:border-gray-600 transition-all"
              >
                取消
              </button>
              <button
                onClick={handleStartBattle}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-pink-600/50 to-purple-600/50 border border-pink-500/50 rounded-lg text-white text-sm font-bold hover:from-pink-600/70 hover:to-purple-600/70 hover:border-pink-400 hover:shadow-lg hover:shadow-pink-500/30 transition-all"
              >
                <Play className="w-4 h-4" />
                开始战斗
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
