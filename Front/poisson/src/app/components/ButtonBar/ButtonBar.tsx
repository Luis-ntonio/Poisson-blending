// components/ButtonBar.js
import React from 'react';
import './ButtonBar.css';
import { useEffect, useRef, useState } from "react";


const ButtonBar = ({ onSelectBackground, onSelectImage, onRestart, onBlend }: { onSelectBackground: (event: React.ChangeEvent<HTMLInputElement>) => void, onSelectImage: (event: React.ChangeEvent<HTMLInputElement>) => void, onRestart: () => void, onBlend: () => void }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const fileInputbgRef = useRef<HTMLInputElement>(null);

    const handleSelectImageClick = () => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    };

    const handleSelectbgClick = () => {
        if (fileInputbgRef.current) {
            fileInputbgRef.current.click();
        }
      };
  
    return (
      <div style={styles.bar}>
        <button style={styles.button} onClick={handleSelectbgClick}>Select Background</button>
        <button style={styles.button} onClick={handleSelectImageClick}>Select Image</button>
        <button style={styles.button} onClick={onRestart}>Restart</button>
        <button style={styles.button} onClick={onBlend}>Blend</button>
        <input
          id='input'
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={onSelectImage}
        />
        <input
          type="file"
          accept="image/*"
          ref={fileInputbgRef}
          style={{ display: 'none' }}
          onChange={onSelectBackground}
        />
      </div>
    );
};

const styles = {
  bar: {
    display: 'flex',
    justifyContent: 'space-around',
    borderRadius: '10px',
    padding: '10px',
    backgroundColor: '#f0f0f0',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    color: 'black'
  },
};

export default ButtonBar;
