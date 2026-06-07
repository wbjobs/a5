package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"

	"bt-battle/config"
	"bt-battle/internal/controller"
	"bt-battle/internal/database"
	"bt-battle/internal/middleware"
	"bt-battle/internal/repository"
	"bt-battle/internal/service"
)

func main() {
	config.LoadConfig()
	cfg := config.GetConfig()

	mongoClient, err := database.NewMongoClient(cfg.MongoURI, cfg.DBName)
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}
	defer func() {
		if err := mongoClient.Close(); err != nil {
			log.Printf("Error closing MongoDB connection: %v", err)
		}
	}()

	if err := mongoClient.EnsureIndexes(); err != nil {
		log.Printf("Warning: Failed to create indexes: %v", err)
	}

	db := mongoClient.GetDB()

	battleRepo := repository.NewBattleRepository(db)
	btRepo := repository.NewBehaviorTreeRepository(db)
	statsRepo := repository.NewStatsRepository(db, battleRepo)

	battleService := service.NewBattleService(btRepo, battleRepo, statsRepo)
	btService := service.NewBehaviorTreeService(btRepo)
	statsService := service.NewStatsService(statsRepo)

	battleController := controller.NewBattleController(battleService, battleRepo)
	btController := controller.NewBehaviorTreeController(btService)
	statsController := controller.NewStatsController(statsService)
	pingController := controller.NewPingController()

	r := gin.Default()

	r.Use(middleware.CORS())

	api := r.Group("/api")
	{
		pingController.RegisterRoutes(api)
		battleController.RegisterRoutes(api)
		btController.RegisterRoutes(api)
		statsController.RegisterRoutes(api)
	}

	port := cfg.Port
	if port == "" {
		port = "8080"
	}
	addr := ":" + port

	srv := &http.Server{
		Addr:    addr,
		Handler: r,
	}

	go func() {
		log.Printf("Server starting on %s", addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exiting")
}
