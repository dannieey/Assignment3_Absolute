package repository

import (
	"context"
	"time"

	"github.com/dannieey/Assignment3_Absolute/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type OrderRepo interface {
	Create(ctx context.Context, o *models.Order) (primitive.ObjectID, error)
	FindByID(ctx context.Context, id primitive.ObjectID) (*models.Order, error)
	FindByUserID(ctx context.Context, userID primitive.ObjectID) ([]models.Order, error)
	UpdateStatus(ctx context.Context, id primitive.ObjectID, status string) error
	UpdateStatusWithHistory(ctx context.Context, id primitive.ObjectID, status string, note string) error
	Delete(ctx context.Context, id primitive.ObjectID) error
}

type orderRepo struct {
	col *mongo.Collection
}

func NewOrderRepo(db *mongo.Database) OrderRepo {
	return &orderRepo{col: db.Collection("orders")}
}
func (r *orderRepo) Create(ctx context.Context, o *models.Order) (primitive.ObjectID, error) {
	now := time.Now()
	o.CreatedAt = now
	o.UpdatedAt = now
	if o.Status == "" {
		o.Status = "NEW"
	}
	res, err := r.col.InsertOne(ctx, o)
	if err != nil {
		return primitive.NilObjectID, err
	}
	id, _ := res.InsertedID.(primitive.ObjectID)
	return id, nil
}
func (r *orderRepo) FindByID(ctx context.Context, id primitive.ObjectID) (*models.Order, error) {
	var o models.Order
	if err := r.col.FindOne(ctx, bson.M{"_id": id}).Decode(&o); err != nil {
		return nil, err
	}
	return &o, nil
}
func (r *orderRepo) FindByUserID(ctx context.Context, userID primitive.ObjectID) ([]models.Order, error) {
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})
	cur, err := r.col.Find(ctx, bson.M{"user_id": userID}, opts)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	var list []models.Order
	if err := cur.All(ctx, &list); err != nil {
		return nil, err
	}
	return list, nil
}
func (r *orderRepo) UpdateStatus(ctx context.Context, id primitive.ObjectID, status string) error {
	_, err := r.col.UpdateOne(
		ctx,
		bson.M{"_id": id},
		bson.M{"$set": bson.M{
			"status":     status,
			"updated_at": time.Now(),
		}},
	)
	return err
}
func (r *orderRepo) UpdateStatusWithHistory(ctx context.Context, id primitive.ObjectID, status string, note string) error {
	historyEntry := bson.M{
		"status":    status,
		"timestamp": time.Now(),
	}
	if note != "" {
		historyEntry["note"] = note
	}

	_, err := r.col.UpdateOne(
		ctx,
		bson.M{"_id": id},
		bson.M{
			"$set": bson.M{
				"status":     status,
				"updated_at": time.Now(),
			},
			"$push": bson.M{
				"history": historyEntry,
			},
		},
	)
	return err
}
func (r *orderRepo) Delete(ctx context.Context, id primitive.ObjectID) error {
	_, err := r.col.DeleteOne(ctx, bson.M{"_id": id})
	return err
}
