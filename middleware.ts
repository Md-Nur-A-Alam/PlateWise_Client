import { NextRequest, NextResponse } from "next/server";

import type { Session } from "better-auth/types";

export async function middleware(request: NextRequest) {
  const isProtected = request.nextUrl.pathname.startsWith('/recipes/add') || 
                      request.nextUrl.pathname.startsWith('/recipes/manage') ||
                      request.nextUrl.pathname.startsWith('/ai/generate') ||
                      request.nextUrl.pathname.startsWith('/ai/recommendations');
                      
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || 
                      request.nextUrl.pathname.startsWith('/register');

  // Verify session with the server using standard fetch
  let session = null;
  try {
    const res = await fetch(new URL('/api/auth/get-session', request.nextUrl.origin).toString(), {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });
    if (res.ok) {
      session = await res.json();
    }
  } catch (e) {
    // console.error(e);
  }

  if (!session && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (session && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
