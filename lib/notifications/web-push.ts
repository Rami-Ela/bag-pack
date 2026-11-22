import { sendNotification, WebPushError } from "web-push";

export interface PushTarget {
  endpoint: string;
  p256dh: string;
  auth: string;
}

// Payload read by the "push" handler of public/sw.js.
export interface PushMessage {
  title: string;
  body: string;
  url: string;
  tag: string;
}

// "expired": the push service forgot this subscription, the caller should delete it.
export type PushResult = "sent" | "expired" | "failed";

// A reminder is pointless once the trip has started, so undelivered pushes expire after 12h.
const TTL_SECONDS = 12 * 60 * 60;

function vapidDetails() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) {
    throw new Error(
      "Web Push is not configured: set NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY and VAPID_SUBJECT.",
    );
  }
  return { subject, publicKey, privateKey };
}

// Throws on missing configuration (a deployment error), returns a result for delivery errors.
export async function sendPush(
  target: PushTarget,
  message: PushMessage,
): Promise<PushResult> {
  const vapid = vapidDetails();
  try {
    await sendNotification(
      { endpoint: target.endpoint, keys: { p256dh: target.p256dh, auth: target.auth } },
      JSON.stringify(message),
      { vapidDetails: vapid, TTL: TTL_SECONDS },
    );
    return "sent";
  } catch (error) {
    if (
      error instanceof WebPushError &&
      (error.statusCode === 404 || error.statusCode === 410)
    ) {
      return "expired";
    }
    console.error("Push delivery failed:", error);
    return "failed";
  }
}
