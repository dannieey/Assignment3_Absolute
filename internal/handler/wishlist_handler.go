package handler

import (
	"encoding/json"
	"net/http"

	"github.com/dannieey/Assignment3_Absolute/internal/service"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type WishlistHandler struct {
	service *service.WishlistService
}

func NewWishlistHandler(s *service.WishlistService) *WishlistHandler {
	return &WishlistHandler{service: s}
}

func (h *WishlistHandler) Get(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromContext(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	wishlist, err := h.service.GetWishlist(r.Context(), userID)
	if err != nil {
		http.Error(w, "Failed to get wishlist", http.StatusInternalServerError)
		return
	}

	writeJSON(w, http.StatusOK, wishlist)
}

func (h *WishlistHandler) Add(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromContext(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		ProductID string `json:"productId"`
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

	if err := h.service.AddItem(r.Context(), userID, productID); err != nil {
		http.Error(w, "Failed to add item: "+err.Error(), http.StatusBadRequest)
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "Item added to wishlist"})
}

func (h *WishlistHandler) Remove(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromContext(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	productIDStr := r.URL.Query().Get("productId")
	if productIDStr == "" {
		if err := h.service.Clear(r.Context(), userID); err != nil {
			http.Error(w, "Failed to clear wishlist", http.StatusInternalServerError)
			return
		}
		writeJSON(w, http.StatusOK, map[string]string{"message": "Wishlist cleared"})
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

	writeJSON(w, http.StatusOK, map[string]string{"message": "Item removed from wishlist"})
}

func (h *WishlistHandler) Check(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromContext(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	productIDStr := r.URL.Query().Get("productId")
	productID, err := primitive.ObjectIDFromHex(productIDStr)
	if err != nil {
		http.Error(w, "Invalid productId", http.StatusBadRequest)
		return
	}

	exists, err := h.service.HasItem(r.Context(), userID, productID)
	if err != nil {
		http.Error(w, "Failed to check", http.StatusInternalServerError)
		return
	}

	writeJSON(w, http.StatusOK, map[string]bool{"inWishlist": exists})
}
