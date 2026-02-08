package app

import (
	"net/http"
	"os"

	"github.com/dannieey/Assignment3_Absolute/internal/router"
)

type App struct {
	server *http.Server
}

func New() (*App, error) {
	r, err := router.New()
	if err != nil {
		return nil, err
	}

	addr := ":8080"
	if p := os.Getenv("PORT"); p != "" {
		addr = ":" + p
	}

	return &App{
		server: &http.Server{
			Addr:    addr,
			Handler: r,
		},
	}, nil
}

func (a *App) Run() error {
	return a.server.ListenAndServe()
}
