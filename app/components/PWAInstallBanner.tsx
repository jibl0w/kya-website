"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "kya-pwa-dismissed";

export default function PWAInstallBanner() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. If already installed (launched from home screen), never show.
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    // iOS standalone check (Safari uses a non-standard property)
    if ((window.navigator as unknown as { standalone?: boolean }).standalone) return;

    // 2. If previously dismissed or installed on this device, never show again.
    if (localStorage.getItem(DISMISS_KEY)) return;

    // 3. Only show on mobile devices.
    const ua = window.navigator.userAgent.toLowerCase();
    const isMobile = /iphone|ipad|ipod|android/.test(ua);
    if (!isMobile) return;

    const ios = /iphone|ipad|ipod/.test(ua);
    setIsIOS(ios);

    // Android / Chrome: capture the native install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // If the app gets installed, remember it so we never prompt again.
    const installedHandler = () => {
      localStorage.setItem(DISMISS_KEY, "true");
      setShowBanner(false);
    };
    window.addEventListener("appinstalled", installedHandler);

    // iOS has no beforeinstallprompt — show manual instructions after a short delay
    let iosTimer: ReturnType<typeof setTimeout> | undefined;
    if (ios) {
      iosTimer = setTimeout(() => setShowBanner(true), 3000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, []);

  async function handleInstall() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const result = await installPrompt.userChoice;
    // Either way, don't prompt again on this device.
    localStorage.setItem(DISMISS_KEY, "true");
    setShowBanner(false);
  }

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, "true");
    setShowBanner(false);
  }

  if (!showBanner) return null;

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
              Add KYA to your home screen for quick access to your trade dashboard.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss"
            className="text-slate-500 hover:text-white transition text-xl leading-none flex-shrink-0"
          >
            ×
          </button>
        </div>

        {isIOS ? (
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              To install: tap the
              <span className="inline-block mx-1 rounded bg-white/10 px-1.5 py-0.5 text-white font-medium">
                Share
              </span>
              button at the bottom of Safari, then
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