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

type ProductFilter struct {
	Query      string
	CategoryID *primitive.ObjectID
	BrandID    *primitive.ObjectID
	MinPrice   *float64
	MaxPrice   *float64
	SortBy     string
	SortOrder  int
	Page       int
	Limit      int
}

type ProductListResult struct {
	Products   []models.Product `json:"products"`
	Total      int64            `json:"total"`
	Page       int              `json:"page"`
	Limit      int              `json:"limit"`
	TotalPages int              `json:"totalPages"`
}

type ProductRepo interface {
	Create(ctx context.Context, p *models.Product) (primitive.ObjectID, error)
	FindByID(ctx context.Context, id primitive.ObjectID) (*models.Product, error)
	List(ctx context.Context, q string, categoryID *primitive.ObjectID) ([]models.Product, error)
	ListWithFilter(ctx context.Context, filter ProductFilter) (*ProductListResult, error)
	Update(ctx context.Context, id primitive.ObjectID, p *models.Product) error
	Delete(ctx context.Context, id primitive.ObjectID) error

	DecreaseStock(ctx context.Context, productID primitive.ObjectID, qty int) error
	FindByBarcode(ctx context.Context, barcode string) (*models.Product, error)
	Count(ctx context.Context) (int64, error)
}

type productRepo struct {
	col *mongo.Collection
}

func NewProductRepo(db *mongo.Database) ProductRepo {
	return &productRepo{col: db.Collection("products")}
}

func (r *productRepo) Create(ctx context.Context, p *models.Product) (primitive.ObjectID, error) {
	now := time.Now()
	p.CreatedAt = now
	p.UpdatedAt = now
	res, err := r.col.InsertOne(ctx, p)
	if err != nil {
		return primitive.NilObjectID, err
	}
	id, _ := res.InsertedID.(primitive.ObjectID)
	return id, nil
}
func (r *productRepo) FindByID(ctx context.Context, id primitive.ObjectID) (*models.Product, error) {
	var p models.Product
	if err := r.col.FindOne(ctx, bson.M{"_id": id}).Decode(&p); err != nil {
		return nil, err
	}
	return &p, nil
}
func (r *productRepo) List(ctx context.Context, q string, categoryID *primitive.ObjectID) ([]models.Product, error) {
	filter := bson.M{}
	if q != "" {
		filter["name"] = bson.M{"$regex": q, "$options": "i"}
	}
	if categoryID != nil {
		filter["category_id"] = *categoryID
	}
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})
	cur, err := r.col.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	var list []models.Product
	if err := cur.All(ctx, &list); err != nil {
		return nil, err
	}
	return list, nil
}
func (r *productRepo) Update(ctx context.Context, id primitive.ObjectID, p *models.Product) error {
	p.UpdatedAt = time.Now()
	_, err := r.col.UpdateOne(
		ctx,
		bson.M{"_id": id},
		bson.M{"$set": bson.M{
			"name":                p.Name,
			"description":         p.Description,
			"barcode":             p.Barcode,
			"brand_id":            p.BrandID,
			"category_id":         p.CategoryID,
			"price":               p.Price,
			"currency":            p.Currency,
			"aisle":               p.Aisle,
			"section":             p.Section,
			"shelf":               p.Shelf,
			"stock_qty":           p.StockQty,
			"availability_status": p.AvailabilityStatus,
			"image_url":           p.ImageURL,
			"updated_at":          p.UpdatedAt,
		}},
	)
	return err
}
func (r *productRepo) Delete(ctx context.Context, id primitive.ObjectID) error {
	_, err := r.col.DeleteOne(ctx, bson.M{"_id": id})
	return err
}
func (r *productRepo) DecreaseStock(ctx context.Context, productID primitive.ObjectID, qty int) error {
	_, err := r.col.UpdateOne(
		ctx,
		bson.M{"_id": productID, "stock_qty": bson.M{"$gte": qty}},
		bson.M{"$inc": bson.M{"stock_qty": -qty}},
	)
	return err
}
func (r *productRepo) FindByBarcode(ctx context.Context, barcode string) (*models.Product, error) {
	var p models.Product
	if err := r.col.FindOne(ctx, bson.M{"barcode": barcode}).Decode(&p); err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *productRepo) ListWithFilter(ctx context.Context, f ProductFilter) (*ProductListResult, error) {
	filter := bson.M{}

	if f.Query != "" {
		filter["$or"] = bson.A{
			bson.M{"name": bson.M{"$regex": f.Query, "$options": "i"}},
			bson.M{"description": bson.M{"$regex": f.Query, "$options": "i"}},
		}
	}

	if f.CategoryID != nil {
		filter["category_id"] = *f.CategoryID
	}

	if f.BrandID != nil {
		filter["brand_id"] = *f.BrandID
	}

	if f.MinPrice != nil || f.MaxPrice != nil {
		priceFilter := bson.M{}
		if f.MinPrice != nil {
			priceFilter["$gte"] = *f.MinPrice
		}
		if f.MaxPrice != nil {
			priceFilter["$lte"] = *f.MaxPrice
		}
		filter["price"] = priceFilter
	}

	total, err := r.col.CountDocuments(ctx, filter)
	if err != nil {
		return nil, err
	}

	sortField := "created_at"
	if f.SortBy != "" {
		sortField = f.SortBy
	}
	sortOrder := -1
	if f.SortOrder != 0 {
		sortOrder = f.SortOrder
	}

	page := f.Page
	if page < 1 {
		page = 1
	}
	limit := f.Limit
	if limit < 1 {
		limit = 12
	}
	if limit > 100 {
		limit = 100
	}
	skip := (page - 1) * limit

	opts := options.Find().
		SetSort(bson.D{{Key: sortField, Value: sortOrder}}).
		SetSkip(int64(skip)).
		SetLimit(int64(limit))

	cur, err := r.col.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var products []models.Product
	if err := cur.All(ctx, &products); err != nil {
		return nil, err
	}

	totalPages := int(total) / limit
	if int(total)%limit > 0 {
		totalPages++
	}

	return &ProductListResult{
		Products:   products,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

func (r *productRepo) Count(ctx context.Context) (int64, error) {
	return r.col.CountDocuments(ctx, bson.M{})
}
