"use client";
// src/components/shared/ServiceWorkerRegister.tsx
// Registers the PWA service worker in the browser for instant caching and offline capability

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname.endsWith(".local");

      // On localhost/development, aggressively unregister any service worker and wipe cache
      if (isLocalhost) {
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.getRegistrations().then((registrations) => {
            for (const reg of registrations) {
              reg.unregister();
            }
          });
        }
        if ("caches" in window) {
          caches.keys().then((names) => {
            for (const name of names) {
              caches.delete(name);
            }
          });
        }
        return;
      }

      // In production, register the service worker for caching
      if ("serviceWorker" in navigator) {
        const registerSW = () => {
          navigator.serviceWorker
            .register("/sw.js")
            .then((registration) => {
              registration.onupdatefound = () => {
                const installingWorker = registration.installing;
                if (installingWorker) {
                  installingWorker.onstatechange = () => {
                    if (
                      installingWorker.state === "installed" &&
                      navigator.serviceWorker.controller
                    ) {
                      // New content available
                    }
                  };
                }
              };
            })
            .catch((error) => {
              console.debug("[SW] Registration skipped:", error);
            });
        };

        if (document.readyState === "complete") {
          registerSW();
        } else {
          window.addEventListener("load", registerSW, { once: true });
        }
      }
    }
  }, []);

  return null;
}
