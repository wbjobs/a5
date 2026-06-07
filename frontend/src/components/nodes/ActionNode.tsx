import React from 'react';
import BaseNode, { BaseNodeData, NodeStatus } from './BaseNode';

export interface ActionNodeData extends BaseNodeData {
  actionType?: string;
  params?: Record<string, unknown>;
}

export interface ActionNodeProps {
  data: ActionNodeData;
  selected?: boolean;
  status?: NodeStatus;
}

const ActionNode: React.FC<ActionNodeProps> = ({ data, selected = false, status = 'idle' }) => {
  const paramsText = data.params 
    ? Object.entries(data.params)
        .map(([key, value]) => `${key}:${String(value)}`)
        .join(' ')
    : '';

  return (
    <BaseNode
      data={data}
      selected={selected}
      type="action"
      status={status}
      borderColor="#ff006e"
      icon="⚡"
    >
      {(data.actionType || paramsText) && (
        <div className="text-[10px] text-rose-300 mt-0.5 truncate font-mono">
          {data.actionType && <span className="text-rose-400">{data.actionType}</span>}
          {data.actionType && paramsText && <span className="mx-1">|</span>}
          {paramsText && <span className="text-gray-400">{paramsText}</span>}
        </div>
      )}
    </BaseNode>
  );
};

export default ActionNode;
