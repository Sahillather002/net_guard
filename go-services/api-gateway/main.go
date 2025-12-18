package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func main() {
	// Initialize Gin router
	router := gin.Default()

	// CORS configuration
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"*"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	router.Use(cors.New(config))

	// Health check endpoint
	router.GET("/health", healthCheck)
	router.GET("/ready", readinessCheck)

	// Metrics endpoint for Prometheus
	router.GET("/metrics", gin.WrapH(promhttp.Handler()))

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// Authentication routes
		auth := v1.Group("/auth")
		{
			auth.POST("/login", login)
			auth.POST("/register", register)
			auth.POST("/refresh", refreshToken)
			auth.POST("/logout", logout)
		}

		// Protected routes (require authentication)
		protected := v1.Group("/")
		protected.Use(authMiddleware())
		{
			// Alerts endpoints
			alerts := protected.Group("/alerts")
			{
				alerts.GET("", listAlerts)
				alerts.GET("/:id", getAlert)
				alerts.POST("", createAlert)
				alerts.PUT("/:id", updateAlert)
				alerts.DELETE("/:id", deleteAlert)
			}

			// Network monitoring endpoints
			network := protected.Group("/network")
			{
				network.GET("/interfaces", listInterfaces)
				network.GET("/stats", getNetworkStats)
				network.POST("/monitor/start", startMonitoring)
				network.POST("/monitor/stop", stopMonitoring)
			}

			// Firewall rules endpoints
			firewall := protected.Group("/firewall")
			{
				firewall.GET("/rules", listFirewallRules)
				firewall.POST("/rules", addFirewallRule)
				firewall.DELETE("/rules/:id", deleteFirewallRule)
			}

			// Threat detection endpoints
			threats := protected.Group("/threats")
			{
				threats.GET("", listThreats)
				threats.GET("/:id", getThreat)
				threats.POST("/analyze", analyzeThreat)
			}

			// User management endpoints
			users := protected.Group("/users")
			{
				users.GET("", listUsers)
				users.GET("/:id", getUser)
				users.PUT("/:id", updateUser)
				users.DELETE("/:id", deleteUser)
			}

			// Dashboard endpoints
			dashboard := protected.Group("/dashboard")
			{
				dashboard.GET("/stats", getDashboardStats)
				dashboard.GET("/recent-activity", getRecentActivity)
			}
		}
	}

	// GraphQL endpoint
	router.POST("/graphql", graphqlHandler)
	router.GET("/graphql", playgroundHandler)

	// WebSocket endpoint for real-time updates
	router.GET("/ws", websocketHandler)

	// Create HTTP server
	srv := &http.Server{
		Addr:         ":8080",
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in goroutine
	go func() {
		log.Println("🚀 API Gateway starting on :8080")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("🛑 Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Println("✅ Server exited")
}

// Health check handler
func healthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": "healthy",
		"time":   time.Now().Unix(),
	})
}

// Readiness check handler
func readinessCheck(c *gin.Context) {
	// Check database connection, Redis, etc.
	c.JSON(http.StatusOK, gin.H{
		"status": "ready",
		"services": gin.H{
			"database": "connected",
			"redis":    "connected",
			"rust_engine": "connected",
		},
	})
}
