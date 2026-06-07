import React from 'react';
import BaseNode, { BaseNodeData, NodeStatus } from './BaseNode';

export interface ConditionNodeData extends BaseNodeData {
  conditionType?: string;
  params?: Record<string, unknown>;
}

export interface ConditionNodeProps {
  data: ConditionNodeData;
  selected?: boolean;
  status?: NodeStatus;
}

const ConditionNode: React.FC<ConditionNodeProps> = ({ data, selected = false, status = 'idle' }) => {
  const paramsText = data.params 
    ? Object.entries(data.params)
        .map(([key, value]) => `${key}:${String(value)}`)
        .join(' ')
    : '';

  return (
    <BaseNode
      data={data}
      selected={selected}
      type="condition"
      status={status}
      borderColor="#00bbf9"
      icon="◈"
    >
      {(data.conditionType || paramsText) && (
        <div className="text-[10px] text-cyan-300 mt-0.5 truncate font-mono">
          {data.conditionType && <span className="text-cyan-400">{data.conditionType}</span>}
          {data.conditionType && paramsText && <span className="mx-1">|</span>}
          {paramsText && <span className="text-gray-400">{paramsText}</span>}
        </div>
      )}
    </BaseNode>
  );
};

export default ConditionNode;
