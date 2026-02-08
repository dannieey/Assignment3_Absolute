package main

import (
	"log"

	"github.com/dannieey/Assignment3_Absolute/internal/app"
)

func main() {
	a, err := app.New()
	if err != nil {
		log.Fatal(err)
	}
	log.Fatal(a.Run())
}
