package router

import (
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
		mongoURI = "mongodb://localhost:27017"
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

	_ = categoryRepo
	_ = brandRepo

	orderService := service.NewOrderService(orderRepo)
	productService := service.NewProductService(productRepo)
	authService := service.NewAuthService(userRepo)

	oh := handler.NewOrderHandler(orderService)
	ah := handler.NewAuthHandler(authService)

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

	mux.HandleFunc("/products", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			ph.List(w, r)
		case http.MethodPost:
			ph.Create(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/orders", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		oh.Create(w, r)
	})

	mux.HandleFunc("/orders/history", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		oh.History(w, r)
	})

	mux.Handle("/staff/ping",
		middleware.RequireAuth(
			middleware.RequireRole("staff",
				http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
					w.WriteHeader(http.StatusOK)
					_, _ = w.Write([]byte("staff ok"))
				}),
			),
		),
	)

	log.Println("Router initialized")
	return mux, nil
}
