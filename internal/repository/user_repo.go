package repository

import (
	"context"

	"github.com/dannieey/Assignment3_Absolute/internal/models"
	"go.mongodb.org/mongo-driver/bson"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"time"
)

type UserRepo interface {
	Create(ctx context.Context, u *models.User) (primitive.ObjectID, error)
	FindByID(ctx context.Context, id primitive.ObjectID) (*models.User, error)
	FindByEmail(ctx context.Context, email string) (*models.User, error)
	List(ctx context.Context) ([]models.User, error)
	Delete(ctx context.Context, id primitive.ObjectID) error
}
type userRepo struct {
	col *mongo.Collection
}

func NewUserRepo(db *mongo.Database) UserRepo {
	return &userRepo{col: db.Collection("users")}
}
func (r *userRepo) Create(ctx context.Context, u *models.User) (primitive.ObjectID, error) {
	if u.CreatedAt.IsZero() {
		u.CreatedAt = time.Now()
	}
	res, err := r.col.InsertOne(ctx, u)
	if err != nil {
		return primitive.NilObjectID, err
	}
	id, _ := res.InsertedID.(primitive.ObjectID)
	return id, nil
}
func (r *userRepo) FindByID(ctx context.Context, id primitive.ObjectID) (*models.User, error) {
	var u models.User
	if err := r.col.FindOne(ctx, bson.M{"_id": id}).Decode(&u); err != nil {
		return nil, err
	}
	return &u, nil
}
func (r *userRepo) FindByEmail(ctx context.Context, email string) (*models.User, error) {
	var u models.User
	if err := r.col.FindOne(ctx, bson.M{"email": email}).Decode(&u); err != nil {
		return nil, err
	}
	return &u, nil
}
func (r *userRepo) List(ctx context.Context) ([]models.User, error) {
	cur, err := r.col.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	var list []models.User
	if err := cur.All(ctx, &list); err != nil {
		return nil, err
	}
	return list, nil
}
func (r *userRepo) Delete(ctx context.Context, id primitive.ObjectID) error {
	_, err := r.col.DeleteOne(ctx, bson.M{"_id": id})
	return err
}
