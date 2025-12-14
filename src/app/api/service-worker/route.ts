import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

// Use Node.js runtime for file system access
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // Read service worker file from public folder
    const swPath = join(process.cwd(), 'public', 'sw.js')
    const swContent = await readFile(swPath, 'utf-8')

    // Return with proper headers for service worker
    return new NextResponse(swContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Service-Worker-Allowed': '/',
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    console.error('[Service Worker Route] Error reading service worker file:', error)
    
    // Return minimal service worker that does nothing but prevents errors
    const fallbackSW = `// Fallback Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
`
    
    return new NextResponse(fallbackSW, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Service-Worker-Allowed': '/',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  }
}
