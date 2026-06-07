import React from 'react';
import BaseNode, { BaseNodeData, NodeStatus } from './BaseNode';

export interface SequenceNodeData extends BaseNodeData {}

export interface SequenceNodeProps {
  data: SequenceNodeData;
  selected?: boolean;
  status?: NodeStatus;
}

const SequenceNode: React.FC<SequenceNodeProps> = ({ data, selected = false, status = 'idle' }) => {
  return (
    <BaseNode
      data={data}
      selected={selected}
      type="sequence"
      status={status}
      borderColor="#00f5d4"
      icon="→"
      hint="顺序器 - 顺序执行直到失败"
    />
  );
};

export default SequenceNode;
