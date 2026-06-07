import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Code2, Swords, BarChart3, Zap, Brain, Target, Shield, Play } from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: '可视化行为树编辑',
    description: '拖拽式节点编辑，实时预览AI决策逻辑，支持选择器、序列器、条件、动作四种节点类型'
  },
  {
    icon: Swords,
    title: '实时战斗模拟',
    description: '双AI实时对战，完整的战斗系统：HP、能量、技能、Buff/Debuff，行为树执行过程可视化'
  },
  {
    icon: Target,
    title: '技能系统',
    description: '攻击、防御、治疗、蓄力等多种技能，冷却时间与能量消耗机制，策略深度对决'
  },
  {
    icon: BarChart3,
    title: '数据统计分析',
    description: '胜率统计、历史对战记录、技能使用率分析，助你优化行为树策略'
  },
  {
    icon: Zap,
    title: '实时Websocket',
    description: '毫秒级战斗数据同步，流畅的动画效果，沉浸式赛博朋克视觉体验'
  },
  {
    icon: Shield,
    title: '高度可扩展',
    description: '模块化架构设计，轻松添加新的条件、动作、技能类型，无限可能'
  }
]

const cards = [
  {
    icon: Code2,
    title: '行为树编辑器',
    description: '创建和编辑AI行为树，可视化设计决策逻辑',
    path: '/editor',
    color: '#00f5ff',
    gradient: 'from-cyan-500/20 to-blue-500/20'
  },
  {
    icon: Swords,
    title: '对战竞技场',
    description: '双AI实时对战，观察行为树执行过程',
    path: '/battle',
    color: '#ff00ff',
    gradient: 'from-pink-500/20 to-purple-500/20'
  },
  {
    icon: BarChart3,
    title: '统计分析',
    description: '查看对战记录、胜率统计和技能使用率',
    path: '/stats',
    color: '#ffff00',
    gradient: 'from-yellow-500/20 to-orange-500/20'
  }
]

export default function Home() {
  const navigate = useNavigate()
  
  return (
    <div className="min-h-screen bg-[var(--cyber-bg-primary)] text-white overflow-hidden">
      <div className="relative min-h-screen">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--cyber-neon-cyan)]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--cyber-neon-pink)]/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--cyber-neon-purple)]/3 rounded-full blur-3xl" />
          
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0, 245, 255, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 245, 255, 0.03) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />
        </div>
        
        <div className="relative z-10">
          <nav className="flex items-center justify-between px-8 py-4 border-b border-[var(--cyber-border)]">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--cyber-neon-cyan)]/20 to-[var(--cyber-neon-purple)]/20 border border-[var(--cyber-neon-cyan)] flex items-center justify-center">
                <Brain size={24} className="text-[var(--cyber-neon-cyan)]" />
              </div>
              <span className="font-display text-xl font-bold tracking-wider">
                <span className="text-[var(--cyber-neon-cyan)]">NEURAL</span>
                <span className="text-[var(--cyber-neon-pink)]">ARENA</span>
              </span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-6"
            >
              {cards.map((card, index) => (
                <button
                  key={card.path}
                  onClick={() => navigate(card.path)}
                  className="font-mono text-sm text-[var(--cyber-text-secondary)] hover:text-white transition-colors flex items-center gap-2"
                >
                  <card.icon size={16} style={{ color: card.color }} />
                  {card.title}
                </button>
              ))}
            </motion.div>
          </nav>
          
          <section className="relative px-8 py-20 min-h-[80vh] flex items-center">
            <div className="max-w-7xl mx-auto w-full grid grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--cyber-neon-cyan)]/10 border border-[var(--cyber-neon-cyan)]/30 rounded-full mb-6">
                  <Zap size={14} className="text-[var(--cyber-neon-cyan)]" />
                  <span className="font-mono text-xs text-[var(--cyber-neon-cyan)]">AI 行为树对战平台</span>
                </div>
                
                <h1 className="font-display text-6xl font-black leading-tight mb-6">
                  <span className="block text-white">设计你的</span>
                  <span className="block bg-gradient-to-r from-[var(--cyber-neon-cyan)] via-[var(--cyber-neon-purple)] to-[var(--cyber-neon-pink)] bg-clip-text text-transparent cyber-text-glow">
                    AI 战斗大师
                  </span>
                </h1>
                
                <p className="font-mono text-lg text-[var(--cyber-text-secondary)] mb-8 leading-relaxed">
                  通过可视化行为树编辑器，为你的AI战士设计独特的战斗策略。
                  在竞技场中与其他AI对战，分析数据，不断优化，成为最强的AI训练师！
                </p>
                
                <div className="flex items-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/editor')}
                    className="group relative cyber-btn px-8 py-4 text-base flex items-center gap-3 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      <Play size={20} />
                      开始创建
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--cyber-neon-cyan)]/20 to-[var(--cyber-neon-purple)]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/battle')}
                    className="px-8 py-4 font-display font-semibold uppercase tracking-wider bg-transparent border border-[var(--cyber-border)] text-[var(--cyber-text-secondary)] hover:text-white hover:border-[var(--cyber-neon-pink)] transition-all flex items-center gap-3"
                  >
                    <Swords size={20} />
                    快速对战
                  </motion.button>
                </div>
                
                <div className="flex items-center gap-8 mt-12 pt-8 border-t border-[var(--cyber-border)]">
                  <div>
                    <div className="font-display text-3xl font-bold text-[var(--cyber-neon-cyan)]">4+</div>
                    <div className="font-mono text-xs text-[var(--cyber-text-muted)]">节点类型</div>
                  </div>
                  <div>
                    <div className="font-display text-3xl font-bold text-[var(--cyber-neon-pink)]">6+</div>
                    <div className="font-mono text-xs text-[var(--cyber-text-muted)]">技能类型</div>
                  </div>
                  <div>
                    <div className="font-display text-3xl font-bold text-[var(--cyber-neon-yellow)]">∞</div>
                    <div className="font-mono text-xs text-[var(--cyber-text-muted)]">策略组合</div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
                className="relative"
              >
                <div className="aspect-square relative">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--cyber-neon-cyan)]/20 via-[var(--cyber-neon-purple)]/10 to-[var(--cyber-neon-pink)]/20 border border-[var(--cyber-border)]" />
                  
                  <div className="absolute inset-4 rounded-xl bg-[var(--cyber-bg-secondary)]/80 border border-[var(--cyber-border)]/50 backdrop-blur-sm overflow-hidden">
                    <div className="p-4 border-b border-[var(--cyber-border)] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[var(--cyber-neon-red)]" />
                        <div className="w-3 h-3 rounded-full bg-[var(--cyber-neon-yellow)]" />
                        <div className="w-3 h-3 rounded-full bg-[var(--cyber-neon-green)]" />
                      </div>
                      <span className="font-mono text-xs text-[var(--cyber-text-muted)]">battle_simulator.exe</span>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[var(--cyber-neon-cyan)]/20 border border-[var(--cyber-neon-cyan)] flex items-center justify-center">
                            <span className="text-[var(--cyber-neon-cyan)] font-bold text-sm">P1</span>
                          </div>
                          <div>
                            <div className="font-display font-bold text-white">进攻型AI</div>
                            <div className="font-mono text-xs text-[var(--cyber-text-muted)]">HP: 1000/1000</div>
                          </div>
                        </div>
                        <div className="font-mono text-2xl font-bold text-[var(--cyber-neon-yellow)]">VS</div>
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="font-display font-bold text-white text-right">防守型AI</div>
                            <div className="font-mono text-xs text-[var(--cyber-text-muted)] text-right">HP: 800/1000</div>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-[var(--cyber-neon-pink)]/20 border border-[var(--cyber-neon-pink)] flex items-center justify-center">
                            <span className="text-[var(--cyber-neon-pink)] font-bold text-sm">P2</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="relative h-2 bg-[var(--cyber-bg-tertiary)] rounded-full overflow-hidden">
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--cyber-neon-green)] to-[var(--cyber-neon-yellow)]"
                          initial={{ width: '100%' }}
                          animate={{ width: '80%' }}
                          transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
                        />
                      </div>
                      
                      <div className="flex justify-center gap-6">
                        {['attack', 'defend', 'heal', 'skill'].map((skill, i) => (
                          <motion.div
                            key={skill}
                            className="w-12 h-12 rounded-full bg-[var(--cyber-bg-tertiary)] border border-[var(--cyber-border)] flex items-center justify-center"
                            animate={{
                              scale: [1, 1.1, 1],
                              borderColor: i === 1 
                                ? ['var(--cyber-border)', 'var(--cyber-neon-blue)', 'var(--cyber-border)']
                                : 'var(--cyber-border)'
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: i * 0.3
                            }}
                          >
                            <Swords
                              size={20}
                              className={i === 1 ? 'text-[var(--cyber-neon-blue)]' : 'text-[var(--cyber-text-muted)]'}
                            />
                          </motion.div>
                        ))}
                      </div>
                      
                      <div className="font-mono text-xs text-[var(--cyber-text-muted)] space-y-1">
                        <div>
                          <span className="text-[var(--cyber-neon-cyan)]">[AI-1]</span>
                          <span className="text-[var(--cyber-neon-orange)]"> ATTACK</span>
                          <span className="text-[var(--cyber-text-secondary)]"> - 造成 150 点伤害</span>
                        </div>
                        <div>
                          <span className="text-[var(--cyber-neon-pink)]">[AI-2]</span>
                          <span className="text-[var(--cyber-neon-blue)]"> DEFEND</span>
                          <span className="text-[var(--cyber-text-secondary)]"> - 减免 50% 伤害</span>
                        </div>
                        <div>
                          <span className="text-[var(--cyber-neon-cyan)]">[AI-1]</span>
                          <span className="text-[var(--cyber-neon-green)]"> NODE_SUCCESS</span>
                          <span className="text-[var(--cyber-text-secondary)]"> - 选择器节点执行成功</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <motion.div
                    className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-[var(--cyber-neon-cyan)] flex items-center justify-center"
                    animate={{ y: [0, -10, 0], rotate: [0, 360] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  >
                    <Brain size={16} className="text-[var(--cyber-bg-primary)]" />
                  </motion.div>
                  
                  <motion.div
                    className="absolute -bottom-4 -left-4 w-8 h-8 rounded-full bg-[var(--cyber-neon-pink)] flex items-center justify-center"
                    animate={{ y: [0, 10, 0], rotate: [0, -360] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  >
                    <Swords size={16} className="text-[var(--cyber-bg-primary)]" />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </section>
          
          <section className="px-8 py-20 border-t border-[var(--cyber-border)]">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="font-display text-4xl font-bold mb-4">
                  <span className="text-white">核心</span>
                  <span className="text-[var(--cyber-neon-purple)]"> 功能特性</span>
                </h2>
                <p className="font-mono text-[var(--cyber-text-secondary)] max-w-2xl mx-auto">
                  从行为树编辑到实时对战，从数据统计到策略优化，为你提供完整的AI对战体验
                </p>
              </motion.div>
              
              <div className="grid grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="group relative cyber-panel p-6 overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--cyber-neon-cyan)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--cyber-neon-cyan)]/20 to-[var(--cyber-neon-purple)]/20 border border-[var(--cyber-neon-cyan)]/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <feature.icon size={28} className="text-[var(--cyber-neon-cyan)]" />
                    </div>
                    
                    <h3 className="font-display text-xl font-bold text-white mb-2">{feature.title}</h3>
                    <p className="font-mono text-sm text-[var(--cyber-text-secondary)] leading-relaxed">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
          
          <section className="px-8 py-20 border-t border-[var(--cyber-border)]">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="font-display text-4xl font-bold mb-4">
                  <span className="text-white">开始你的</span>
                  <span className="text-[var(--cyber-neon-cyan)]"> AI 训练之旅</span>
                </h2>
                <p className="font-mono text-[var(--cyber-text-secondary)]">
                  选择一个功能入口，创建你的第一个行为树
                </p>
              </motion.div>
              
              <div className="grid grid-cols-3 gap-8">
                {cards.map((card, index) => (
                  <motion.button
                    key={card.path}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(card.path)}
                    className="group relative text-left overflow-hidden"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}
                    />
                    
                    <div className="relative cyber-panel p-8 h-full">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border-2 transition-colors"
                        style={{
                          backgroundColor: `${card.color}15`,
                          borderColor: `${card.color}40`
                        }}
                      >
                        <card.icon size={32} style={{ color: card.color }} />
                      </div>
                      
                      <h3 className="font-display text-2xl font-bold text-white mb-3">
                        {card.title}
                      </h3>
                      <p className="font-mono text-sm text-[var(--cyber-text-secondary)] mb-6">
                        {card.description}
                      </p>
                      
                      <div
                        className="inline-flex items-center gap-2 font-mono text-sm font-bold transition-colors"
                        style={{ color: card.color }}
                      >
                        进入模块
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          →
                        </motion.div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </section>
          
          <footer className="px-8 py-8 border-t border-[var(--cyber-border)]">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Brain size={20} className="text-[var(--cyber-neon-cyan)]" />
                <span className="font-display font-bold">
                  <span className="text-[var(--cyber-neon-cyan)]">NEURAL</span>
                  <span className="text-[var(--cyber-neon-pink)]">ARENA</span>
                </span>
              </div>
              <p className="font-mono text-xs text-[var(--cyber-text-muted)]">
                © 2025 Neural Arena. Built with React, TypeScript & Go.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
