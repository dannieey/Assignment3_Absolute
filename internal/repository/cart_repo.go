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

type CartRepo interface {
	GetByUserID(ctx context.Context, userID primitive.ObjectID) (*models.Cart, error)
	AddItem(ctx context.Context, userID primitive.ObjectID, productID primitive.ObjectID, quantity int) error
	UpdateItemQuantity(ctx context.Context, userID primitive.ObjectID, productID primitive.ObjectID, quantity int) error
	RemoveItem(ctx context.Context, userID primitive.ObjectID, productID primitive.ObjectID) error
	Clear(ctx context.Context, userID primitive.ObjectID) error
}

type cartRepo struct {
	col *mongo.Collection
}

func NewCartRepo(db *mongo.Database) CartRepo {
	return &cartRepo{col: db.Collection("carts")}
}

func (r *cartRepo) GetByUserID(ctx context.Context, userID primitive.ObjectID) (*models.Cart, error) {
	var cart models.Cart
	err := r.col.FindOne(ctx, bson.M{"user_id": userID}).Decode(&cart)
	if err == mongo.ErrNoDocuments {
		return &models.Cart{
			UserID:    userID,
			Items:     []models.CartItem{},
			UpdatedAt: time.Now(),
		}, nil
	}
	if err != nil {
		return nil, err
	}
	return &cart, nil
}

func (r *cartRepo) AddItem(ctx context.Context, userID primitive.ObjectID, productID primitive.ObjectID, quantity int) error {
	now := time.Now()

	result, err := r.col.UpdateOne(
		ctx,
		bson.M{
			"user_id":          userID,
			"items.product_id": productID,
		},
		bson.M{
			"$inc": bson.M{"items.$.quantity": quantity},
			"$set": bson.M{"updated_at": now},
		},
	)
	if err != nil {
		return err
	}

	if result.MatchedCount == 0 {
		_, err = r.col.UpdateOne(
			ctx,
			bson.M{"user_id": userID},
			bson.M{
				"$push": bson.M{
					"items": models.CartItem{
						ProductID: productID,
						Quantity:  quantity,
						AddedAt:   now,
					},
				},
				"$set": bson.M{"updated_at": now},
			},
			options.Update().SetUpsert(true),
		)
		if err != nil {
			return err
		}
	}

	return nil
}

func (r *cartRepo) UpdateItemQuantity(ctx context.Context, userID primitive.ObjectID, productID primitive.ObjectID, quantity int) error {
	if quantity <= 0 {
		return r.RemoveItem(ctx, userID, productID)
	}

	_, err := r.col.UpdateOne(
		ctx,
		bson.M{
			"user_id":          userID,
			"items.product_id": productID,
		},
		bson.M{
			"$set": bson.M{
				"items.$.quantity": quantity,
				"updated_at":       time.Now(),
			},
		},
	)
	return err
}

func (r *cartRepo) RemoveItem(ctx context.Context, userID primitive.ObjectID, productID primitive.ObjectID) error {
	_, err := r.col.UpdateOne(
		ctx,
		bson.M{"user_id": userID},
		bson.M{
			"$pull": bson.M{
				"items": bson.M{"product_id": productID},
			},
			"$set": bson.M{"updated_at": time.Now()},
		},
	)
	return err
}

func (r *cartRepo) Clear(ctx context.Context, userID primitive.ObjectID) error {
	_, err := r.col.UpdateOne(
		ctx,
		bson.M{"user_id": userID},
		bson.M{
			"$set": bson.M{
				"items":      []models.CartItem{},
				"updated_at": time.Now(),
			},
		},
	)
	return err
}
