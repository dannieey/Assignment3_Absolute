package repository

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type Product struct {
	ID                 primitive.ObjectID `bson:"_id,omitempty"`
	Name               string             `bson:"name"`
	Description        string             `bson:"description"`
	Barcode            string             `bson:"barcode"`
	BrandID            primitive.ObjectID `bson:"brand_id"`
	CategoryID         primitive.ObjectID `bson:"category_id"`
	Price              float64            `bson:"price"`
	Currency           string             `bson:"currency"`
	StockQty           int                `bson:"stock_qty"`
	AvailabilityStatus string             `bson:"availability_status"`
	CreatedAt          time.Time          `bson:"created_at"`
	UpdatedAt          time.Time          `bson:"updated_at"`
}

type ProductRepo interface {
	Create(ctx context.Context, product *Product) error
	FindByID(ctx context.Context, id primitive.ObjectID) (*Product, error)
	Update(ctx context.Context, product *Product) error
	Delete(ctx context.Context, id primitive.ObjectID) error
}
type productRepo struct {
	collection *mongo.Collection
}

func NewProductRepo() ProductRepo {

	return nil
}

// crud stubs
func (repo *productRepo) Create(ctx context.Context, product *Product) error {
	return nil
}
func (repo *productRepo) FindByID(ctx context.Context, id primitive.ObjectID) (*Product, error) {
	return nil, nil
}

func (repo *productRepo) Update(ctx context.Context, product *Product) error {
	return nil
}
func (repo *productRepo) Delete(ctx context.Context, id primitive.ObjectID) error {
	return nil
}
