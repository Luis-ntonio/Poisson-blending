'use client';
import React from 'react';
import './Initial.css';
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from "react";

export default function Initial() {
  const router = useRouter();
  const [boardId, setBoardID] = useState<number>(0);

  useEffect(() => {
    // This will trigger on `boardId` change and navigate to the new path
    const routeChange = () => {
      let path = `/poisson`;
      router.push(path);
    };

    // Check if the default boardId '1' has changed before navigating
    if (boardId !== 0) {
      routeChange();
    }
  }, [boardId, router]);

  const setVars = () => {
    setBoardID(1); // Update the boardId state
  };
  
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-10 rounded-lg hello">
          <h1 className="mb-4 text-3xl font-bold" style={{ color: '#333333' }}>Welcome to the Poisson-blending app</h1>
          <button 
            onClick={setVars} 
            className="px-6 py-2 text-lg font-semibold text-white rounded shadow-lg" 
            style={{ backgroundColor: '#333333', borderColor: '#F0D9B5' }}>
            Initialize Experience
          </button>
        </div>
      </div>
    );
}