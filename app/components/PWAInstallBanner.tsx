"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallBanner() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Check if iOS
    const ios = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    setIsIOS(ios);

    // Check if dismissed before
    const dismissed = localStorage.getItem("kya-pwa-dismissed");
    if (dismissed) return;

    // Listen for install prompt on Android/Chrome
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Show iOS banner after 3 seconds
    if (ios) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handler);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (installPrompt) {
      await installPrompt.prompt();
      const result = await installPrompt.userChoice;
      if (result.outcome === "accepted") {
        setShowBanner(false);
        setIsInstalled(true);
      }
    }
  }

  function handleDismiss() {
    setShowBanner(false);
    localStorage.setItem("kya-pwa-dismissed", "true");
  }

  if (!showBanner || isInstalled) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="mx-auto max-w-lg rounded-2xl border border-amber-400/30 bg-slate-900 shadow-2xl p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-950 border border-white/10">
            <span className="text-2xl font-black text-white">
              KY<span className="text-amber-400">A</span>
            </span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white">Install KYA App</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Add KYA to your home screen for quick access to your trade dashboard
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-slate-500 hover:text-white transition text-lg flex-shrink-0"
          >
            ✕
          </button>
        </div>

        {isIOS ? (
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              To install: tap the
              <span className="inline-block mx-1 rounded bg-white/10 px-1.5 py-0.5 text-white font-medium">
                Share ↑
              </span>
              button at the bottom of Safari, then tap
              <span className="inline-block mx-1 rounded bg-white/10 px-1.5 py-0.5 text-white font-medium">
                Add to Home Screen
              </span>
            </p>
          </div>
        ) : (
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleInstall}
              className="flex-1 rounded-xl bg-amber-400 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-300 transition"
            >
              Install App
            </button>
            <button
              onClick={handleDismiss}
              className="rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-400 hover:text-white transition"
            >
              Not now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}