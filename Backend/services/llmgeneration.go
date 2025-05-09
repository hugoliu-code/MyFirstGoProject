package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

func GenerateSummary(commentChain []*Comment) string {
	const apiURL = "https://api.openai.com/v1/chat/completions"

	apiKey := os.Getenv("GPT_KEY")
	if apiKey == "" {
		fmt.Println("OPENAI_API_KEY is not set")
		panic("API KEY MISSING")
	}

	roleDescription := `
	You are a useful comment section moderation assistent. Given a chain of comments in a comment thread,
	tell a easily digestible story of the comment thread that led to the last comment. Then, describe whether
	the comment might violate any of the following guidelines: ["no hate speech", "no racism", "no excessive profanity"
	"no lewd statements"]. If none are violated, simply state that you believe there were no violations. 
	`

	var commentString string
	for _, c := range commentChain {
		commentString += c.String() + ",\n"
	}
	commentString = "Comment Chain: " + commentString

	// Create the request body
	requestBody := map[string]interface{}{
		"model": "gpt-3.5-turbo",
		"messages": []map[string]string{
			{"role": "assistant", "content": roleDescription},
			{"role": "user", "content": commentString},
		},
	}

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		panic(err)
	}

	// Build HTTP request
	req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(jsonData))
	if err != nil {
		panic(err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	// Send HTTP request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	// Read and print the response
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		panic(err)
	}
	fmt.Println(string(body))

	var convertedBody map[string]interface{}
	json.Unmarshal(body, &convertedBody)

	messagePath := [4]string{"choices", "0", "message", "content"}
	message := GetNestedValue(convertedBody, messagePath[:])

	return message
}
