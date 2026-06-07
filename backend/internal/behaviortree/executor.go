package behaviortree

import (
	"fmt"
	"hash/fnv"

	"bt-battle/internal/types"
)

type BehaviorTreeExecutor struct {
	tree           *types.BehaviorTree
	nodeStatus     map[string]types.NodeStatus
	executionPath  []string
	fighter        *types.FighterState
	enemy          *types.FighterState
	frameCache     map[string]types.NodeStatus
	childrenCache  map[string][]types.BTNode
	conditionCache map[string]bool
}

func NewExecutor(tree *types.BehaviorTree, fighter *types.FighterState, enemy *types.FighterState) *BehaviorTreeExecutor {
	exec := &BehaviorTreeExecutor{
		tree:           tree,
		nodeStatus:     make(map[string]types.NodeStatus),
		executionPath:  []string{},
		fighter:        fighter,
		enemy:          enemy,
		frameCache:     make(map[string]types.NodeStatus),
		childrenCache:  make(map[string][]types.BTNode),
		conditionCache: make(map[string]bool),
	}
	exec.buildChildrenCache()
	return exec
}

func (e *BehaviorTreeExecutor) buildChildrenCache() {
	for _, edge := range e.tree.Edges {
		if child, exists := e.tree.Nodes[edge.Target]; exists {
			e.childrenCache[edge.Source] = append(e.childrenCache[edge.Source], child)
		}
	}
}

func (e *BehaviorTreeExecutor) Tick() types.NodeStatus {
	e.reset()
	if e.tree.RootNodeID == "" {
		return types.NodeStatusFailure
	}
	rootNode, exists := e.tree.Nodes[e.tree.RootNodeID]
	if !exists {
		return types.NodeStatusFailure
	}
	return e.executeNode(rootNode)
}

func (e *BehaviorTreeExecutor) reset() {
	e.nodeStatus = make(map[string]types.NodeStatus)
	e.executionPath = []string{}
	e.frameCache = make(map[string]types.NodeStatus)
	e.conditionCache = make(map[string]bool)
}

func (e *BehaviorTreeExecutor) hashCondition(cond *types.Condition) string {
	h := fnv.New32a()
	if cond == nil {
		return ""
	}
	h.Write([]byte(string(cond.Type)))
	if cond.Value != nil {
		fmt.Fprintf(h, ":%d", *cond.Value)
	}
	if cond.SkillID != nil {
		h.Write([]byte(":" + *cond.SkillID))
	}
	return fmt.Sprintf("%s:%s", cond.Type, h.Sum32())
}

func (e *BehaviorTreeExecutor) executeNode(node types.BTNode) types.NodeStatus {
	if cached, exists := e.frameCache[node.ID]; exists {
		e.executionPath = append(e.executionPath, node.ID)
		e.nodeStatus[node.ID] = cached
		return cached
	}

	e.executionPath = append(e.executionPath, node.ID)

	var status types.NodeStatus

	switch node.Data.NodeType {
	case types.NodeTypeSelector:
		status = e.executeSelector(node)
	case types.NodeTypeSequence:
		status = e.executeSequence(node)
	case types.NodeTypeCondition:
		status = e.executeCondition(node)
	case types.NodeTypeAction:
		status = e.executeAction(node)
	default:
		status = types.NodeStatusFailure
	}

	e.frameCache[node.ID] = status
	e.nodeStatus[node.ID] = status
	return status
}

func (e *BehaviorTreeExecutor) getChildren(node types.BTNode) []types.BTNode {
	if children, exists := e.childrenCache[node.ID]; exists {
		return children
	}
	var children []types.BTNode
	for _, edge := range e.tree.Edges {
		if edge.Source == node.ID {
			if child, exists := e.tree.Nodes[edge.Target]; exists {
				children = append(children, child)
			}
		}
	}
	e.childrenCache[node.ID] = children
	return children
}

func (e *BehaviorTreeExecutor) executeSelector(node types.BTNode) types.NodeStatus {
	children := e.getChildren(node)
	for _, child := range children {
		status := e.executeNode(child)
		if status == types.NodeStatusSuccess {
			return types.NodeStatusSuccess
		}
		if status == types.NodeStatusRunning {
			return types.NodeStatusRunning
		}
	}
	return types.NodeStatusFailure
}

func (e *BehaviorTreeExecutor) executeSequence(node types.BTNode) types.NodeStatus {
	children := e.getChildren(node)
	for _, child := range children {
		status := e.executeNode(child)
		if status == types.NodeStatusFailure {
			return types.NodeStatusFailure
		}
		if status == types.NodeStatusRunning {
			return types.NodeStatusRunning
		}
	}
	return types.NodeStatusSuccess
}

func (e *BehaviorTreeExecutor) executeCondition(node types.BTNode) types.NodeStatus {
	if node.Data.Condition == nil {
		return types.NodeStatusFailure
	}

	cond := node.Data.Condition
	cacheKey := e.hashCondition(cond)

	if cachedResult, exists := e.conditionCache[cacheKey]; exists {
		if cachedResult {
			return types.NodeStatusSuccess
		}
		return types.NodeStatusFailure
	}

	var result bool

	switch cond.Type {
	case types.ConditionTypeHPAbove:
		if cond.Value == nil {
			return types.NodeStatusFailure
		}
		result = CheckHPAbove(e.fighter, *cond.Value)
	case types.ConditionTypeHPBelow:
		if cond.Value == nil {
			return types.NodeStatusFailure
		}
		result = CheckHPBelow(e.fighter, *cond.Value)
	case types.ConditionTypeEnemyHPAbove:
		if cond.Value == nil {
			return types.NodeStatusFailure
		}
		result = CheckEnemyHPAbove(e.enemy, *cond.Value)
	case types.ConditionTypeEnemyHPBelow:
		if cond.Value == nil {
			return types.NodeStatusFailure
		}
		result = CheckEnemyHPBelow(e.enemy, *cond.Value)
	case types.ConditionTypeSkillReady:
		if cond.SkillID == nil {
			return types.NodeStatusFailure
		}
		result = CheckSkillReady(e.fighter, *cond.SkillID)
	case types.ConditionTypeEnergyAbove:
		if cond.Value == nil {
			return types.NodeStatusFailure
		}
		result = CheckEnergyAbove(e.fighter, *cond.Value)
	case types.ConditionTypeCooldownReady:
		if cond.SkillID == nil {
			return types.NodeStatusFailure
		}
		result = CheckCooldownReady(e.fighter, *cond.SkillID)
	default:
		return types.NodeStatusFailure
	}

	e.conditionCache[cacheKey] = result

	if result {
		return types.NodeStatusSuccess
	}
	return types.NodeStatusFailure
}

func (e *BehaviorTreeExecutor) executeAction(node types.BTNode) types.NodeStatus {
	if node.Data.Action == nil {
		return types.NodeStatusFailure
	}

	action := node.Data.Action

	switch action.Type {
	case types.ActionTypeAttack:
		return types.NodeStatusSuccess
	case types.ActionTypeSkill:
		if action.SkillID == nil {
			return types.NodeStatusFailure
		}
		skillID := *action.SkillID
		if !CheckSkillReady(e.fighter, skillID) || !CheckCooldownReady(e.fighter, skillID) {
			return types.NodeStatusFailure
		}
		for _, skill := range e.fighter.Skills {
			if skill.ID == skillID {
				if e.fighter.Energy < skill.EnergyCost {
					return types.NodeStatusFailure
				}
				return types.NodeStatusSuccess
			}
		}
		return types.NodeStatusFailure
	case types.ActionTypeDefend:
		return types.NodeStatusSuccess
	case types.ActionTypeHeal:
		if e.fighter.HP >= e.fighter.MaxHP {
			return types.NodeStatusFailure
		}
		return types.NodeStatusSuccess
	case types.ActionTypeWait:
		return types.NodeStatusSuccess
	case types.ActionTypeCharge:
		if e.fighter.Energy >= e.fighter.MaxEnergy {
			return types.NodeStatusFailure
		}
		return types.NodeStatusSuccess
	default:
		return types.NodeStatusFailure
	}
}

func (e *BehaviorTreeExecutor) GetExecutionPath() []string {
	return e.executionPath
}

func (e *BehaviorTreeExecutor) GetNodeStatus() map[string]types.NodeStatus {
	return e.nodeStatus
}

func (e *BehaviorTreeExecutor) GetLastAction() (*types.ActionData, error) {
	for i := len(e.executionPath) - 1; i >= 0; i-- {
		nodeID := e.executionPath[i]
		if node, exists := e.tree.Nodes[nodeID]; exists {
			if node.Data.NodeType == types.NodeTypeAction && node.Data.Action != nil {
				return node.Data.Action, nil
			}
		}
	}
	return nil, fmt.Errorf("no action found in execution path")
}
