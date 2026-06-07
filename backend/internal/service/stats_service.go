package service

import (
	"bt-battle/internal/repository"
	"bt-battle/internal/types"
)

type StatsService struct {
	repo *repository.StatsRepository
}

func NewStatsService(repo *repository.StatsRepository) *StatsService {
	return &StatsService{
		repo: repo,
	}
}

func (s *StatsService) GetStats() (*types.BattleStats, error) {
	return s.repo.GetBattleStats()
}
