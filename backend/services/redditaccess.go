package services

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
)

type Comment struct {
	Author   string     `json:"author"`
	Text     string     `json:"text"`
	Upvotes  string     `json:"upvotes"`
	Children []*Comment `json:"children,omitempty"`
}

func (c Comment) String() string {
	return fmt.Sprintf("[Author: %s, Upvotes: %s, Comment %s]", c.Author, c.Upvotes, c.Text)
}
func PrintTree(node *Comment, indent string) {
	if node == nil {
		return
	}

	fmt.Println(indent + "- " + node.Author + "(" + node.Upvotes + ")")

	for _, child := range node.Children {
		PrintTree(child, indent+"-") // Increase indentation for child
	}
}

func GetInfoFromUrl(url string) (string, string) {
	getNthInstance := func(text string, find string, n int) int {
		index := -1
		offset := 0
		for i := n; i > 0; i-- {
			index = strings.Index(text, find)
			if index == -1 {
				return -1
			}
			text = text[(index + len(find)):]
			offset += (index + len(find))
		}
		return offset - 1
	}
	// parse a reddit url for the subreddit and postID
	// find "reddit.com" and find the 2nd and 3rd "/", the subreddit is between
	// the postID is between the 4th and 5th
	url = url[strings.Index(url, "reddit.com"):]
	subredditStartIndex := 13 // to account for removing "reddit.com/r/"
	subredditEndIndex := getNthInstance(url, "/", 3)
	subreddit := url[subredditStartIndex:subredditEndIndex]

	postIdStartIndex := getNthInstance(url, "/", 4)
	postIdEndIndex := getNthInstance(url, "/", 5)
	postId := url[postIdStartIndex+1 : postIdEndIndex]
	return subreddit, postId
}

func GetUsername(accessToken string) string {
	fmt.Println("ATTEMPTING TO GET USERNAME")
	url := "https://oauth.reddit.com/api/v1/me"

	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Add("Authorization", "bearer "+accessToken)
	req.Header.Add("User-Agent", "ContextGeneratorAppDemo/0.1 by Specialist-Net-8473")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Fatal("Request failed:", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	stringBody := string(body)

	var result map[string]interface{}
	json.Unmarshal([]byte(body), &result)

	fmt.Println(stringBody)
	username, ok := result["name"].(string)
	if !ok {
		panic("Something went wrong in getting username")
	}
	return username
}

func GetCommentThread(subreddit, postID, accessToken string, result *[]map[string]interface{}) {
	// Take in a postID within a subreddit and use api to get comments
	url := fmt.Sprintf("https://oauth.reddit.com/r/%s/comments/%s?depth=20&limit=200&sort=top", subreddit, postID)

	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Add("Authorization", "bearer "+accessToken)
	req.Header.Add("User-Agent", "ContextGeneratorAppDemo/0.1 by Specialist-Net-8473")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Fatal("Request failed:", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	stringBody := string(body)

	json.Unmarshal([]byte(stringBody), result)
}

func GetNestedValue(nestedMap interface{}, chain []string) string {
	//get the nested string value in a nested map of interfaces
	current := chain[0]
	chain = chain[1:]

	switch v := nestedMap.(type) {

	case map[string]interface{}:
		if len(chain) == 0 {
			switch finalValue := v[current].(type) {
			case int:
				return strconv.Itoa(finalValue)
			case float64:
				return strconv.FormatFloat(finalValue, 'f', -1, 64)
			case string:
				return finalValue
			default:
				panic("Something strange happened in getNestedValue")
			}
		}
		return GetNestedValue(v[current], chain)

	case []interface{}:
		index, err := strconv.Atoi(current)
		if err != nil {
			panic("expected integer string to convert")
		}
		return GetNestedValue(v[index], chain)
	default:
		return "FOUND NOTHING"
	}
}

func MakeComment(nestedMap interface{}) *Comment {
	authorPath := [2]string{"data", "author"}
	author := GetNestedValue(nestedMap, authorPath[:])
	textPath := [2]string{"data", "body"}
	text := GetNestedValue(nestedMap, textPath[:])
	upvotePath := [2]string{"data", "score"}
	upvotes := GetNestedValue(nestedMap, upvotePath[:])

	return &Comment{Author: author, Text: text, Upvotes: upvotes, Children: []*Comment{}}
}

func GetNestedTree(nestedMap interface{}, parent *Comment) {
	//at the current parent, nagivate to the children attribute
	//create a new node for each one, and recursively call function

	// go to data, then go to children
	checkedMap, ok := nestedMap.(map[string]interface{})
	if !ok {
		panic("Something went wrong in getting nested tree")
	}
	data, ok := checkedMap["data"].(map[string]interface{})
	if !ok {
		panic("Something went wrong in getting nested map \"data\"")
	}
	children, ok := data["children"].([]interface{})
	if !ok {
		panic("Something went wrong in getting nested array \"children\"")
	}
	for i := 0; i < len(children); i++ {
		// go through all children
		// if the type is of "more", it isn't a real child, and we skip

		childMap, ok := children[i].(map[string]interface{})
		if !ok {
			panic("Something went wrong in getting children map")
		}

		kind, ok := childMap["kind"].(string)
		if !ok {
			panic("Something went wrong in getting kind")
		}
		if kind == "more" {
			continue
		}
		child := MakeComment(children[i])
		parent.Children = append(parent.Children, child)

		// get to replies and recurse
		childData, ok := childMap["data"].(map[string]interface{})
		if !ok {
			panic("Something went wrong in getting children data")
		}
		childReplies, ok := childData["replies"].(map[string]interface{})
		if !ok {
			// There are no replies
			continue
		}
		GetNestedTree(childReplies, child)

	}
}

func CleanCommentThread(commentThread []map[string]interface{}) *Comment {
	// Take in the "json" result of api call, and construct a new, cleaned result

	// get general post information
	authorPath := [5]string{"data", "children", "0", "data", "author"}
	textPath := [5]string{"data", "children", "0", "data", "selftext"}
	upvotesPath := [5]string{"data", "children", "0", "data", "score"}

	head := Comment{Author: GetNestedValue(commentThread[0], authorPath[:]), Text: GetNestedValue(commentThread[0], textPath[:]), Upvotes: GetNestedValue(commentThread[0], upvotesPath[:]), Children: []*Comment{}}
	GetNestedTree(commentThread[1], &head)
	return &head
}

func GetRedditAccessTokenOAuth(code string, redirectUri string, clientID string) string {
	clientSecret := os.Getenv("REDDIT_SECRET")
	data := url.Values{}
	data.Set("grant_type", "authorization_code")
	data.Set("code", code)
	data.Set("redirect_uri", redirectUri)

	req, err := http.NewRequest("POST", "https://www.reddit.com/api/v1/access_token", strings.NewReader(data.Encode()))
	if err != nil {
		panic(err)
	}

	req.SetBasicAuth(clientID, clientSecret)
	req.Header.Add("User-Agent", "ContextGeneratorApp/0.1 by "+"Specialist-Net-8473")
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != 200 {
		fmt.Println("Failed to get token:", resp.Status)
		fmt.Println(string(body))
		panic("FAILED TO GET TOKEN")
	}

	var result map[string]interface{}
	json.Unmarshal(body, &result)
	// fmt.Println("Response JSON:", result)
	return result["access_token"].(string)
}

func GetRedditAccessToken() string {
	//... scraping logic
	clientID := "NQkJ5LH6SrXecVMOJwx4PQ"
	clientSecret := os.Getenv("REDDIT_SECRET")
	username := os.Getenv("REDDIT_USERNAME")
	password := os.Getenv("REDDIT_PASSWORD")

	data := url.Values{}
	data.Set("grant_type", "password")
	data.Set("username", username)
	data.Set("password", password)

	req, err := http.NewRequest("POST", "https://www.reddit.com/api/v1/access_token", strings.NewReader(data.Encode()))
	if err != nil {
		panic(err)
	}

	req.SetBasicAuth(clientID, clientSecret)
	req.Header.Add("User-Agent", "ContextGeneratorAppDemo/0.1 by "+username)
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != 200 {
		fmt.Println("Failed to get token:", resp.Status)
		fmt.Println(string(body))
		panic("FAILED TO GET TOKEN")
	}

	var result map[string]interface{}
	json.Unmarshal(body, &result)
	// fmt.Println("Response JSON:", result)
	return result["access_token"].(string)
}
