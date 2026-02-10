package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/dannieey/Assignment3_Absolute/internal/models"
	"github.com/dannieey/Assignment3_Absolute/internal/repository"
	"github.com/dannieey/Assignment3_Absolute/internal/service"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ProductHandler struct {
	service *service.ProductService
}

func NewProductHandler(s *service.ProductService) *ProductHandler {
	return &ProductHandler{service: s}
}

func (h *ProductHandler) List(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query().Get("q")
	cat := r.URL.Query().Get("categoryId")

	var catID *primitive.ObjectID
	if cat != "" {
		id, err := primitive.ObjectIDFromHex(cat)
		if err == nil {
			catID = &id
		}
	}

	products, err := h.service.List(r.Context(), q, catID)
	if err != nil {
		http.Error(w, "Failed to fetch products", http.StatusInternalServerError)
		return
	}
	writeJSON(w, http.StatusOK, products)
}

func (h *ProductHandler) ListWithFilter(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()

	filter := repository.ProductFilter{
		Query:     query.Get("q"),
		SortBy:    query.Get("sortBy"),
		SortOrder: 1,
		Page:      1,
		Limit:     12,
	}

	if catID := query.Get("categoryId"); catID != "" {
		id, err := primitive.ObjectIDFromHex(catID)
		if err == nil {
			filter.CategoryID = &id
		}
	}

	if brandID := query.Get("brandId"); brandID != "" {
		id, err := primitive.ObjectIDFromHex(brandID)
		if err == nil {
			filter.BrandID = &id
		}
	}

	if minPrice := query.Get("minPrice"); minPrice != "" {
		if val, err := strconv.ParseFloat(minPrice, 64); err == nil {
			filter.MinPrice = &val
		}
	}
	if maxPrice := query.Get("maxPrice"); maxPrice != "" {
		if val, err := strconv.ParseFloat(maxPrice, 64); err == nil {
			filter.MaxPrice = &val
		}
	}

	if order := query.Get("order"); order == "desc" {
		filter.SortOrder = -1
	}

	if page := query.Get("page"); page != "" {
		if val, err := strconv.Atoi(page); err == nil {
			filter.Page = val
		}
	}
	if limit := query.Get("limit"); limit != "" {
		if val, err := strconv.Atoi(limit); err == nil {
			filter.Limit = val
		}
	}

	result, err := h.service.ListWithFilter(r.Context(), filter)
	if err != nil {
		http.Error(w, "Failed to fetch products", http.StatusInternalServerError)
		return
	}

	writeJSON(w, http.StatusOK, result)
}

// staff
func (h *ProductHandler) Create(w http.ResponseWriter, r *http.Request) {
	var p models.Product
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	id, err := h.service.Create(r.Context(), &p)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	writeJSON(w, http.StatusCreated, map[string]string{"id": id.Hex()})
}

// staff
func (h *ProductHandler) Update(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	id, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var p models.Product
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	if err := h.service.Update(r.Context(), id, &p); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "Product updated"})
}

// staff only
func (h *ProductHandler) Delete(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	id, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	if err := h.service.Delete(r.Context(), id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "Product deleted"})
}

func (h *ProductHandler) FindByBarcode(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Query().Get("code")
	if code == "" {
		http.Error(w, "code is required", http.StatusBadRequest)
		return
	}

	p, err := h.service.GetByBarcode(r.Context(), code)
	if err != nil {
		http.Error(w, "Product not found", http.StatusNotFound)
		return
	}

	writeJSON(w, http.StatusOK, p)
}
