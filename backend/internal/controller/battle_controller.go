package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"

	"bt-battle/internal/repository"
	"bt-battle/internal/service"
	"bt-battle/internal/types"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type BattleController struct {
	service    *service.BattleService
	battleRepo *repository.BattleRepository
}

func NewBattleController(service *service.BattleService, battleRepo *repository.BattleRepository) *BattleController {
	return &BattleController{
		service:    service,
		battleRepo: battleRepo,
	}
}

func (c *BattleController) RegisterRoutes(router *gin.RouterGroup) {
	battles := router.Group("/battles")
	{
		battles.POST("", c.StartBattle)
		battles.GET("/:id", c.GetBattle)
		battles.GET("/:id/logs", c.GetBattleLogs)
		battles.GET("/:id/ws", c.WebSocket)
	}
}

func (c *BattleController) StartBattle(ctx *gin.Context) {
	var req types.BattleRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body: " + err.Error(),
		})
		return
	}

	resp, err := c.service.StartBattle(&req)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, resp)
}

func (c *BattleController) GetBattle(ctx *gin.Context) {
	id := ctx.Param("id")
	if id == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "Battle ID is required",
		})
		return
	}

	state, err := c.service.GetBattleState(id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{
			"error": err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": state,
	})
}

func (c *BattleController) GetBattleLogs(ctx *gin.Context) {
	id := ctx.Param("id")
	if id == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "Battle ID is required",
		})
		return
	}

	logs, err := c.battleRepo.GetLogsByBattleID(id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get battle logs: " + err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": logs,
	})
}

func (c *BattleController) WebSocket(ctx *gin.Context) {
	id := ctx.Param("id")
	if id == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "Battle ID is required",
		})
		return
	}

	conn, err := upgrader.Upgrade(ctx.Writer, ctx.Request, nil)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to upgrade connection: " + err.Error(),
		})
		return
	}

	if err := c.service.Subscribe(id, conn); err != nil {
		_ = conn.Close()
		ctx.JSON(http.StatusNotFound, gin.H{
			"error": err.Error(),
		})
		return
	}

	go func() {
		defer func() {
			c.service.Unsubscribe(id, conn)
			_ = conn.Close()
		}()

		for {
			_, _, err := conn.ReadMessage()
			if err != nil {
				break
			}
		}
	}()
}
