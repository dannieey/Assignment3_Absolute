package main

import (
	"log"

	"Assignment3_Absolute/internal/app"
)

func main() {
	app := app.New()
	log.Fatal(app.Run())
}
