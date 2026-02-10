package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type CartItem struct {
	ProductID primitive.ObjectID `json:"productId" bson:"product_id"`
	Quantity  int                `json:"quantity" bson:"quantity"`
	AddedAt   time.Time          `json:"addedAt" bson:"added_at"`
}

type Cart struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	UserID    primitive.ObjectID `json:"userId" bson:"user_id"`
	Items     []CartItem         `json:"items" bson:"items"`
	UpdatedAt time.Time          `json:"updatedAt" bson:"updated_at"`
}

type CartItemWithProduct struct {
	ProductID primitive.ObjectID `json:"productId"`
	Name      string             `json:"name"`
	Price     float64            `json:"price"`
	ImageURL  string             `json:"imageUrl"`
	Quantity  int                `json:"quantity"`
	Subtotal  float64            `json:"subtotal"`
	InStock   bool               `json:"inStock"`
	StockQty  int                `json:"stockQty"`
}

type CartResponse struct {
	Items      []CartItemWithProduct `json:"items"`
	TotalItems int                   `json:"totalItems"`
	TotalPrice float64               `json:"totalPrice"`
}
