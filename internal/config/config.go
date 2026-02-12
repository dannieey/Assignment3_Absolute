package config

import (
	"errors"
	"fmt"
	"net"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	MongoURI          string
	DBName            string
	Port              int
	JWTSecret         string
	StaffRegisterCode string
}

func Load() (Config, error) {
	_ = godotenv.Load()

	cfg := Config{
		MongoURI:          strings.TrimSpace(os.Getenv("MONGO_URI")),
		DBName:            strings.TrimSpace(os.Getenv("DB_NAME")),
		JWTSecret:         strings.TrimSpace(os.Getenv("JWT_SECRET")),
		StaffRegisterCode: strings.TrimSpace(os.Getenv("STAFF_REGISTER_CODE")),
	}

	if cfg.DBName == "" {
		cfg.DBName = "supermarket"
	}
	if cfg.JWTSecret == "" {
		cfg.JWTSecret = "dev_secret_change_me"
	}
	if cfg.StaffRegisterCode == "" {
		cfg.StaffRegisterCode = "Staff2006"
	}

	portStr := strings.TrimSpace(os.Getenv("PORT"))
	if portStr == "" {
		cfg.Port = 8080
	} else {
		p, err := strconv.Atoi(portStr)
		if err != nil || p < 1 || p > 65535 {
			return Config{}, fmt.Errorf("invalid PORT: %q", portStr)
		}
		cfg.Port = p
	}

	if err := cfg.Validate(); err != nil {
		return Config{}, err
	}
	return cfg, nil
}

func (c Config) Validate() error {
	if c.MongoURI == "" {
		return errors.New("MONGO_URI environment variable not set")
	}
	if c.DBName == "" {
		return errors.New("DB_NAME is empty")
	}
	if c.Port < 1 || c.Port > 65535 {
		return fmt.Errorf("invalid port: %d", c.Port)
	}
	return nil
}

func (c Config) HTTPAddr() string {
	return net.JoinHostPort("", strconv.Itoa(c.Port))
}
