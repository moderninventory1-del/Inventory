"use client";
// src/components/shared/ServiceWorkerRegister.tsx
// Registers the PWA service worker in the browser for instant caching and offline capability

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Register after initial load so critical rendering is not blocked
      const registerSW = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            // Check for updates periodically
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (
                    installingWorker.state === "installed" &&
                    navigator.serviceWorker.controller
                  ) {
                    // New content is available; update quietly
                  }
                };
              }
            };
          })
          .catch((error) => {
            // Silently fail in unsupported or dev environments
            console.debug("[SW] Registration skipped or failed:", error);
          });
      };

      if (document.readyState === "complete") {
        registerSW();
      } else {
        window.addEventListener("load", registerSW, { once: true });
      }
    }
  }, []);

  return null;
}
