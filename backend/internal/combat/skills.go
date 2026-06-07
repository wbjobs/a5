package combat

type Skill struct {
	ID          string `json:"id" bson:"id"`
	Name        string `json:"name" bson:"name"`
	Damage      int    `json:"damage" bson:"damage"`
	Cooldown    int    `json:"cooldown" bson:"cooldown"`
	EnergyCost  int    `json:"energyCost" bson:"energyCost"`
	Icon        string `json:"icon" bson:"icon"`
	Description string `json:"description" bson:"description"`
	Heal        int    `json:"heal,omitempty" bson:"heal,omitempty"`
}

func GetDefaultSkills() []Skill {
	return []Skill{
		{
			ID:          "fireball",
			Name:        "火球术",
			Damage:      40,
			Cooldown:    5,
			EnergyCost:  30,
			Icon:        "🔥",
			Description: "发射一颗火球，造成高额伤害",
		},
		{
			ID:          "attack",
			Name:        "普通攻击",
			Damage:      10,
			Cooldown:    0,
			EnergyCost:  0,
			Icon:        "⚔️",
			Description: "基础攻击，无冷却",
		},
		{
			ID:          "heal",
			Name:        "治疗",
			Damage:      0,
			Cooldown:    3,
			EnergyCost:  25,
			Icon:        "💚",
			Description: "恢复自身生命值",
			Heal:        30,
		},
		{
			ID:          "defend",
			Name:        "防御",
			Damage:      0,
			Cooldown:    2,
			EnergyCost:  15,
			Icon:        "🛡️",
			Description: "进入防御姿态，减少受到的伤害",
		},
		{
			ID:          "charge",
			Name:        "蓄力",
			Damage:      0,
			Cooldown:    1,
			EnergyCost:  0,
			Icon:        "⚡",
			Description: "蓄力恢复能量",
		},
		{
			ID:          "stun",
			Name:        "眩晕",
			Damage:      15,
			Cooldown:    6,
			EnergyCost:  35,
			Icon:        "💫",
			Description: "眩晕敌人，使其下回合无法行动",
		},
	}
}

func GetSkillByID(id string) *Skill {
	for _, skill := range GetDefaultSkills() {
		if skill.ID == id {
			s := skill
			return &s
		}
	}
	return nil
}
