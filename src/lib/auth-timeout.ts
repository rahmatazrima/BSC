/**
 * Auth Timeout Utility
 * Menangani auto logout setelah user idle selama 3 jam
 */

export const AUTH_TIMEOUT_DURATION = 3 * 60 * 60 * 1000; // 3 jam dalam milliseconds

/**
 * Aktivitas user yang akan direset timeout
 */
export const USER_ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keypress',
  'scroll',
  'touchstart',
  'click',
] as const;

/**
 * Logout user dan redirect ke login page
 */
export async function performLogout(redirectUrl: string = '/login') {
  try {
    // Call logout API untuk clear cookie
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Redirect ke login page
    if (typeof window !== 'undefined') {
      // Clear any local storage/session storage if needed
      localStorage.removeItem('user');
      sessionStorage.clear();
      
      // Redirect
      window.location.href = redirectUrl;
    }
  } catch (error) {
    console.error('Auto logout error:', error);
    // Tetap redirect meskipun API call gagal
    if (typeof window !== 'undefined') {
      window.location.href = redirectUrl;
    }
  }
}

/**
 * Format waktu remaining untuk display
 */
export function formatTimeRemaining(milliseconds: number): string {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
  
  return `${hours}j ${minutes}m ${seconds}d`;
}

/**
 * Check apakah user sedang di halaman login/register
 */
export function isAuthPage(pathname: string): boolean {
  return pathname === '/login' || pathname === '/register' || pathname === '/';
}
