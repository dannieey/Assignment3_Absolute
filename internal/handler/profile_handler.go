package handler

import (
	"net/http"

	"github.com/dannieey/Assignment3_Absolute/internal/middleware"
	"github.com/dannieey/Assignment3_Absolute/internal/repository"
	"github.com/dannieey/Assignment3_Absolute/internal/service"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ProfileHandler struct {
	userRepo     repository.UserRepo
	orderService *service.OrderService
}

func NewProfileHandler(userRepo repository.UserRepo, orderService *service.OrderService) *ProfileHandler {
	return &ProfileHandler{
		userRepo:     userRepo,
		orderService: orderService,
	}
}

type ProfileResponse struct {
	ID          string `json:"id"`
	Email       string `json:"email"`
	FullName    string `json:"fullName"`
	Role        string `json:"role"`
	OrdersCount int    `json:"ordersCount"`
}

func (h *ProfileHandler) Get(w http.ResponseWriter, r *http.Request) {
	userIDHex, ok := r.Context().Value(middleware.CtxUserID).(string)
	if !ok || userIDHex == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	userID, err := primitive.ObjectIDFromHex(userIDHex)
	if err != nil {
		http.Error(w, "Invalid user id", http.StatusUnauthorized)
		return
	}

	user, err := h.userRepo.FindByID(r.Context(), userID)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	orders, _ := h.orderService.GetHistory(r.Context(), userID)
	ordersCount := 0
	if orders != nil {
		ordersCount = len(orders)
	}

	profile := ProfileResponse{
		ID:          user.ID.Hex(),
		Email:       user.Email,
		FullName:    user.FullName,
		Role:        user.Role,
		OrdersCount: ordersCount,
	}

	writeJSON(w, http.StatusOK, profile)
}
