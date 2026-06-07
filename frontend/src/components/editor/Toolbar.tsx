import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Save,
  FolderOpen,
  Trash2,
  Download,
  Upload,
  Swords,
  FileText,
  AlertTriangle,
} from 'lucide-react'
import { useEditorStore } from '../../store/editorStore'
import { saveBehaviorTree, getBehaviorTrees } from '../../utils/api'
import { createDefaultTree, createAggressiveTree, createDefensiveTree, validateTree } from '../../utils/btUtils'
import { BehaviorTree } from '../../types'

interface ToolbarProps {
  onStartBattle: () => void
}

export const Toolbar: React.FC<ToolbarProps> = ({ onStartBattle }) => {
  const { treeName, setTreeName, clearAll, importFromJSON, exportToJSON, loadTemplate, nodes, edges, rootNodeId } =
    useEditorStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showLoadDropdown, setShowLoadDropdown] = useState(false)
  const [savedTrees, setSavedTrees] = useState<BehaviorTree[]>([])
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const handleSave = async () => {
    try {
      const tree = exportToJSON()
      await saveBehaviorTree(tree)
      alert('保存成功！')
    } catch (error) {
      console.error('保存失败:', error)
      alert('保存失败，请检查控制台')
    }
  }

  const handleLoad = async () => {
    try {
      const trees = await getBehaviorTrees()
      setSavedTrees(trees)
      setShowLoadDropdown(true)
    } catch (error) {
      console.error('加载失败:', error)
      alert('加载失败，请检查控制台')
    }
  }

  const handleLoadTree = (tree: BehaviorTree) => {
    importFromJSON(tree)
    setShowLoadDropdown(false)
  }

  const handleClear = () => {
    if (confirm('确定要清空所有节点吗？')) {
      clearAll()
    }
  }

  const handleExport = () => {
    const tree = exportToJSON()
    const blob = new Blob([JSON.stringify(tree, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${treeName.replace(/\s+/g, '_')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const tree = JSON.parse(e.target?.result as string) as BehaviorTree
          importFromJSON(tree)
        } catch {
          alert('导入失败：无效的JSON文件')
        }
      }
      reader.readAsText(file)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleTemplateChange = (template: string) => {
    switch (template) {
      case 'default':
        loadTemplate(createDefaultTree())
        break
      case 'aggressive':
        loadTemplate(createAggressiveTree())
        break
      case 'defensive':
        loadTemplate(createDefensiveTree())
        break
    }
  }

  const handleValidate = () => {
    const result = validateTree(nodes, edges, rootNodeId)
    if (result.valid) {
      alert('行为树验证通过！')
      setValidationErrors([])
    } else {
      setValidationErrors(result.errors)
    }
  }

  return (
    <div className="h-16 bg-gray-900/95 border-b border-cyan-500/30 flex items-center px-4 gap-4 relative">
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(0,255,255,0.1) 50%, transparent 100%)',
        }}
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />

      <div className="flex items-center gap-3 z-10">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-cyan-400" />
          <input
            type="text"
            value={treeName}
            onChange={(e) => setTreeName(e.target.value)}
            className="px-3 py-1.5 bg-gray-800/50 border border-cyan-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all w-48"
            placeholder="行为树名称"
          />
        </div>

        <select
          onChange={(e) => handleTemplateChange(e.target.value)}
          defaultValue=""
          className="px-3 py-1.5 bg-gray-800/50 border border-purple-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 transition-all"
        >
          <option value="" disabled>
            加载预设模板
          </option>
          <option value="default">默认战士AI</option>
          <option value="aggressive">激进AI</option>
          <option value="defensive">防御AI</option>
        </select>
      </div>

      <div className="h-8 w-px bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent" />

      <div className="flex items-center gap-2 z-10">
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-900/30 border border-cyan-500/50 rounded-lg text-cyan-400 text-sm hover:bg-cyan-900/50 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
        >
          <Save className="w-4 h-4" />
          保存
        </button>

        <div className="relative">
          <button
            onClick={handleLoad}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-900/30 border border-blue-500/50 rounded-lg text-blue-400 text-sm hover:bg-blue-900/50 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/20 transition-all"
          >
            <FolderOpen className="w-4 h-4" />
            加载
          </button>

          {showLoadDropdown && savedTrees.length > 0 && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-gray-900 border border-cyan-500/30 rounded-lg shadow-xl shadow-cyan-500/10 z-50 max-h-64 overflow-y-auto">
              {savedTrees.map((tree) => (
                <button
                  key={tree.id}
                  onClick={() => handleLoadTree(tree)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-cyan-900/30 hover:text-cyan-400 transition-colors border-b border-gray-800 last:border-b-0"
                >
                  {tree.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleClear}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400 text-sm hover:bg-red-900/50 hover:border-red-400 hover:shadow-lg hover:shadow-red-500/20 transition-all"
        >
          <Trash2 className="w-4 h-4" />
          清空
        </button>
      </div>

      <div className="h-8 w-px bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent" />

      <div className="flex items-center gap-2 z-10">
        <button
          onClick={handleImport}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-900/30 border border-yellow-500/50 rounded-lg text-yellow-400 text-sm hover:bg-yellow-900/50 hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-500/20 transition-all"
        >
          <Upload className="w-4 h-4" />
          导入JSON
        </button>

        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-900/30 border border-green-500/50 rounded-lg text-green-400 text-sm hover:bg-green-900/50 hover:border-green-400 hover:shadow-lg hover:shadow-green-500/20 transition-all"
        >
          <Download className="w-4 h-4" />
          导出JSON
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div className="h-8 w-px bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent" />

      <div className="flex items-center gap-2 z-10">
        <button
          onClick={handleValidate}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-900/30 border border-orange-500/50 rounded-lg text-orange-400 text-sm hover:bg-orange-900/50 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-500/20 transition-all"
        >
          <AlertTriangle className="w-4 h-4" />
          验证
        </button>

        <button
          onClick={onStartBattle}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-pink-600/50 to-purple-600/50 border border-pink-500/50 rounded-lg text-white text-sm font-bold hover:from-pink-600/70 hover:to-purple-600/70 hover:border-pink-400 hover:shadow-lg hover:shadow-pink-500/30 transition-all"
        >
          <Swords className="w-4 h-4" />
          启动对战
        </button>
      </div>

      <div className="flex-1" />

      {validationErrors.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-red-900/90 border border-red-500/50 p-3 z-50">
          <div className="text-red-400 text-sm font-bold mb-2">验证错误：</div>
          <ul className="text-red-300 text-xs space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
          <button
            onClick={() => setValidationErrors([])}
            className="absolute top-2 right-2 text-red-400 hover:text-red-300"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-gray-500 z-10">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span>节点: {nodes.size}</span>
        <span>|</span>
        <span>连接: {edges.length}</span>
      </div>
    </div>
  )
}
