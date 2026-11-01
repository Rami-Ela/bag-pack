"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/password-rules";
import { createDefaultTemplates } from "@/lib/templates/create-defaults";
import {
  createSession,
  deleteSession,
  getCurrentUserId,
} from "@/lib/auth/session";

// Error codes are translated client-side (messages/fr.json > auth.errors).
export type AuthFormState = { error?: string; success?: boolean } | undefined;

function readCredentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "")
      .trim()
      .toLowerCase(),
    password: String(formData.get("password") ?? ""),
  };
}

export async function login(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const { email, password } = readCredentials(formData);
  if (!email || !password) return { error: "missingFields" };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "invalidCredentials" };
  }

  await createSession(user.id);
  redirect("/");
}

export async function signup(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const { email, password } = readCredentials(formData);
  const name = String(formData.get("name") ?? "").trim() || null;
  if (!email || !password) return { error: "missingFields" };
  if (password.length < MIN_PASSWORD_LENGTH)
    return { error: "passwordTooShort" };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "emailTaken" };

  const user = await prisma.user.create({
    data: { email, name, passwordHash: await hashPassword(password) },
  });
  await createDefaultTemplates(user.id);

  await createSession(user.id);
  redirect("/");
}

export async function logout(): Promise<void> {
  await deleteSession();
}

export async function changePassword(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  if (!currentPassword || !newPassword) return { error: "missingFields" };
  if (newPassword.length < MIN_PASSWORD_LENGTH)
    return { error: "passwordTooShort" };

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!(await verifyPassword(currentPassword, user.passwordHash))) {
    return { error: "invalidCurrentPassword" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(newPassword) },
  });
  return { success: true };
}
