package handlers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/hugoliu-code/MyFirstGoProject/backend/services"
)

type FetchCommentsRequest struct {
	Token string
	Url   string
}

type FetchGenerationRequest struct {
	Comments []*services.Comment
}

func FetchCommentTree(c *gin.Context) {
	// Take in a url, and accessToken, and get all comments organized in json string

	var fetchRequest FetchCommentsRequest
	c.BindJSON(&fetchRequest)

	url := fetchRequest.Url
	accessToken := fetchRequest.Token

	//Extract Subreddit and PostID from the url
	subreddit, postId := services.GetInfoFromUrl(url)

	//Call Reddit API
	redditApiResult := []map[string]interface{}{}
	services.GetCommentThread(subreddit, postId, accessToken, &redditApiResult)

	//Process Result into Tree
	commentHead := services.CleanCommentThread(redditApiResult)

	c.IndentedJSON(http.StatusOK, gin.H{
		"token":     accessToken,
		"url":       url,
		"subreddit": subreddit,
		"postId":    postId,
		"text":      commentHead.Text,
		"comments":  commentHead,
	})
}

func FetchAccessToken(c *gin.Context) {
	// Simply Return an access token
	c.IndentedJSON(http.StatusOK, gin.H{
		"token": services.GetRedditAccessToken(),
	})
}

func FetchContextGeneration(c *gin.Context) {
	var fetchRequest FetchGenerationRequest
	c.BindJSON(&fetchRequest)
	fmt.Println(fetchRequest)
	c.IndentedJSON(http.StatusOK, gin.H{
		"response": services.GenerateSummary(fetchRequest.Comments),
	})
}
