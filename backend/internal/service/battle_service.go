package service

import (
	"encoding/json"
	"errors"
	"fmt"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"bt-battle/internal/behaviortree"
	"bt-battle/internal/combat"
	"bt-battle/internal/models"
	"bt-battle/internal/repository"
	"bt-battle/internal/types"
)

type BattleInstance struct {
	battleID       string
	combat         *combat.CombatSystem
	executor1      *behaviortree.BehaviorTreeExecutor
	executor2      *behaviortree.BehaviorTreeExecutor
	wsClients      map[*websocket.Conn]bool
	frameInterval  time.Duration
	maxFrames      int
	isRunning      bool
	isPaused       bool
	startTime      time.Time
	ai1Tree        *types.BehaviorTree
	ai2Tree        *types.BehaviorTree
	usedSkills     []string
	damages        []int
	pingTicker     *time.Ticker
	stopPingCh     chan struct{}
	mu             sync.RWMutex
}

const (
	pingInterval     = 30 * time.Second
	pongWait         = 60 * time.Second
	writeWait        = 10 * time.Second
	maxReconnectWait = 5 * time.Minute
)

type BattleService struct {
	btRepo     *repository.BehaviorTreeRepository
	battleRepo *repository.BattleRepository
	statsRepo  *repository.StatsRepository
	battles    map[string]*BattleInstance
	mu         sync.RWMutex
}

func NewBattleService(btRepo *repository.BehaviorTreeRepository, battleRepo *repository.BattleRepository, statsRepo *repository.StatsRepository) *BattleService {
	return &BattleService{
		btRepo:     btRepo,
		battleRepo: battleRepo,
		statsRepo:  statsRepo,
		battles:    make(map[string]*BattleInstance),
	}
}

func (s *BattleService) StartBattle(req *types.BattleRequest) (*types.BattleResponse, error) {
	if req == nil {
		return nil, errors.New("request cannot be nil")
	}

	if req.AI1Tree.Name == "" {
		req.AI1Tree.Name = "AI1"
	}
	if req.AI2Tree.Name == "" {
		req.AI2Tree.Name = "AI2"
	}

	combatSystem := combat.NewCombatSystem(req.AI1Tree.Name, req.AI2Tree.Name)

	executor1 := behaviortree.NewExecutor(&req.AI1Tree, combatSystem.GetAI1(), combatSystem.GetAI2())
	executor2 := behaviortree.NewExecutor(&req.AI2Tree, combatSystem.GetAI2(), combatSystem.GetAI1())

	battleID := primitive.NewObjectID().Hex()
	frameInterval := 60 * time.Millisecond
	maxFrames := 10000
	if req.MaxFrames != nil {
		maxFrames = *req.MaxFrames
	}

	instance := &BattleInstance{
		battleID:      battleID,
		combat:        combatSystem,
		executor1:     executor1,
		executor2:     executor2,
		wsClients:     make(map[*websocket.Conn]bool),
		frameInterval: frameInterval,
		maxFrames:     maxFrames,
		isRunning:     true,
		isPaused:      false,
		startTime:     time.Now(),
		ai1Tree:       &req.AI1Tree,
		ai2Tree:       &req.AI2Tree,
		usedSkills:    []string{},
		damages:       []int{},
		pingTicker:    time.NewTicker(pingInterval),
		stopPingCh:    make(chan struct{}),
	}

	s.mu.Lock()
	s.battles[battleID] = instance
	s.mu.Unlock()

	battleModel := &models.BattleModel{
		AI1Name:   req.AI1Tree.Name,
		AI2Name:   req.AI2Tree.Name,
	}
	if oid, err := primitive.ObjectIDFromHex(req.AI1Tree.ID); err == nil {
		battleModel.AI1TreeID = oid
	}
	if oid, err := primitive.ObjectIDFromHex(req.AI2Tree.ID); err == nil {
		battleModel.AI2TreeID = oid
	}

	_, err := s.battleRepo.CreateBattle(battleModel)
	if err != nil {
		return nil, fmt.Errorf("failed to create battle record: %w", err)
	}

	go s.runBattleLoop(instance)

	return &types.BattleResponse{
		BattleID: battleID,
		Success:  true,
	}, nil
}

func (s *BattleService) runBattleLoop(instance *BattleInstance) {
	ticker := time.NewTicker(instance.frameInterval)
	defer ticker.Stop()

	go s.startPingLoop(instance)

	for {
		instance.mu.RLock()
		if !instance.isRunning {
			instance.mu.RUnlock()
			break
		}
		if instance.isPaused {
			instance.mu.RUnlock()
			time.Sleep(instance.frameInterval)
			continue
		}
		instance.mu.RUnlock()

		select {
		case <-ticker.C:
			winner := s.battleTick(instance)
			if winner != nil {
				s.endBattle(instance, *winner)
				return
			}
		}
	}
}

func (s *BattleService) startPingLoop(instance *BattleInstance) {
	defer instance.pingTicker.Stop()

	for {
		select {
		case <-instance.pingTicker.C:
			instance.mu.RLock()
			clients := make([]*websocket.Conn, 0, len(instance.wsClients))
			for conn := range instance.wsClients {
				clients = append(clients, conn)
			}
			instance.mu.RUnlock()

			for _, conn := range clients {
				conn.SetWriteDeadline(time.Now().Add(writeWait))
				if err := conn.WriteMessage(websocket.PingMessage, nil); err != nil {
					instance.mu.Lock()
					delete(instance.wsClients, conn)
					instance.mu.Unlock()
					_ = conn.Close()
				}
			}
		case <-instance.stopPingCh:
			return
		}
	}
}

func (s *BattleService) battleTick(instance *BattleInstance) *types.FighterSide {
	instance.mu.Lock()
	defer instance.mu.Unlock()

	if instance.combat.GetFrame() >= instance.maxFrames {
		ended, winner := instance.combat.CheckBattleEnd()
		if !ended {
			draw := types.FighterSideDraw
			return &draw
		}
		return &winner
	}

	_ = instance.executor1.Tick()
	_ = instance.executor2.Tick()

	action1, err1 := instance.executor1.GetLastAction()
	if err1 == nil && action1 != nil {
		instance.combat.ExecuteAction(types.FighterSideAI1, *action1)
		if action1.Type == types.ActionTypeSkill && action1.SkillID != nil {
			instance.usedSkills = append(instance.usedSkills, *action1.SkillID)
		}
	}

	action2, err2 := instance.executor2.GetLastAction()
	if err2 == nil && action2 != nil {
		instance.combat.ExecuteAction(types.FighterSideAI2, *action2)
		if action2.Type == types.ActionTypeSkill && action2.SkillID != nil {
			instance.usedSkills = append(instance.usedSkills, *action2.SkillID)
		}
	}

	instance.combat.Tick()

	for _, event := range instance.combat.GetEvents() {
		if event.Type == types.EventTypeDamage && event.Data != nil {
			if damage, ok := event.Data["damage"].(int); ok {
				instance.damages = append(instance.damages, damage)
			}
		}
	}

	s.saveExecutionRecord(instance)
	s.saveBattleLogs(instance)

	ai1CurrentNodeID := s.getCurrentNodeID(instance.executor1)
	ai2CurrentNodeID := s.getCurrentNodeID(instance.executor2)

	state := &types.BattleState{
		BattleID:        instance.battleID,
		Frame:           instance.combat.GetFrame(),
		IsRunning:       instance.isRunning,
		IsPaused:        instance.isPaused,
		IsFinished:      false,
		AI1:             *instance.combat.GetAI1(),
		AI2:             *instance.combat.GetAI2(),
		AI1CurrentNodeID: ai1CurrentNodeID,
		AI2CurrentNodeID: ai2CurrentNodeID,
		Events:          instance.combat.GetEvents(),
	}

	instance.combat.ClearEvents()

	s.broadcastState(instance, state)

	ended, winner := instance.combat.CheckBattleEnd()
	if ended {
		return &winner
	}

	return nil
}

func (s *BattleService) getCurrentNodeID(executor *behaviortree.BehaviorTreeExecutor) *string {
	path := executor.GetExecutionPath()
	if len(path) > 0 {
		last := path[len(path)-1]
		return &last
	}
	return nil
}

func (s *BattleService) saveExecutionRecord(instance *BattleInstance) {
	ai1Path := instance.executor1.GetExecutionPath()
	ai2Path := instance.executor2.GetExecutionPath()
	ai1Status := instance.executor1.GetNodeStatus()
	ai2Status := instance.executor2.GetNodeStatus()

	battleOID, _ := primitive.ObjectIDFromHex(instance.battleID)

	record := &models.ExecutionRecordModel{
		BattleID:      battleOID,
		Frame:         instance.combat.GetFrame(),
		AI1Path:       ai1Path,
		AI2Path:       ai2Path,
		AI1NodeStatus: ai1Status,
		AI2NodeStatus: ai2Status,
	}

	go s.battleRepo.AddExecutionRecord(record)
}

func (s *BattleService) saveBattleLogs(instance *BattleInstance) {
	events := instance.combat.GetEvents()
	if len(events) == 0 {
		return
	}

	battleOID, _ := primitive.ObjectIDFromHex(instance.battleID)
	logs := make([]*models.BattleLogModel, 0, len(events))

	for _, event := range events {
		log := &models.BattleLogModel{
			BattleID: battleOID,
			Frame:    instance.combat.GetFrame(),
			Type:     event.Type,
			Source:   event.Side,
			Message:  event.Message,
			Data:     event.Data,
		}
		if event.NodeID != nil {
			log.Source = event.Side
		}
		logs = append(logs, log)
	}

	go s.battleRepo.AddLogs(logs)
}

func (s *BattleService) endBattle(instance *BattleInstance, winner types.FighterSide) {
	instance.mu.Lock()
	instance.isRunning = false
	instance.mu.Unlock()

	close(instance.stopPingCh)

	duration := time.Since(instance.startTime).Milliseconds()

	battle, err := s.battleRepo.GetBattleByID(instance.battleID)
	if err == nil {
		battle.Winner = winner
		battle.TotalFrames = instance.combat.GetFrame()
		battle.DurationMs = duration
		_ = s.battleRepo.UpdateBattle(battle)
	}

	state := &types.BattleState{
		BattleID:   instance.battleID,
		Frame:      instance.combat.GetFrame(),
		IsRunning:  false,
		IsPaused:   false,
		IsFinished: true,
		Winner:     &winner,
		AI1:        *instance.combat.GetAI1(),
		AI2:        *instance.combat.GetAI2(),
		Events:     []types.BattleEvent{},
	}

	s.broadcastState(instance, state)

	go s.statsRepo.IncrementBattleResult(winner, duration, instance.usedSkills, instance.damages)

	s.mu.Lock()
	for conn := range instance.wsClients {
		_ = conn.Close()
		delete(instance.wsClients, conn)
	}
	s.mu.Unlock()

	time.Sleep(5 * time.Second)

	s.mu.Lock()
	delete(s.battles, instance.battleID)
	s.mu.Unlock()
}

func (s *BattleService) Subscribe(battleID string, conn *websocket.Conn) error {
	s.mu.RLock()
	instance, exists := s.battles[battleID]
	s.mu.RUnlock()

	if !exists {
		return errors.New("battle not found")
	}

	conn.SetReadDeadline(time.Now().Add(pongWait))
	conn.SetPongHandler(func(string) error {
		conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	instance.mu.Lock()
	instance.wsClients[conn] = true
	instance.mu.Unlock()

	go s.readPump(instance, conn)

	state := &types.BattleState{
		BattleID:   instance.battleID,
		Frame:      instance.combat.GetFrame(),
		IsRunning:  instance.isRunning,
		IsPaused:   instance.isPaused,
		IsFinished: !instance.isRunning,
		AI1:        *instance.combat.GetAI1(),
		AI2:        *instance.combat.GetAI2(),
		Events:     []types.BattleEvent{},
	}

	data, err := json.Marshal(state)
	if err == nil {
		_ = conn.WriteMessage(websocket.TextMessage, data)
	}

	return nil
}

func (s *BattleService) readPump(instance *BattleInstance, conn *websocket.Conn) {
	defer func() {
		instance.mu.Lock()
		delete(instance.wsClients, conn)
		instance.mu.Unlock()
		_ = conn.Close()
	}()

	conn.SetReadLimit(512)

	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				fmt.Printf("websocket read error: %v\n", err)
			}
			break
		}
	}
}

func (s *BattleService) Unsubscribe(battleID string, conn *websocket.Conn) {
	s.mu.RLock()
	instance, exists := s.battles[battleID]
	s.mu.RUnlock()

	if !exists {
		return
	}

	instance.mu.Lock()
	delete(instance.wsClients, conn)
	instance.mu.Unlock()
}

func (s *BattleService) broadcastState(instance *BattleInstance, state *types.BattleState) {
	data, err := json.Marshal(state)
	if err != nil {
		return
	}

	instance.mu.RLock()
	clients := make([]*websocket.Conn, 0, len(instance.wsClients))
	for conn := range instance.wsClients {
		clients = append(clients, conn)
	}
	instance.mu.RUnlock()

	for _, conn := range clients {
		err := conn.WriteMessage(websocket.TextMessage, data)
		if err != nil {
			instance.mu.Lock()
			delete(instance.wsClients, conn)
			instance.mu.Unlock()
			_ = conn.Close()
		}
	}
}

func (s *BattleService) GetBattleState(battleID string) (*types.BattleState, error) {
	s.mu.RLock()
	instance, exists := s.battles[battleID]
	s.mu.RUnlock()

	if !exists {
		battle, err := s.battleRepo.GetBattleByID(battleID)
		if err != nil {
			return nil, errors.New("battle not found")
		}

		state := &types.BattleState{
			BattleID:   battleID,
			Frame:      battle.TotalFrames,
			IsRunning:  false,
			IsPaused:   false,
			IsFinished: true,
			Winner:     &battle.Winner,
			AI1:        types.FighterState{ID: types.FighterSideAI1, Name: battle.AI1Name},
			AI2:        types.FighterState{ID: types.FighterSideAI2, Name: battle.AI2Name},
			Events:     []types.BattleEvent{},
		}
		return state, nil
	}

	instance.mu.RLock()
	defer instance.mu.RUnlock()

	ai1CurrentNodeID := s.getCurrentNodeID(instance.executor1)
	ai2CurrentNodeID := s.getCurrentNodeID(instance.executor2)

	return &types.BattleState{
		BattleID:         instance.battleID,
		Frame:            instance.combat.GetFrame(),
		IsRunning:        instance.isRunning,
		IsPaused:         instance.isPaused,
		IsFinished:       !instance.isRunning,
		Winner:           nil,
		AI1:              *instance.combat.GetAI1(),
		AI2:              *instance.combat.GetAI2(),
		AI1CurrentNodeID: ai1CurrentNodeID,
		AI2CurrentNodeID: ai2CurrentNodeID,
		Events:           instance.combat.GetEvents(),
	}, nil
}
