"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthenticationError, DemoAuthService } from "@kcode/services";
import { SESSION_COOKIE, SESSION_VALUE } from "../../lib/auth";

export async function login(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const remember = formData.get("remember") === "on";
  const auth = new DemoAuthService();
  try {
    await auth.signIn({ username, password, rememberMe: remember });
  } catch (error) {
    if (error instanceof AuthenticationError) redirect("/login?error=invalid");
    throw error;
  }

  (await cookies()).set(SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(remember ? { maxAge: 60 * 60 * 24 * 7 } : {}),
  });
  redirect("/launcher");
}

export async function logout() {
  await new DemoAuthService().signOut();
  (await cookies()).set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  redirect("/login");
}
