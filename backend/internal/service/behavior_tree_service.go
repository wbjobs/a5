package service

import (
	"errors"
	"fmt"

	"bt-battle/internal/repository"
	"bt-battle/internal/types"
)

type BehaviorTreeService struct {
	repo *repository.BehaviorTreeRepository
}

func NewBehaviorTreeService(repo *repository.BehaviorTreeRepository) *BehaviorTreeService {
	return &BehaviorTreeService{
		repo: repo,
	}
}

func (s *BehaviorTreeService) Create(tree *types.BehaviorTree) (string, error) {
	if tree == nil {
		return "", errors.New("tree cannot be nil")
	}

	if err := s.Validate(tree); err != nil {
		return "", fmt.Errorf("validation failed: %w", err)
	}

	return s.repo.Create(tree)
}

func (s *BehaviorTreeService) GetByID(id string) (*types.BehaviorTree, error) {
	if id == "" {
		return nil, errors.New("id cannot be empty")
	}

	return s.repo.GetByID(id)
}

func (s *BehaviorTreeService) GetAll() ([]*types.BehaviorTree, error) {
	return s.repo.GetAll()
}

func (s *BehaviorTreeService) Update(id string, tree *types.BehaviorTree) error {
	if id == "" {
		return errors.New("id cannot be empty")
	}

	if tree == nil {
		return errors.New("tree cannot be nil")
	}

	if err := s.Validate(tree); err != nil {
		return fmt.Errorf("validation failed: %w", err)
	}

	return s.repo.Update(id, tree)
}

func (s *BehaviorTreeService) Delete(id string) error {
	if id == "" {
		return errors.New("id cannot be empty")
	}

	return s.repo.Delete(id)
}

func (s *BehaviorTreeService) Validate(tree *types.BehaviorTree) error {
	if tree == nil {
		return errors.New("tree cannot be nil")
	}

	if tree.Name == "" {
		return errors.New("tree name cannot be empty")
	}

	if tree.RootNodeID == "" {
		return errors.New("root node id cannot be empty")
	}

	if len(tree.Nodes) == 0 {
		return errors.New("tree must have at least one node")
	}

	if _, exists := tree.Nodes[tree.RootNodeID]; !exists {
		return errors.New("root node not found in nodes")
	}

	visited := make(map[string]bool)
	if err := s.validateNode(tree, tree.RootNodeID, visited); err != nil {
		return err
	}

	for nodeID := range tree.Nodes {
		if !visited[nodeID] {
			return fmt.Errorf("node '%s' is not reachable from root", nodeID)
		}
	}

	return nil
}

func (s *BehaviorTreeService) validateNode(tree *types.BehaviorTree, nodeID string, visited map[string]bool) error {
	if visited[nodeID] {
		return fmt.Errorf("cycle detected at node '%s'", nodeID)
	}

	visited[nodeID] = true

	node, exists := tree.Nodes[nodeID]
	if !exists {
		return fmt.Errorf("node '%s' not found", nodeID)
	}

	if node.Data.NodeType == "" {
		return fmt.Errorf("node '%s' has no node type", nodeID)
	}

	switch node.Data.NodeType {
	case types.NodeTypeSelector, types.NodeTypeSequence:
		children := s.getChildren(tree, nodeID)
		if len(children) == 0 {
			return fmt.Errorf("composite node '%s' must have at least one child", nodeID)
		}
		for _, childID := range children {
			if err := s.validateNode(tree, childID, visited); err != nil {
				return err
			}
		}

	case types.NodeTypeCondition:
		if node.Data.Condition == nil {
			return fmt.Errorf("condition node '%s' has no condition data", nodeID)
		}
		if node.Data.Condition.Type == "" {
			return fmt.Errorf("condition node '%s' has no condition type", nodeID)
		}
		if err := s.validateCondition(node.Data.Condition, nodeID); err != nil {
			return err
		}

	case types.NodeTypeAction:
		if node.Data.Action == nil {
			return fmt.Errorf("action node '%s' has no action data", nodeID)
		}
		if node.Data.Action.Type == "" {
			return fmt.Errorf("action node '%s' has no action type", nodeID)
		}
		if err := s.validateAction(node.Data.Action, nodeID); err != nil {
			return err
		}

	default:
		return fmt.Errorf("node '%s' has invalid node type: %s", nodeID, node.Data.NodeType)
	}

	return nil
}

func (s *BehaviorTreeService) validateCondition(cond *types.Condition, nodeID string) error {
	switch cond.Type {
	case types.ConditionTypeHPAbove, types.ConditionTypeHPBelow,
		types.ConditionTypeEnemyHPAbove, types.ConditionTypeEnemyHPBelow,
		types.ConditionTypeEnergyAbove:
		if cond.Value == nil {
			return fmt.Errorf("condition '%s' of type '%s' requires a value", nodeID, cond.Type)
		}
	case types.ConditionTypeSkillReady, types.ConditionTypeCooldownReady:
		if cond.SkillID == nil || *cond.SkillID == "" {
			return fmt.Errorf("condition '%s' of type '%s' requires a skillId", nodeID, cond.Type)
		}
	default:
		return fmt.Errorf("condition '%s' has invalid type: %s", nodeID, cond.Type)
	}
	return nil
}

func (s *BehaviorTreeService) validateAction(action *types.ActionData, nodeID string) error {
	switch action.Type {
	case types.ActionTypeSkill:
		if action.SkillID == nil || *action.SkillID == "" {
			return fmt.Errorf("action '%s' of type '%s' requires a skillId", nodeID, action.Type)
		}
	case types.ActionTypeAttack, types.ActionTypeDefend,
		types.ActionTypeHeal, types.ActionTypeWait, types.ActionTypeCharge:
	default:
		return fmt.Errorf("action '%s' has invalid type: %s", nodeID, action.Type)
	}
	return nil
}

func (s *BehaviorTreeService) getChildren(tree *types.BehaviorTree, nodeID string) []string {
	var children []string
	for _, edge := range tree.Edges {
		if edge.Source == nodeID {
			children = append(children, edge.Target)
		}
	}
	return children
}
