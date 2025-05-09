"use client";

import React, { useState, useEffect } from "react";
import CommentTree, { CommentData } from "../components/CommentTree"; // Adjust path if needed

export default function Main() {
  const [url, setUrl] = useState("");
  const [token, setToken] = useState("");
  const [commentsHead, setCommentsHead] = useState({
    author: "",
    text: "",
    children: [],
  });

  useEffect(() => {
    // This function runs when the page/component is loaded
    console.log("Page loaded!");
    fetchToken();
  }, []); // Empty dependency array = run only once on mount

  async function fetchToken() {
    try {
      const res = await fetch("http://127.0.0.1:8080/authenticate");
      if (!res.ok) throw new Error("Token request failed");
      const data = await res.json();
      setToken(data.token);
      console.log(data);
    } catch (err) {
      console.error("Error:", err);
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
    console.log(comments.map((n) => n.text));
    // Send json data to backend
    // Set a State for the output
    // Create a window that overlays over the comments to display
  }

  return (
    <div className="flex flex-col items-center justify-start bg-black h-screen overflow-y-auto p-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <text className="">Reddit Moderation Simulator</text>
        <input
          type="text"
          placeholder="Enter Reddit URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="px-10 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
        />
        <button
          onClick={() => handleFetchClick()}
          className="px-4 py-2 bg-blue-500 text-white font-medium rounded-md shadow-sm 
                   hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300
                   transition-colors duration-200"
        >
          Moderate!
        </button>
      </div>
      <div>
        <CommentTree data={commentsHead} onClick={handleContextClick} />
      </div>
    </div>
  );
}
