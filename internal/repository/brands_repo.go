package repository

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type Brand struct {
	ID        primitive.ObjectID `bson:"_id,omitempty"`
	Name      string             `bson:"name"`
	Country   string             `bson:"country"`
	CreatedAt time.Time          `bson:"createdAt"`
}

type BrandRepo interface {
	Create(ctx context.Context, brand *Brand) error
	FindByID(ctx context.Context, id primitive.ObjectID) (*Brand, error)
	FindAll(ctx context.Context) ([]Brand, error)
	Update(ctx context.Context, brand *Brand) error
	Delete(ctx context.Context, id primitive.ObjectID) error
}

type brandRepo struct {
	collection *mongo.Collection
}

func NewBrandRepo() BrandRepo {
	return nil
}

func (repo *brandRepo) Create(ctx context.Context, brand *Brand) error {
	return nil
}

func (repo *brandRepo) FindByID(ctx context.Context, id primitive.ObjectID) (*Brand, error) {
	return nil, nil
}

func (repo *brandRepo) FindAll(ctx context.Context) ([]Brand, error) {
	return nil, nil
}

func (repo *brandRepo) Update(ctx context.Context, brand *Brand) error {
	return nil
}

func (repo *brandRepo) Delete(ctx context.Context, id primitive.ObjectID) error {
	return nil
}
