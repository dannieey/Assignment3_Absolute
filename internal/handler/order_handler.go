package handler

import (
	"encoding/json"
	"net/http"

	"github.com/dannieey/Assignment3_Absolute/internal/models"
	"github.com/dannieey/Assignment3_Absolute/internal/service"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type OrderHandler struct {
	service *service.OrderService
}

func NewOrderHandler(s *service.OrderService) *OrderHandler {
	return &OrderHandler{service: s}
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

	id, err := h.service.Create(r.Context(), &order)
	if err != nil {
		http.Error(w, "Failed to create order: "+err.Error(), http.StatusInternalServerError)
		return
	}

	writeJSON(w, http.StatusCreated, map[string]string{
		"message": "Order placed, background processing started",
		"id":      id.Hex(),
	})
}

func (h *OrderHandler) History(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("userId")
	if userID == "" {
		http.Error(w, "userId query param is required", http.StatusBadRequest)
		return
	}

	uid, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		http.Error(w, "Invalid userId", http.StatusBadRequest)
		return
	}
	orders, err := h.service.GetHistory(r.Context(), uid)
	if err != nil {
		http.Error(w, "Failed to fetch orders: "+err.Error(), http.StatusInternalServerError)
		return
	}
	writeJSON(w, http.StatusOK, orders)
}
