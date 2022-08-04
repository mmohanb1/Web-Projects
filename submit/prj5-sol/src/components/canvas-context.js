import React, { useContext, useRef, useState } from "react";

  export const CanvasContext = React.createContext(null);
  const DRAW = { width: 20, height: 20 };
  const ZOOM = 10;
  const FG_COLOR = 'blue';
console.log(CanvasContext);
console.log(FG_COLOR);
export const CanvasProvider = ({ children }) =>  {
  const [isDrawing, setIsDrawing] = useState(false)
  const canvasRef = React.useRef();
    const contextRef = React.useRef();
    const checking = 10;
    console.log('CanvasProvider');
    
  const prepareCanvas = () => {
      console.log('preparing canvas');
      const canvas = canvasRef.current;
      canvas.width = DRAW.width;
      canvas.height = DRAW.height;
      canvas.style.width = `${ZOOM * DRAW.width}.px`;
      canvas.style.height = `${ZOOM * DRAW.height}px`;
      const context = canvas.getContext("2d");
      

    context.lineCap = "round";
    context.strokeStyle = FG_COLOR;
    context.lineWidth = 1;
    contextRef.current = context;
  };

  const startDrawing = ({ nativeEvent }) => {
      //      const { offsetX, offsetY } = eventCanvasCoord(canvasRef.current, nativeEvent);
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };
/*  const eventCanvasCoord = (canvas, ev) => {
  const x = (ev.pageX - canvas.offsetLeft)/ZOOM;
  const y = (ev.pageY - canvas.offsetTop)/ZOOM;
  return { x, y };
  };*/
  const finishDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) {
      return;
    }
      //    const { offsetX, offsetY } = eventCanvasCoord(canvasRef.current, nativeEvent);
          const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d")
    context.fillStyle = "white"
    context.fillRect(0, 0, canvas.width, canvas.height)
  };

  return (
      <CanvasContext.Provider
	value={{
        canvasRef,
        contextRef,
        prepareCanvas,
        startDrawing,
        finishDrawing,
        clearCanvas,
        draw,
        checking,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};


//export const useCanvas = () => useContext(CanvasContext);


