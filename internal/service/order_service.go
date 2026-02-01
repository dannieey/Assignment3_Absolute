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
	repo         repository.OrderRepo
	orderQueue   chan primitive.ObjectID // канал для фоновой обработки
	workerQuitCh chan bool               // для остановки воркера (опционально)
}

func NewOrderService(repo repository.OrderRepo) *OrderService {
	s := &OrderService{
		repo:         repo,
		orderQueue:   make(chan primitive.ObjectID, 100), // буфер для 100 заказов
		workerQuitCh: make(chan bool),
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
	time.Sleep(2 * time.Second) // эмуляция обработки
	log.Printf("[worker] Finished processing order %s", orderID.Hex())
}
func (s *OrderService) StopWorker() {
	s.workerQuitCh <- true
}
