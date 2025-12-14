"use client";

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running on iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Check if app is already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);
    setIsInstalled(standalone);

    if (standalone) {
      return;
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      // Only register in browser environment
      if (typeof window !== 'undefined') {
        navigator.serviceWorker
          .register('/api/service-worker', { 
            scope: '/',
            updateViaCache: 'none' // Always check for updates
          })
          .then((registration) => {
            console.log('[PWA] Service Worker registered successfully:', registration.scope);

            // Check for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('[PWA] New service worker available');
                  }
                });
              }
            });

            // Periodically check for updates (every 5 minutes)
            const updateInterval = setInterval(() => {
              registration.update().catch((error) => {
                console.warn('[PWA] Failed to check for service worker updates:', error);
              });
            }, 300000); // Check every 5 minutes

            // Store interval ID for cleanup (optional)
            return () => clearInterval(updateInterval);
          })
          .catch((error) => {
            // Better error handling
            const errorDetails: Record<string, unknown> = {
              message: error?.message || 'Unknown error',
              name: error?.name || 'Error',
            };

            // Only log stack in development (check if we're in dev mode)
            const isDev = typeof window !== 'undefined' && 
                         (window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1');
            
            if (isDev && error instanceof Error && error.stack) {
              errorDetails.stack = error.stack;
            }

            console.error('[PWA] Service Worker registration failed:', errorDetails);
            
            // Log registration attempt details only in development
            if (isDev) {
              console.error('[PWA] Registration attempt details:', {
                url: '/api/service-worker',
                scope: '/',
                userAgent: navigator.userAgent,
                serviceWorkerSupported: 'serviceWorker' in navigator,
              });
            }
          });
      }

      // Listen for service worker updates
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }

    // Listen for beforeinstallprompt event (Chrome, Edge, etc.)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log('[PWA] beforeinstallprompt event fired');
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app was installed
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App installed');
      setIsInstalled(true);
      setShowInstallButton(false);
      setDeferredPrompt(null);
    });

    // For iOS, show install instructions after a delay if prompt doesn't appear
    if (iOS && !standalone) {
      const timer = setTimeout(() => {
        if (!deferredPrompt) {
          setShowInstallButton(true);
        }
      }, 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (isIOS) {
      // For iOS, show instructions
      alert('Untuk menginstall aplikasi di iOS:\n\n1. Tap tombol Share (kotak dengan panah)\n2. Pilih "Add to Home Screen"\n3. Tap "Add"');
      return;
    }

    if (!deferredPrompt) {
      // Fallback: try to trigger browser's install UI
      console.log('[PWA] No deferred prompt available, checking if installable...');
      return;
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user to respond
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('[PWA] User accepted the install prompt');
        setIsInstalled(true);
      } else {
        console.log('[PWA] User dismissed the install prompt');
      }

      // Clear the deferred prompt
      setDeferredPrompt(null);
      setShowInstallButton(false);
    } catch (error) {
      console.error('[PWA] Error showing install prompt:', error);
    }
  };

  // Don't render if already installed
  if (isInstalled) {
    return null;
  }

  // Show install button if:
  // 1. We have a deferred prompt (Android/Chrome), OR
  // 2. It's iOS and we want to show instructions
  if (!showInstallButton && !isIOS) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
      <button
        onClick={handleInstallClick}
        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-full shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium flex items-center space-x-2 backdrop-blur-sm"
        aria-label="Install Bukhari Service Center App"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
        <span>{isIOS ? 'Install App' : 'Install App'}</span>
      </button>
    </div>
  );
}

