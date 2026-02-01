package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/dannieey/Assignment3_Absolute/internal/db"
	"github.com/dannieey/Assignment3_Absolute/internal/handler"
	"github.com/dannieey/Assignment3_Absolute/internal/repository"
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

	log.Println("Application started successfully")

	ph := handler.NewProductHandler(productRepo)
	oh := handler.NewOrderHandler(orderRepo)
	mux := http.NewServeMux()
	mux.HandleFunc("GET /products", ph.List)
	mux.HandleFunc("POST /products", ph.Create)

	mux.HandleFunc("POST /orders", oh.Create)
	mux.HandleFunc("GET /orders/history", oh.History)

	log.Println("Server running on http://localhost:8080")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatal(err)
	}
}
