"use client";

import { useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Share, X } from "lucide-react";

const DISMISSED_KEY = "iosInstallBannerDismissed";

const subscribeNoop = () => () => {};

function isIos() {
  // iPadOS reports a desktop Mac user agent, touch support tells them apart.
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1)
  );
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function wasDismissed() {
  try {
    return localStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

// Safari iOS never shows an install prompt, so users must be told to use "Add to Home Screen".
export function IosInstallBanner() {
  const t = useTranslations("pwa");
  // Browser-only checks: the server snapshot is false so SSR and hydration render nothing.
  const shouldPrompt = useSyncExternalStore(
    subscribeNoop,
    () => isIos() && !isStandalone() && !wasDismissed(),
    () => false,
  );
  const [dismissed, setDismissed] = useState(false);

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Storage unavailable (private mode): the banner will simply show again next visit.
    }
  }

  if (!shouldPrompt || dismissed) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-sm bg-white rounded-xl shadow-lg border border-gray-200 p-4 flex items-start gap-3">
        <p className="flex-1 text-sm text-gray-700">
          {t.rich("iosInstall", {
            share: () => (
              <Share
                className="inline size-4 align-text-bottom text-blue-600"
                aria-label={t("shareLabel")}
              />
            ),
          })}
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label={t("dismiss")}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="size-5" />
        </button>
      </div>
    </div>
  );
}
