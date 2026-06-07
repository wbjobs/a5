import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import ReactECharts from 'echarts-for-react'
import { useStatsStore } from '@/store/statsStore'
import { useBattleStore } from '@/store/battleStore'
import { Swords, Trophy, Clock, Zap, Brain, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { EChartsOption } from 'echarts'
import type { ActionType } from '@/types'

const actionLabels: Record<ActionType, string> = {
  attack: '攻击',
  skill: '技能',
  defend: '防御',
  heal: '治疗',
  wait: '等待',
  charge: '蓄力'
}

const actionColors: Record<ActionType, string> = {
  attack: '#ff6600',
  skill: '#ff00ff',
  defend: '#0088ff',
  heal: '#00ff88',
  wait: '#606060',
  charge: '#ffff00'
}

export default function Stats() {
  const navigate = useNavigate()
  const { stats, isLoading, error, fetchStats } = useStatsStore()
  const { battleState } = useBattleStore()
  
  useEffect(() => {
    fetchStats()
  }, [fetchStats])
  
  const pieOption = useMemo((): EChartsOption => {
    if (!stats) return {}
    
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'var(--cyber-bg-secondary)',
        borderColor: 'var(--cyber-border)',
        textStyle: {
          color: 'var(--cyber-text-primary)',
          fontFamily: 'JetBrains Mono'
        }
      },
      legend: {
        orient: 'vertical',
        right: 20,
        top: 'center',
        textStyle: {
          color: 'var(--cyber-text-secondary)',
          fontFamily: 'JetBrains Mono',
          fontSize: 12
        },
        itemWidth: 12,
        itemHeight: 12
      },
      series: [
        {
          name: '胜率分布',
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 4,
            borderColor: 'var(--cyber-bg-primary)',
            borderWidth: 2
          },
          label: {
            show: false
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold',
              color: 'var(--cyber-text-primary)',
              fontFamily: 'Orbitron'
            },
            itemStyle: {
              shadowBlur: 20,
              shadowColor: 'rgba(0, 245, 255, 0.5)'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            {
              value: stats.ai1Wins,
              name: 'AI-1 获胜',
              itemStyle: { color: '#00f5ff' }
            },
            {
              value: stats.ai2Wins,
              name: 'AI-2 获胜',
              itemStyle: { color: '#ff00ff' }
            },
            {
              value: stats.draws,
              name: '平局',
              itemStyle: { color: '#ffff00' }
            }
          ]
        }
      ]
    }
  }, [stats])
  
  const barOption = useMemo((): EChartsOption => {
    if (!stats || stats.winRateHistory.length === 0) return {}
    
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'var(--cyber-bg-secondary)',
        borderColor: 'var(--cyber-border)',
        textStyle: {
          color: 'var(--cyber-text-primary)',
          fontFamily: 'JetBrains Mono'
        },
        axisPointer: {
          type: 'shadow',
          shadowStyle: {
            color: 'rgba(0, 245, 255, 0.1)'
          }
        }
      },
      legend: {
        top: 0,
        textStyle: {
          color: 'var(--cyber-text-secondary)',
          fontFamily: 'JetBrains Mono',
          fontSize: 12
        },
        itemWidth: 12,
        itemHeight: 12
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: stats.winRateHistory.map((_, i) => `#${i + 1}`),
        axisLine: {
          lineStyle: { color: 'var(--cyber-border)' }
        },
        axisLabel: {
          color: 'var(--cyber-text-muted)',
          fontFamily: 'JetBrains Mono',
          fontSize: 10
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLine: {
          lineStyle: { color: 'var(--cyber-border)' }
        },
        axisLabel: {
          color: 'var(--cyber-text-muted)',
          fontFamily: 'JetBrains Mono',
          fontSize: 10,
          formatter: '{value}%'
        },
        splitLine: {
          lineStyle: { color: 'var(--cyber-border)', type: 'dashed' }
        }
      },
      series: [
        {
          name: 'AI-1 胜率',
          type: 'bar',
          data: stats.winRateHistory.map(h => Math.round(h.ai1WinRate * 100)),
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#00f5ff' },
                { offset: 1, color: '#0088ff' }
              ]
            },
            borderRadius: [4, 4, 0, 0]
          }
        },
        {
          name: 'AI-2 胜率',
          type: 'bar',
          data: stats.winRateHistory.map(h => Math.round(h.ai2WinRate * 100)),
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#ff00ff' },
                { offset: 1, color: '#9d00ff' }
              ]
            },
            borderRadius: [4, 4, 0, 0]
          }
        }
      ]
    }
  }, [stats])
  
  const skillUsageOption = useMemo((): EChartsOption => {
    if (!stats) return {}
    
    const actions = Object.entries(stats.mostUsedActions) as [ActionType, number][]
    
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'var(--cyber-bg-secondary)',
        borderColor: 'var(--cyber-border)',
        textStyle: {
          color: 'var(--cyber-text-primary)',
          fontFamily: 'JetBrains Mono'
        },
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        axisLine: {
          lineStyle: { color: 'var(--cyber-border)' }
        },
        axisLabel: {
          color: 'var(--cyber-text-muted)',
          fontFamily: 'JetBrains Mono',
          fontSize: 10
        },
        splitLine: {
          lineStyle: { color: 'var(--cyber-border)', type: 'dashed' }
        }
      },
      yAxis: {
        type: 'category',
        data: actions.map(([action]) => actionLabels[action]),
        axisLine: {
          lineStyle: { color: 'var(--cyber-border)' }
        },
        axisLabel: {
          color: 'var(--cyber-text-secondary)',
          fontFamily: 'JetBrains Mono',
          fontSize: 11
        }
      },
      series: [
        {
          type: 'bar',
          data: actions.map(([action, count]) => ({
            value: count,
            itemStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 1, y2: 0,
                colorStops: [
                  { offset: 0, color: actionColors[action] + '80' },
                  { offset: 1, color: actionColors[action] }
                ]
              },
              borderRadius: [0, 4, 4, 0]
            }
          })),
          barWidth: '60%'
        }
      ]
    }
  }, [stats])
  
  const getWinRateIcon = (ai1: number, ai2: number) => {
    if (ai1 > ai2) return <ArrowUpRight className="text-[var(--cyber-neon-green)]" />
    if (ai1 < ai2) return <ArrowDownRight className="text-[var(--cyber-neon-red)]" />
    return <Minus className="text-[var(--cyber-neon-yellow)]" />
  }
  
  const statCards = stats ? [
    {
      icon: Swords,
      label: '总战斗数',
      value: stats.totalBattles,
      color: '#00f5ff',
      gradient: 'from-cyan-500/20 to-blue-500/20'
    },
    {
      icon: Trophy,
      label: 'AI-1 胜率',
      value: stats.totalBattles > 0 ? `${Math.round((stats.ai1Wins / stats.totalBattles) * 100)}%` : '0%',
      subValue: `${stats.ai1Wins} 胜`,
      color: '#00f5ff',
      gradient: 'from-cyan-500/20 to-cyan-600/20'
    },
    {
      icon: Trophy,
      label: 'AI-2 胜率',
      value: stats.totalBattles > 0 ? `${Math.round((stats.ai2Wins / stats.totalBattles) * 100)}%` : '0%',
      subValue: `${stats.ai2Wins} 胜`,
      color: '#ff00ff',
      gradient: 'from-pink-500/20 to-purple-500/20'
    },
    {
      icon: Clock,
      label: '平均回合数',
      value: Math.round(stats.avgRounds),
      color: '#ffff00',
      gradient: 'from-yellow-500/20 to-orange-500/20'
    }
  ] : []
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--cyber-bg-primary)] flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-2 border-[var(--cyber-neon-cyan)] border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="font-mono text-[var(--cyber-text-muted)]">加载统计数据...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-[var(--cyber-bg-primary)] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[var(--cyber-neon-red)] mb-4">加载失败</div>
          <p className="font-mono text-[var(--cyber-text-muted)] mb-4">{error}</p>
          <button onClick={fetchStats} className="cyber-btn">
            重试
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-[var(--cyber-bg-primary)] text-white">
      <div className="px-8 py-4 bg-[var(--cyber-bg-secondary)] border-b border-[var(--cyber-border)] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="text-[var(--cyber-text-muted)] hover:text-white transition-colors"
          >
            ← 返回
          </button>
          <h1 className="font-display text-xl font-bold text-[var(--cyber-neon-purple)]">
            STATISTICS // 统计分析
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          {battleState && (
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-[var(--cyber-text-muted)]">当前战斗:</span>
              <span className="text-[var(--cyber-neon-yellow)]">
                {battleState.isRunning ? '进行中' : battleState.isFinished ? '已结束' : '等待中'}
              </span>
            </div>
          )}
          <button onClick={fetchStats} className="cyber-btn text-xs px-4 py-1.5">
            刷新数据
          </button>
        </div>
      </div>
      
      <div className="p-8">
        <div className="grid grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group cyber-panel p-6 relative overflow-hidden"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}
              />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center border"
                    style={{
                      backgroundColor: `${card.color}15`,
                      borderColor: `${card.color}40`
                    }}
                  >
                    <card.icon size={24} style={{ color: card.color }} />
                  </div>
                  {stats && card.label.includes('胜率') && (
                    getWinRateIcon(stats.ai1Wins, stats.ai2Wins)
                  )}
                </div>
                
                <div className="font-mono text-xs text-[var(--cyber-text-muted)] mb-1">
                  {card.label}
                </div>
                <div
                  className="font-display text-3xl font-bold"
                  style={{ color: card.color }}
                >
                  {card.value}
                </div>
                {card.subValue && (
                  <div className="font-mono text-xs text-[var(--cyber-text-secondary)] mt-1">
                    {card.subValue}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="grid grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="cyber-panel"
          >
            <div className="cyber-panel-header">
              <div className="flex items-center gap-2">
                <Trophy size={14} className="text-[var(--cyber-neon-yellow)]" />
                胜率分布
              </div>
            </div>
            <div className="p-4 h-80">
              {stats && <ReactECharts option={pieOption} style={{ height: '100%' }} />}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="cyber-panel"
          >
            <div className="cyber-panel-header">
              <div className="flex items-center gap-2">
                <Brain size={14} className="text-[var(--cyber-neon-purple)]" />
                历史胜率趋势
              </div>
            </div>
            <div className="p-4 h-80">
              {stats && stats.winRateHistory.length > 0 && (
                <ReactECharts option={barOption} style={{ height: '100%' }} />
              )}
              {stats && stats.winRateHistory.length === 0 && (
                <div className="h-full flex items-center justify-center text-[var(--cyber-text-muted)] font-mono text-sm">
                  暂无历史数据
                </div>
              )}
            </div>
          </motion.div>
        </div>
        
        <div className="grid grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="cyber-panel col-span-1"
          >
            <div className="cyber-panel-header">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-[var(--cyber-neon-orange)]" />
                技能使用率
              </div>
            </div>
            <div className="p-4 h-96">
              {stats && (
                <ReactECharts option={skillUsageOption} style={{ height: '100%' }} />
              )}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="cyber-panel col-span-2"
          >
            <div className="cyber-panel-header flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Swords size={14} className="text-[var(--cyber-neon-cyan)]" />
                历史对战记录
              </div>
              {stats && (
                <span className="font-mono text-xs text-[var(--cyber-text-muted)]">
                  共 {stats.winRateHistory.length} 场
                </span>
              )}
            </div>
            <div className="p-4 h-96 overflow-y-auto">
              {stats && stats.winRateHistory.length > 0 ? (
                <div className="space-y-2">
                  {stats.winRateHistory.slice().reverse().map((record, index) => {
                    const actualIndex = stats.winRateHistory.length - 1 - index
                    let result: 'ai1' | 'ai2' | 'draw' = 'draw'
                    if (record.ai1WinRate > record.ai2WinRate) result = 'ai1'
                    else if (record.ai2WinRate > record.ai1WinRate) result = 'ai2'
                    
                    return (
                      <motion.div
                        key={record.battleId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="flex items-center gap-4 p-3 bg-[var(--cyber-bg-tertiary)] border border-[var(--cyber-border)] hover:border-[var(--cyber-neon-cyan)]/50 transition-colors"
                      >
                        <div className="font-mono text-xs text-[var(--cyber-text-muted)] w-16">
                          #{actualIndex + 1}
                        </div>
                        
                        <div className="flex-1 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[var(--cyber-neon-cyan)]/20 border border-[var(--cyber-neon-cyan)] flex items-center justify-center">
                            <span className="text-[var(--cyber-neon-cyan)] text-xs font-bold">P1</span>
                          </div>
                          
                          <div className="flex-1">
                            <div className="h-2 bg-[var(--cyber-bg-primary)] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[var(--cyber-neon-cyan)] to-[var(--cyber-neon-blue)]"
                                style={{ width: `${record.ai1WinRate * 100}%` }}
                              />
                            </div>
                          </div>
                          
                          <div className="font-mono text-xs font-bold">
                            <span className="text-[var(--cyber-neon-cyan)]">
                              {Math.round(record.ai1WinRate * 100)}%
                            </span>
                            <span className="text-[var(--cyber-text-muted)] mx-2">VS</span>
                            <span className="text-[var(--cyber-neon-pink)]">
                              {Math.round(record.ai2WinRate * 100)}%
                            </span>
                          </div>
                          
                          <div className="flex-1">
                            <div className="h-2 bg-[var(--cyber-bg-primary)] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[var(--cyber-neon-purple)] to-[var(--cyber-neon-pink)]"
                                style={{ width: `${record.ai2WinRate * 100}%` }}
                              />
                            </div>
                          </div>
                          
                          <div className="w-8 h-8 rounded-full bg-[var(--cyber-neon-pink)]/20 border border-[var(--cyber-neon-pink)] flex items-center justify-center">
                            <span className="text-[var(--cyber-neon-pink)] text-xs font-bold">P2</span>
                          </div>
                        </div>
                        
                        <div className="w-20 text-right">
                          {result === 'ai1' && (
                            <span className="font-mono text-xs text-[var(--cyber-neon-cyan)] font-bold">
                              AI-1 胜
                            </span>
                          )}
                          {result === 'ai2' && (
                            <span className="font-mono text-xs text-[var(--cyber-neon-pink)] font-bold">
                              AI-2 胜
                            </span>
                          )}
                          {result === 'draw' && (
                            <span className="font-mono text-xs text-[var(--cyber-neon-yellow)] font-bold">
                              平局
                            </span>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-[var(--cyber-text-muted)] font-mono text-sm">
                  暂无对战记录
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
