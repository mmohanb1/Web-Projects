import  React,{ useRef, useEffect, useState } from 'react'
//import { Canvas } from './canvas'
//const { useState } = React;

import canvasToMnistB64 from './canvas-to-mnist-b64.mjs';
import makeKnnWsClient from './knn-ws-client.mjs';
  const DRAW = { width: 20, height: 20 };
  const ZOOM = 10;
  const FG_COLOR = 'blue';

const DEFAULT_WS_URL = 'https://zdu.binghamton.edu:2345';

export default function App() {
    //TODO

    const [isDrawing, setIsDrawing] = useState(false);
    const [label, setLabel] = useState('');
    const [wsUrl, setWsUrl] = useState(DEFAULT_WS_URL);
    const [knnWsObj, setKnnObj] = useState(makeKnnWsClient(DEFAULT_WS_URL));
  const canvasRef = React.useRef();
    const contextRef = React.useRef();
    const checking = 10;
  //  console.log('CanvasProvider');
  //  const knnWsObj = makeKnnWsClient(DEFAULT_WS_URL);
//    let label = '';
    useEffect(() => {
      console.log('preparing canvas');
	const canvas = canvasRef.current;
	console.log(`canvas = ${canvas}`)
	canvas.width = DRAW.width;
	console.log(`canvas.width = ${canvas.width}`)
      canvas.height = DRAW.height;
      canvas.style.width = `${ZOOM * DRAW.width}.px`;
	canvas.style.height = `${ZOOM * DRAW.height}px`;
	      canvas.style.border = `2px solid black`;
      const context = canvas.getContext("2d");
      

    context.lineCap = "round";
    context.strokeStyle = FG_COLOR;
    context.lineWidth = 1;
    contextRef.current = context;
    },[]);

    const resetWsUrl = (url) => {
	console.log(`updated url => ${url}`);
	setWsUrl(url);
	setKnnObj(makeKnnWsClient(url));
    }
  const recognize = async () => {
  try
  {
    console.log('TODO recognize()');

    const b64Img = canvasToMnistB64(contextRef.current);
    const result = await knnWsObj.classify(b64Img);
      console.log(`b64Img => ${b64Img}`)
    console.log(`----result.hasErrors = ${result.hasErrors}`);
    console.log(`result.label = ${result.label}`);

    if(!result || result.hasErrors || !result.label)
	//	this.shadowRoot.querySelector('#knn-label').innerHTML = '<div style="color:red">fetch failed</div>';
	setLabel('fetch failed');
    else
	//	this.shadowRoot.querySelector('#knn-label').innerHTML = result.label;
	setLabel(result.label);

      console.log(`label = ${label}`);
    }
    catch(e)
    {
	console.error(e.message);
    }
  }
    
    const startDrawing = ({ nativeEvent }) => {
	console.log(`canvasRef.current = ${canvasRef.current}`);
            const { x, y } = eventCanvasCoord(canvasRef.current, nativeEvent);
      console.log(`startDrawing`)
    //const { offsetX, offsetY } = nativeEvent;
      console.log(`x = ${x}, y=${y}`);
      console.log(`contextRef.current.strokeStyle = ${contextRef.current.strokeStyle}, line width = ${contextRef.current.lineWidth}`)
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    setIsDrawing(true);
  };
    const eventCanvasCoord = (canvas, ev) => {
	console.log(`ev.pageX = ${ev.pageX}, ev.pageY = ${ev.pageY}, canvas.offsetTop = ${canvas.offsetTop}, canvas.offsetLeft = ${canvas.offsetLeft}, ZOOM = ${ZOOM}`);
  const x = (ev.pageX - canvas.offsetLeft)/ZOOM;
	const y = (ev.pageY - canvas.offsetTop)/ZOOM;
//	console.log(`x = ${x}, y = ${y}`)
  return { x, y };
  };
  const finishDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) {
      return;
    }
          const { x, y } = eventCanvasCoord(canvasRef.current, nativeEvent);
        //  const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d")
  //  context.fillStyle = "white"
      context.clearRect(0, 0, canvas.width, canvas.height);
      setLabel('');
  };

    
  return (
      <div align='center'>
	  <div>
	  <form>
      <label>KNN Web Services URL</label>
	      <input size="40"
		     value={wsUrl} onChange={e => resetWsUrl(e.target.value)}/>
	  </form>
	      </div>
	  <canvas
      onMouseDown={startDrawing}
      onMouseUp={finishDrawing}
      onMouseMove={draw}
      ref={canvasRef}
	  />
	  <div>
	      <button id="clear" onClick={clearCanvas}><slot name="clear">Clear Area</slot></button>
	      <button id="recognize" onClick={recognize}><slot name="recognize">Recognize</slot></button>
        Pen width : <select id="pen-width">
            <option value="1" selected="selected">1</option>
            <option value="2">2</option>
        </select>
	<p>
	    <strong>Label : </strong><span>{label}</span>
        </p>
	      <ul id="errors"></ul>
	      </div>
      </div>
    
  );
}


//export default App;
