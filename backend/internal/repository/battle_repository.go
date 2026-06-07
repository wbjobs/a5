package repository

import (
	"context"
	"errors"
	"time"

	"bt-battle/internal/models"
	"bt-battle/internal/types"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type BattleRepository struct {
	battlesCol *mongo.Collection
	logsCol    *mongo.Collection
	recordsCol *mongo.Collection
}

func NewBattleRepository(db *mongo.Database) *BattleRepository {
	return &BattleRepository{
		battlesCol: db.Collection("battles"),
		logsCol:    db.Collection("battle_logs"),
		recordsCol: db.Collection("execution_records"),
	}
}

func (r *BattleRepository) CreateBattle(battle *models.BattleModel) (string, error) {
	if battle == nil {
		return "", errors.New("battle cannot be nil")
	}

	battle.CreatedAt = time.Now()

	result, err := r.battlesCol.InsertOne(context.Background(), battle)
	if err != nil {
		return "", err
	}

	oid, ok := result.InsertedID.(primitive.ObjectID)
	if !ok {
		return "", errors.New("failed to get inserted id")
	}

	return oid.Hex(), nil
}

func (r *BattleRepository) GetBattleByID(id string) (*models.BattleModel, error) {
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	var battle models.BattleModel
	err = r.battlesCol.FindOne(context.Background(), bson.M{"_id": oid}).Decode(&battle)
	if err != nil {
		return nil, err
	}

	return &battle, nil
}

func (r *BattleRepository) UpdateBattle(battle *models.BattleModel) error {
	if battle == nil {
		return errors.New("battle cannot be nil")
	}

	update := bson.M{
		"$set": bson.M{
			"winner":      battle.Winner,
			"totalFrames": battle.TotalFrames,
			"durationMs":  battle.DurationMs,
		},
	}

	result, err := r.battlesCol.UpdateOne(context.Background(), bson.M{"_id": battle.ID}, update)
	if err != nil {
		return err
	}

	if result.MatchedCount == 0 {
		return mongo.ErrNoDocuments
	}

	return nil
}

func (r *BattleRepository) AddLogs(logs []*models.BattleLogModel) error {
	if len(logs) == 0 {
		return nil
	}

	docs := make([]interface{}, len(logs))
	for i, log := range logs {
		log.Timestamp = time.Now()
		docs[i] = log
	}

	_, err := r.logsCol.InsertMany(context.Background(), docs)
	return err
}

func (r *BattleRepository) GetLogsByBattleID(battleID string) ([]*models.BattleLogModel, error) {
	oid, err := primitive.ObjectIDFromHex(battleID)
	if err != nil {
		return nil, err
	}

	opts := options.Find().SetSort(bson.D{{Key: "frame", Value: 1}, {Key: "timestamp", Value: 1}})
	cursor, err := r.logsCol.Find(context.Background(), bson.M{"battleId": oid}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var logs []*models.BattleLogModel
	if err = cursor.All(context.Background(), &logs); err != nil {
		return nil, err
	}

	return logs, nil
}

func (r *BattleRepository) AddExecutionRecord(record *models.ExecutionRecordModel) error {
	if record == nil {
		return errors.New("record cannot be nil")
	}

	record.CreatedAt = time.Now()

	_, err := r.recordsCol.InsertOne(context.Background(), record)
	return err
}

func (r *BattleRepository) GetAllBattles() ([]*models.BattleModel, error) {
	opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}})
	cursor, err := r.battlesCol.Find(context.Background(), bson.M{}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var battles []*models.BattleModel
	if err = cursor.All(context.Background(), &battles); err != nil {
		return nil, err
	}

	return battles, nil
}

func (r *BattleRepository) GetBattleStats() (*types.BattleStats, error) {
	battles, err := r.GetAllBattles()
	if err != nil {
		return nil, err
	}

	stats := &types.BattleStats{
		TotalBattles:   len(battles),
		MostUsedActions: make(map[types.ActionType]int),
		WinRateHistory:  []types.WinRateHistoryEntry{},
	}

	var totalDuration int64
	ai1Wins := 0
	ai2Wins := 0
	draws := 0

	for i, battle := range battles {
		totalDuration += battle.DurationMs

		switch battle.Winner {
		case types.FighterSideAI1:
			ai1Wins++
		case types.FighterSideAI2:
			ai2Wins++
		case types.FighterSideDraw:
			draws++
		}

		if (i+1)%10 == 0 || i == len(battles)-1 {
			total := i + 1
			entry := types.WinRateHistoryEntry{
				BattleID:   battle.ID.Hex(),
				AI1WinRate: float64(ai1Wins) / float64(total),
				AI2WinRate: float64(ai2Wins) / float64(total),
			}
			stats.WinRateHistory = append(stats.WinRateHistory, entry)
		}
	}

	stats.AI1Wins = ai1Wins
	stats.AI2Wins = ai2Wins
	stats.Draws = draws

	if len(battles) > 0 {
		stats.AvgDuration = float64(totalDuration) / float64(len(battles))
	}

	return stats, nil
}
