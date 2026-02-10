package service

import (
	"context"
	"fmt"

	"github.com/dannieey/Assignment3_Absolute/internal/models"
	"github.com/dannieey/Assignment3_Absolute/internal/repository"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ProductService struct {
	repo repository.ProductRepo
}

func NewProductService(repo repository.ProductRepo) *ProductService {
	return &ProductService{repo: repo}
}

func (s *ProductService) Create(ctx context.Context, p *models.Product) (primitive.ObjectID, error) {
	s.applyAvailabilityLogic(p)
	return s.repo.Create(ctx, p)
}

func (s *ProductService) List(ctx context.Context, q string, catID *primitive.ObjectID) ([]models.Product, error) {
	products, err := s.repo.List(ctx, q, catID)
	if err != nil {
		return nil, err
	}
	for i := range products {
		s.applyAvailabilityLogic(&products[i])
	}
	return products, nil
}

func (s *ProductService) Update(ctx context.Context, id primitive.ObjectID, p *models.Product) error {
	s.applyAvailabilityLogic(p)
	return s.repo.Update(ctx, id, p)
}

func (s *ProductService) Delete(ctx context.Context, id primitive.ObjectID) error {
	return s.repo.Delete(ctx, id)
}

func (s *ProductService) applyAvailabilityLogic(p *models.Product) {
	if p.StockQty <= 0 {
		p.AvailabilityStatus = "OUT_OF_STOCK"
	} else if p.StockQty < 10 {
		p.AvailabilityStatus = "LOW_STOCK"
	} else {
		p.AvailabilityStatus = "IN_STOCK"
	}
}

func (s *ProductService) DecreaseStock(ctx context.Context, id primitive.ObjectID, qty int) error {
	if qty <= 0 {
		return nil
	}
	return s.repo.DecreaseStock(ctx, id, qty)
}
func (s *ProductService) GetByID(ctx context.Context, id primitive.ObjectID) (*models.Product, error) {
	p, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	s.applyAvailabilityLogic(p)
	return p, nil
}

func (s *ProductService) GetByBarcode(ctx context.Context, barcode string) (*models.Product, error) {
	if barcode == "" {
		return nil, fmt.Errorf("barcode is required")
	}
	p, err := s.repo.FindByBarcode(ctx, barcode)
	if err != nil {
		return nil, err
	}
	s.applyAvailabilityLogic(p)
	return p, nil
}

func (s *ProductService) ListWithFilter(ctx context.Context, filter repository.ProductFilter) (*repository.ProductListResult, error) {
	result, err := s.repo.ListWithFilter(ctx, filter)
	if err != nil {
		return nil, err
	}
	for i := range result.Products {
		s.applyAvailabilityLogic(&result.Products[i])
	}
	return result, nil
}
