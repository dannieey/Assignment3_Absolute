package service

import (
	"context"
	"errors"
	"os"
	"time"

	"github.com/dannieey/Assignment3_Absolute/internal/models"
	"github.com/dannieey/Assignment3_Absolute/internal/repository"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrEmailAlreadyUsed   = errors.New("email already used")
)

type AuthService struct {
	users repository.UserRepo
}

func NewAuthService(users repository.UserRepo) *AuthService {
	return &AuthService{users: users}
}

func (s *AuthService) Register(ctx context.Context, fullName, email, password, role string) (primitive.ObjectID, error) {
	if role == "" {
		role = "customer"
	}

	_, err := s.users.FindByEmail(ctx, email)
	if err == nil {
		return primitive.NilObjectID, ErrEmailAlreadyUsed
	}
	if err != nil && !errors.Is(err, mongo.ErrNoDocuments) {
		return primitive.NilObjectID, err
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return primitive.NilObjectID, err
	}

	u := &models.User{
		FullName:     fullName,
		Email:        email,
		PasswordHash: string(hash),
		Role:         role,
		CreatedAt:    time.Now(),
	}

	return s.users.Create(ctx, u)
}

func (s *AuthService) Login(ctx context.Context, email, password string) (string, primitive.ObjectID, string, error) {
	u, err := s.users.FindByEmail(ctx, email)
	if err != nil {
		return "", primitive.NilObjectID, "", ErrInvalidCredentials
	}

	if err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(password)); err != nil {
		return "", primitive.NilObjectID, "", ErrInvalidCredentials
	}

	token, err := s.signJWT(u.ID, u.Role)
	if err != nil {
		return "", primitive.NilObjectID, "", err
	}

	return token, u.ID, u.Role, nil
}

func (s *AuthService) signJWT(userID primitive.ObjectID, role string) (string, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "dev_secret_change_me"
	}

	claims := jwt.MapClaims{
		"sub":  userID.Hex(),
		"role": role,
		"iat":  time.Now().Unix(),
		"exp":  time.Now().Add(7 * 24 * time.Hour).Unix(),
	}

	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return t.SignedString([]byte(secret))
}
