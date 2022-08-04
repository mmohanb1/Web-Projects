import React, { useEffect, useContext } from "react";
//import { useEffect, useContext, useRef, useState } from 'react';
//import { useCanvas }  from "./canvas-context";
import { CanvasContext } from "./canvas-context";
//import { useContext } from React;

//export default CanvasProvider;

export const Canvas = () =>
{
  const {
    canvasRef,
    prepareCanvas,
    startDrawing,
    finishDrawing,
    draw,
    } = useContext(CanvasContext);
    console.log(`CanvasContext ==> ${CanvasContext}`);
  //  const { value }  = useContext(CanvasContext);
    console.log(`canvasRef ====> ${canvasRef}`);
  useEffect(() => {
    prepareCanvas();
  }, []);

  return (
    <canvas
      onMouseDown={startDrawing}
      onMouseUp={finishDrawing}
      onMouseMove={draw}
      ref={canvasRef}
    />
  );
}

//export default Canvas;
