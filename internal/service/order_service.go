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

	// 1) Calculate prices from DB and reserve stock immediately
	var total float64

	for i := range order.Items {
		item := &order.Items[i]

		// get product by id (add this method in ProductService, see below)
		p, err := s.productService.GetByID(ctx, item.ProductID)
		if err != nil {
			return primitive.NilObjectID, fmt.Errorf("product not found: %s", item.ProductID.Hex())
		}

		// reserve stock NOW (atomic condition inside repo)
		if err := s.productService.DecreaseStock(ctx, item.ProductID, item.Quantity); err != nil {
			return primitive.NilObjectID, fmt.Errorf("not enough stock for product %s", item.ProductID.Hex())
		}

		item.Price = p.Price
		total += p.Price * float64(item.Quantity)
	}

	order.TotalPrice = total
	order.Status = "NEW"

	// 2) Save order
	return s.repo.Create(ctx, order)
}

func (s *OrderService) GetHistory(ctx context.Context, userID primitive.ObjectID) ([]models.Order, error) {
	return s.repo.FindByUserID(ctx, userID)
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
	log.Printf("[worker] Start processing order %s", orderID.Hex())
	time.Sleep(2 * time.Second)

	_ = s.repo.UpdateStatus(context.Background(), orderID, "PROCESSING")
	time.Sleep(2 * time.Second)
	_ = s.repo.UpdateStatus(context.Background(), orderID, "DONE")

	log.Printf("[worker] Finished processing order %s", orderID.Hex())
}

func (s *OrderService) StopWorker() {
	s.workerQuitCh <- true
}
