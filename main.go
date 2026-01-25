package main

import (
	"log"

	"github.com/dannieey/Assignment3_Absolute/internal/app"
)

func main() {
	app := app.New()
	log.Fatal(app.Run())
}
