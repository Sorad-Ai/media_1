// components/CameraToggle.tsx

'use client';

import React, { useState, useEffect, useRef } from 'react';

interface CameraToggleProps {
  Hands: typeof window.Hands;
  HAND_CONNECTIONS: typeof window.HAND_CONNECTIONS;
  Camera: typeof window.Camera;
}

const CameraToggle: React.FC<CameraToggleProps> = ({ Hands, HAND_CONNECTIONS, Camera }) => {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);

  const handleCheckboxChange = () => {
    setIsCameraOn((prevState) => !prevState);
  };

  useEffect(() => {
    const initializeHands = async () => {
      if (!Hands || !videoRef.current || !canvasRef.current) return;

      const hands = new Hands({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      hands.onResults((results: any) => {
        const canvasCtx = canvasRef.current!.getContext('2d');
        if (!canvasCtx || !results.multiHandLandmarks) return;

        canvasCtx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
        canvasCtx.drawImage(results.image, 0, 0, canvasRef.current!.width, canvasRef.current!.height);

        for (const landmarks of results.multiHandLandmarks) {
          canvasCtx.beginPath();
          for (const connection of HAND_CONNECTIONS) {
            const start = landmarks[connection[0]];
            const end = landmarks[connection[1]];
            canvasCtx.moveTo(start.x * canvasRef.current!.width, start.y * canvasRef.current!.height);
            canvasCtx.lineTo(end.x * canvasRef.current!.width, end.y * canvasRef.current!.height);
          }
          canvasCtx.stroke();

          for (const landmark of landmarks) {
            canvasCtx.beginPath();
            canvasCtx.arc(landmark.x * canvasRef.current!.width, landmark.y * canvasRef.current!.height, 5, 0, 2 * Math.PI);
            canvasCtx.fillStyle = 'red';
            canvasCtx.fill();
          }
        }
      });

      handsRef.current = hands;
    };

    const startCamera = async () => {
      if (!handsRef.current || !videoRef.current || !canvasRef.current || !Camera) return;

      cameraRef.current = new Camera(videoRef.current, {
        onFrame: async () => {
          await handsRef.current.send({ image: videoRef.current });
        },
        width: 640,
        height: 480,
      });

      cameraRef.current.start();
    };

    const stopCamera = () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };

    if (isCameraOn) {
      initializeHands().then(() => {
        startCamera();
      });
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isCameraOn, Hands, HAND_CONNECTIONS, Camera]);

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={isCameraOn}
          onChange={handleCheckboxChange}
        />
        Toggle Camera
      </label>

      <div style={{ position: 'relative', marginTop: '10px' }}>
        <video
          ref={videoRef}
          style={{
            position: 'absolute',
            width: '640px',
            height: '480px',
            zIndex: 1,
          }}
          autoPlay
          muted
        />
        <canvas
          ref={canvasRef}
          width="640"
          height="480"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            zIndex: 2,
          }}
        />
      </div>
    </div>
  );
};

export default CameraToggle;