package repository

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type Order struct {
	ID         primitive.ObjectID `bson:"_id,omitempty"`
	UserID     primitive.ObjectID `bson:"user_id"`
	Status     string             `bson:"status"`
	TotalPrice float64            `bson:"total_price"`
	CreatedAt  time.Time          `bson:"created_at"`
	UpdatedAt  time.Time          `bson:"updated_at"`
	Items      []OrderItem        `bson:"items"`
}

type OrderItem struct {
	ProductID primitive.ObjectID `bson:"product_id"`
	Quantity  int                `bson:"quantity"`
	Price     float64            `bson:"price"`
}
type OrderRepo interface {
	Create(ctx context.Context, order *Order) error
	FindByID(ctx context.Context, id primitive.ObjectID) (*Order, error)
	FindByUserID(ctx context.Context, userID primitive.ObjectID) ([]Order, error)
	Update(ctx context.Context, id primitive.ObjectID, order *Order) error
	Delete(ctx context.Context, id primitive.ObjectID) error
}
type orderRepo struct {
	collection *mongo.Collection
}

func NewOrderRepo() CategoryRepo {
	return nil
}
func (repo *orderRepo) Create(ctx context.Context, order *Order) error {
	return nil
}

func (repo *orderRepo) FindByID(ctx context.Context, id primitive.ObjectID) (*Order, error) {
	return nil, nil
}

func (repo *orderRepo) FindByUserID(ctx context.Context, userID primitive.ObjectID) ([]Order, error) {
	return nil, nil
}

func (repo *orderRepo) Update(ctx context.Context, order *Order) error {
	return nil
}

func (repo *orderRepo) Delete(ctx context.Context, id primitive.ObjectID) error {
	return nil
}
