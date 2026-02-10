package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type OrderStatusHistory struct {
	Status    string    `json:"status" bson:"status"`
	Timestamp time.Time `json:"timestamp" bson:"timestamp"`
	Note      string    `json:"note,omitempty" bson:"note,omitempty"`
}

type OrderTracking struct {
	OrderID   primitive.ObjectID   `json:"orderId"`
	UserID    primitive.ObjectID   `json:"userId"`
	Status    string               `json:"status"`
	History   []OrderStatusHistory `json:"history"`
	CreatedAt time.Time            `json:"createdAt"`
	UpdatedAt time.Time            `json:"updatedAt"`
}
