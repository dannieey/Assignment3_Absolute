package repository

import (
	"context"
	"time"

	"github.com/dannieey/Assignment3_Absolute/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type CategoryRepo interface {
	Create(ctx context.Context, c *models.Category) (primitive.ObjectID, error)
	FindByID(ctx context.Context, id primitive.ObjectID) (*models.Category, error)
	List(ctx context.Context) ([]models.Category, error)
	Update(ctx context.Context, id primitive.ObjectID, c *models.Category) error
	Delete(ctx context.Context, id primitive.ObjectID) error
}
type categoryRepo struct {
	col *mongo.Collection
}

func NewCategoryRepo(db *mongo.Database) CategoryRepo {
	return &categoryRepo{col: db.Collection("categories")}
}
func (r *categoryRepo) Create(ctx context.Context, c *models.Category) (primitive.ObjectID, error) {
	if c.CreatedAt.IsZero() {
		c.CreatedAt = time.Now()
	}
	res, err := r.col.InsertOne(ctx, c)
	if err != nil {
		return primitive.NilObjectID, err
	}
	id, _ := res.InsertedID.(primitive.ObjectID)
	return id, nil
}
func (r *categoryRepo) FindByID(ctx context.Context, id primitive.ObjectID) (*models.Category, error) {
	var c models.Category
	if err := r.col.FindOne(ctx, bson.M{"_id": id}).Decode(&c); err != nil {
		return nil, err
	}
	return &c, nil
}
func (r *categoryRepo) List(ctx context.Context) ([]models.Category, error) {
	cur, err := r.col.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	var list []models.Category
	if err := cur.All(ctx, &list); err != nil {
		return nil, err
	}
	return list, nil
}

func (r *categoryRepo) Update(ctx context.Context, id primitive.ObjectID, c *models.Category) error {
	_, err := r.col.UpdateOne(
		ctx,
		bson.M{"_id": id},
		bson.M{"$set": bson.M{
			"name":      c.Name,
			"parent_id": c.ParentID,
		}},
	)
	return err
}
func (r *categoryRepo) Delete(ctx context.Context, id primitive.ObjectID) error {
	_, err := r.col.DeleteOne(ctx, bson.M{"_id": id})
	return err
}
