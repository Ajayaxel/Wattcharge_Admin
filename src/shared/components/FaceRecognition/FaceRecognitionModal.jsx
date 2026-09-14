import React, { useState, useEffect, useRef } from 'react';
import { Camera, CheckCircle2, RefreshCw, ShieldAlert, Sparkles, UserCheck, Eye } from 'lucide-react';
import Button from '../Button/Button';

export default function FaceRecognitionModal({ onComplete, signatoryName = 'Authorized Signatory' }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(true);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyProgress, setVerifyProgress] = useState(0);
  const [verificationResult, setVerificationResult] = useState(null);

  // Start video camera stream
  useEffect(() => {
    let activeStream = null;
    const startCamera = async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        });
        activeStream = s;
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      } catch (err) {
        console.warn('Camera access error or restricted:', err);
        setHasCameraPermission(false);
      }
    };

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const capturePhoto = () => {
    if (videoRef.current && stream) {
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, 400, 300);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(dataUrl);
      runVerification(dataUrl);
    } else {
      // Fallback SVG/Canvas snapshot if camera permission disabled in demo mode
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 400, 300);
      ctx.fillStyle = '#00f2fe';
      ctx.beginPath();
      ctx.arc(200, 130, 50, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(200, 240, 80, 0, Math.PI, true);
      ctx.fill();
      const demoDataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(demoDataUrl);
      runVerification(demoDataUrl);
    }
  };

  const runVerification = (imgData) => {
    setIsVerifying(true);
    setVerifyProgress(10);
    
    const interval = setInterval(() => {
      setVerifyProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            setIsVerifying(false);
            const score = Math.floor(Math.random() * 8) + 92; // 92% - 99%
            const res = {
              status: 'VERIFIED',
              livenessScore: score,
              confidence: `${score}.${Math.floor(Math.random() * 9)}%`,
              signatoryName,
              snapshot: imgData,
              timestamp: new Date().toLocaleTimeString(),
            };
            setVerificationResult(res);
            if (onComplete) onComplete(res);
          }, 400);
          return 100;
        }
        return prev + 20;
      });
    }, 250);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setVerificationResult(null);
    setVerifyProgress(0);
    setIsVerifying(false);
  };

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="p-3 bg-appSecondary/10 border border-appSecondary/20 rounded-2xl flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-appSecondary/20 flex items-center justify-center text-appSecondary flex-shrink-0">
          <UserCheck className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-appTextLight">Biometric Face Verification & Liveness Check</h4>
          <p className="text-[10px] text-appTextGray">
            Signatory: <span className="font-semibold text-appSecondary">{signatoryName}</span>
          </p>
        </div>
      </div>

      {/* Camera Stream / Snapshot Box */}
      <div className="relative w-full h-64 rounded-2xl bg-black border border-white/10 overflow-hidden flex items-center justify-center shadow-2xl">
        {!capturedImage ? (
          <>
            {/* Live Camera View */}
            {hasCameraPermission ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <div className="text-center p-6 space-y-3 z-10">
                <Camera className="w-10 h-10 mx-auto text-appSecondary opacity-80 animate-pulse" />
                <p className="text-xs font-semibold text-appTextLight">Ready for Face Scan Simulation</p>
                <p className="text-[10px] text-appTextGray max-w-xs">
                  Click "Scan Face & Verify" to run AI biometric liveness check.
                </p>
              </div>
            )}

            {/* Face Oval Overlay */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              <div className="w-40 h-52 border-2 border-dashed border-appSecondary/80 rounded-[50%] shadow-[0_0_30px_rgba(0,242,254,0.3)] animate-pulse flex items-center justify-center">
                <Eye className="w-5 h-5 text-appSecondary opacity-50" />
              </div>
              <span className="mt-2 text-[10px] bg-black/60 backdrop-blur px-3 py-1 rounded-full text-appTextLight border border-white/10 font-mono tracking-wider">
                ALIGN FACE INSIDE OVAL
              </span>
            </div>
          </>
        ) : (
          /* Captured Preview */
          <div className="relative w-full h-full">
            <img src={capturedImage} alt="Face Snapshot" className="w-full h-full object-cover" />

            {/* Verification Loading Overlay */}
            {isVerifying && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-4">
                <RefreshCw className="w-8 h-8 text-appSecondary animate-spin" />
                <p className="text-xs font-bold text-appTextLight">Analyzing Liveness & Face Features...</p>
                <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-appSecondary transition-all duration-300 rounded-full"
                    style={{ width: `${verifyProgress}%` }}
                  />
                </div>
                <span className="text-[10px] text-appSecondary font-mono">{verifyProgress}% COMPLETED</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hidden canvas element */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Verification Result Banner */}
      {verificationResult && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-2xl flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-green-400 flex items-center gap-1.5">
                FACE MATCH VERIFIED <Sparkles className="w-3.5 h-3.5" />
              </p>
              <p className="text-[10px] text-appTextGray">
                Liveness Score: <span className="font-bold text-appTextLight">{verificationResult.livenessScore}%</span> | Confidence: <span className="font-bold text-green-400">{verificationResult.confidence}</span>
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-[10px] font-bold font-mono">
            PASSED
          </span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-end gap-3 pt-2">
        {capturedImage && (
          <Button variant="secondary" onClick={retakePhoto} disabled={isVerifying}>
            <RefreshCw className="w-3.5 h-3.5" /> Retake Face Scan
          </Button>
        )}
        {!capturedImage && (
          <Button variant="primary" onClick={capturePhoto}>
            <Camera className="w-4 h-4" /> Scan Face & Verify
          </Button>
        )}
      </div>
    </div>
  );
}
