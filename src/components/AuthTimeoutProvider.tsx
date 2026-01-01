'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import {
  AUTH_TIMEOUT_DURATION,
  USER_ACTIVITY_EVENTS,
  performLogout,
  isAuthPage,
} from '@/lib/auth-timeout';

/**
 * AuthTimeoutProvider
 * 
 * Component untuk menangani auto logout setelah user idle selama 3 jam
 * - Mendeteksi aktivitas user (mouse, keyboard, touch, scroll)
 * - Reset timer setiap kali ada aktivitas
 * - Auto logout setelah 3 jam tanpa aktivitas
 * - Tidak aktif di halaman login/register
 */
export default function AuthTimeoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  /**
   * Reset timeout setiap kali ada aktivitas user
   */
  const resetTimeout = useCallback(() => {
    // Skip jika di halaman auth
    if (isAuthPage(pathname)) {
      return;
    }

    // Clear existing timeout
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }

    // Update last activity time
    lastActivityRef.current = Date.now();

    // Set new timeout untuk 3 jam
    timeoutIdRef.current = setTimeout(() => {
      console.log('User idle selama 3 jam, melakukan auto logout...');
      performLogout('/login');
    }, AUTH_TIMEOUT_DURATION);
  }, [pathname]);

  /**
   * Handle user activity
   */
  const handleActivity = useCallback(() => {
    resetTimeout();
  }, [resetTimeout]);

  /**
   * Setup event listeners untuk track aktivitas user
   */
  useEffect(() => {
    // Skip jika di halaman auth
    if (isAuthPage(pathname)) {
      // Clear timeout jika ada
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
      return;
    }

    // Initialize timeout
    resetTimeout();

    // Add event listeners untuk semua aktivitas user
    USER_ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Cleanup
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      USER_ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [pathname, resetTimeout, handleActivity]);

  /**
   * Check token validity on mount dan setiap route change
   */
  useEffect(() => {
    // Skip jika di halaman auth
    if (isAuthPage(pathname)) {
      return;
    }

    // Check jika token masih valid
    const checkTokenValidity = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          // Token invalid atau expired, logout
          console.log('Token invalid atau expired, melakukan logout...');
          performLogout('/login');
        }
      } catch (error) {
        console.error('Error checking token validity:', error);
      }
    };

    checkTokenValidity();
  }, [pathname]);

  return <>{children}</>;
}
