package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"bt-battle/internal/service"
	"bt-battle/internal/types"
)

type BehaviorTreeController struct {
	service *service.BehaviorTreeService
}

func NewBehaviorTreeController(service *service.BehaviorTreeService) *BehaviorTreeController {
	return &BehaviorTreeController{
		service: service,
	}
}

func (c *BehaviorTreeController) RegisterRoutes(router *gin.RouterGroup) {
	trees := router.Group("/behavior-trees")
	{
		trees.GET("", c.GetAll)
		trees.POST("", c.Create)
		trees.GET("/:id", c.GetByID)
		trees.PUT("/:id", c.Update)
		trees.DELETE("/:id", c.Delete)
	}
}

func (c *BehaviorTreeController) GetAll(ctx *gin.Context) {
	trees, err := c.service.GetAll()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": trees,
	})
}

func (c *BehaviorTreeController) Create(ctx *gin.Context) {
	var tree types.BehaviorTree
	if err := ctx.ShouldBindJSON(&tree); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body: " + err.Error(),
		})
		return
	}

	id, err := c.service.Create(&tree)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"id":      id,
		"success": true,
	})
}

func (c *BehaviorTreeController) GetByID(ctx *gin.Context) {
	id := ctx.Param("id")
	if id == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "ID is required",
		})
		return
	}

	tree, err := c.service.GetByID(id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{
			"error": "Behavior tree not found",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": tree,
	})
}

func (c *BehaviorTreeController) Update(ctx *gin.Context) {
	id := ctx.Param("id")
	if id == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "ID is required",
		})
		return
	}

	var tree types.BehaviorTree
	if err := ctx.ShouldBindJSON(&tree); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body: " + err.Error(),
		})
		return
	}

	if err := c.service.Update(id, &tree); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Behavior tree updated successfully",
	})
}

func (c *BehaviorTreeController) Delete(ctx *gin.Context) {
	id := ctx.Param("id")
	if id == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "ID is required",
		})
		return
	}

	if err := c.service.Delete(id); err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{
			"error": "Behavior tree not found",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Behavior tree deleted successfully",
	})
}
