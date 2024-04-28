import React from 'react';
import { useRef, useEffect, useState } from 'react';
import './App.css';
import * as faceapi from "face-api.js";
import confettiAnimation from "./confettiAnimation";


function App() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [setYippee] = useState(false);
    const [currentExpression, setCurrentExpression] = useState(null);
    const [index, setIndex] = useState(null);
    const [expressions, setExpressions] = useState({
        "neutral": 0,
        "happy": 0,
        "sad": 0,
        "angry": 0,
        "fearful": 0,
        "disgust": 0,
        "suprised": 0,
    });

    useEffect(() => {
        startVideo();
        videoRef && loadModels();

    }, [expressions]);
    
        const loadModels = () => {
        Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
            faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
            faceapi.nets.faceExpressionNet.loadFromUri('/models'),
        ]).then(() => {
            faceDetection();
        })
        };

    const startVideo = () => {
        navigator.mediaDevices.getUserMedia({ video: true })
        .then((currentStream) => {
            videoRef.current.srcObject = currentStream;
        })
        .catch((err) => {
            console.error(err)
        });
    }

    const faceDetection = async () => {
        setInterval(async() => {
            const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
            
            canvasRef.current.innerHtml = faceapi.createCanvasFromMedia(videoRef.current);
            faceapi.matchDimensions(canvasRef.current, {
                width: 940,
                height: 650,
            })

            const resized = faceapi.resizeResults(detections, {
                width: 940,
                height: 650,
            });

            faceapi.draw.drawDetections(canvasRef.current, resized)
            faceapi.draw.drawFaceLandmarks(canvasRef.current, resized)
            faceapi.draw.drawFaceExpressions(canvasRef.current, resized)

            // Process detected expressions/emotions
            if (resized.length > 0) {
                const emotions = resized[0].expressions;
                setExpressions(emotions);
                console.log(expressions)
            }

            if (expressions[currentExpression] >= 0.70){
                let newIndex = index + 1;
                setIndex(newIndex);

                setTimeout(()=> {
                    newChallenge();
                }, 5000)
            }
        }, 1000)
    }

    const newChallenge = () => {
        console.log("hello");
        const emotions = ["neutral", "happy", "sad", "angry", "fearful", "disgust", "suprised"];
        const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
        setCurrentExpression(randomEmotion);
    }

    
  return (
    <div className="app">
        <div className="app--tips">

        </div>
        <div className="app--center">
            <h1 className="center--title"> Mood Match</h1>

            <div className="center--subtext">
                <p className="subtext--expression">The current expression is: {currentExpression} points: {index}</p>
                <button onClick={() => newChallenge()}>start</button>

            </div>

            <div className='center--video'>
                <video crossOrigin='anonymous' ref={videoRef} autoPlay ></video>
            </div>

            <canvas ref={canvasRef} width="940" height="650" className='center--canvas' />

            <div className="center--emotions">
                {Object.entries(expressions).map(([expression, percentage]) => (
                    <p key={expression} className="emotions--emotion">
                        {expression}: {Math.floor(percentage * 10000) / 100}%
                    </p>
                ))}
            </div>
        </div>
        <div className="app--key">
            <img src="/public/IMG_0608.png"></img>
        </div>
    </div>
  );
}

export default App;
