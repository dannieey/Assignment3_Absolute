package service

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/dannieey/Assignment3_Absolute/internal/models"
	"github.com/dannieey/Assignment3_Absolute/internal/repository"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type OrderService struct {
	repo           repository.OrderRepo
	orderQueue     chan primitive.ObjectID // канал для фоновой обработки
	workerQuitCh   chan bool               // для остановки воркера (опционально)
	productService *ProductService
}

func NewOrderService(repo repository.OrderRepo, prodService *ProductService) *OrderService {
	s := &OrderService{
		repo:           repo,
		productService: prodService,
		orderQueue:     make(chan primitive.ObjectID, 100),
		workerQuitCh:   make(chan bool),
	}
	go s.startWorker() // запускаем воркер в фоне
	return s
}
func (s *OrderService) Create(ctx context.Context, order *models.Order) (primitive.ObjectID, error) {
	if order.UserID == primitive.NilObjectID {
		return primitive.NilObjectID, fmt.Errorf("userId missing")
	}
	if len(order.Items) == 0 {
		return primitive.NilObjectID, fmt.Errorf("items missing")
	}

	var total float64

	for i := range order.Items {
		item := &order.Items[i]

		p, err := s.productService.GetByID(ctx, item.ProductID)
		if err != nil {
			return primitive.NilObjectID, fmt.Errorf("product not found: %s", item.ProductID.Hex())
		}

		if err := s.productService.DecreaseStock(ctx, item.ProductID, item.Quantity); err != nil {
			return primitive.NilObjectID, fmt.Errorf("not enough stock for product %s", item.ProductID.Hex())
		}

		item.Price = p.Price
		total += p.Price * float64(item.Quantity)
	}

	order.TotalPrice = total
	order.Status = "NEW"

	order.History = []models.OrderStatusHistory{
		{
			Status:    "NEW",
			Timestamp: time.Now(),
			Note:      "Order created",
		},
	}

	id, err := s.repo.Create(ctx, order)
	if err != nil {
		return primitive.NilObjectID, err
	}

	select {
	case s.orderQueue <- id:
	default:
		log.Printf("[worker] orderQueue is full, skipping async processing for order %s", id.Hex())
	}

	return id, nil
}

func (s *OrderService) GetHistory(ctx context.Context, userID primitive.ObjectID) ([]models.Order, error) {
	return s.repo.FindByUserID(ctx, userID)
}

func (s *OrderService) GetTracking(
	ctx context.Context,
	orderID primitive.ObjectID,
	userID primitive.ObjectID,
) (*models.OrderTracking, error) {

	order, err := s.repo.FindByID(ctx, orderID)
	if err != nil {
		return nil, fmt.Errorf("order not found")
	}

	if order.UserID != userID {
		return nil, fmt.Errorf("forbidden")
	}

	return &models.OrderTracking{
		OrderID:   order.ID,
		UserID:    order.UserID,
		Status:    order.Status,
		History:   order.History,
		CreatedAt: order.CreatedAt,
		UpdatedAt: order.UpdatedAt,
	}, nil
}
func (s *OrderService) startWorker() {
	log.Println("[worker] Order worker started")
	for {
		select {
		case orderID := <-s.orderQueue:
			s.processOrder(orderID)
		case <-s.workerQuitCh:
			log.Println("[worker] Order worker stopped")
			return
		}
	}
}

func (s *OrderService) processOrder(orderID primitive.ObjectID) {
	log.Printf("[worker] processing order %s", orderID.Hex())

	time.Sleep(2 * time.Second)
	_ = s.repo.UpdateStatusWithHistory(
		context.Background(),
		orderID,
		"PROCESSING",
		"Order is being prepared",
	)

	time.Sleep(2 * time.Second)
	_ = s.repo.UpdateStatusWithHistory(
		context.Background(),
		orderID,
		"DONE",
		"Order ready for pickup",
	)
}

func (s *OrderService) StopWorker() {
	s.workerQuitCh <- true
}
