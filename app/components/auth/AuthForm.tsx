"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { AuthFormState, login, signup } from "@/app/actions/auth";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/password-rules";

const INPUT_CLASS =
  "w-full px-3 py-3 text-sm border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500";

interface Props {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: Props) {
  const t = useTranslations("auth");
  const [state, action, isPending] = useActionState<AuthFormState, FormData>(
    mode === "login" ? login : signup,
    undefined,
  );

  return (
    <div className="min-h-dvh bg-gray-100 flex items-center justify-center p-4">
      <form
        action={action}
        className="w-full max-w-sm bg-white rounded-xl shadow-sm p-6 space-y-3"
      >
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          {t(`${mode}.title`)}
        </h1>

        {mode === "signup" && (
          <input
            name="name"
            type="text"
            placeholder={t("namePlaceholder")}
            className={INPUT_CLASS}
          />
        )}
        <input
          name="email"
          type="email"
          placeholder={t("emailPlaceholder")}
          autoComplete="email"
          className={INPUT_CLASS}
          required
        />
        <input
          name="password"
          type="password"
          placeholder={t("passwordPlaceholder")}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          minLength={mode === "signup" ? MIN_PASSWORD_LENGTH : undefined}
          className={INPUT_CLASS}
          required
        />

        {state?.error && (
          <p className="text-sm text-red-600">{t(`errors.${state.error}`)}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {t(`${mode}.submit`)}
        </button>

        <p className="text-sm text-gray-500 text-center">
          <Link
            href={mode === "login" ? "/signup" : "/login"}
            className="text-blue-600 hover:underline"
          >
            {t(`${mode}.switch`)}
          </Link>
        </p>
      </form>
    </div>
  );
}
