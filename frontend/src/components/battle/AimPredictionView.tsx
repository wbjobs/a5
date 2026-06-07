import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { AimPrediction, FighterState } from '@/types'
import { Crosshair, Zap, Clock, Target, TrendingUp } from 'lucide-react'

interface AimPredictionViewProps {
  fighter: FighterState | null
  prediction: AimPrediction | null
  side: 'left' | 'right'
  className?: string
}

interface PredictionMarkerProps {
  prediction: AimPrediction
  fighter: FighterState
  side: 'left' | 'right'
}

function PredictionMarker({ prediction, fighter, side }: PredictionMarkerProps) {
  const accentColor = side === 'left' ? '#00f5ff' : '#ff00ff'
  const confidenceColor = prediction.confidence >= 0.8
    ? '#00ff88'
    : prediction.confidence >= 0.5
      ? '#ffff00'
      : '#ff0044'

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${prediction.predictedX}%`,
        top: `${prediction.predictedY}%`,
        transform: 'translate(-50%, -50%)'
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
    >
      <div className="relative">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            width: '80px',
            height: '80px',
            marginLeft: '-40px',
            marginTop: '-40px',
            border: `2px solid ${confidenceColor}40`,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />

        <div
          className="relative w-10 h-10 flex items-center justify-center"
          style={{
            marginLeft: '-20px',
            marginTop: '-20px'
          }}
        >
          <Crosshair
            size={40}
            style={{
              color: confidenceColor,
              filter: `drop-shadow(0 0 8px ${confidenceColor})`
            }}
          />

          <motion.div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle, ${confidenceColor}40 0%, transparent 70%)`
            }}
            animate={{
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        </div>

        <div
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded text-[10px] font-mono"
          style={{
            backgroundColor: 'rgba(10, 10, 15, 0.9)',
            border: `1px solid ${confidenceColor}60`,
            color: confidenceColor
          }}
        >
          <div className="flex items-center gap-1">
            <Target size={10} />
            <span>{Math.round(prediction.confidence * 100)}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

interface TrajectoryLineProps {
  fighter: FighterState
  prediction: AimPrediction
  side: 'left' | 'right'
}

function TrajectoryLine({ fighter, prediction, side }: TrajectoryLineProps) {
  const accentColor = side === 'left' ? '#00f5ff' : '#ff00ff'

  const startX = fighter.x
  const startY = fighter.y
  const endX = prediction.predictedX
  const endY = prediction.predictedY

  const midX = (startX + endX) / 2
  const midY = (startY + endY) / 2

  const pathD = `M ${startX} ${startY} Q ${midX} ${midY - 20} ${endX} ${endY}`

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 5 }}
    >
      <defs>
        <linearGradient id={`trajectory-gradient-${side}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.8" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0.1" />
        </linearGradient>
        <filter id={`glow-${side}`}>
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <motion.path
        d={pathD}
        fill="none"
        stroke={`url(#trajectory-gradient-${side})`}
        strokeWidth="3"
        strokeLinecap="round"
        filter={`url(#glow-${side})`}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        exit={{ pathLength: 0, opacity: 0 }}
        transition={{ duration: 0.5 }}
      />

      <motion.path
        d={pathD}
        fill="none"
        stroke={accentColor}
        strokeWidth="1"
        strokeDasharray="5,5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.5 }}
        exit={{ pathLength: 0, opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <animate
          attributeName="stroke-dashoffset"
          values="0;10"
          dur="0.5s"
          repeatCount="indefinite"
        />
      </motion.path>
    </svg>
  )
}

interface VelocityVectorProps {
  fighter: FighterState
  side: 'left' | 'right'
}

function VelocityVector({ fighter, side }: VelocityVectorProps) {
  const accentColor = side === 'left' ? '#00f5ff' : '#ff00ff'
  const speed = Math.sqrt(fighter.vx * fighter.vx + fighter.vy * fighter.vy)

  if (speed < 0.1) return null

  const arrowLength = Math.min(speed * 5, 50)
  const angle = Math.atan2(fighter.vy, fighter.vx) * (180 / Math.PI)

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${fighter.x}%`,
        top: `${fighter.y}%`,
        transform: `translate(-50%, -50%) rotate(${angle}deg)`
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="relative"
        style={{ width: `${arrowLength}px`, height: '2px' }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(90deg, ${accentColor}80, ${accentColor}20)`,
            boxShadow: `0 0 8px ${accentColor}60`
          }}
        />
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2"
          style={{
            width: 0,
            height: 0,
            borderTop: '4px solid transparent',
            borderBottom: '4px solid transparent',
            borderLeft: `8px solid ${accentColor}`,
            filter: `drop-shadow(0 0 4px ${accentColor})`
          }}
        />
      </div>
    </motion.div>
  )
}

interface InfoPanelProps {
  prediction: AimPrediction
  fighter: FighterState
  side: 'left' | 'right'
}

function InfoPanel({ prediction, fighter, side }: InfoPanelProps) {
  const accentColor = side === 'left' ? '#00f5ff' : '#ff00ff'
  const speed = Math.sqrt(fighter.vx * fighter.vx + fighter.vy * fighter.vy)

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute top-3 right-3 z-10"
    >
      <div
        className="px-3 py-2 rounded backdrop-blur-sm"
        style={{
          backgroundColor: 'rgba(10, 10, 15, 0.85)',
          border: `1px solid ${accentColor}40`,
          boxShadow: `0 0 20px ${accentColor}20`
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Zap size={12} style={{ color: accentColor }} />
          <span
            className="text-[10px] font-mono font-bold tracking-wider"
            style={{ color: accentColor }}
          >
            AIM PREDICTION
          </span>
        </div>

        <div className="space-y-1 text-[10px] font-mono">
          <div className="flex items-center justify-between gap-4">
            <span className="text-gray-500">技能ID</span>
            <span style={{ color: accentColor }}>{prediction.skillId}</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-gray-500">
              <Clock size={10} className="inline mr-1" />
              飞行时间
            </span>
            <span className="text-white">{prediction.leadTime.toFixed(2)}s</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-gray-500">
              <TrendingUp size={10} className="inline mr-1" />
              目标速度
            </span>
            <span className="text-white">{speed.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-gray-500">
              <Target size={10} className="inline mr-1" />
              置信度
            </span>
            <span
              style={{
                color: prediction.confidence >= 0.8
                  ? '#00ff88'
                  : prediction.confidence >= 0.5
                    ? '#ffff00'
                    : '#ff0044'
              }}
            >
              {Math.round(prediction.confidence * 100)}%
            </span>
          </div>

          <div className="pt-1 mt-1 border-t border-gray-700">
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500">预测位置</span>
              <span className="text-white">
                ({prediction.predictedX.toFixed(1)}, {prediction.predictedY.toFixed(1)})
              </span>
            </div>
          </div>
        </div>

        <div className="mt-2 h-1 bg-gray-800 rounded overflow-hidden">
          <motion.div
            className="h-full rounded"
            style={{
              backgroundColor: prediction.confidence >= 0.8
                ? '#00ff88'
                : prediction.confidence >= 0.5
                  ? '#ffff00'
                  : '#ff0044'
            }}
            initial={{ width: 0 }}
            animate={{ width: `${prediction.confidence * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </motion.div>
  )
}

export default function AimPredictionView({ fighter, prediction, side, className }: AimPredictionViewProps) {
  if (!fighter || !prediction) return null

  return (
    <div className={cn('relative w-full h-full overflow-hidden', className)}>
      <AnimatePresence>
        <TrajectoryLine
          key={`trajectory-${fighter.id}`}
          fighter={fighter}
          prediction={prediction}
          side={side}
        />
      </AnimatePresence>

      <AnimatePresence>
        <VelocityVector
          key={`velocity-${fighter.id}`}
          fighter={fighter}
          side={side}
        />
      </AnimatePresence>

      <AnimatePresence>
        <PredictionMarker
          key={`prediction-${fighter.id}`}
          prediction={prediction}
          fighter={fighter}
          side={side}
        />
      </AnimatePresence>

      <AnimatePresence>
        <InfoPanel
          key={`info-${fighter.id}`}
          prediction={prediction}
          fighter={fighter}
          side={side}
        />
      </AnimatePresence>
    </div>
  )
}
