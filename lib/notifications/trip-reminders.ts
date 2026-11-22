import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { tomorrowStartDate } from "./reminder-schedule";
import { PushResult, sendPush } from "./web-push";

export interface TripRemindersSummary {
  trips: number;
  sent: number;
  expired: number;
  failed: number;
}

// Sends one notification per device for every trip departing tomorrow. A trip is marked
// once at least one device received it, so re-running the job the same day is harmless.
export async function sendTripReminders(
  now: Date = new Date(),
): Promise<TripRemindersSummary> {
  const startDate = tomorrowStartDate(now);
  const trips = await prisma.trip.findMany({
    where: {
      startDate,
      // SQL "<>" never matches NULL, hence the explicit null branch.
      OR: [{ reminderSentFor: null }, { reminderSentFor: { not: startDate } }],
      user: { pushSubscriptions: { some: {} } },
    },
    select: {
      id: true,
      name: true,
      _count: { select: { items: { where: { packed: false } } } },
      user: {
        select: {
          pushSubscriptions: {
            select: { endpoint: true, p256dh: true, auth: true },
          },
        },
      },
    },
  });

  const t = await getTranslations({ locale: "fr", namespace: "notifications" });
  const summary: TripRemindersSummary = {
    trips: trips.length,
    sent: 0,
    expired: 0,
    failed: 0,
  };

  for (const trip of trips) {
    const message = {
      title: t("tripReminder.title", { name: trip.name }),
      body: t("tripReminder.body"),
      url: `/?trip=${encodeURIComponent(trip.id)}`,
      tag: `trip-reminder-${trip.id}`,
    };

    const results: PushResult[] = await Promise.all(
      trip.user.pushSubscriptions.map(async (subscription) => {
        const result = await sendPush(subscription, message);
        if (result === "expired") {
          // deleteMany: another trip of the same user may have removed it already.
          await prisma.pushSubscription.deleteMany({
            where: { endpoint: subscription.endpoint },
          });
        }
        return result;
      }),
    );

    for (const result of results) summary[result] += 1;
    if (results.includes("sent")) {
      await prisma.trip.update({
        where: { id: trip.id },
        data: { reminderSentFor: startDate },
      });
    }
  }

  return summary;
}
