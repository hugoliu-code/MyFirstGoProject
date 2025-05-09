package main

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/hugoliu-code/MyFirstGoProject/Backend/handlers"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		panic("Error loading .env file")
	}

	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = []string{"http://localhost:3000", "https://your-frontend-url.com"} // Allowed origins (replace with your front-end URL)
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "DELETE"}                           // Allowed methods
	corsConfig.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}                // Allowed headers

	router := gin.Default()
	router.Use(cors.New(corsConfig))
	router.GET("/authenticate", handlers.FetchAccessToken)
	router.POST("/fetch", handlers.FetchCommentTree)
	router.POST("/generate", handlers.FetchContextGeneration)
	router.Run("localhost:8080")
}

// func main() {
// 	accessToken := services.GetRedditAccessToken()
// 	redditApiResult := []map[string]interface{}{}
// 	services.GetCommentThread("AmItheAsshole", "1kboshu", accessToken, &redditApiResult)
// 	commentHead := services.CleanCommentThread(redditApiResult)
// 	services.PrintTree(commentHead, "-")
// }
