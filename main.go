package main

import (
	"log"

	"github.com/dannieey/Assignment3_Absolute/internal/app"
	"github.com/dannieey/Assignment3_Absolute/internal/config"
)

func main() {
	if _, err := config.Load(); err != nil {
		log.Fatal(err)
	}

	a, err := app.New()
	if err != nil {
		log.Fatal(err)
	}
	log.Fatal(a.Run())
}
