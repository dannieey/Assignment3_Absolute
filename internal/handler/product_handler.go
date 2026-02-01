package handler

import (
	"encoding/json"
	"net/http"

	"github.com/dannieey/Assignment3_Absolute/internal/models"
	"github.com/dannieey/Assignment3_Absolute/internal/repository"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ProductHandler struct {
	repo repository.ProductRepo
}

func NewProductHandler(repo repository.ProductRepo) *ProductHandler {
	return &ProductHandler{repo: repo}
}
func (h *ProductHandler) List(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query().Get("q")
	cat := r.URL.Query().Get("categoryId")
	var catID *primitive.ObjectID
	if cat != "" {
		id, err := primitive.ObjectIDFromHex(cat)
		if err != nil {
			http.Error(w, "Invalid categoryId", http.StatusBadRequest)
			return
		}
		catID = &id
	}
	products, err := h.repo.List(r.Context(), q, catID)
	if err != nil {
		http.Error(w, "Failed to fetch products: "+err.Error(), http.StatusInternalServerError)
		return
	}

	writeJSON(w, http.StatusOK, products)
}
func (h *ProductHandler) Create(w http.ResponseWriter, r *http.Request) {
	var p models.Product
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}
	if p.Name == "" {
		http.Error(w, "name is required", http.StatusBadRequest)
		return
	}
	if p.Currency == "" {
		p.Currency = "KZT"
	}
	if p.AvailabilityStatus == "" {
		p.AvailabilityStatus = "IN_STOCK"
	}

	id, err := h.repo.Create(r.Context(), &p)
	if err != nil {
		http.Error(w, "Failed to create product: "+err.Error(), http.StatusInternalServerError)
		return
	}

	writeJSON(w, http.StatusCreated, map[string]string{"id": id.Hex()})
}
