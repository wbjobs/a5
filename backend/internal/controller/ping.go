package controller

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type PingController struct{}

func NewPingController() *PingController {
	return &PingController{}
}

func (c *PingController) RegisterRoutes(router *gin.RouterGroup) {
	router.GET("/ping", c.Ping)
}

func (c *PingController) Ping(ctx *gin.Context) {
	ctx.JSON(http.StatusOK, gin.H{
		"status":    "ok",
		"timestamp": time.Now().Unix(),
	})
}
