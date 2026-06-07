package combat

import (
	"fmt"
	"math"
	"math/rand"
	"time"

	"bt-battle/internal/types"
)

const (
	BattleFieldWidth  = 800.0
	BattleFieldHeight = 600.0
	MinX              = 50.0
	MaxX              = 750.0
	MinY              = 50.0
	MaxY              = 550.0
)

const (
	DefaultMaxHP     = 100
	DefaultMaxEnergy = 100
	DefaultAttack    = 10
	DefaultDefense   = 5
	EnergyRegenRate  = 5
	DefendBuffValue  = 50
	DefendDuration   = 2
	StunDuration     = 1
	ChargeEnergyGain = 25
	HealAmount       = 30
)

type CombatSystem struct {
	ai1    *types.FighterState
	ai2    *types.FighterState
	frame  int
	events []types.BattleEvent
	ai1X   float64
	ai1Y   float64
	ai2X   float64
	ai2Y   float64
	ai1Vx  float64
	ai1Vy  float64
	ai2Vx  float64
	ai2Vy  float64
}

func NewCombatSystem(ai1Name string, ai2Name string) *CombatSystem {
	defaultSkills := GetDefaultSkills()

	ai1Skills := make([]types.SkillState, len(defaultSkills))
	ai2Skills := make([]types.SkillState, len(defaultSkills))

	for i, skill := range defaultSkills {
		ai1Skills[i] = types.SkillState{
			ID:              skill.ID,
			Name:            skill.Name,
			Cooldown:        0,
			MaxCooldown:     skill.Cooldown,
			EnergyCost:      skill.EnergyCost,
			Damage:          skill.Damage,
			Heal:            skill.Heal,
			ProjectileSpeed: skill.ProjectileSpeed,
		}
		ai2Skills[i] = types.SkillState{
			ID:              skill.ID,
			Name:            skill.Name,
			Cooldown:        0,
			MaxCooldown:     skill.Cooldown,
			EnergyCost:      skill.EnergyCost,
			Damage:          skill.Damage,
			Heal:            skill.Heal,
			ProjectileSpeed: skill.ProjectileSpeed,
		}
	}

	ai1X := MinX + 50.0
	ai1Y := BattleFieldHeight / 2.0
	ai2X := MaxX - 50.0
	ai2Y := BattleFieldHeight / 2.0

	ai1 := &types.FighterState{
		ID:          types.FighterSideAI1,
		Name:        ai1Name,
		HP:          DefaultMaxHP,
		MaxHP:       DefaultMaxHP,
		Energy:      DefaultMaxEnergy,
		MaxEnergy:   DefaultMaxEnergy,
		Attack:      DefaultAttack,
		Defense:     DefaultDefense,
		Skills:      ai1Skills,
		Buffs:       []types.Buff{},
		IsDefending: false,
		X:           ai1X,
		Y:           ai1Y,
		Vx:          0,
		Vy:          0,
	}

	ai2 := &types.FighterState{
		ID:          types.FighterSideAI2,
		Name:        ai2Name,
		HP:          DefaultMaxHP,
		MaxHP:       DefaultMaxHP,
		Energy:      DefaultMaxEnergy,
		MaxEnergy:   DefaultMaxEnergy,
		Attack:      DefaultAttack,
		Defense:     DefaultDefense,
		Skills:      ai2Skills,
		Buffs:       []types.Buff{},
		IsDefending: false,
		X:           ai2X,
		Y:           ai2Y,
		Vx:          0,
		Vy:          0,
	}

	return &CombatSystem{
		ai1:    ai1,
		ai2:    ai2,
		frame:  0,
		events: []types.BattleEvent{},
		ai1X:   ai1X,
		ai1Y:   ai1Y,
		ai2X:   ai2X,
		ai2Y:   ai2Y,
		ai1Vx:  0,
		ai1Vy:  0,
		ai2Vx:  0,
		ai2Vy:  0,
	}
}

func (cs *CombatSystem) Tick() {
	cs.frame++

	cs.processBuffs(cs.ai1)
	cs.processBuffs(cs.ai2)

	cs.processCooldowns(cs.ai1)
	cs.processCooldowns(cs.ai2)

	cs.regenerateEnergy(cs.ai1)
	cs.regenerateEnergy(cs.ai2)

	cs.ai1.IsDefending = false
	cs.ai2.IsDefending = false

	cs.updateMovement()
}

func (cs *CombatSystem) updateMovement() {
	if rand.Float64() < 0.3 {
		cs.ai1Vx += (rand.Float64() - 0.5) * 4.0
		cs.ai1Vy += (rand.Float64() - 0.5) * 4.0
	}
	if rand.Float64() < 0.3 {
		cs.ai2Vx += (rand.Float64() - 0.5) * 4.0
		cs.ai2Vy += (rand.Float64() - 0.5) * 4.0
	}

	speedLimit := 2.0
	cs.ai1Vx = math.Max(-speedLimit, math.Min(speedLimit, cs.ai1Vx))
	cs.ai1Vy = math.Max(-speedLimit, math.Min(speedLimit, cs.ai1Vy))
	cs.ai2Vx = math.Max(-speedLimit, math.Min(speedLimit, cs.ai2Vx))
	cs.ai2Vy = math.Max(-speedLimit, math.Min(speedLimit, cs.ai2Vy))

	cs.ai1X += cs.ai1Vx
	cs.ai1Y += cs.ai1Vy
	cs.ai2X += cs.ai2Vx
	cs.ai2Y += cs.ai2Vy

	if cs.ai1X <= MinX || cs.ai1X >= MaxX {
		cs.ai1Vx *= -1
		cs.ai1X = math.Max(MinX, math.Min(MaxX, cs.ai1X))
	}
	if cs.ai1Y <= MinY || cs.ai1Y >= MaxY {
		cs.ai1Vy *= -1
		cs.ai1Y = math.Max(MinY, math.Min(MaxY, cs.ai1Y))
	}
	if cs.ai2X <= MinX || cs.ai2X >= MaxX {
		cs.ai2Vx *= -1
		cs.ai2X = math.Max(MinX, math.Min(MaxX, cs.ai2X))
	}
	if cs.ai2Y <= MinY || cs.ai2Y >= MaxY {
		cs.ai2Vy *= -1
		cs.ai2Y = math.Max(MinY, math.Min(MaxY, cs.ai2Y))
	}

	cs.ai1.X = cs.ai1X
	cs.ai1.Y = cs.ai1Y
	cs.ai1.Vx = cs.ai1Vx
	cs.ai1.Vy = cs.ai1Vy
	cs.ai2.X = cs.ai2X
	cs.ai2.Y = cs.ai2Y
	cs.ai2.Vx = cs.ai2Vx
	cs.ai2.Vy = cs.ai2Vy
}

func (cs *CombatSystem) PredictTargetPosition(targetX, targetY, targetVx, targetVy, projectileSpeed float64) (predX, predY, leadTime float64) {
	dx := targetX - cs.ai1X
	dy := targetY - cs.ai1Y
	distance := math.Sqrt(dx*dx + dy*dy)

	if projectileSpeed <= 0 {
		return targetX, targetY, 0
	}

	leadTime = distance / projectileSpeed

	maxLeadTime := 2.0
	if leadTime > maxLeadTime {
		leadTime = maxLeadTime
	}

	predX = targetX + targetVx*leadTime
	predY = targetY + targetVy*leadTime

	predX = math.Max(MinX, math.Min(MaxX, predX))
	predY = math.Max(MinY, math.Min(MaxY, predY))

	return predX, predY, leadTime
}

func (cs *CombatSystem) CalculateConfidence(distance, targetSpeed float64) float64 {
	maxDistance := math.Sqrt((MaxX-MinX)*(MaxX-MinX) + (MaxY-MinY)*(MaxY-MinY))
	distanceFactor := 1.0 - (distance / maxDistance)
	speedFactor := 1.0 - math.Min(targetSpeed/4.0, 1.0)
	confidence := (distanceFactor*0.7 + speedFactor*0.3)
	return math.Max(0.0, math.Min(1.0, confidence))
}

func (cs *CombatSystem) GetAimPrediction(attackerSide types.FighterSide, skillId string) (*types.AimPrediction, error) {
	skillDef := GetSkillByID(skillId)
	if skillDef == nil {
		return nil, fmt.Errorf("skill not found: %s", skillId)
	}

	if skillDef.ProjectileSpeed <= 0 {
		return nil, fmt.Errorf("skill has no projectile speed: %s", skillId)
	}

	var attackerX, attackerY float64
	var targetX, targetY, targetVx, targetVy float64

	if attackerSide == types.FighterSideAI1 {
		attackerX = cs.ai1X
		attackerY = cs.ai1Y
		targetX = cs.ai2X
		targetY = cs.ai2Y
		targetVx = cs.ai2Vx
		targetVy = cs.ai2Vy
	} else {
		attackerX = cs.ai2X
		attackerY = cs.ai2Y
		targetX = cs.ai1X
		targetY = cs.ai1Y
		targetVx = cs.ai1Vx
		targetVy = cs.ai1Vy
	}

	dx := targetX - attackerX
	dy := targetY - attackerY
	distance := math.Sqrt(dx*dx + dy*dy)
	targetSpeed := math.Sqrt(targetVx*targetVx + targetVy*targetVy)

	predX, predY, leadTime := cs.PredictTargetPosition(targetX, targetY, targetVx, targetVy, skillDef.ProjectileSpeed)
	confidence := cs.CalculateConfidence(distance, targetSpeed)

	return &types.AimPrediction{
		SkillID:    skillId,
		PredictedX: predX,
		PredictedY: predY,
		Confidence: confidence,
		LeadTime:   leadTime,
	}, nil
}

func (cs *CombatSystem) ExecuteAction(side types.FighterSide, action types.ActionData) {
	var attacker *types.FighterState
	var defender *types.FighterState

	if side == types.FighterSideAI1 {
		attacker = cs.ai1
		defender = cs.ai2
	} else {
		attacker = cs.ai2
		defender = cs.ai1
	}

	if cs.isStunned(attacker) {
		cs.addEvent(types.EventTypeBuff, side, fmt.Sprintf("%s 处于眩晕状态，无法行动", attacker.Name), nil)
		return
	}

	switch action.Type {
	case types.ActionTypeAttack:
		damage := attacker.Attack
		cs.applyDamage(defender, damage, attacker.Name)
		cs.addEvent(types.EventTypeAttack, side, fmt.Sprintf("%s 发动普通攻击，造成 %d 点伤害", attacker.Name, damage), map[string]interface{}{
			"damage": damage,
		})

	case types.ActionTypeSkill:
		if action.SkillID != nil {
			cs.useSkill(attacker, defender, *action.SkillID)
		}

	case types.ActionTypeDefend:
		attacker.IsDefending = true
		attacker.Energy -= 15
		if attacker.Energy < 0 {
			attacker.Energy = 0
		}
		defendBuff := types.Buff{
			ID:       "defend_buff",
			Name:     "防御",
			Duration: DefendDuration,
			Effect:   "damage_reduction",
			Value:    DefendBuffValue,
		}
		cs.applyBuff(attacker, defendBuff)
		cs.addEvent(types.EventTypeDefend, side, fmt.Sprintf("%s 进入防御姿态", attacker.Name), nil)

	case types.ActionTypeHeal:
		attacker.Energy -= 25
		if attacker.Energy < 0 {
			attacker.Energy = 0
		}
		cs.applyHeal(attacker, HealAmount)
		for i := range attacker.Skills {
			if attacker.Skills[i].ID == "heal" {
				attacker.Skills[i].Cooldown = attacker.Skills[i].MaxCooldown
				break
			}
		}
		cs.addEvent(types.EventTypeHeal, side, fmt.Sprintf("%s 使用治疗，恢复 %d 点生命值", attacker.Name, HealAmount), map[string]interface{}{
			"heal": HealAmount,
		})

	case types.ActionTypeWait:
		cs.addEvent(types.EventTypeBuff, side, fmt.Sprintf("%s 选择等待", attacker.Name), nil)

	case types.ActionTypeCharge:
		gain := ChargeEnergyGain
		attacker.Energy += gain
		if attacker.Energy > attacker.MaxEnergy {
			attacker.Energy = attacker.MaxEnergy
		}
		for i := range attacker.Skills {
			if attacker.Skills[i].ID == "charge" {
				attacker.Skills[i].Cooldown = attacker.Skills[i].MaxCooldown
				break
			}
		}
		cs.addEvent(types.EventTypeBuff, side, fmt.Sprintf("%s 蓄力，恢复 %d 点能量", attacker.Name, gain), map[string]interface{}{
			"energyGain": gain,
		})
	}
}

func (cs *CombatSystem) applyDamage(target *types.FighterState, damage int, source string) {
	finalDamage := damage

	for _, buff := range target.Buffs {
		if buff.Effect == "damage_reduction" {
			finalDamage = finalDamage * (100 - buff.Value) / 100
		}
	}

	if target.Defense > 0 {
		finalDamage = finalDamage - target.Defense
		if finalDamage < 1 {
			finalDamage = 1
		}
	}

	target.HP -= finalDamage
	if target.HP < 0 {
		target.HP = 0
	}

	cs.addEvent(types.EventTypeDamage, target.ID, fmt.Sprintf("%s 受到 %d 点伤害", target.Name, finalDamage), map[string]interface{}{
		"damage": finalDamage,
		"source": source,
	})

	if target.HP <= 0 {
		cs.addEvent(types.EventTypeDeath, target.ID, fmt.Sprintf("%s 被击败", target.Name), nil)
	}
}

func (cs *CombatSystem) applyHeal(target *types.FighterState, amount int) {
	target.HP += amount
	if target.HP > target.MaxHP {
		target.HP = target.MaxHP
	}
}

func (cs *CombatSystem) applyBuff(target *types.FighterState, buff types.Buff) {
	for i, existing := range target.Buffs {
		if existing.ID == buff.ID {
			target.Buffs[i].Duration = buff.Duration
			cs.addEvent(types.EventTypeBuff, target.ID, fmt.Sprintf("%s 的 %s 效果刷新", target.Name, buff.Name), nil)
			return
		}
	}

	target.Buffs = append(target.Buffs, buff)
	cs.addEvent(types.EventTypeBuff, target.ID, fmt.Sprintf("%s 获得 %s 效果", target.Name, buff.Name), map[string]interface{}{
		"buff": buff,
	})
}

func (cs *CombatSystem) useSkill(attacker *types.FighterState, defender *types.FighterState, skillId string) {
	var skillState *types.SkillState
	for i := range attacker.Skills {
		if attacker.Skills[i].ID == skillId {
			skillState = &attacker.Skills[i]
			break
		}
	}

	if skillState == nil {
		return
	}

	if skillState.Cooldown > 0 {
		return
	}

	if attacker.Energy < skillState.EnergyCost {
		return
	}

	attacker.Energy -= skillState.EnergyCost
	skillState.Cooldown = skillState.MaxCooldown

	skillDef := GetSkillByID(skillId)
	if skillDef == nil {
		return
	}

	if skillDef.Damage > 0 {
		cs.applyDamage(defender, skillDef.Damage, attacker.Name)
	}

	if skillDef.Heal > 0 {
		cs.applyHeal(attacker, skillDef.Heal)
	}

	if skillId == "stun" {
		stunBuff := types.Buff{
			ID:       "stun_buff",
			Name:     "眩晕",
			Duration: StunDuration,
			Effect:   "stun",
			Value:    0,
		}
		cs.applyBuff(defender, stunBuff)
	}

	cs.addEvent(types.EventTypeSkill, attacker.ID, fmt.Sprintf("%s 使用 %s", attacker.Name, skillDef.Name), map[string]interface{}{
		"skillId":   skillId,
		"skillName": skillDef.Name,
		"damage":    skillDef.Damage,
		"heal":      skillDef.Heal,
	})
}

func (cs *CombatSystem) processCooldowns(fighter *types.FighterState) {
	for i := range fighter.Skills {
		if fighter.Skills[i].Cooldown > 0 {
			fighter.Skills[i].Cooldown--
		}
	}
}

func (cs *CombatSystem) processBuffs(fighter *types.FighterState) {
	activeBuffs := []types.Buff{}
	for _, buff := range fighter.Buffs {
		buff.Duration--
		if buff.Duration > 0 {
			activeBuffs = append(activeBuffs, buff)
		} else {
			cs.addEvent(types.EventTypeBuff, fighter.ID, fmt.Sprintf("%s 的 %s 效果消失", fighter.Name, buff.Name), nil)
		}
	}
	fighter.Buffs = activeBuffs
}

func (cs *CombatSystem) regenerateEnergy(fighter *types.FighterState) {
	fighter.Energy += EnergyRegenRate
	if fighter.Energy > fighter.MaxEnergy {
		fighter.Energy = fighter.MaxEnergy
	}
}

func (cs *CombatSystem) CheckBattleEnd() (bool, types.FighterSide) {
	if cs.ai1.HP <= 0 && cs.ai2.HP <= 0 {
		return true, types.FighterSideDraw
	}
	if cs.ai1.HP <= 0 {
		return true, types.FighterSideAI2
	}
	if cs.ai2.HP <= 0 {
		return true, types.FighterSideAI1
	}
	return false, ""
}

func (cs *CombatSystem) GetAI1() *types.FighterState {
	return cs.ai1
}

func (cs *CombatSystem) GetAI2() *types.FighterState {
	return cs.ai2
}

func (cs *CombatSystem) GetFrame() int {
	return cs.frame
}

func (cs *CombatSystem) GetEvents() []types.BattleEvent {
	return cs.events
}

func (cs *CombatSystem) GetFighter(side types.FighterSide) *types.FighterState {
	if side == types.FighterSideAI1 {
		return cs.ai1
	}
	return cs.ai2
}

func (cs *CombatSystem) GetEnemy(side types.FighterSide) *types.FighterState {
	if side == types.FighterSideAI1 {
		return cs.ai2
	}
	return cs.ai1
}

func (cs *CombatSystem) addEvent(eventType types.EventType, side types.FighterSide, message string, data map[string]interface{}) {
	event := types.BattleEvent{
		ID:        fmt.Sprintf("evt_%d_%d", cs.frame, len(cs.events)),
		Timestamp: time.Now().UnixMilli(),
		Type:      eventType,
		Side:      &side,
		Message:   message,
		Data:      data,
	}
	cs.events = append(cs.events, event)
}

func (cs *CombatSystem) isStunned(fighter *types.FighterState) bool {
	for _, buff := range fighter.Buffs {
		if buff.Effect == "stun" {
			return true
		}
	}
	return false
}

func (cs *CombatSystem) ClearEvents() {
	cs.events = []types.BattleEvent{}
}
