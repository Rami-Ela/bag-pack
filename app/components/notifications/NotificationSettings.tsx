"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type Status = "loading" | "unsupported" | "denied" | "disabled" | "enabled";

const ENDPOINT = "/api/push-subscriptions";

// iOS only exposes PushManager once the app is installed on the home screen.
function isPushSupported(): boolean {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

// The VAPID public key is base64url; PushManager.subscribe wants raw bytes.
function urlBase64ToUint8Array(base64Url: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

async function send(method: "POST" | "DELETE", body: unknown): Promise<void> {
  const res = await fetch(ENDPOINT, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${method} ${ENDPOINT} failed with ${res.status}`);
}

async function currentSubscription(): Promise<PushSubscription | null> {
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

async function readStatus(): Promise<Status> {
  if (!isPushSupported()) return "unsupported";
  if (Notification.permission === "denied") return "denied";
  const subscription = await currentSubscription();
  if (!subscription || Notification.permission !== "granted") return "disabled";
  // Re-register: the device may have been subscribed under another account before.
  await send("POST", subscription.toJSON());
  return "enabled";
}

export function NotificationSettings() {
  const t = useTranslations("notifications.settings");
  const [status, setStatus] = useState<Status>("loading");
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    readStatus()
      .then(setStatus)
      .catch((error) => {
        console.error("Could not read notification status:", error);
        setStatus("disabled");
      });
  }, []);

  const run = async (action: () => Promise<Status>) => {
    setPending(true);
    setFailed(false);
    try {
      setStatus(await action());
    } catch (error) {
      console.error("Notification settings update failed:", error);
      setFailed(true);
    } finally {
      setPending(false);
    }
  };

  const enable = () =>
    run(async () => {
      const permission = await Notification.requestPermission();
      if (permission !== "granted")
        return permission === "denied" ? "denied" : "disabled";

      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) throw new Error("NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set");
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      await send("POST", subscription.toJSON());
      return "enabled";
    });

  const disable = () =>
    run(async () => {
      const subscription = await currentSubscription();
      if (subscription) {
        await send("DELETE", { endpoint: subscription.endpoint });
        await subscription.unsubscribe();
      }
      return "disabled";
    });

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium text-gray-900">{t("title")}</h2>
      <p className="text-sm text-gray-500">{t("description")}</p>

      {status === "unsupported" && (
        <p className="text-sm text-gray-500">{t("unsupported")}</p>
      )}
      {status === "denied" && (
        <p className="text-sm text-gray-500">{t("denied")}</p>
      )}
      {status === "enabled" && (
        <p className="text-sm text-green-600">{t("enabled")}</p>
      )}
      {failed && <p className="text-sm text-red-600">{t("error")}</p>}

      {(status === "disabled" || status === "enabled") && (
        <button
          type="button"
          onClick={status === "enabled" ? disable : enable}
          disabled={pending}
          className={
            status === "enabled"
              ? "w-full py-3 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
              : "w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors"
          }
        >
          {status === "enabled" ? t("disable") : t("enable")}
        </button>
      )}
    </section>
  );
}
