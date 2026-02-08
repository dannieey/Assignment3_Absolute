package router

import (
	"errors"
	"log"
	"net/http"
	"os"

	"github.com/dannieey/Assignment3_Absolute/internal/db"
	"github.com/dannieey/Assignment3_Absolute/internal/handler"
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

	productService := service.NewProductService(productRepo)
	orderService := service.NewOrderService(orderRepo, productService)
	authService := service.NewAuthService(userRepo)

	ph := handler.NewProductHandler(productService)
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

	log.Println("Router initialized")
	return mux, nil
}
