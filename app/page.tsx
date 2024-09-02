// app/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const CameraToggle = dynamic(() => import('../components/CameraControl'), { ssr: false });

export default function Home() {
  const [mediapipeLoaded, setMediapipeLoaded] = useState(false);

  useEffect(() => {
    const loadMediaPipeScripts = async () => {
      // Load the MediaPipe Hands script
      const handsScript = document.createElement('script');
      handsScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js';
      document.body.appendChild(handsScript);

      // Load the MediaPipe Camera Utils script
      const cameraUtilsScript = document.createElement('script');
      cameraUtilsScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';
      document.body.appendChild(cameraUtilsScript);

      handsScript.onload = () => {
        cameraUtilsScript.onload = () => {
          setMediapipeLoaded(true);
        };
      };
    };

    loadMediaPipeScripts();
  }, []);

  return (
    <main>
      <h1>Hand Tracking Example</h1>
      {mediapipeLoaded ? (
        <CameraToggle
          Hands={window.Hands}
          HAND_CONNECTIONS={window.HAND_CONNECTIONS}
          Camera={window.Camera}
        />
      ) : (
        <p>Loading MediaPipe...</p>
      )}
    </main>
  );
}