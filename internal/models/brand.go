package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Brand struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Name      string             `json:"name" bson:"name"`
	Country   string             `json:"country" bson:"country"`
	CreatedAt time.Time          `json:"createdAt" bson:"created_at"`
}
