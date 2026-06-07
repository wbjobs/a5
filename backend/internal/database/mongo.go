package database

import (
	"context"
	"errors"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MongoClient struct {
	client *mongo.Client
	db     *mongo.Database
}

func NewMongoClient(uri, dbName string) (*MongoClient, error) {
	if uri == "" {
		return nil, errors.New("mongodb uri cannot be empty")
	}
	if dbName == "" {
		return nil, errors.New("database name cannot be empty")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOpts := options.Client().ApplyURI(uri)
	client, err := mongo.Connect(ctx, clientOpts)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to mongodb: %w", err)
	}

	if err := client.Ping(ctx, nil); err != nil {
		return nil, fmt.Errorf("failed to ping mongodb: %w", err)
	}

	return &MongoClient{
		client: client,
		db:     client.Database(dbName),
	}, nil
}

func (m *MongoClient) Close() error {
	if m.client == nil {
		return nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := m.client.Disconnect(ctx); err != nil {
		return fmt.Errorf("failed to disconnect mongodb: %w", err)
	}
	return nil
}

func (m *MongoClient) GetDB() *mongo.Database {
	return m.db
}

func (m *MongoClient) GetCollection(name string) *mongo.Collection {
	return m.db.Collection(name)
}

func (m *MongoClient) EnsureIndexes() error {
	indexModels := []struct {
		collection string
		index      mongo.IndexModel
	}{
		{
			collection: "behavior_trees",
			index: mongo.IndexModel{
				Keys:    bson.D{{Key: "name", Value: 1}},
				Options: options.Index().SetUnique(true),
			},
		},
		{
			collection: "battles",
			index: mongo.IndexModel{
				Keys:    bson.D{{Key: "createdAt", Value: -1}},
				Options: options.Index(),
			},
		},
		{
			collection: "battle_logs",
			index: mongo.IndexModel{
				Keys:    bson.D{{Key: "battleId", Value: 1}, {Key: "frame", Value: 1}},
				Options: options.Index(),
			},
		},
		{
			collection: "execution_records",
			index: mongo.IndexModel{
				Keys:    bson.D{{Key: "battleId", Value: 1}, {Key: "frame", Value: 1}},
				Options: options.Index(),
			},
		},
	}

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	for _, im := range indexModels {
		coll := m.GetCollection(im.collection)
		if _, err := coll.Indexes().CreateOne(ctx, im.index); err != nil {
			return fmt.Errorf("failed to create index for %s: %w", im.collection, err)
		}
	}

	return nil
}
