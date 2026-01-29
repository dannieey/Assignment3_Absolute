package repository

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type Category struct {
	ID        primitive.ObjectID  `bson:"_id,omitempty"`
	Name      string              `bson:"name"`
	ParentID  *primitive.ObjectID `bson:"parentId,omitempty"`
	CreatedAt time.Time           `bson:"createdAt"`
}

type CategoryRepo interface {
	Create(ctx context.Context, category *Category) error
	FindByID(ctx context.Context, id primitive.ObjectID) (*Category, error)
	FindAll(ctx context.Context) ([]Category, error)
	Update(ctx context.Context, category *Category) error
	Delete(ctx context.Context, id primitive.ObjectID) error
}

type categoryRepo struct {
	collection *mongo.Collection
}

func NewCategoryRepo() CategoryRepo {
	return nil
}
func (repo *categoryRepo) Create(ctx context.Context, category *Category) error {
	return nil
}

func (repo *categoryRepo) FindByID(ctx context.Context, id primitive.ObjectID) (*Category, error) {
	return nil, nil
}

func (repo *categoryRepo) FindAll(ctx context.Context) ([]Category, error) {
	return nil, nil
}

func (repo *categoryRepo) Update(ctx context.Context, category *Category) error {
	return nil
}

func (repo *categoryRepo) Delete(ctx context.Context, id primitive.ObjectID) error {
	return nil
}
