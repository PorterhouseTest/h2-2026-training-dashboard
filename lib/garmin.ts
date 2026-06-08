import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

type GarminSyncResult = {
  activitiesImported: number;
  healthMetricsImported: number;
  message: string;
};

type GarminActivityInput = Prisma.GarminActivityCreateInput;
type DailyHealthMetricInput = Prisma.DailyHealthMetricCreateInput;

type GarminPayload = {
  activities: GarminActivityInput[];
  healthMetrics: DailyHealthMetricInput[];
  message: string;
};

export async function runGarminSync(source = "garmin"): Promise<GarminSyncResult> {
  const startedAt = new Date();
  const log = await prisma.syncLog.create({
    data: {
      source: "garmin",
      status: "running",
      startedAt,
      message: source
    }
  });

  try {
    const payload = await fetchRecentGarminData();

    for (const activity of payload.activities) {
      await prisma.garminActivity.upsert({
        where: { garminActivityId: activity.garminActivityId },
        update: activity,
        create: activity
      });
    }

    for (const metric of payload.healthMetrics) {
      await prisma.dailyHealthMetric.upsert({
        where: { date: metric.date },
        update: metric,
        create: metric
      });
    }

    const message = `${payload.message} Imported ${payload.activities.length} activities and ${payload.healthMetrics.length} health metric days.`;
    await prisma.syncLog.update({
      where: { id: log.id },
      data: { status: "success", finishedAt: new Date(), message }
    });

    return {
      activitiesImported: payload.activities.length,
      healthMetricsImported: payload.healthMetrics.length,
      message
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Garmin sync error";
    await prisma.syncLog.update({
      where: { id: log.id },
      data: { status: "failure", finishedAt: new Date(), message }
    });
    throw error;
  }
}

async function fetchRecentGarminData(): Promise<GarminPayload> {
  if (!process.env.GARMIN_EMAIL || !process.env.GARMIN_PASSWORD) {
    return {
      activities: [],
      healthMetrics: [],
      message:
        "Garmin credentials are not configured. The sync endpoint, logging, and upsert pipeline are ready; connect a Garmin client in this module when deploying the worker."
    };
  }

  return {
    activities: [],
    healthMetrics: [],
    message:
      "TODO: Wire a Garmin Connect client here. Keep credentials server-only and move this function to a worker if Vercel runtime limits make live Garmin auth unreliable."
  };
}
