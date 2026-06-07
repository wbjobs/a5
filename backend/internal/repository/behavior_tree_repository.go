package repository

import (
	"context"
	"errors"
	"time"

	"bt-battle/internal/models"
	"bt-battle/internal/types"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type BehaviorTreeRepository struct {
	col *mongo.Collection
}

func NewBehaviorTreeRepository(db *mongo.Database) *BehaviorTreeRepository {
	return &BehaviorTreeRepository{
		col: db.Collection("behavior_trees"),
	}
}

func (r *BehaviorTreeRepository) Create(tree *types.BehaviorTree) (string, error) {
	if tree == nil {
		return "", errors.New("tree cannot be nil")
	}

	model := &models.BehaviorTreeModel{
		Name:       tree.Name,
		RootNodeID: tree.RootNodeID,
		Nodes:      tree.Nodes,
		Edges:      tree.Edges,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	result, err := r.col.InsertOne(context.Background(), model)
	if err != nil {
		return "", err
	}

	oid, ok := result.InsertedID.(primitive.ObjectID)
	if !ok {
		return "", errors.New("failed to get inserted id")
	}

	return oid.Hex(), nil
}

func (r *BehaviorTreeRepository) GetByID(id string) (*types.BehaviorTree, error) {
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	var model models.BehaviorTreeModel
	err = r.col.FindOne(context.Background(), bson.M{"_id": oid}).Decode(&model)
	if err != nil {
		return nil, err
	}

	return &types.BehaviorTree{
		ID:         model.ID.Hex(),
		Name:       model.Name,
		RootNodeID: model.RootNodeID,
		Nodes:      model.Nodes,
		Edges:      model.Edges,
	}, nil
}

func (r *BehaviorTreeRepository) GetAll() ([]*types.BehaviorTree, error) {
	cursor, err := r.col.Find(context.Background(), bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var modelsList []models.BehaviorTreeModel
	if err = cursor.All(context.Background(), &modelsList); err != nil {
		return nil, err
	}

	trees := make([]*types.BehaviorTree, len(modelsList))
	for i, model := range modelsList {
		trees[i] = &types.BehaviorTree{
			ID:         model.ID.Hex(),
			Name:       model.Name,
			RootNodeID: model.RootNodeID,
			Nodes:      model.Nodes,
			Edges:      model.Edges,
		}
	}

	return trees, nil
}

func (r *BehaviorTreeRepository) Update(id string, tree *types.BehaviorTree) error {
	if tree == nil {
		return errors.New("tree cannot be nil")
	}

	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	update := bson.M{
		"$set": bson.M{
			"name":        tree.Name,
			"rootNodeId":  tree.RootNodeID,
			"nodes":       tree.Nodes,
			"edges":       tree.Edges,
			"updatedAt":   time.Now(),
		},
	}

	result, err := r.col.UpdateOne(context.Background(), bson.M{"_id": oid}, update)
	if err != nil {
		return err
	}

	if result.MatchedCount == 0 {
		return mongo.ErrNoDocuments
	}

	return nil
}

func (r *BehaviorTreeRepository) Delete(id string) error {
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	result, err := r.col.DeleteOne(context.Background(), bson.M{"_id": oid})
	if err != nil {
		return err
	}

	if result.DeletedCount == 0 {
		return mongo.ErrNoDocuments
	}

	return nil
}
