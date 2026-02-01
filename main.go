package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/dannieey/Assignment3_Absolute/internal/db"
	"github.com/dannieey/Assignment3_Absolute/internal/handler"
	"github.com/dannieey/Assignment3_Absolute/internal/repository"
	"github.com/dannieey/Assignment3_Absolute/internal/service"
)

func main() {
	// Подключение к MongoDB
	mongoURI := "mongodb+srv://katekimeDB:Adiktop4ik@cluster0.ocrutum.mongodb.net/"
	client, err := db.ConnectDB(mongoURI)
	if err != nil {
		log.Fatalf("Error connecting to MongoDB: %v", err)
	}
	defer func() {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := client.Disconnect(ctx); err != nil {
			log.Println("Error disconnecting MongoDB:", err)
		}
	}()
	database := client.Database("supermarket")

	productRepo := repository.NewProductRepo(database)
	orderRepo := repository.NewOrderRepo(database)
	orderService := service.NewOrderService(orderRepo)

	log.Println("Application started successfully")

	ph := handler.NewProductHandler(productRepo)
	oh := handler.NewOrderHandler(orderService)
	mux := http.NewServeMux()
	mux.HandleFunc("/products", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			ph.List(w, r)
		} else if r.Method == http.MethodPost {
			ph.Create(w, r)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/orders", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			oh.Create(w, r)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/orders/history", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			oh.History(w, r)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	log.Println("Server running on http://localhost:8080")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatal(err)
	}
}
