"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { AuthFormState, changePassword, logout } from "@/app/actions/auth";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/password-rules";

const INPUT_CLASS =
  "w-full px-3 py-3 text-sm border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500";

interface Props {
  email: string;
}

export function AccountView({ email }: Props) {
  const t = useTranslations("auth");
  const [state, action, isPending] = useActionState<AuthFormState, FormData>(
    changePassword,
    undefined,
  );

  const handleLogout = async () => {
    await logout();
    // Full reload so the React Query cache of this user is dropped.
    window.location.assign("/login");
  };

  return (
    <div className="min-h-dvh bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">
            {t("account.title")}
          </h1>
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            {t("account.back")}
          </Link>
        </div>
        <p className="text-sm text-gray-500">{email}</p>

        <form action={action} className="space-y-3">
          <h2 className="text-sm font-medium text-gray-900">
            {t("account.changePassword")}
          </h2>
          <input
            name="currentPassword"
            type="password"
            placeholder={t("account.currentPasswordPlaceholder")}
            autoComplete="current-password"
            className={INPUT_CLASS}
            required
          />
          <input
            name="newPassword"
            type="password"
            placeholder={t("account.newPasswordPlaceholder")}
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            className={INPUT_CLASS}
            required
          />
          {state?.error && (
            <p className="text-sm text-red-600">{t(`errors.${state.error}`)}</p>
          )}
          {state?.success && (
            <p className="text-sm text-green-600">
              {t("account.passwordChanged")}
            </p>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {t("account.submit")}
          </button>
        </form>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
        >
          {t("account.logout")}
        </button>
      </div>
    </div>
  );
}
