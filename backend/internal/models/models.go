package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"bt-battle/internal/types"
)

type BehaviorTreeModel struct {
	ID         primitive.ObjectID    `json:"id" bson:"_id,omitempty"`
	Name       string                `json:"name" bson:"name"`
	RootNodeID string                `json:"rootNodeId" bson:"rootNodeId"`
	Nodes      map[string]types.BTNode `json:"nodes" bson:"nodes"`
	Edges      []types.BTEdge        `json:"edges" bson:"edges"`
	CreatedAt  time.Time             `json:"createdAt" bson:"createdAt"`
	UpdatedAt  time.Time             `json:"updatedAt" bson:"updatedAt"`
}

type BattleModel struct {
	ID         primitive.ObjectID  `json:"id" bson:"_id,omitempty"`
	AI1Name    string              `json:"ai1Name" bson:"ai1Name"`
	AI1TreeID  primitive.ObjectID  `json:"ai1TreeId" bson:"ai1TreeId"`
	AI2Name    string              `json:"ai2Name" bson:"ai2Name"`
	AI2TreeID  primitive.ObjectID  `json:"ai2TreeId" bson:"ai2TreeId"`
	Winner     types.FighterSide   `json:"winner" bson:"winner"`
	TotalFrames int                 `json:"totalFrames" bson:"totalFrames"`
	DurationMs int64               `json:"durationMs" bson:"durationMs"`
	CreatedAt  time.Time           `json:"createdAt" bson:"createdAt"`
}

type BattleLogModel struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	BattleID  primitive.ObjectID `json:"battleId" bson:"battleId"`
	Frame     int                `json:"frame" bson:"frame"`
	Type      types.EventType    `json:"type" bson:"type"`
	Source    *types.FighterSide `json:"source,omitempty" bson:"source,omitempty"`
	Target    *types.FighterSide `json:"target,omitempty" bson:"target,omitempty"`
	Data      interface{}        `json:"data,omitempty" bson:"data,omitempty"`
	Message   string             `json:"message" bson:"message"`
	Timestamp time.Time          `json:"timestamp" bson:"timestamp"`
}

type ExecutionRecordModel struct {
	ID            primitive.ObjectID            `json:"id" bson:"_id,omitempty"`
	BattleID      primitive.ObjectID            `json:"battleId" bson:"battleId"`
	Frame         int                           `json:"frame" bson:"frame"`
	AI1Path       []string                      `json:"ai1Path" bson:"ai1Path"`
	AI2Path       []string                      `json:"ai2Path" bson:"ai2Path"`
	AI1NodeStatus map[string]types.NodeStatus   `json:"ai1NodeStatus" bson:"ai1NodeStatus"`
	AI2NodeStatus map[string]types.NodeStatus   `json:"ai2NodeStatus" bson:"ai2NodeStatus"`
	CreatedAt     time.Time                     `json:"createdAt" bson:"createdAt"`
}

type StatsModel struct {
	ID                 primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	TotalBattles       int                `json:"totalBattles" bson:"totalBattles"`
	AI1Wins            int                `json:"ai1Wins" bson:"ai1Wins"`
	AI2Wins            int                `json:"ai2Wins" bson:"ai2Wins"`
	Draws              int                `json:"draws" bson:"draws"`
	AvgDuration        float64            `json:"avgDuration" bson:"avgDuration"`
	SkillUsage         map[string]int     `json:"skillUsage" bson:"skillUsage"`
	DamageDistribution []types.DamageRange `json:"damageDistribution" bson:"damageDistribution"`
	CreatedAt          time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt          time.Time          `json:"updatedAt" bson:"updatedAt"`
}
