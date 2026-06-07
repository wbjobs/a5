import React from 'react';
import { Handle, Position } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

export type NodeStatus = 'idle' | 'running' | 'success' | 'failed';

export interface BaseNodeData {
  label: string;
  [key: string]: unknown;
}

export interface BaseNodeProps {
  data: BaseNodeData;
  selected?: boolean;
  type: 'selector' | 'sequence' | 'condition' | 'action';
  status?: NodeStatus;
  borderColor: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
  hint?: string;
}

const statusColors: Record<NodeStatus, string> = {
  idle: 'bg-gray-500',
  running: 'bg-yellow-400',
  success: 'bg-green-400',
  failed: 'bg-red-500',
};

const statusGlow: Record<NodeStatus, string> = {
  idle: '',
  running: 'shadow-[0_0_10px_rgba(250,204,21,0.8)]',
  success: 'shadow-[0_0_10px_rgba(74,222,128,0.8)]',
  failed: 'shadow-[0_0_10px_rgba(239,68,68,0.8)]',
};

const BaseNode: React.FC<BaseNodeProps> = ({
  data,
  selected,
  type,
  status = 'idle',
  borderColor,
  icon,
  children,
  hint,
}) => {
  const showInputHandle = type !== 'action';
  const showOutputHandle = type !== 'selector';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        transition: { duration: 0.3, ease: 'easeOut' }
      }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className="relative"
    >
      {showInputHandle && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !bg-gray-800 !border-2 !border-cyan-400 !shadow-[0_0_8px_rgba(34,211,238,0.8)]"
        />
      )}

      <motion.div
        className={twMerge(
          'relative w-[180px] h-[80px] rounded-lg overflow-hidden',
          'bg-gray-900/95 backdrop-blur-sm',
          'border-2',
          selected ? 'border-white' : `border-[${borderColor}]`,
          'transition-all duration-300'
        )}
        style={{
          borderColor: selected ? '#ffffff' : borderColor,
          boxShadow: selected 
            ? `0 0 20px ${borderColor}, 0 0 40px ${borderColor}40, inset 0 0 20px ${borderColor}20`
            : `0 0 10px ${borderColor}60, inset 0 0 10px ${borderColor}10`,
        }}
        animate={status === 'running' ? {
          boxShadow: [
            `0 0 10px ${borderColor}60, inset 0 0 10px ${borderColor}10`,
            `0 0 25px ${borderColor}aa, inset 0 0 20px ${borderColor}30`,
            `0 0 10px ${borderColor}60, inset 0 0 10px ${borderColor}10`,
          ]
        } : {}}
        transition={status === 'running' ? {
          boxShadow: {
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }
        } : {}}
      >
        <div 
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ 
            background: `linear-gradient(90deg, transparent 0%, ${borderColor} 50%, transparent 100%)`,
            opacity: 0.8
          }}
        />

        <div 
          className="absolute bottom-0 left-0 right-0 h-[2px]"
          style={{ 
            background: `linear-gradient(90deg, transparent 0%, ${borderColor} 50%, transparent 100%)`,
            opacity: 0.8
          }}
        />

        <div className="relative flex items-center h-full px-3 gap-3">
          <motion.div
            className="flex-shrink-0 w-10 h-10 rounded-md flex items-center justify-center text-xl font-bold"
            style={{
              backgroundColor: `${borderColor}20`,
              color: borderColor,
              boxShadow: `0 0 15px ${borderColor}40`,
              textShadow: `0 0 10px ${borderColor}`,
            }}
            animate={status === 'running' ? {
              scale: [1, 1.1, 1],
              opacity: [0.8, 1, 0.8],
            } : {}}
            transition={status === 'running' ? {
              duration: 1,
              repeat: Infinity,
              ease: 'easeInOut'
            } : {}}
          >
            {icon}
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span 
                className="text-xs font-mono tracking-wider"
                style={{ color: borderColor }}
              >
                {type.toUpperCase()}
              </span>
              <AnimatePresence mode="wait">
                <motion.div
                  key={status}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={twMerge(
                    'w-2 h-2 rounded-full',
                    statusColors[status],
                    statusGlow[status]
                  )}
                />
              </AnimatePresence>
            </div>

            <div className="text-white text-sm font-semibold truncate mt-0.5">
              {data.label}
            </div>

            {children}

            {hint && (
              <div className="text-[10px] text-gray-400 mt-0.5 truncate">
                {hint}
              </div>
            )}
          </div>
        </div>

        <div 
          className="absolute top-1 right-1 w-8 h-8 opacity-10"
          style={{
            background: `radial-gradient(circle, ${borderColor} 0%, transparent 70%)`,
          }}
        />
      </motion.div>

      {showOutputHandle && (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !bg-gray-800 !border-2 !border-cyan-400 !shadow-[0_0_8px_rgba(34,211,238,0.8)]"
        />
      )}
    </motion.div>
  );
};

export default BaseNode;
