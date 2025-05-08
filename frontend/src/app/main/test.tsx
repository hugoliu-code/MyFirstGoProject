"use client";

import React, { useState } from "react";

export default function TestComponent() {
  // JS-based hover tracking
  const [isHovered, setIsHovered] = useState(false);

  // For debugging
  console.log("Render TestComponent, isHovered:", isHovered);

  return (
    <div className="p-10 bg-gray-100 flex flex-col gap-4">
      <h1 className="text-xl font-bold">Hover Test</h1>

      {/* Test 1: Pure inline CSS */}
      <button
        style={{
          padding: "8px 16px",
          backgroundColor: "blue",
          color: "white",
          borderRadius: "4px",
          transition: "background-color 0.2s",
        }}
        onMouseEnter={(e) => {
          console.log("Mouse entered button 1");
          e.currentTarget.style.backgroundColor = "darkblue";
        }}
        onMouseLeave={(e) => {
          console.log("Mouse left button 1");
          e.currentTarget.style.backgroundColor = "blue";
        }}
      >
        Test 1: Inline CSS with JS events
      </button>

      {/* Test 2: React state-based hover */}
      <button
        className={`p-2 rounded-md ${
          isHovered ? "bg-red-600" : "bg-red-500"
        } text-white`}
        onMouseEnter={() => {
          console.log("Mouse entered button 2");
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          console.log("Mouse left button 2");
          setIsHovered(false);
        }}
      >
        Test 2: React state hover
      </button>

      {/* Test 3: Pure CSS in a style tag */}
      <div>
        <style jsx>{`
          .custom-hover-button {
            padding: 8px 16px;
            background-color: green;
            color: white;
            border-radius: 4px;
            transition: background-color 0.2s;
          }
          .custom-hover-button:hover {
            background-color: darkgreen;
          }
        `}</style>
        <button className="custom-hover-button">
          Test 3: Scoped CSS with :hover
        </button>
      </div>

      {/* Test 4: Tailwind hover */}
      <button className="p-2 bg-blue-500 hover:bg-blue-700 text-white rounded-md">
        Test 4: Tailwind hover
      </button>
    </div>
  );
}
