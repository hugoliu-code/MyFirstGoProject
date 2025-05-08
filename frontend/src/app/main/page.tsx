"use client";

import React, { useState, useEffect } from "react";
import Tree from "../components/CommentTree"; // Adjust path if needed

function LogMessage(text: string) {
  console.log(text);
}

export default function Main() {
  const [url, setUrl] = useState("");
  const [token, setToken] = useState("");

  function LogMessage(text: string) {
    console.log(text);
  }

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
        method: "GET",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url, token: token }),
      };
      const res = await fetch("http://127.0.0.1:8080/fetch", requestOptions);
      if (!res.ok) throw new Error("Fetch request failed");
      const data = await res.json();
      console.log(data);
    } catch (err) {
      console.error("Error:", err);
    }
  }

  return (
    <div className="flex-col flex h-screen items-center justify-center bg-blac">
      <div className="flex flex-col sm:flex-row gap-2">
        <text className="">Reddit Moderation Simulator</text>
        <input
          type="text"
          placeholder="Type something..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="px-10 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
        />
        <button
          onClick={() => LogMessage(url)}
          className="px-4 py-2 bg-blue-500 text-white font-medium rounded-md shadow-sm 
                   hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300
                   transition-colors duration-200"
        >
          Moderate!
        </button>
      </div>
      <div>
        <Tree />
      </div>
    </div>
  );
}
