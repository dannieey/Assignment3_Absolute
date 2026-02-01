package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Category struct {
	ID        primitive.ObjectID  `json:"id" bson:"_id,omitempty"`
	Name      string              `json:"name" bson:"name"`
	ParentID  *primitive.ObjectID `json:"parentId,omitempty" bson:"parent_id,omitempty"`
	CreatedAt time.Time           `json:"createdAt" bson:"created_at"`
}
