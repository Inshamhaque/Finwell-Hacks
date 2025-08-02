"use client";
import React from "react";


export default function Lesson({ content }) {
  return (
    <div className="bg-gray-800 p-4 rounded-xl text-white space-y-2">
      <h2 className="text-lg font-semibold">📘 Your Lesson</h2>
      <p className="text-gray-300 whitespace-pre-wrap">{content}</p>
    </div>
  );
}
