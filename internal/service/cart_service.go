package service

import (
	"context"

	"github.com/dannieey/Assignment3_Absolute/internal/models"
	"github.com/dannieey/Assignment3_Absolute/internal/repository"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type CartService struct {
	cartRepo    repository.CartRepo
	productRepo repository.ProductRepo
}

func NewCartService(cartRepo repository.CartRepo, productRepo repository.ProductRepo) *CartService {
	return &CartService{
		cartRepo:    cartRepo,
		productRepo: productRepo,
	}
}

func (s *CartService) GetCart(ctx context.Context, userID primitive.ObjectID) (*models.CartResponse, error) {
	cart, err := s.cartRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	var items []models.CartItemWithProduct
	var totalPrice float64
	var totalItems int

	for _, item := range cart.Items {
		product, err := s.productRepo.FindByID(ctx, item.ProductID)
		if err != nil {
			continue // Пропускаем товары, которых больше нет
		}

		subtotal := product.Price * float64(item.Quantity)
		totalPrice += subtotal
		totalItems += item.Quantity

		items = append(items, models.CartItemWithProduct{
			ProductID: item.ProductID,
			Name:      product.Name,
			Price:     product.Price,
			ImageURL:  product.ImageURL,
			Quantity:  item.Quantity,
			Subtotal:  subtotal,
			InStock:   product.StockQty >= item.Quantity,
			StockQty:  product.StockQty,
		})
	}

	return &models.CartResponse{
		Items:      items,
		TotalItems: totalItems,
		TotalPrice: totalPrice,
	}, nil
}

func (s *CartService) AddItem(ctx context.Context, userID primitive.ObjectID, productID primitive.ObjectID, quantity int) error {
	_, err := s.productRepo.FindByID(ctx, productID)
	if err != nil {
		return err
	}

	return s.cartRepo.AddItem(ctx, userID, productID, quantity)
}

func (s *CartService) UpdateQuantity(ctx context.Context, userID primitive.ObjectID, productID primitive.ObjectID, quantity int) error {
	return s.cartRepo.UpdateItemQuantity(ctx, userID, productID, quantity)
}

func (s *CartService) RemoveItem(ctx context.Context, userID primitive.ObjectID, productID primitive.ObjectID) error {
	return s.cartRepo.RemoveItem(ctx, userID, productID)
}

func (s *CartService) Clear(ctx context.Context, userID primitive.ObjectID) error {
	return s.cartRepo.Clear(ctx, userID)
}
