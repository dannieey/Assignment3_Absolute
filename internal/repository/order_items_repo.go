package repository

import (
	"context"

	"github.com/dannieey/Assignment3_Absolute/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type OrderItemRepo interface {
	CreateMany(ctx context.Context, items []models.OrderItem) error
	FindByOrderID(ctx context.Context, orderID primitive.ObjectID) ([]models.OrderItem, error)
	DeleteByOrderID(ctx context.Context, orderID primitive.ObjectID) error
}
type orderItemRepo struct {
	col *mongo.Collection
}

func NewOrderItemRepo(db *mongo.Database) OrderItemRepo {
	return &orderItemRepo{col: db.Collection("order_items")}
}
func (r *orderItemRepo) CreateMany(ctx context.Context, items []models.OrderItem) error {
	if len(items) == 0 {
		return nil
	}
	docs := make([]interface{}, 0, len(items))
	for i := range items {
		docs = append(docs, items[i])
	}
	_, err := r.col.InsertMany(ctx, docs)
	return err
}
func (r *orderItemRepo) FindByOrderID(ctx context.Context, orderID primitive.ObjectID) ([]models.OrderItem, error) {
	cur, err := r.col.Find(ctx, bson.M{"order_id": orderID})
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	var list []models.OrderItem
	if err := cur.All(ctx, &list); err != nil {
		return nil, err
	}
	return list, nil
}
func (r *orderItemRepo) DeleteByOrderID(ctx context.Context, orderID primitive.ObjectID) error {
	_, err := r.col.DeleteMany(ctx, bson.M{"order_id": orderID})
	return err
}
