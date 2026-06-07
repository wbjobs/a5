package combat

import (
	"fmt"
	"time"

	"bt-battle/internal/types"
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
}

func NewCombatSystem(ai1Name string, ai2Name string) *CombatSystem {
	defaultSkills := GetDefaultSkills()

	ai1Skills := make([]types.SkillState, len(defaultSkills))
	ai2Skills := make([]types.SkillState, len(defaultSkills))

	for i, skill := range defaultSkills {
		ai1Skills[i] = types.SkillState{
			ID:          skill.ID,
			Name:        skill.Name,
			Cooldown:    0,
			MaxCooldown: skill.Cooldown,
			EnergyCost:  skill.EnergyCost,
			Damage:      skill.Damage,
			Heal:        skill.Heal,
		}
		ai2Skills[i] = types.SkillState{
			ID:          skill.ID,
			Name:        skill.Name,
			Cooldown:    0,
			MaxCooldown: skill.Cooldown,
			EnergyCost:  skill.EnergyCost,
			Damage:      skill.Damage,
			Heal:        skill.Heal,
		}
	}

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
	}

	return &CombatSystem{
		ai1:    ai1,
		ai2:    ai2,
		frame:  0,
		events: []types.BattleEvent{},
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
