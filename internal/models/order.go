package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Order struct {
	ID         primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	UserID     primitive.ObjectID `json:"userId" bson:"user_id"`
	Status     string             `json:"status" bson:"status"`
	TotalPrice float64            `json:"totalPrice" bson:"total_price"`
	Items      []OrderItem        `json:"items" bson:"items"`
	CreatedAt  time.Time          `json:"createdAt" bson:"created_at"`
	UpdatedAt  time.Time          `json:"updatedAt" bson:"updated_at"`
}
