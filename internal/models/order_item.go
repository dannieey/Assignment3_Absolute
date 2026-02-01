package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type OrderItem struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	OrderID   primitive.ObjectID `json:"orderId" bson:"order_id"`
	ProductID primitive.ObjectID `json:"productId" bson:"product_id"`
	Quantity  int                `json:"quantity" bson:"quantity"`
	Price     float64            `json:"price" bson:"price"`
}
