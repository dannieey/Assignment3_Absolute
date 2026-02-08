package router

import (
	"net/http"

	"github.com/dannieey/Assignment3_Absolute/internal/middleware"
)

func AuthOnly(h http.Handler) http.Handler {
	return middleware.RequireAuth(h)
}

func StaffOnly(h http.Handler) http.Handler {
	return middleware.RequireAuth(
		middleware.RequireRole("staff", h),
	)
}
