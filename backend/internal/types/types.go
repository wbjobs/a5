package types

import "time"

type NodeType string

const (
	NodeTypeSelector  NodeType = "selector"
	NodeTypeSequence  NodeType = "sequence"
	NodeTypeCondition NodeType = "condition"
	NodeTypeAction    NodeType = "action"
)

type ConditionType string

const (
	ConditionTypeHPAbove       ConditionType = "hp_above"
	ConditionTypeHPBelow       ConditionType = "hp_below"
	ConditionTypeEnemyHPAbove  ConditionType = "enemy_hp_above"
	ConditionTypeEnemyHPBelow  ConditionType = "enemy_hp_below"
	ConditionTypeSkillReady   ConditionType = "skill_ready"
	ConditionTypeEnergyAbove  ConditionType = "energy_above"
	ConditionTypeCooldownReady  ConditionType = "cooldown_ready"
)

type ActionType string

const (
	ActionTypeAttack  ActionType = "attack"
	ActionTypeSkill   ActionType = "skill"
	ActionTypeDefend  ActionType = "defend"
	ActionTypeHeal    ActionType = "heal"
	ActionTypeWait    ActionType = "wait"
	ActionTypeCharge  ActionType = "charge"
)

type NodeStatus string

const (
	NodeStatusRunning NodeStatus = "running"
	NodeStatusSuccess NodeStatus = "success"
	NodeStatusFailure NodeStatus = "failure"
)

type EventType string

const (
	EventTypeAttack    EventType = "attack"
	EventTypeSkill     EventType = "skill"
	EventTypeDefend    EventType = "defend"
	EventTypeHeal      EventType = "heal"
	EventTypeBuff      EventType = "buff"
	EventTypeDamage    EventType = "damage"
	EventTypeDeath     EventType = "death"
	EventTypeNodeResult EventType = "node_result"
)

type FighterSide string

const (
	FighterSideAI1  FighterSide = "ai1"
	FighterSideAI2  FighterSide = "ai2"
	FighterSideDraw FighterSide = "draw"
)

type Position struct {
	X float64 `json:"x" bson:"x"`
	Y float64 `json:"y" bson:"y"`
}

type Condition struct {
	Type    ConditionType `json:"type" bson:"type"`
	Value   *float64      `json:"value,omitempty" bson:"value,omitempty"`
	SkillID *string      `json:"skillId,omitempty" bson:"skillId,omitempty"`
}

type ActionData struct {
	Type    ActionType `json:"type" bson:"type"`
	SkillID *string      `json:"skillId,omitempty" bson:"skillId,omitempty"`
	Target  *string      `json:"target,omitempty" bson:"target,omitempty"`
}

type BTNodeData struct {
	NodeType  NodeType   `json:"nodeType" bson:"nodeType"`
	Label       string     `json:"label" bson:"label"`
	Condition   *Condition `json:"condition,omitempty" bson:"condition,omitempty"`
	Action      *ActionData `json:"action,omitempty" bson:"action,omitempty"`
}

type BTNode struct {
	ID       string      `json:"id" bson:"id"`
	Type     string      `json:"type" bson:"type"`
	Position Position    `json:"position" bson:"position"`
	Data     BTNodeData `json:"data" bson:"data"`
}

type BTEdge struct {
	ID     string `json:"id" bson:"id"`
	Source string `json:"source" bson:"source"`
	Target string `json:"target" bson:"target"`
}

type Skill struct {
	ID          string `json:"id" bson:"id"`
	Name        string `json:"name" bson:"name"`
	Cooldown    int    `json:"cooldown" bson:"cooldown"`
	MaxCooldown int    `json:"maxCooldown" bson:"maxCooldown"`
	EnergyCost  int    `json:"energyCost" bson:"energyCost"`
	Damage      int    `json:"damage" bson:"damage"`
	Heal        int    `json:"heal" bson:"heal"`
}

type SkillState struct {
	ID          string `json:"id" bson:"id"`
	Name        string `json:"name" bson:"name"`
	Cooldown    int    `json:"cooldown" bson:"cooldown"`
	MaxCooldown int    `json:"maxCooldown" bson:"maxCooldown"`
	EnergyCost  int    `json:"energyCost" bson:"energyCost"`
	Damage      int    `json:"damage" bson:"damage"`
	Heal        int    `json:"heal" bson:"heal"`
}

type Buff struct {
	ID       string `json:"id" bson:"id"`
	Name     string `json:"name" bson:"name"`
	Duration int    `json:"duration" bson:"duration"`
	Effect   string `json:"effect" bson:"effect"`
	Value    int    `json:"value" bson:"value"`
}

type FighterState struct {
	ID          FighterSide `json:"id" bson:"id"`
	Name        string      `json:"name" bson:"name"`
	HP          int         `json:"hp" bson:"hp"`
	MaxHP       int         `json:"maxHp" bson:"maxHp"`
	Energy      int         `json:"energy" bson:"energy"`
	MaxEnergy   int         `json:"maxEnergy" bson:"maxEnergy"`
	Attack      int         `json:"attack" bson:"attack"`
	Defense     int         `json:"defense" bson:"defense"`
	Skills      []SkillState `json:"skills" bson:"skills"`
	Buffs       []Buff      `json:"buffs" bson:"buffs"`
	IsDefending bool        `json:"isDefending" bson:"isDefending"`
}

type BattleEvent struct {
	ID         string                 `json:"id" bson:"id"`
	Timestamp  int64                  `json:"timestamp" bson:"timestamp"`
	Type       EventType              `json:"type" bson:"type"`
	Side       *FighterSide           `json:"side,omitempty" bson:"side,omitempty"`
	Message    string                 `json:"message" bson:"message"`
	Data       map[string]interface{} `json:"data,omitempty" bson:"data,omitempty"`
	NodeID     *string                `json:"nodeId,omitempty" bson:"nodeId,omitempty"`
	NodeStatus *NodeStatus            `json:"nodeStatus,omitempty" bson:"nodeStatus,omitempty"`
}

type BehaviorTree struct {
	ID         string             `json:"id" bson:"id"`
	Name       string             `json:"name" bson:"name"`
	RootNodeID string             `json:"rootNodeId" bson:"rootNodeId"`
	Nodes      map[string]BTNode `json:"nodes" bson:"nodes"`
	Edges      []BTEdge           `json:"edges" bson:"edges"`
}

type BattleState struct {
	BattleID        string         `json:"battleId" bson:"battleId"`
	Frame           int            `json:"frame" bson:"frame"`
	IsRunning       bool           `json:"isRunning" bson:"isRunning"`
	IsPaused        bool           `json:"isPaused" bson:"isPaused"`
	IsFinished      bool           `json:"isFinished" bson:"isFinished"`
	Winner          *FighterSide  `json:"winner,omitempty" bson:"winner,omitempty"`
	AI1             FighterState `json:"ai1" bson:"ai1"`
	AI2             FighterState `json:"ai2" bson:"ai2"`
	AI1CurrentNodeID *string     `json:"ai1CurrentNodeId,omitempty" bson:"ai1CurrentNodeId,omitempty"`
	AI2CurrentNodeID *string     `json:"ai2CurrentNodeId,omitempty" bson:"ai2CurrentNodeId,omitempty"`
	Events          []BattleEvent `json:"events" bson:"events"`
}

type BattleRequest struct {
	AI1Tree   BehaviorTree `json:"ai1Tree" bson:"ai1Tree"`
	AI2Tree   BehaviorTree `json:"ai2Tree" bson:"ai2Tree"`
	MaxFrames *int       `json:"maxFrames,omitempty" bson:"maxFrames,omitempty"`
}

type BattleResponse struct {
	BattleID string `json:"battleId" bson:"battleId"`
	Success  bool   `json:"success" bson:"success"`
	Message  *string `json:"message,omitempty" bson:"message,omitempty"`
}

type DamageRange struct {
	Range string `json:"range" bson:"range"`
	Count int    `json:"count" bson:"count"`
}

type WinRateHistoryEntry struct {
	BattleID   string  `json:"battleId" bson:"battleId"`
	AI1WinRate float64 `json:"ai1WinRate" bson:"ai1WinRate"`
	AI2WinRate float64 `json:"ai2WinRate" bson:"ai2WinRate"`
}

type BattleStats struct {
	TotalBattles    int                      `json:"totalBattles" bson:"totalBattles"`
	AI1Wins         int                      `json:"ai1Wins" bson:"ai1Wins"`
	AI2Wins         int                      `json:"ai2Wins" bson:"ai2Wins"`
	Draws            int                      `json:"draws" bson:"draws"`
	AvgDuration     float64                  `json:"avgDuration" bson:"avgDuration"`
	MostUsedActions  map[ActionType]int     `json:"mostUsedActions" bson:"mostUsedActions"`
	WinRateHistory   []WinRateHistoryEntry `json:"winRateHistory" bson:"winRateHistory"`
}

type ExecutionRecord struct {
	BattleID    string            `json:"battleId" bson:"battleId"`
	Frame         int               `json:"frame" bson:"frame"`
	AI1Path       []string          `json:"ai1Path" bson:"ai1Path"`
	AI2Path       []string          `json:"ai2Path" bson:"ai2Path"`
	AI1NodeStatus map[string]NodeStatus `json:"ai1NodeStatus" bson:"ai1NodeStatus"`
	AI2NodeStatus map[string]NodeStatus `json:"ai2NodeStatus" bson:"ai2NodeStatus"`
	CreatedAt     time.Time         `json:"createdAt" bson:"createdAt"`
}
