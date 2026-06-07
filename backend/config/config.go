package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Port          string `json:"port"`
	MongoURI      string `json:"mongo_uri"`
	DBName        string `json:"db_name"`
	FrameInterval int    `json:"frame_interval"`
	MaxFrames     int    `json:"max_frames"`
}

var instance *Config

func LoadConfig() {
	err := godotenv.Load()
	if err != nil {
		log.Printf("Warning: .env file not found, using environment variables or defaults: %v", err)
	}

	frameInterval, _ := strconv.Atoi(getEnv("FRAME_INTERVAL", "60"))
	maxFrames, _ := strconv.Atoi(getEnv("MAX_FRAMES", "10000"))

	instance = &Config{
		Port:          getEnv("PORT", "8080"),
		MongoURI:      getEnv("MONGO_URI", "mongodb://localhost:27017"),
		DBName:        getEnv("DB_NAME", "bt_battle"),
		FrameInterval: frameInterval,
		MaxFrames:     maxFrames,
	}
}

func GetConfig() *Config {
	if instance == nil {
		LoadConfig()
	}
	return instance
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
