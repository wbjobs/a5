package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"bt-battle/internal/service"
)

type StatsController struct {
	service *service.StatsService
}

func NewStatsController(service *service.StatsService) *StatsController {
	return &StatsController{
		service: service,
	}
}

func (c *StatsController) RegisterRoutes(router *gin.RouterGroup) {
	stats := router.Group("/stats")
	{
		stats.GET("", c.GetStats)
	}
}

func (c *StatsController) GetStats(ctx *gin.Context) {
	stats, err := c.service.GetStats()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get stats: " + err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": stats,
	})
}
