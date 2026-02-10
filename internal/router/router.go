package router

import (
	"errors"
	"log"
	"net/http"
	"os"

	"github.com/dannieey/Assignment3_Absolute/internal/db"
	"github.com/dannieey/Assignment3_Absolute/internal/handler"
	"github.com/dannieey/Assignment3_Absolute/internal/middleware"
	"github.com/dannieey/Assignment3_Absolute/internal/repository"
	"github.com/dannieey/Assignment3_Absolute/internal/service"
)

func New() (http.Handler, error) {
	mux := http.NewServeMux()

	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		return nil, errors.New("MONGO_URI environment variable not set")
	}
	client, err := db.ConnectDB(mongoURI)
	if err != nil {
		return nil, err
	}

	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "supermarket"
	}
	database := client.Database(dbName)

	productRepo := repository.NewProductRepo(database)
	orderRepo := repository.NewOrderRepo(database)
	userRepo := repository.NewUserRepo(database)
	categoryRepo := repository.NewCategoryRepo(database)
	brandRepo := repository.NewBrandRepo(database)
	cartRepo := repository.NewCartRepo(database)
	wishlistRepo := repository.NewWishlistRepo(database)

	productService := service.NewProductService(productRepo)
	orderService := service.NewOrderService(orderRepo, productService)
	authService := service.NewAuthService(userRepo)
	cartService := service.NewCartService(cartRepo, productRepo)
	wishlistService := service.NewWishlistService(wishlistRepo, productRepo)

	ch := handler.NewCategoryHandler(categoryRepo, productRepo)
	bh := handler.NewBrandHandler(brandRepo)

	ph := handler.NewProductHandler(productService)
	oh := handler.NewOrderHandler(orderService)
	ah := handler.NewAuthHandler(authService)
	cartH := handler.NewCartHandler(cartService)
	wishlistH := handler.NewWishlistHandler(wishlistService)
	profileH := handler.NewProfileHandler(userRepo, orderService)

	mux.HandleFunc("/ping", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("pong"))
	})

	mux.HandleFunc("/auth/register", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		ah.Register(w, r)
	})

	mux.HandleFunc("/auth/login", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		ah.Login(w, r)
	})

	mux.Handle("/products", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		ph.List(w, r)
	}))

	mux.Handle("/orders", AuthOnly(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		oh.Create(w, r)
	})))

	mux.Handle("/orders/history", AuthOnly(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		oh.History(w, r)
	})))

	mux.Handle("/orders/tracking", AuthOnly(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		oh.GetTracking(w, r)
	})))

	mux.Handle("/staff/products", StaffOnly(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		ph.Create(w, r)
	})))

	mux.Handle("/staff/products/update", StaffOnly(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPatch {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		ph.Update(w, r)
	})))

	mux.Handle("/staff/products/delete", StaffOnly(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodDelete {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		ph.Delete(w, r)
	})))

	mux.Handle("/staff/ping", StaffOnly(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("staff ok"))
	})))

	mux.HandleFunc("/categories", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		ch.List(w, r)
	})

	mux.HandleFunc("/brands", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		bh.List(w, r)
	})

	mux.Handle("/staff/categories",
		middleware.RequireAuth(
			middleware.RequireRole("staff",
				http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
					switch r.Method {
					case http.MethodPost:
						ch.Create(w, r)
					case http.MethodPatch:
						ch.Update(w, r)
					case http.MethodDelete:
						ch.Delete(w, r)
					default:
						http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
					}
				}),
			),
		),
	)

	mux.Handle("/staff/brands",
		middleware.RequireAuth(
			middleware.RequireRole("staff",
				http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
					switch r.Method {
					case http.MethodPost:
						bh.Create(w, r)
					case http.MethodPatch:
						bh.Update(w, r)
					case http.MethodDelete:
						bh.Delete(w, r)
					default:
						http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
					}
				}),
			),
		),
	)

	mux.HandleFunc("/products/barcode", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		ph.FindByBarcode(w, r)
	})

	mux.HandleFunc("/products/search", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		ph.ListWithFilter(w, r)
	})

	mux.Handle("/profile", AuthOnly(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		profileH.Get(w, r)
	})))

	mux.Handle("/cart", AuthOnly(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			cartH.Get(w, r)
		case http.MethodPost:
			cartH.Add(w, r)
		case http.MethodPatch:
			cartH.Update(w, r)
		case http.MethodDelete:
			cartH.Remove(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})))

	mux.Handle("/wishlist", AuthOnly(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			wishlistH.Get(w, r)
		case http.MethodPost:
			wishlistH.Add(w, r)
		case http.MethodDelete:
			wishlistH.Remove(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})))

	mux.Handle("/wishlist/check", AuthOnly(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		wishlistH.Check(w, r)
	})))

	log.Println("Router initialized")
	return middleware.CORS(mux), nil
}
