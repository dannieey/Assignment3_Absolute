package middleware

import (
	"context"
	"net/http"
	"os"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ctxKey string

const (
	CtxUserID ctxKey = "userId"
	CtxRole   ctxKey = "role"
)

func RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		auth := r.Header.Get("Authorization")
		if !strings.HasPrefix(auth, "Bearer ") {
			http.Error(w, "Missing token", http.StatusUnauthorized)
			return
		}

		tokenStr := strings.TrimPrefix(auth, "Bearer ")
		secret := os.Getenv("JWT_SECRET")
		if secret == "" {
			secret = "dev_secret_change_me"
		}

		tok, err := jwt.Parse(tokenStr, func(token *jwt.Token) (any, error) {
			return []byte(secret), nil
		})
		if err != nil || !tok.Valid {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		claims, ok := tok.Claims.(jwt.MapClaims)
		if !ok {
			http.Error(w, "Invalid token claims", http.StatusUnauthorized)
			return
		}

		sub, _ := claims["sub"].(string)
		role, _ := claims["role"].(string)
		if sub == "" {
			http.Error(w, "Invalid token subject", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), CtxUserID, sub)
		ctx = context.WithValue(ctx, CtxRole, role)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
func RequireRole(requiredRole string, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		role, _ := r.Context().Value(CtxRole).(string)
		if role != requiredRole {
			http.Error(w, "Forbidden", http.StatusForbidden)
			return
		}
		next.ServeHTTP(w, r)
	})
}
func UserIDFromContext(ctx context.Context) primitive.ObjectID {
	userIDHex, ok := ctx.Value(CtxUserID).(string)
	if !ok || userIDHex == "" {
		return primitive.NilObjectID
	}

	id, err := primitive.ObjectIDFromHex(userIDHex)
	if err != nil {
		return primitive.NilObjectID
	}
	return id
}
