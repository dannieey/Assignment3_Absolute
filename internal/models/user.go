package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID           primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	FullName     string             `json:"fullName" bson:"full_name"`
	Email        string             `json:"email" bson:"email"`
	PasswordHash string             `json:"passwordHash" bson:"password_hash"`
	Role         string             `json:"role" bson:"role"`
	CreatedAt    time.Time          `json:"createdAt" bson:"created_at"`
}
