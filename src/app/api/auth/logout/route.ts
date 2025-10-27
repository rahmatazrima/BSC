import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// POST - Logout user
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Delete auth token cookie
    cookieStore.delete('auth-token');

    return NextResponse.json({
      message: 'Logout successful',
      data: {
        redirectUrl: '/login'
      }
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to logout",
      },
      { status: 500 }
    );
  }
}

// GET - Alternative logout method
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('auth-token');

    return NextResponse.json({
      message: 'Logout successful',
      data: {
        redirectUrl: '/login'
      }
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to logout",
      },
      { status: 500 }
    );
  }
}