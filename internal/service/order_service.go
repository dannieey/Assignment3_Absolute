package service

import (
	"context"
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
	id, err := s.repo.Create(ctx, order)
	if err != nil {
		return primitive.NilObjectID, err
	}
	s.orderQueue <- id
	return id, nil
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
	order, err := s.repo.FindByID(context.Background(), orderID)
	if err != nil {
		log.Printf("[worker] Order %s not found: %v", orderID.Hex(), err)
		return
	}
	for _, item := range order.Items {
		err := s.productService.DecreaseStock(context.Background(), item.ProductID, item.Quantity)
		if err != nil {
			log.Printf("[worker] Failed to update stock for product %s: %v", item.ProductID, err)
			continue
		}
	}

	log.Printf("[worker] Finished processing order %s. Inventory updated.", orderID.Hex())
}
func (s *OrderService) StopWorker() {
	s.workerQuitCh <- true
}
