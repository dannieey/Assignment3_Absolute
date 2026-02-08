package handler

import (
	"encoding/json"
	"net/http"

	"github.com/dannieey/Assignment3_Absolute/internal/middleware"
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

type createOrderReq struct {
	Items []struct {
		ProductID string `json:"productId"`
		Quantity  int    `json:"quantity"`
	} `json:"items"`
}

func (h *OrderHandler) Create(w http.ResponseWriter, r *http.Request) {
	// 1) userId only from JWT context
	userIDHex, ok := r.Context().Value(middleware.CtxUserID).(string)
	if !ok || userIDHex == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	userID, err := primitive.ObjectIDFromHex(userIDHex)
	if err != nil {
		http.Error(w, "Invalid user id in token", http.StatusUnauthorized)
		return
	}

	// 2) parse body
	var req createOrderReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}
	if len(req.Items) == 0 {
		http.Error(w, "items is required", http.StatusBadRequest)
		return
	}

	order := &models.Order{
		UserID: userID,
		Items:  make([]models.OrderItem, 0, len(req.Items)),
	}

	for _, it := range req.Items {
		pid, err := primitive.ObjectIDFromHex(it.ProductID)
		if err != nil {
			http.Error(w, "Invalid productId", http.StatusBadRequest)
			return
		}
		if it.Quantity <= 0 {
			http.Error(w, "quantity must be > 0", http.StatusBadRequest)
			return
		}
		order.Items = append(order.Items, models.OrderItem{
			ProductID: pid,
			Quantity:  it.Quantity,
		})
	}

	id, err := h.service.Create(r.Context(), order)
	if err != nil {
		http.Error(w, "Failed to create order: "+err.Error(), http.StatusBadRequest)
		return
	}

	writeJSON(w, http.StatusCreated, map[string]string{
		"message": "Order created",
		"id":      id.Hex(),
	})
}
func (h *OrderHandler) History(w http.ResponseWriter, r *http.Request) {
	// userId only from JWT context (safer than query param)
	userIDHex, ok := r.Context().Value(middleware.CtxUserID).(string)
	if !ok || userIDHex == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	userID, err := primitive.ObjectIDFromHex(userIDHex)
	if err != nil {
		http.Error(w, "Invalid user id in token", http.StatusUnauthorized)
		return
	}

	orders, err := h.service.GetHistory(r.Context(), userID)
	if err != nil {
		http.Error(w, "Failed to fetch orders: "+err.Error(), http.StatusInternalServerError)
		return
	}

	writeJSON(w, http.StatusOK, orders)
}
