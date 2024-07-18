'use client';
import { useRef, useState } from "react";
import "./Blend.css";
import Tile from "../Tile/Tile";


interface Props {
    image: string | undefined | null;
    imagebg: string | undefined | null;
    isVideo1: boolean;
    isVideo2: boolean;
  }

export default function Blend({image, imagebg, isVideo1, isVideo2}: Props) {
    const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
    const [grabPosition, setGrabPosition] = useState<[Number, Number]>([0, 0]);
    const chessboardRef = useRef<HTMLDivElement>(null);

    function grabPiece(e: React.MouseEvent) {
      const element = e.target as HTMLElement;
      const chessboard = chessboardRef.current;

      const height = element.clientHeight;
      const width = element.clientWidth;

      const GRID_SIZE = height;

      if (element.classList.contains("target") && chessboard) {
        const grabX = e.clientX - chessboard.offsetLeft 
        const grabY = Math.abs(e.clientY - chessboard.offsetTop)
        setGrabPosition([grabX, grabY]);

        const x = e.clientX - width / 2;
        const y = e.clientY - GRID_SIZE / 2;
        element.style.position = "absolute";
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        element.style.height = `${height}px`;
        element.style.width = `${width}px`;

        setActivePiece(element);
      }
    }

    function movePiece(e: React.MouseEvent) {
      const chessboard = chessboardRef.current;
      if (activePiece && chessboard) {
        const height = activePiece.clientHeight / 4;
        const width = activePiece.clientWidth / 4;
        const minX = chessboard.offsetLeft - width;
        const minY = chessboard.offsetTop - height;
        const maxX = chessboard.offsetLeft + chessboard.clientWidth - width*3;
        const maxY = chessboard.offsetTop + chessboard.clientHeight - height*3;
        const x = e.clientX - width*2;
        const y = e.clientY - height*2;
        activePiece.style.position = "absolute";

        //If x is smaller than minimum amount
        if (x < minX) {
          activePiece.style.left = `${minX}px`;
        }
        //If x is bigger than maximum amount
        else if (x > maxX) {
          activePiece.style.left = `${maxX}px`;
        }
        //If x is in the constraints
        else {
          activePiece.style.left = `${x}px`;
        }

        //If y is smaller than minimum amount
        if (y < minY) {
          activePiece.style.top = `${minY}px`;
        }
        //If y is bigger than maximum amount
        else if (y > maxY) {
          activePiece.style.top = `${maxY}px`;
        }
        //If y is in the constraints
        else {
          activePiece.style.top = `${y}px`;
        }
      }
    }

    function dropPiece(e: React.MouseEvent) {

      const element = e.target as HTMLElement;
      const chessboard = chessboardRef.current;    
      const height = element.clientHeight;

      const GRID_SIZE = height;
      if (activePiece && chessboard) {
        const x = e.clientX - chessboard.offsetLeft
        const y = e.clientY - chessboard.offsetTop - height

        setActivePiece(null);
      }
    }
    let board = [];
    let imgbg = imagebg? imagebg : undefined;
    console.log(imgbg)
    let img = image? image : undefined;
    board.push(<Tile id={1} image={imgbg} left={true} class_="bg" isVideo={isVideo1}/>);
    board.push(<Tile id={2} image={img} left={false} class_="target" isVideo={isVideo2}/>);
    console.log(grabPosition)
    return (
    <>
      <div
        onMouseMove={(e) => movePiece(e)}
        onMouseDown={(e) => grabPiece(e)}
        onMouseUp={(e) => dropPiece(e)}
        id="chessboard"
        ref={chessboardRef}
      >
        {board}
      </div>
    </>
  );
}