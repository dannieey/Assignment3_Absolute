package app

import (
	"net/http"
	"os"

	"github.com/dannieey/Assignment3_Absolute/internal/router"
)

type App struct {
	server *http.Server
}

func New() *App {
	r := router.New()

	addr := ":8080"
	if p := os.Getenv("PORT"); p != "" {
		addr = ":" + p
	}

	return &App{
		server: &http.Server{
			Addr:    addr,
			Handler: r,
		},
	}
}

func (a *App) Run() error {
	return a.server.ListenAndServe()
}
