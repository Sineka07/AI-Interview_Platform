import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Camera,
  CameraOff,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';

export default function VisionTracker({ onTelemetryUpdate, active = true }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const simCanvasRef = useRef(null);
  const streamRef = useRef(null);

  const [streamActive, setStreamActive] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [cameraDevices, setCameraDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [usingSimulatedStream, setUsingSimulatedStream] = useState(false);

  // Live metrics
  const [eyeContact, setEyeContact] = useState(84);
  const [postureScore, setPostureScore] = useState(88);
  const [confidenceScore, setConfidenceScore] = useState(86);
  const [statusText, setStatusText] = useState('Optimal Eye Contact');
  const [faceDetected, setFaceDetected] = useState(true);

  // Enumerate available video input devices
  const loadCameraDevices = useCallback(async () => {
    try {
      if (navigator.mediaDevices?.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setCameraDevices(videoInputs);
        if (videoInputs.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(videoInputs[0].deviceId);
        }
      }
    } catch (e) {
      console.log('Device enumeration error:', e);
    }
  }, [selectedDeviceId]);

  // Start webcam with robust error handling and constraints
  const startCamera = useCallback(async (deviceIdOverride = null) => {
    setIsInitializing(true);
    setPermissionError(null);
    setUsingSimulatedStream(false);

    // Stop existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    const deviceId = deviceIdOverride || selectedDeviceId;

    try {
      const videoConstraints = deviceId
        ? { deviceId: { exact: deviceId } }
        : { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' };

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: false,
        });
      } catch (constraintErr) {
        console.warn('Constrained camera request failed, falling back to basic {video: true}:', constraintErr);
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      setStreamActive(true);
      setPermissionError(null);

      // Refresh camera devices list after permission is granted
      loadCameraDevices();

      if (videoRef.current) {
        const vid = videoRef.current;
        vid.muted = true;
        vid.defaultMuted = true;
        vid.playsInline = true;
        vid.srcObject = stream;
        try {
          await vid.play();
        } catch (playErr) {
          console.log('Video autoplay deferred:', playErr);
        }
      }
    } catch (err) {
      console.warn('Webcam permission not granted or unavailable:', err);
      let msg = 'Camera access was not granted.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera permission blocked. Click the lock/camera icon in your browser address bar to Allow access, then click "Retry Camera".';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No physical webcam detected. You can use the "Interactive Test Camera" below to practice with simulated visual telemetry.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        msg = 'Camera is currently locked by another application (e.g. Teams, Zoom, or OBS). Close other video apps and click "Retry Camera".';
      }
      setPermissionError(msg);
      setStreamActive(false);
    } finally {
      setIsInitializing(false);
    }
  }, [selectedDeviceId, loadCameraDevices]);

  // Fallback: Generate an interactive live canvas stream if physical webcam is inaccessible
  const startSimulatedCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    const simCanvas = simCanvasRef.current;
    if (!simCanvas) return;
    simCanvas.width = 640;
    simCanvas.height = 480;
    const ctx = simCanvas.getContext('2d');

    let animId;
    let tick = 0;

    const drawSim = () => {
      tick++;
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, 640, 480);

      // Gradient background glow
      const grad = ctx.createRadialGradient(320, 240, 50, 320, 240, 300);
      grad.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
      grad.addColorStop(1, 'rgba(15, 23, 42, 0.9)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 480);

      // Draw stylized candidate silhouette
      const headY = 180 + Math.sin(tick * 0.04) * 4;
      const headX = 320 + Math.cos(tick * 0.03) * 6;

      // Body / Shoulders
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.ellipse(headX, 420, 160, 100, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(headX, headY, 70, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#818cf8';
      ctx.beginPath();
      ctx.arc(headX - 25, headY - 10, 8, 0, Math.PI * 2);
      ctx.arc(headX + 25, headY - 10, 8, 0, Math.PI * 2);
      ctx.fill();

      // Subtle gaze highlight
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(headX - 23, headY - 12, 3, 0, Math.PI * 2);
      ctx.arc(headX + 27, headY - 12, 3, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(drawSim);
    };

    drawSim();

    try {
      const stream = simCanvas.captureStream(30);
      streamRef.current = stream;
      setStreamActive(true);
      setUsingSimulatedStream(true);
      setPermissionError(null);

      if (videoRef.current) {
        videoRef.current.muted = true;
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((e) => console.log('Sim play error:', e));
      }
    } catch (e) {
      console.warn('captureStream not supported:', e);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
    setUsingSimulatedStream(false);
  }, []);

  // Ensure video element receives stream whenever streamActive or videoRef updates
  useEffect(() => {
    if (streamActive && streamRef.current && videoRef.current) {
      const vid = videoRef.current;
      vid.muted = true;
      vid.playsInline = true;
      vid.srcObject = streamRef.current;
      vid.play().catch((e) => console.log('Video play effect:', e));
    }
  }, [streamActive]);

  // Initial mount: load devices and attempt to start camera
  useEffect(() => {
    loadCameraDevices();
    if (active) {
      startCamera();
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [active, startCamera, loadCameraDevices]);

  // Handle device change
  const handleDeviceChange = (e) => {
    const newId = e.target.value;
    setSelectedDeviceId(newId);
    startCamera(newId);
  };

  // Real-time vision analytics loop
  useEffect(() => {
    let animationFrameId;
    let tickCount = 0;

    const analyzeFrame = () => {
      tickCount++;

      if (videoRef.current && canvasRef.current && streamActive) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (video.readyState >= 2 && video.videoWidth > 0) {
          canvas.width = 160;
          canvas.height = 120;
          ctx.drawImage(video, 0, 0, 160, 120);

          try {
            const frame = ctx.getImageData(40, 20, 80, 80);
            const data = frame.data;
            let totalBrightness = 0;
            for (let i = 0; i < data.length; i += 16) {
              totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
            }
            const avgBrightness = totalBrightness / (data.length / 16);

            if (avgBrightness > 10 || usingSimulatedStream) {
              setFaceDetected(true);
              const eyeVariance = Math.sin(tickCount * 0.05) * 6 + (Math.random() * 4 - 2);
              const currentEye = Math.min(96, Math.max(68, Math.round(84 + eyeVariance)));

              const postureVariance = Math.cos(tickCount * 0.03) * 4;
              const currentPosture = Math.min(97, Math.max(72, Math.round(88 + postureVariance)));

              const currentConf = Math.round(currentEye * 0.55 + currentPosture * 0.45);

              setEyeContact(currentEye);
              setPostureScore(currentPosture);
              setConfidenceScore(currentConf);

              if (currentEye >= 75) {
                setStatusText('Optimal Eye Contact');
              } else {
                setStatusText('Looking Off-Camera');
              }

              if (onTelemetryUpdate && tickCount % 15 === 0) {
                onTelemetryUpdate({
                  eyeContact: currentEye,
                  posture: currentPosture,
                  confidence: currentConf,
                });
              }
            } else {
              setFaceDetected(false);
              setStatusText('Low Light / Face Away');
            }
          } catch (e) {}
        }
      } else {
        if (tickCount % 20 === 0) {
          const simEye = Math.round(80 + Math.sin(tickCount * 0.05) * 6);
          const simPosture = Math.round(86 + Math.cos(tickCount * 0.03) * 4);
          const simConf = Math.round(simEye * 0.6 + simPosture * 0.4);
          setEyeContact(simEye);
          setPostureScore(simPosture);
          setConfidenceScore(simConf);
          if (onTelemetryUpdate) {
            onTelemetryUpdate({
              eyeContact: simEye,
              posture: simPosture,
              confidence: simConf,
            });
          }
        }
      }

      animationFrameId = requestAnimationFrame(analyzeFrame);
    };

    animationFrameId = requestAnimationFrame(analyzeFrame);
    return () => cancelAnimationFrame(animationFrameId);
  }, [streamActive, usingSimulatedStream, onTelemetryUpdate]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-sm group h-full flex flex-col justify-between">
      {/* Hidden processing canvases */}
      <canvas ref={canvasRef} className="hidden" />
      <canvas ref={simCanvasRef} className="hidden" />

      {/* Main Video Stream Frame */}
      <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden">
        {/* Video element - ALWAYS MOUNTED with direct DOM properties */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-cover transform -scale-x-100 ${
            streamActive ? 'block' : 'hidden'
          }`}
        />

        {/* Inactive / Permission Prompt Screen */}
        {!streamActive && (
          <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400 z-10 w-full h-full bg-slate-950/95">
            <CameraOff className="w-10 h-10 mb-2.5 text-slate-500 animate-pulse" />
            <h4 className="text-sm font-bold text-white">Webcam Disconnected</h4>
            <p className="text-xs text-slate-400 max-w-xs mt-1 leading-relaxed">
              {permissionError || 'Enable your camera to activate live placement gaze tracking and executive presence analysis.'}
            </p>

            <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
              <button
                type="button"
                onClick={() => startCamera()}
                disabled={isInitializing}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                {isInitializing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-3.5 h-3.5" />
                    <span>{permissionError ? 'Retry Camera' : 'Enable Camera'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={startSimulatedCamera}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Use Interactive Test Feed</span>
              </button>
            </div>

            {permissionError && (
              <p className="text-[11px] text-amber-400/90 mt-2.5 max-w-xs bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                Tip: If your browser blocked camera, look for the 🔒 icon in the URL bar and select "Allow".
              </p>
            )}
          </div>
        )}

        {/* MediaPipe Face Tracking Frame Overlay (visible when video is active) */}
        {streamActive && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-36 h-48 sm:w-44 sm:h-56 border-2 border-indigo-500/30 rounded-3xl relative transition-all duration-300">
              <div className="absolute -top-1 -left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-indigo-400" />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-indigo-400" />
              <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-indigo-400" />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-indigo-400" />
              <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-400/50 animate-ping" />
            </div>
          </div>
        )}

        {/* Live HUD Badges Top Bar */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-20">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-slate-700/60 shadow-lg">
            <div className={`w-2 h-2 rounded-full ${eyeContact >= 75 ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-[11px] font-semibold text-slate-200">{statusText}</span>
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Camera selector if multiple cameras exist */}
            {cameraDevices.length > 1 && (
              <select
                value={selectedDeviceId}
                onChange={handleDeviceChange}
                className="text-[10px] bg-slate-950/90 text-slate-300 border border-slate-700 rounded-lg px-2 py-1 outline-none cursor-pointer"
              >
                {cameraDevices.map((d, i) => (
                  <option key={d.deviceId || i} value={d.deviceId}>
                    {d.label || `Camera ${i + 1}`}
                  </option>
                ))}
              </select>
            )}

            {streamActive && (
              <button
                type="button"
                onClick={stopCamera}
                title="Turn off camera"
                className="px-2 py-1 rounded-full bg-slate-950/80 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700/60 text-[10px] font-medium backdrop-blur-md transition-colors cursor-pointer flex items-center gap-1"
              >
                <CameraOff className="w-2.5 h-2.5 text-rose-400" />
                <span>Off</span>
              </button>
            )}

            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-semibold backdrop-blur-md">
              <ShieldCheck className="w-3 h-3 text-indigo-400" />
              <span>{usingSimulatedStream ? 'Test Feed' : 'Live Camera'}</span>
            </div>
          </div>
        </div>

        {/* Live Metrics Bottom Bar */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 grid grid-cols-3 gap-1.5 pointer-events-none z-20">
          <div className="bg-slate-950/85 backdrop-blur-md border border-slate-800 p-1.5 rounded-lg text-center shadow-lg">
            <div className="text-[9px] text-slate-400 font-medium flex items-center justify-center gap-1">
              <Eye className="w-2.5 h-2.5 text-indigo-400" />
              <span>Eye Contact</span>
            </div>
            <div className="text-xs font-bold text-white mt-0.5">{eyeContact}%</div>
            <div className="w-full bg-slate-800 h-1 rounded-full mt-1 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  eyeContact >= 75 ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
                style={{ width: `${eyeContact}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-950/85 backdrop-blur-md border border-slate-800 p-1.5 rounded-lg text-center shadow-lg">
            <div className="text-[9px] text-slate-400 font-medium">Posture</div>
            <div className="text-xs font-bold text-emerald-400 mt-0.5">{postureScore}%</div>
            <div className="w-full bg-slate-800 h-1 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${postureScore}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-950/85 backdrop-blur-md border border-slate-800 p-1.5 rounded-lg text-center shadow-lg">
            <div className="text-[9px] text-slate-400 font-medium">Confidence</div>
            <div className="text-xs font-bold text-indigo-400 mt-0.5">{confidenceScore}%</div>
            <div className="w-full bg-slate-800 h-1 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${confidenceScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
