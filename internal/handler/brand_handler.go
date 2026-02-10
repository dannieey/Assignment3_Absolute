package handler

import (
	"encoding/json"
	"net/http"

	"github.com/dannieey/Assignment3_Absolute/internal/models"
	"github.com/dannieey/Assignment3_Absolute/internal/repository"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type BrandHandler struct {
	repo repository.BrandRepo
}

func NewBrandHandler(repo repository.BrandRepo) *BrandHandler {
	return &BrandHandler{repo: repo}
}

// PUBLIC
func (h *BrandHandler) List(w http.ResponseWriter, r *http.Request) {
	brands, err := h.repo.List(r.Context())
	if err != nil {
		http.Error(w, "Failed to fetch brands", http.StatusInternalServerError)
		return
	}
	writeJSON(w, http.StatusOK, brands)
}

// STAFF
func (h *BrandHandler) Create(w http.ResponseWriter, r *http.Request) {
	var b models.Brand
	if err := json.NewDecoder(r.Body).Decode(&b); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}
	if b.Name == "" {
		http.Error(w, "name is required", http.StatusBadRequest)
		return
	}

	id, err := h.repo.Create(r.Context(), &b)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	writeJSON(w, http.StatusCreated, map[string]string{"id": id.Hex()})
}

// STAFF
func (h *BrandHandler) Update(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	id, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		http.Error(w, "Invalid id", http.StatusBadRequest)
		return
	}
	var b models.Brand
	if err := json.NewDecoder(r.Body).Decode(&b); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}
	if err := h.repo.Update(r.Context(), id, &b); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "Brand updated"})
}

// STAFF
func (h *BrandHandler) Delete(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	id, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		http.Error(w, "Invalid id", http.StatusBadRequest)
		return
	}
	if err := h.repo.Delete(r.Context(), id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "Brand deleted"})
}
