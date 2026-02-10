package service

import (
	"context"

	"github.com/dannieey/Assignment3_Absolute/internal/models"
	"github.com/dannieey/Assignment3_Absolute/internal/repository"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type WishlistService struct {
	wishlistRepo repository.WishlistRepo
	productRepo  repository.ProductRepo
}

func NewWishlistService(wishlistRepo repository.WishlistRepo, productRepo repository.ProductRepo) *WishlistService {
	return &WishlistService{
		wishlistRepo: wishlistRepo,
		productRepo:  productRepo,
	}
}

func (s *WishlistService) GetWishlist(ctx context.Context, userID primitive.ObjectID) (*models.WishlistResponse, error) {
	wishlist, err := s.wishlistRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	var items []models.WishlistItemWithProduct

	for _, item := range wishlist.Items {
		product, err := s.productRepo.FindByID(ctx, item.ProductID)
		if err != nil {
			continue
		}

		items = append(items, models.WishlistItemWithProduct{
			ProductID: item.ProductID,
			Name:      product.Name,
			Price:     product.Price,
			ImageURL:  product.ImageURL,
			InStock:   product.StockQty > 0,
			AddedAt:   item.AddedAt,
		})
	}

	return &models.WishlistResponse{
		Items:      items,
		TotalItems: len(items),
	}, nil
}

func (s *WishlistService) AddItem(ctx context.Context, userID primitive.ObjectID, productID primitive.ObjectID) error {
	_, err := s.productRepo.FindByID(ctx, productID)
	if err != nil {
		return err
	}

	return s.wishlistRepo.AddItem(ctx, userID, productID)
}

func (s *WishlistService) RemoveItem(ctx context.Context, userID primitive.ObjectID, productID primitive.ObjectID) error {
	return s.wishlistRepo.RemoveItem(ctx, userID, productID)
}

func (s *WishlistService) HasItem(ctx context.Context, userID primitive.ObjectID, productID primitive.ObjectID) (bool, error) {
	return s.wishlistRepo.HasItem(ctx, userID, productID)
}

func (s *WishlistService) Clear(ctx context.Context, userID primitive.ObjectID) error {
	return s.wishlistRepo.Clear(ctx, userID)
}
