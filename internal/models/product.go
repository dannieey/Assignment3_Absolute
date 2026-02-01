package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Product struct {
	ID                 primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Name               string             `json:"name" bson:"name"`
	Description        string             `json:"description" bson:"description"`
	Barcode            string             `json:"barcode" bson:"barcode"`
	BrandID            primitive.ObjectID `json:"brandId" bson:"brand_id"`
	CategoryID         primitive.ObjectID `json:"categoryId" bson:"category_id"`
	Price              float64            `json:"price" bson:"price"`
	Currency           string             `json:"currency" bson:"currency"`
	StockQty           int                `json:"stockQty" bson:"stock_qty"`
	AvailabilityStatus string             `json:"availabilityStatus" bson:"availability_status"`
	ImageURL           string             `json:"imageUrl" bson:"image_url"`
	CreatedAt          time.Time          `json:"createdAt" bson:"created_at"`
	UpdatedAt          time.Time          `json:"updatedAt" bson:"updated_at"`
}
