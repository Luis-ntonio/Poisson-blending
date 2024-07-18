'use client';
import './Poissonblending.css'
import { useEffect, useRef, useState } from "react";
import axios from 'axios';
import Blend from "../Blend/Blend";
import ButtonBar from '../ButtonBar/ButtonBar';

interface Props {
    image: string;
    
  }

export default function PoissonBlending() {
    const [selectedImage, setSelectedImage] = useState<string | undefined | null>(undefined);
    const [bgImage, setbgImage] = useState<string | undefined | null>(undefined);
    const [isVideo1, setIsVideo1] = useState<boolean>(false);
    const [isVideo2, setIsVideo2] = useState<boolean>(false);

    const handleSelectBackground = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      console.log(file?.type)
      if (file && file.type.includes('image')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setbgImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
      else if (file?.type.includes('video')) {
        const reader = new FileReader();
          reader.onloadend = () => {
            setbgImage(reader.result as string);
          };
        setIsVideo1(true);
        reader.readAsDataURL(file);
      } 
    }
    
      const handleSelectImage = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        console.log(event.target.files, "targetsssss")
        console.log(file?.type)
        if (file && file.type.includes('image')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setSelectedImage(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
        else if (file?.type.includes('video')) {
          const reader = new FileReader();
            reader.onloadend = () => {
              setSelectedImage(reader.result as string);
            };
          setIsVideo2(true);
          reader.readAsDataURL(file);
        }
      }
    
      const handleRestart = () => {
        window.location.reload();
      };
      
      const setVars = (data: any) => {
        const reader = new FileReader();
          reader.onloadend = () => {
            setbgImage(reader.result as string);
          };
          reader.readAsDataURL(data);
      }

      async function handleBlend() {
        console.group(bgImage)
        var trg = document.getElementById('1')?.getBoundingClientRect();
        var src = document.getElementById('2')?.getBoundingClientRect();
        let widthbgimg = document.getElementById('1')?.clientWidth;
        let heightbgimg = document.getElementById('1')?.clientHeight;
        let widthimg = document.getElementById('2')?.clientWidth;
        let heightimg = document.getElementById('2')?.clientHeight;

        let x = src && trg ? Math.abs(((src.left - trg.left) + (src.right - trg.right) + (widthbgimg ?? 0))/2) : 0;
        let y = src && trg ? Math.abs(((src.top - trg.top) + (src.bottom - trg.bottom) + (heightbgimg ?? 0))/2) : 0;
        
        const response = await fetch('http://localhost:5000/blend', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
          image: {url: selectedImage, width: widthimg, height: heightimg},
          bgImage: {url: bgImage, width: widthbgimg, height: heightbgimg},
          maskPosition: { x: x, y: y },
          }),
        })
        let data = await response.blob()
        setVars(data)
        var src_ = document.getElementById('2')
        if(src_){
          src_.style.position = 'relative';
          src_.style.height = '100%';
          src_.style.width = '100%';
          src_.style.removeProperty("top");
          src_.style.removeProperty("left");
        }
        console.group(bgImage)
      };

      

    return (
        <div className='content'>
            <ButtonBar
              onSelectBackground={handleSelectBackground}
              onSelectImage={handleSelectImage}
              onRestart={handleRestart}
              onBlend={handleBlend}
            />
            <div className="cont">
                <div className="Playzone">
                    <Blend imagebg={bgImage} image={selectedImage} isVideo1={isVideo1} isVideo2={isVideo2}/>
                </div>
            </div>
        </div>
    );
}
const styles = {
    imageContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: '20px',
    },
    image: {
      maxWidth: '100%',
      height: 'auto',
    },
  };
