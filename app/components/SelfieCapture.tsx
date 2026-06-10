"use client";

import { useState, useRef, useCallback } from "react";

interface Props {
  onComplete: (result: { livenessStatus: string; faceMatchStatus?: string }) => void;
  onSkip?: () => void;
  idImageBase64?: string;
}

export default function SelfieCapture({ onComplete, onSkip, idImageBase64 }: Props) {
  const [step, setStep] = useState<"instructions" | "capture" | "processing" | "result">("instructions");
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [livenessResult, setLivenessResult] = useState<{ passed: boolean; probability: number } | null>(null);
  const [faceMatchResult, setFaceMatchResult] = useState<{ matched: boolean; confidence: number } | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setSelfiePreview(base64);
      setStep("capture");
    };
    reader.readAsDataURL(file);
  }

  const processImage = useCallback(async () => {
    if (!selfiePreview) return;
    setStep("processing");
    setError("");

    try {
      // Extract base64 without data URL prefix
      const base64 = selfiePreview.split(",")[1];

      // Step 1 — Liveness check
      const livenessRes = await fetch("/api/verify/liveness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64 }),
      });
      const livenessData = await livenessRes.json();
      setLivenessResult({ passed: livenessData.passed, probability: livenessData.probability });

      // Step 2 — Face match if ID image available and liveness passed
      if (livenessData.passed && idImageBase64) {
        const faceRes = await fetch("/api/verify/face-match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            selfieBase64: base64,
            idImageBase64: idImageBase64.split(",")[1] || idImageBase64,
          }),
        });
        const faceData = await faceRes.json();
        setFaceMatchResult({ matched: faceData.matched, confidence: faceData.confidence });
      }

      setStep("result");
    } catch (err) {
      console.error("Biometric error:", err);
      setError("Verification failed. Please try again.");
      setStep("capture");
    }
  }, [selfiePreview, idImageBase64]);

  function handleRetake() {
    setSelfiePreview(null);
    setLivenessResult(null);
    setFaceMatchResult(null);
    setStep("instructions");
  }

  function handleContinue() {
    onComplete({
      livenessStatus: livenessResult?.passed ? "passed" : "failed",
      faceMatchStatus: faceMatchResult ? (faceMatchResult.matched ? "matched" : "mismatch") : undefined,
    });
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">

      {/* Instructions */}
      {step === "instructions" && (
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-amber-400/10 border-2 border-amber-400/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📸</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Selfie Verification</h3>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            We need to verify your identity with a selfie. This confirms you are a real person and matches your identity documents.
          </p>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 mb-6 text-left flex flex-col gap-2">
            {[
              "Ensure good lighting — face the light source",
              "Look directly at the camera",
              "Remove sunglasses or hats",
              "Use a plain background if possible",
            ].map(tip => (
              <div key={tip} className="flex items-start gap-2 text-xs text-slate-400">
                <span className="text-amber-400 flex-shrink-0">•</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="user"
            ref={fileRef}
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full rounded-xl bg-amber-400 py-3 font-bold text-slate-950 hover:bg-amber-300 transition mb-3"
          >
            Take Selfie or Upload Photo →
          </button>
          {onSkip && (
            <button onClick={onSkip} className="w-full rounded-xl border border-white/10 py-3 text-sm text-slate-400 hover:text-white transition">
              Skip for now
            </button>
          )}
        </div>
      )}

      {/* Preview */}
      {step === "capture" && selfiePreview && (
        <div className="text-center">
          <p className="text-sm font-semibold text-white mb-4">Review your photo</p>
          <div className="relative w-48 h-48 mx-auto mb-4 rounded-2xl overflow-hidden border-2 border-amber-400/30">
            <img src={selfiePreview} alt="Selfie preview" className="w-full h-full object-cover" />
          </div>
          <p className="text-xs text-slate-400 mb-6">Make sure your face is clearly visible and well lit.</p>
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 mb-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
          <button onClick={processImage} className="w-full rounded-xl bg-amber-400 py-3 font-bold text-slate-950 hover:bg-amber-300 transition mb-3">
            Use This Photo →
          </button>
          <button onClick={handleRetake} className="w-full rounded-xl border border-white/10 py-3 text-sm text-slate-400 hover:text-white transition">
            Retake Photo
          </button>
        </div>
      )}

      {/* Processing */}
      {step === "processing" && (
        <div className="text-center py-8">
          <div className="h-12 w-12 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white font-semibold mb-1">Verifying your identity</p>
          <p className="text-xs text-slate-400">Running liveness detection and face match checks...</p>
        </div>
      )}

      {/* Result */}
      {step === "result" && (
        <div className="text-center">
          <div className="flex flex-col gap-3 mb-6">
            {livenessResult && (
              <div className={"rounded-xl border p-4 " + (livenessResult.passed ? "border-emerald-500/30 bg-emerald-500/10" : "border-red-500/30 bg-red-500/10")}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{livenessResult.passed ? "✓" : "✕"}</span>
                    <p className={"text-sm font-semibold " + (livenessResult.passed ? "text-emerald-400" : "text-red-400")}>
                      Liveness Check — {livenessResult.passed ? "Passed" : "Failed"}
                    </p>
                  </div>
                  <span className="text-xs text-slate-500">{(livenessResult.probability * 100).toFixed(1)}%</span>
                </div>
              </div>
            )}
            {faceMatchResult && (
              <div className={"rounded-xl border p-4 " + (faceMatchResult.matched ? "border-emerald-500/30 bg-emerald-500/10" : "border-red-500/30 bg-red-500/10")}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{faceMatchResult.matched ? "✓" : "✕"}</span>
                    <p className={"text-sm font-semibold " + (faceMatchResult.matched ? "text-emerald-400" : "text-red-400")}>
                      Face Match — {faceMatchResult.matched ? "Matched" : "Not Matched"}
                    </p>
                  </div>
                  <span className="text-xs text-slate-500">{faceMatchResult.confidence.toFixed(1)}% confidence</span>
                </div>
              </div>
            )}
          </div>

          {livenessResult?.passed ? (
            <>
              <p className="text-sm text-slate-400 mb-6">Your identity has been verified. You can now continue.</p>
              <button onClick={handleContinue} className="w-full rounded-xl bg-amber-400 py-3 font-bold text-slate-950 hover:bg-amber-300 transition mb-3">
                Continue →
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-400 mb-6">The liveness check did not pass. Please retake your photo in better lighting.</p>
              <button onClick={handleRetake} className="w-full rounded-xl bg-amber-400 py-3 font-bold text-slate-950 hover:bg-amber-300 transition mb-3">
                Try Again
              </button>
            </>
          )}
          {onSkip && (
            <button onClick={onSkip} className="w-full rounded-xl border border-white/10 py-3 text-sm text-slate-400 hover:text-white transition">
              Skip for now
            </button>
          )}
        </div>
      )}
    </div>
  );
}