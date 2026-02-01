package repository

import (
	"context"
	"time"

	"github.com/dannieey/Assignment3_Absolute/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type BrandRepo interface {
	Create(ctx context.Context, b *models.Brand) (primitive.ObjectID, error)
	FindByID(ctx context.Context, id primitive.ObjectID) (*models.Brand, error)
	List(ctx context.Context) ([]models.Brand, error)
	Update(ctx context.Context, id primitive.ObjectID, b *models.Brand) error
	Delete(ctx context.Context, id primitive.ObjectID) error
}
type brandRepo struct {
	col *mongo.Collection
}

func NewBrandRepo(db *mongo.Database) BrandRepo {
	return &brandRepo{col: db.Collection("brands")}
}
func (r *brandRepo) Create(ctx context.Context, b *models.Brand) (primitive.ObjectID, error) {
	if b.CreatedAt.IsZero() {
		b.CreatedAt = time.Now()
	}
	res, err := r.col.InsertOne(ctx, b)
	if err != nil {
		return primitive.NilObjectID, err
	}
	id, _ := res.InsertedID.(primitive.ObjectID)
	return id, nil
}
func (r *brandRepo) FindByID(ctx context.Context, id primitive.ObjectID) (*models.Brand, error) {
	var b models.Brand
	if err := r.col.FindOne(ctx, bson.M{"_id": id}).Decode(&b); err != nil {
		return nil, err
	}
	return &b, nil
}
func (r *brandRepo) List(ctx context.Context) ([]models.Brand, error) {
	cur, err := r.col.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	var list []models.Brand
	if err := cur.All(ctx, &list); err != nil {
		return nil, err
	}
	return list, nil
}
func (r *brandRepo) Update(ctx context.Context, id primitive.ObjectID, b *models.Brand) error {
	_, err := r.col.UpdateOne(
		ctx,
		bson.M{"_id": id},
		bson.M{"$set": bson.M{
			"name":    b.Name,
			"country": b.Country,
		}},
	)
	return err
}
func (r *brandRepo) Delete(ctx context.Context, id primitive.ObjectID) error {
	_, err := r.col.DeleteOne(ctx, bson.M{"_id": id})
	return err
}
