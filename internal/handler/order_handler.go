package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/dannieey/Assignment3_Absolute/internal/models"
	"github.com/dannieey/Assignment3_Absolute/internal/repository"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type OrderHandler struct {
	repo repository.OrderRepo
}

func NewOrderHandler(repo repository.OrderRepo) *OrderHandler {
	return &OrderHandler{repo: repo}
}
func (h *OrderHandler) Create(w http.ResponseWriter, r *http.Request) {
	var order models.Order
	if err := json.NewDecoder(r.Body).Decode(&order); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}
	if order.UserID == primitive.NilObjectID {
		http.Error(w, "userId is required (ObjectID)", http.StatusBadRequest)
		return
	}
	id, err := h.repo.Create(r.Context(), &order)
	if err != nil {
		http.Error(w, "Failed to create order: "+err.Error(), http.StatusInternalServerError)
		return
	}
	go func(orderID string) {
		log.Printf("[bg] start processing order %s", orderID)
		time.Sleep(2 * time.Second)
		log.Printf("[bg] order %s processed", orderID)
	}(id.Hex())
	writeJSON(w, http.StatusCreated, map[string]string{
		"message": "Order placed, background processing started",
		"id":      id.Hex(),
	})
}
func (h *OrderHandler) History(w http.ResponseWriter, r *http.Request) {
	userId := r.URL.Query().Get("userId")
	if userId == "" {
		http.Error(w, "userIВ query param is required", http.StatusBadRequest)
		return
	}
	uid, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		http.Error(w, "Invalid userId", http.StatusBadRequest)
		return
	}
	orders, err := h.repo.FindByUserID(r.Context(), uid)
	if err != nil {
		http.Error(w, "Failed to fetch orders: "+err.Error(), http.StatusInternalServerError)
		return
	}
	writeJSON(w, http.StatusOK, orders)
}
