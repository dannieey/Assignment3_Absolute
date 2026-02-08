package main

import (
	"log"

	"github.com/dannieey/Assignment3_Absolute/internal/app"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()
	a, err := app.New()
	if err != nil {
		log.Fatal(err)
	}
	log.Fatal(a.Run())
}
