package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type WishlistItem struct {
	ProductID primitive.ObjectID `json:"productId" bson:"product_id"`
	AddedAt   time.Time          `json:"addedAt" bson:"added_at"`
}

type Wishlist struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	UserID    primitive.ObjectID `json:"userId" bson:"user_id"`
	Items     []WishlistItem     `json:"items" bson:"items"`
	UpdatedAt time.Time          `json:"updatedAt" bson:"updated_at"`
}

type WishlistItemWithProduct struct {
	ProductID primitive.ObjectID `json:"productId"`
	Name      string             `json:"name"`
	Price     float64            `json:"price"`
	ImageURL  string             `json:"imageUrl"`
	InStock   bool               `json:"inStock"`
	AddedAt   time.Time          `json:"addedAt"`
}

type WishlistResponse struct {
	Items      []WishlistItemWithProduct `json:"items"`
	TotalItems int                       `json:"totalItems"`
}
