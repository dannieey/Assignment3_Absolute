package repository

import (
	"context"

	"github.com/dannieey/Assignment3_Absolute/internal/db"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"time"
)

type User struct {
	ID           primitive.ObjectID `bson:"_id,omitempty"`
	FullName     string             `bson:"fullname"`
	Email        string             `bson:"email"`
	PasswordHash string             `bson:"password_hash"`
	Role         string             `bson:"role"`
	CreatedAt    time.Time          `bson:"createdAt"`
}

type UserRepo interface {
	Create(ctx context.Context, user *User) error
	GetByID(ctx context.Context, id primitive.ObjectID) (*User, error)
	Update(ctx context.Context, user *User) error
	Delete(ctx context.Context, id primitive.ObjectID) error
}
type userRepo struct {
	collection *mongo.Collection
}

func NewUserRepo() UserRepo {
	return &userRepo{
		collection: db.GetCollection("supermarket", "users"),
	}
}

// CRUD stubs
func (r *userRepo) Create(ctx context.Context, user *User) error {

	return nil
}
func (r *userRepo) GetByID(ctx context.Context, id primitive.ObjectID) (*User, error) {

	return nil, nil
}

func (r *userRepo) Update(ctx context.Context, user *User) error {
	return nil
}
func (r *userRepo) Delete(ctx context.Context, id primitive.ObjectID) error {
	return nil
}
