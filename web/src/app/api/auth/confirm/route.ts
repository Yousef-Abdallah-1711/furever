import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const allowedNextPaths = new Set(["/en/accept-invite", "/ar/accept-invite"]);

function redirect(request: NextRequest, path: string) {
  const response = NextResponse.redirect(new URL(path, request.url), 303);
  response.headers.set("cache-control", "private, no-store");
  response.headers.set("referrer-policy", "no-referrer");
  return response;
}

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const tokenType = request.nextUrl.searchParams.get("type");
  const requestedNext = request.nextUrl.searchParams.get("next");
  const nextPath = requestedNext && allowedNextPaths.has(requestedNext)
    ? requestedNext
    : "/en/accept-invite";

  if (!tokenHash || tokenType !== "invite") {
    return redirect(request, nextPath);
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "invite",
    });
    if (error) return redirect(request, nextPath);
    return redirect(request, nextPath);
  } catch {
    return redirect(request, nextPath);
  }
}
