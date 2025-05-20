"use client";

import React, { useState, useEffect } from "react";
import CommentTree, { CommentData } from "../components/CommentTree"; // Adjust path if needed
import {
  CLIENT_ID,
  REDIRECT_URI,
  RESPONSE_TYPE,
  DURATION,
  SCOPE_STRING,
} from "../../constants/constants";
import PopUp from "../components/PopUp";
import TopBar from "../components/TopBar";
import HomePage from "../components/HomePage";
export default function Main() {
  const [url, setUrl] = useState("");
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [commentsHead, setCommentsHead] = useState({
    author: "",
    text: "",
    children: [],
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResponse, setGenerationResponse] = useState("");

  useEffect(() => {
    // This function runs when the page/component is loaded
    console.log("Page loaded!");
    // Check if there are params that match an OAuth Response, if yes, handle it
    const params = new URLSearchParams(window.location.search);
    if (!params.has("state") || !params.has("code")) {
      return;
    }

    const returnedState = params.get("state");
    const storedState = localStorage.getItem("reddit_oauth_string");

    console.log(returnedState);
    console.log(storedState);

    if (returnedState != storedState) {
      return;
    }

    const returnedCode = params.get("code");

    authenticate(String(returnedCode));
    //fetchToken();
  }, []); // Empty dependency array = run only once on mount

  // async function fetchToken() {
  //   try {
  //     const res = await fetch("http://127.0.0.1:8080/authenticate");
  //     if (!res.ok) throw new Error("Token request failed");
  //     const data = await res.json();
  //     setToken(data.token);
  //     setUsername(data.username);
  //     console.log(data);
  //   } catch (err) {
  //     console.error("Error:", err);
  //   }
  // }

  async function authenticate(code: string) {
    try {
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code,
          clientID: CLIENT_ID,
          redirectURI: REDIRECT_URI,
        }),
      };
      const res = await fetch(
        "http://127.0.0.1:8080/authenticate",
        requestOptions
      );
      if (!res.ok) throw new Error("Fetch request failed");
      const data = await res.json();
      console.log(data);
      setToken(data.token);
      setUsername(data.username);
      console.log(data.token);
    } catch (err) {
      console.error("Error", err);
    }
  }

  async function handleFetchClick() {
    try {
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url, token: token }),
      };
      const res = await fetch("http://127.0.0.1:8080/fetch", requestOptions);
      if (!res.ok) throw new Error("Fetch request failed");
      const data = await res.json();
      setUrl("");
      console.log(data);
      // const allComments = JSON.parse(data);
      setCommentsHead(data.comments);
    } catch (err) {
      console.error("Error:", err);
    }
  }

  async function handleContextClick(comments: CommentData[]): Promise<void> {
    setGenerationResponse("");
    setIsGenerating(true);
    try {
      const response = await fetch("http://127.0.0.1:8080/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comments }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      setGenerationResponse(result.response);
      console.log("Server response:", result);
    } catch (error) {
      console.error("Error sending comments:", error);
    }
  }

  async function handleLogin() {
    const randomString = String(Math.random() * 10000);
    localStorage.setItem("reddit_oauth_string", randomString);
    const OAuthString = `https://www.reddit.com/api/v1/authorize?client_id=${CLIENT_ID}&response_type=${RESPONSE_TYPE}&state=${randomString}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&duration=${DURATION}&scope=${encodeURIComponent(SCOPE_STRING)}`;
    window.location.href = OAuthString;
  }

  function handleLogout() {
    setToken("");
    setUsername("");
    setCommentsHead({
      author: "",
      text: "",
      children: [],
    });
  }

  function handleClosePopUp() {
    setGenerationResponse("");
    setIsGenerating(false);
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  }

  return (
    <div>
      <TopBar
        url={url}
        username={username}
        setUrl={setUrl}
        handleFetchClick={handleFetchClick}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
      />
      <div className="flex flex-col items-center justify-start bg-slate-50 h-screen overflow-y-auto p-4 pt-20">
        {commentsHead.author != "" && (
          <div>
            <CommentTree data={commentsHead} onClick={handleContextClick} />
          </div>
        )}
        {commentsHead.author == "" && (
          <div>
            <HomePage />
          </div>
        )}
        <div>
          <PopUp
            showPopUp={isGenerating}
            text={generationResponse}
            closePopUp={handleClosePopUp}
          ></PopUp>
        </div>
      </div>
    </div>
  );
}
