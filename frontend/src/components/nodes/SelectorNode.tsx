import React from 'react';
import BaseNode, { BaseNodeData, NodeStatus } from './BaseNode';

export interface SelectorNodeData extends BaseNodeData {}

export interface SelectorNodeProps {
  data: SelectorNodeData;
  selected?: boolean;
  status?: NodeStatus;
}

const SelectorNode: React.FC<SelectorNodeProps> = ({ data, selected = false, status = 'idle' }) => {
  return (
    <BaseNode
      data={data}
      selected={selected}
      type="selector"
      status={status}
      borderColor="#9d4edd"
      icon="?"
      hint="选择器 - 顺序执行直到成功"
    />
  );
};

export default SelectorNode;
