package behaviortree

import (
	"bt-battle/internal/types"
)

func CheckHPAbove(fighter *types.FighterState, value float64) bool {
	hpPercent := float64(fighter.HP) / float64(fighter.MaxHP) * 100
	return hpPercent > value
}

func CheckHPBelow(fighter *types.FighterState, value float64) bool {
	hpPercent := float64(fighter.HP) / float64(fighter.MaxHP) * 100
	return hpPercent < value
}

func CheckEnemyHPAbove(enemy *types.FighterState, value float64) bool {
	hpPercent := float64(enemy.HP) / float64(enemy.MaxHP) * 100
	return hpPercent > value
}

func CheckEnemyHPBelow(enemy *types.FighterState, value float64) bool {
	hpPercent := float64(enemy.HP) / float64(enemy.MaxHP) * 100
	return hpPercent < value
}

func CheckSkillReady(fighter *types.FighterState, skillId string) bool {
	for _, skill := range fighter.Skills {
		if skill.ID == skillId {
			return true
		}
	}
	return false
}

func CheckEnergyAbove(fighter *types.FighterState, value float64) bool {
	energyPercent := float64(fighter.Energy) / float64(fighter.MaxEnergy) * 100
	return energyPercent > value
}

func CheckCooldownReady(fighter *types.FighterState, skillId string) bool {
	for _, skill := range fighter.Skills {
		if skill.ID == skillId {
			return skill.Cooldown <= 0
		}
	}
	return false
}
