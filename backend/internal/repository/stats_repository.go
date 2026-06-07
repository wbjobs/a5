package repository

import (
	"context"
	"time"

	"bt-battle/internal/models"
	"bt-battle/internal/types"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type StatsRepository struct {
	col        *mongo.Collection
	battleRepo *BattleRepository
}

func NewStatsRepository(db *mongo.Database, battleRepo *BattleRepository) *StatsRepository {
	return &StatsRepository{
		col:        db.Collection("stats"),
		battleRepo: battleRepo,
	}
}

func (r *StatsRepository) GetOrCreateStats() (*models.StatsModel, error) {
	var stats models.StatsModel
	err := r.col.FindOne(context.Background(), bson.M{}).Decode(&stats)
	if err == mongo.ErrNoDocuments {
		stats = models.StatsModel{
			TotalBattles:       0,
			AI1Wins:            0,
			AI2Wins:            0,
			Draws:              0,
			AvgDuration:        0,
			SkillUsage:         make(map[string]int),
			DamageDistribution: []types.DamageRange{},
			CreatedAt:          time.Now(),
			UpdatedAt:          time.Now(),
		}

		result, err := r.col.InsertOne(context.Background(), stats)
		if err != nil {
			return nil, err
		}

		stats.ID = result.InsertedID.(primitive.ObjectID)
		return &stats, nil
	}

	if err != nil {
		return nil, err
	}

	return &stats, nil
}

func (r *StatsRepository) UpdateStats(stats *models.StatsModel) error {
	stats.UpdatedAt = time.Now()

	update := bson.M{
		"$set": bson.M{
			"totalBattles":       stats.TotalBattles,
			"ai1Wins":            stats.AI1Wins,
			"ai2Wins":            stats.AI2Wins,
			"draws":              stats.Draws,
			"avgDuration":        stats.AvgDuration,
			"skillUsage":         stats.SkillUsage,
			"damageDistribution": stats.DamageDistribution,
			"updatedAt":          stats.UpdatedAt,
		},
	}

	opts := options.Update().SetUpsert(true)
	_, err := r.col.UpdateOne(context.Background(), bson.M{"_id": stats.ID}, update, opts)
	return err
}

func (r *StatsRepository) IncrementBattleResult(winner types.FighterSide, durationMs int64, skillIDs []string, damages []int) error {
	stats, err := r.GetOrCreateStats()
	if err != nil {
		return err
	}

	stats.TotalBattles++

	switch winner {
	case types.FighterSideAI1:
		stats.AI1Wins++
	case types.FighterSideAI2:
		stats.AI2Wins++
	case types.FighterSideDraw:
		stats.Draws++
	}

	totalDuration := stats.AvgDuration * float64(stats.TotalBattles-1)
	stats.AvgDuration = (totalDuration + float64(durationMs)) / float64(stats.TotalBattles)

	for _, skillID := range skillIDs {
		stats.SkillUsage[skillID]++
	}

	damageRanges := []struct {
		Range string
		Min   int
		Max   int
	}{
		{"0-10", 0, 10},
		{"11-20", 11, 20},
		{"21-30", 21, 30},
		{"31-40", 31, 40},
		{"41+", 41, 999999},
	}

	if stats.DamageDistribution == nil {
		stats.DamageDistribution = make([]types.DamageRange, len(damageRanges))
		for i, dr := range damageRanges {
			stats.DamageDistribution[i] = types.DamageRange{Range: dr.Range, Count: 0}
		}
	}

	for _, damage := range damages {
		for i, dr := range damageRanges {
			if damage >= dr.Min && damage <= dr.Max {
				stats.DamageDistribution[i].Count++
				break
			}
		}
	}

	return r.UpdateStats(stats)
}

func (r *StatsRepository) GetBattleStats() (*types.BattleStats, error) {
	return r.battleRepo.GetBattleStats()
}
