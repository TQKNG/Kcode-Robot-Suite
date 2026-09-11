import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, SESSION_VALUE } from "./lib/session";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function middleware(request: NextRequest) {
  const authenticated = request.cookies.get(SESSION_COOKIE)?.value === SESSION_VALUE;
  
  if (!authenticated) {
    return NextResponse.redirect(
      new URL(`${BASE_PATH}/login`, request.url)
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/launcher", "/demo/:path*"]
};
