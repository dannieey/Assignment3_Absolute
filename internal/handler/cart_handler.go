package handler

import (
	"encoding/json"
	"net/http"

	"github.com/dannieey/Assignment3_Absolute/internal/middleware"
	"github.com/dannieey/Assignment3_Absolute/internal/service"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type CartHandler struct {
	service *service.CartService
}

func NewCartHandler(s *service.CartService) *CartHandler {
	return &CartHandler{service: s}
}

func (h *CartHandler) Get(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromContext(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	cart, err := h.service.GetCart(r.Context(), userID)
	if err != nil {
		http.Error(w, "Failed to get cart", http.StatusInternalServerError)
		return
	}

	writeJSON(w, http.StatusOK, cart)
}

func (h *CartHandler) Add(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromContext(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		ProductID string `json:"productId"`
		Quantity  int    `json:"quantity"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	productID, err := primitive.ObjectIDFromHex(req.ProductID)
	if err != nil {
		http.Error(w, "Invalid productId", http.StatusBadRequest)
		return
	}

	if req.Quantity < 1 {
		req.Quantity = 1
	}

	if err := h.service.AddItem(r.Context(), userID, productID, req.Quantity); err != nil {
		http.Error(w, "Failed to add item: "+err.Error(), http.StatusBadRequest)
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "Item added to cart"})
}

func (h *CartHandler) Update(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromContext(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		ProductID string `json:"productId"`
		Quantity  int    `json:"quantity"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	productID, err := primitive.ObjectIDFromHex(req.ProductID)
	if err != nil {
		http.Error(w, "Invalid productId", http.StatusBadRequest)
		return
	}

	if err := h.service.UpdateQuantity(r.Context(), userID, productID, req.Quantity); err != nil {
		http.Error(w, "Failed to update cart", http.StatusInternalServerError)
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "Cart updated"})
}

func (h *CartHandler) Remove(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromContext(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	productIDStr := r.URL.Query().Get("productId")
	if productIDStr == "" {
		if err := h.service.Clear(r.Context(), userID); err != nil {
			http.Error(w, "Failed to clear cart", http.StatusInternalServerError)
			return
		}
		writeJSON(w, http.StatusOK, map[string]string{"message": "Cart cleared"})
		return
	}

	productID, err := primitive.ObjectIDFromHex(productIDStr)
	if err != nil {
		http.Error(w, "Invalid productId", http.StatusBadRequest)
		return
	}

	if err := h.service.RemoveItem(r.Context(), userID, productID); err != nil {
		http.Error(w, "Failed to remove item", http.StatusInternalServerError)
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "Item removed from cart"})
}

func getUserIDFromContext(r *http.Request) (primitive.ObjectID, error) {
	userIDHex, ok := r.Context().Value(middleware.CtxUserID).(string)
	if !ok || userIDHex == "" {
		return primitive.NilObjectID, http.ErrNoCookie
	}
	return primitive.ObjectIDFromHex(userIDHex)
}
