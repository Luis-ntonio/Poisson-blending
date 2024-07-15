'use client';
import "./Tile.css";
import { useEffect, useRef, useState } from "react";
interface Props {
  image?: string;
  left?: boolean;
  id: number;
}

export default function Tile({image, left, id}: Props) {
    console.log(left);
    
    const [divWidth, setDivWidth] = useState({ width: 300 });
    const [divheight, setDivheight] = useState({ height: 300 });
    let lf = left? "left" : "right";
    const className: string = [`tile black-tile ${lf}`].filter(Boolean).join(' ');
    const increaseWidth = () => {
      setDivWidth(prevSize => ({
        width: prevSize.width + 50
      }));
    };
  
    const decreaseheight = () => {
      setDivheight(prevSize => ({
        height: prevSize.height - 50
      }));
    };
    const decreaseWidth = () => {
      setDivWidth(prevSize => ({
        width: prevSize.width - 50
      }));
    };
    const Increaseheight = () => {
      setDivheight(prevSize => ({
        height: prevSize.height + 50
      }));
    };

  return (
    <div className="a">
      <div className={className} style={{...styles.imageContainer, ...divWidth, ...divheight}}>
        {image && <div id={id.toString()} style={{ backgroundImage: `url(${image})`, backgroundSize: '100% 100%' }} className="chess-piece"></div>}
      </div>
      <div style={styles.buttonContainer}>
        <button className="btn" style={styles.controlButton} onClick={increaseWidth}>Increase Width</button>
        <button className="btn" style={styles.controlButton} onClick={decreaseheight}>Decrease height</button>
        <button className="btn" style={styles.controlButton} onClick={Increaseheight}>Increase height</button>
        <button className="btn" style={styles.controlButton} onClick={decreaseWidth}>Decrease Width</button>
      </div>
    </div>
  );
}

const styles = {
  imageContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'width 0.3s, height 0.3s',
  },
  image: {
    maxWidth: '100%',
    maxheight: '100%',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px',
  },
  controlButton: {
    padding: '10px 20px',
    margin: '0 10px',
    fontSize: '16px',
    cursor: 'pointer',
  },
};
