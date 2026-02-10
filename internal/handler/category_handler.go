package handler

import (
	"encoding/json"
	"net/http"

	"github.com/dannieey/Assignment3_Absolute/internal/models"
	"github.com/dannieey/Assignment3_Absolute/internal/repository"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type CategoryHandler struct {
	repo        repository.CategoryRepo
	productRepo repository.ProductRepo
}

func NewCategoryHandler(repo repository.CategoryRepo, productRepo repository.ProductRepo) *CategoryHandler {
	return &CategoryHandler{repo: repo, productRepo: productRepo}
}

type categoryWithCount struct {
	models.Category
	ItemsCount int64 `json:"itemsCount"`
}

func (h *CategoryHandler) List(w http.ResponseWriter, r *http.Request) {
	cats, err := h.repo.List(r.Context())
	if err != nil {
		http.Error(w, "Failed to fetch categories", http.StatusInternalServerError)
		return
	}

	out := make([]categoryWithCount, 0, len(cats))
	for _, c := range cats {
		cnt := int64(0)
		if h.productRepo != nil {
			if n, err := h.productRepo.CountByCategory(r.Context(), c.ID); err == nil {
				cnt = n
			}
		}
		out = append(out, categoryWithCount{Category: c, ItemsCount: cnt})
	}

	writeJSON(w, http.StatusOK, out)
}

// STAFF
func (h *CategoryHandler) Create(w http.ResponseWriter, r *http.Request) {
	var c models.Category
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}
	if c.Name == "" {
		http.Error(w, "name is required", http.StatusBadRequest)
		return
	}

	id, err := h.repo.Create(r.Context(), &c)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	writeJSON(w, http.StatusCreated, map[string]string{"id": id.Hex()})
}

// STAFF
func (h *CategoryHandler) Update(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	id, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		http.Error(w, "Invalid id", http.StatusBadRequest)
		return
	}

	var c models.Category
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}
	if err := h.repo.Update(r.Context(), id, &c); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "Category updated"})
}

// STAFF
func (h *CategoryHandler) Delete(w http.ResponseWriter, r *http.Request) {
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
	writeJSON(w, http.StatusOK, map[string]string{"message": "Category deleted"})
}
