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

type WishlistRepo interface {
	GetByUserID(ctx context.Context, userID primitive.ObjectID) (*models.Wishlist, error)
	AddItem(ctx context.Context, userID primitive.ObjectID, productID primitive.ObjectID) error
	RemoveItem(ctx context.Context, userID primitive.ObjectID, productID primitive.ObjectID) error
	HasItem(ctx context.Context, userID primitive.ObjectID, productID primitive.ObjectID) (bool, error)
	Clear(ctx context.Context, userID primitive.ObjectID) error
}

type wishlistRepo struct {
	col *mongo.Collection
}

func NewWishlistRepo(db *mongo.Database) WishlistRepo {
	return &wishlistRepo{col: db.Collection("wishlists")}
}

func (r *wishlistRepo) GetByUserID(ctx context.Context, userID primitive.ObjectID) (*models.Wishlist, error) {
	var wishlist models.Wishlist
	err := r.col.FindOne(ctx, bson.M{"user_id": userID}).Decode(&wishlist)
	if err == mongo.ErrNoDocuments {
		return &models.Wishlist{
			UserID:    userID,
			Items:     []models.WishlistItem{},
			UpdatedAt: time.Now(),
		}, nil
	}
	if err != nil {
		return nil, err
	}
	return &wishlist, nil
}

func (r *wishlistRepo) AddItem(ctx context.Context, userID primitive.ObjectID, productID primitive.ObjectID) error {
	now := time.Now()

	exists, err := r.HasItem(ctx, userID, productID)
	if err != nil {
		return err
	}
	if exists {
		return nil // Уже есть
	}

	_, err = r.col.UpdateOne(
		ctx,
		bson.M{"user_id": userID},
		bson.M{
			"$push": bson.M{
				"items": models.WishlistItem{
					ProductID: productID,
					AddedAt:   now,
				},
			},
			"$set": bson.M{"updated_at": now},
		},
		options.Update().SetUpsert(true),
	)
	return err
}

func (r *wishlistRepo) RemoveItem(ctx context.Context, userID primitive.ObjectID, productID primitive.ObjectID) error {
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

func (r *wishlistRepo) HasItem(ctx context.Context, userID primitive.ObjectID, productID primitive.ObjectID) (bool, error) {
	count, err := r.col.CountDocuments(ctx, bson.M{
		"user_id":          userID,
		"items.product_id": productID,
	})
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func (r *wishlistRepo) Clear(ctx context.Context, userID primitive.ObjectID) error {
	_, err := r.col.UpdateOne(
		ctx,
		bson.M{"user_id": userID},
		bson.M{
			"$set": bson.M{
				"items":      []models.WishlistItem{},
				"updated_at": time.Now(),
			},
		},
	)
	return err
}
