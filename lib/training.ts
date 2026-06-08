import type { GarminActivity, PlannedWorkout } from "@prisma/client";
import { addDays, dateKey, RACE_DATE, startOfSundayWeek } from "./date";
import { prisma } from "./prisma";

export type WorkoutStatus = "Complete" | "Partial" | "Missed" | "Upcoming" | "Rest" | "Over";

export function workoutStatus(workout: PlannedWorkout, activity?: GarminActivity | null, today = new Date()) {
  if (workout.workoutType === "Rest") return "Rest";
  if (workout.date > today) return "Upcoming";
  if (!activity) return "Missed";

  const plannedDistance = workout.plannedDistanceMiles;
  if (plannedDistance && activity.distanceMiles) {
    if (activity.distanceMiles >= plannedDistance * 1.15) return "Over";
    if (activity.distanceMiles >= plannedDistance * 0.8) return "Complete";
    return "Partial";
  }

  if (workout.plannedDurationMinutes && activity.durationSeconds) {
    const actualMinutes = activity.durationSeconds / 60;
    if (actualMinutes >= workout.plannedDurationMinutes * 0.8) return "Complete";
    return "Partial";
  }

  return "Complete";
}

export function statusClass(status: WorkoutStatus) {
  return {
    Complete: "text-track",
    Partial: "text-caution",
    Missed: "text-red-300",
    Upcoming: "text-cool",
    Rest: "text-zinc-400",
    Over: "text-amber-300"
  }[status];
}

export async function getLatestPlan() {
  return prisma.trainingPlan.findFirst({ orderBy: { raceDate: "desc" } });
}

export async function getPlanWithWorkouts() {
  return prisma.trainingPlan.findFirst({
    orderBy: { raceDate: "desc" },
    include: {
      workouts: {
        orderBy: { date: "asc" }
      }
    }
  });
}

export async function getActivitiesByDate(start: Date, end: Date) {
  const activities = await prisma.garminActivity.findMany({
    where: {
      activityDate: { gte: start, lte: end }
    },
    orderBy: { activityDate: "asc" }
  });

  return new Map(activities.map((activity) => [dateKey(activity.activityDate), activity]));
}

export async function getOverviewData() {
  const today = new Date();
  const plan = await getPlanWithWorkouts();
  const firstWorkout = plan?.workouts[0];
  const lastWorkout = plan?.workouts.at(-1);
  const fallbackWeek = firstWorkout?.weekStartDate ?? startOfSundayWeek(today);
  const naturalWeek = startOfSundayWeek(today);
  const currentWeekStart =
    firstWorkout && today < firstWorkout.date
      ? fallbackWeek
      : lastWorkout && today > lastWorkout.date
        ? lastWorkout.weekStartDate
        : naturalWeek;
  const weekEnd = addDays(currentWeekStart, 6);
  const weekWorkouts =
    plan?.workouts.filter((workout) => workout.date >= currentWeekStart && workout.date <= weekEnd) ?? [];

  const [activities, latestSync, latestWeight, notes, health, allActivities] = await Promise.all([
    prisma.garminActivity.findMany({
      where: { activityDate: { gte: currentWeekStart, lte: weekEnd } },
      orderBy: { activityDate: "asc" }
    }),
    prisma.syncLog.findFirst({ where: { source: "garmin" }, orderBy: { startedAt: "desc" } }),
    prisma.weeklyWeight.findFirst({ orderBy: { weekStartDate: "desc" } }),
    prisma.dailyNote.findMany({ orderBy: { date: "desc" }, take: 5 }),
    prisma.dailyHealthMetric.findFirst({ orderBy: { date: "desc" } }),
    prisma.garminActivity.findMany({ orderBy: { activityDate: "desc" }, take: 30 })
  ]);

  const activityMap = new Map(activities.map((activity) => [dateKey(activity.activityDate), activity]));
  const plannedMiles = weekWorkouts.reduce((sum, workout) => sum + (workout.plannedDistanceMiles ?? 0), 0);
  const actualMiles = activities.reduce((sum, activity) => sum + (activity.distanceMiles ?? 0), 0);
  const completedPast =
    plan?.workouts.filter((workout) => {
      if (workout.date > today || workout.workoutType === "Rest") return false;
      const status = workoutStatus(workout, activityMap.get(dateKey(workout.date)), today);
      return status === "Complete" || status === "Over";
    }).length ?? 0;
  const requiredPast =
    plan?.workouts.filter((workout) => workout.date <= today && workout.workoutType !== "Rest").length ?? 0;
  const completion = requiredPast ? Math.round((completedPast / requiredPast) * 100) : 0;

  return {
    plan,
    today,
    daysToRace: Math.max(0, Math.ceil((RACE_DATE.getTime() - today.getTime()) / 86400000)),
    currentWeekStart,
    weekEnd,
    weekWorkouts,
    plannedMiles,
    actualMiles,
    completion,
    latestSync,
    latestWeight,
    notes,
    health,
    prediction: buildRacePrediction(allActivities, completion)
  };
}

export function buildRacePrediction(activities: GarminActivity[], completion: number) {
  const runs = activities
    .filter((activity) => activity.distanceMiles && activity.distanceMiles > 0 && activity.durationSeconds)
    .slice(0, 12);

  if (runs.length < 3) {
    return {
      confidence: "Low" as const,
      explanation: "Not enough data yet. Import recent Garmin runs to unlock rolling estimates.",
      marathon: null,
      half: null,
      tenK: null,
      fiveK: null
    };
  }

  const bestEffort = runs.reduce((best, activity) => {
    const pace = (activity.durationSeconds ?? 0) / (activity.distanceMiles ?? 1);
    return !best || pace < (best.durationSeconds ?? 0) / (best.distanceMiles ?? 1) ? activity : best;
  }, runs[0]);

  const sourceDistance = Math.max(bestEffort.distanceMiles ?? 1, 1);
  const sourceSeconds = bestEffort.durationSeconds ?? sourceDistance * 600;
  const estimate = (targetMiles: number) => Math.round(sourceSeconds * Math.pow(targetMiles / sourceDistance, 1.06));
  const longRun = Math.max(...runs.map((run) => run.distanceMiles ?? 0));

  return {
    confidence: runs.length >= 8 && longRun >= 12 && completion >= 70 ? ("Medium" as const) : ("Low" as const),
    explanation: `Based on ${runs.length} recent Garmin runs, using the strongest recent run and a Riegel-style distance adjustment. Confidence improves after longer runs and more completed plan workouts.`,
    marathon: estimate(26.2),
    half: estimate(13.1),
    tenK: estimate(6.214),
    fiveK: estimate(3.107)
  };
}
