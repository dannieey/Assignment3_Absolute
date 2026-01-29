package main

import (
	"context"
	"log"
	"time"

	"github.com/dannieey/Assignment3_Absolute/internal/db"
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

	productRepo := repository.NewProductRepo()
	categoryRepo := repository.NewCategoryRepo()
	brandRepo := repository.NewBrandRepo()
	orderRepo := repository.NewOrderRepo()

	_ = productRepo
	_ = categoryRepo
	_ = brandRepo
	_ = orderRepo

	log.Println("Application started successfully")

}
