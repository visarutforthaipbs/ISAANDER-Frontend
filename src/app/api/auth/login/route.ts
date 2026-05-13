import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { getAuthorByEmail } from "@/data/authors";
import { createToken, COOKIE_NAME } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "unknown";

    const limiter = checkRateLimit(`${ip}:${email || "anonymous"}`, {
      windowMs: 15 * 60 * 1000,
      max: 10,
    });
    if (!limiter.allowed) {
      return NextResponse.json(
        { error: "ลองใหม่อีกครั้งในภายหลัง" },
        {
          status: 429,
          headers: {
            "Retry-After": String(limiter.retryAfterSeconds),
          },
        }
      );
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: "กรุณากรอกอีเมลและรหัสผ่าน" },
        { status: 400 }
      );
    }

    const author = getAuthorByEmail(email);
    if (!author || !author.passwordHash) {
      return NextResponse.json(
        { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    const valid = await compare(password, author.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    const token = await createToken({
      slug: author.slug,
      email: author.email!,
      name: author.name,
    });

    const response = NextResponse.json({ success: true, author: { slug: author.slug, name: author.name } });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาด กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}
