import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type Role = "teacher" | "student";

function redirectWithCookies(
  request: NextRequest,
  sourceResponse: NextResponse,
  pathname: string,
  searchParams?: Record<string, string>
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";

  if (searchParams) {
    Object.entries(searchParams).forEach(([k, v]) => {
      url.searchParams.set(k, v);
    });
  }

  const redirectResponse = NextResponse.redirect(url);
  sourceResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  return redirectResponse;
}

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        supabaseResponse = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const pathname = request.nextUrl.pathname;
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const requiredRole: Role | null = pathname.startsWith("/teacher")
    ? "teacher"
    : pathname.startsWith("/student")
      ? "student"
      : null;

  if (!requiredRole && !isAuthPage) {
    return supabaseResponse;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (requiredRole) {
      return redirectWithCookies(request, supabaseResponse, "/login", {
        next: pathname,
      });
    }
    return supabaseResponse;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const resolvedRole: Role =
    profile?.role === "teacher" || profile?.role === "student"
      ? profile.role
      : user.user_metadata?.role === "teacher"
        ? "teacher"
        : "student";

  // If already logged in and visiting /login or /register, redirect to workspace
  if (isAuthPage) {
    return redirectWithCookies(
      request,
      supabaseResponse,
      resolvedRole === "teacher" ? "/teacher" : "/student"
    );
  }

  if (requiredRole && resolvedRole !== requiredRole) {
    return redirectWithCookies(
      request,
      supabaseResponse,
      resolvedRole === "teacher" ? "/teacher" : "/student"
    );
  }

  return supabaseResponse;
}
