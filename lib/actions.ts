"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "./auth";
import { parseInputDate, startOfSundayWeek } from "./date";
import { runGarminSync } from "./garmin";
import { prisma } from "./prisma";

const optionalNumber = (value: FormDataEntryValue | null) => {
  if (!value || typeof value !== "string" || value.trim() === "") return undefined;
  return Number(value);
};

const bjjSchema = z.object({
  style: z.enum(["Gi", "NoGi", "MMA", "OpenMat", "Other"]),
  role: z.enum(["Taught", "Trained", "Rolled", "Competed", "Other"]),
  intensity: z.number().int().min(1).max(5).optional(),
  roundsRolled: z.number().int().min(0).optional(),
  hardRounds: z.number().int().min(0).optional(),
  notes: z.string().optional()
});

export async function addBjjSession(formData: FormData) {
  await requireUser();
  const date = parseInputDate(formData.get("date"));
  const payload = bjjSchema.parse({
    style: formData.get("style"),
    role: formData.get("role"),
    intensity: optionalNumber(formData.get("intensity")),
    roundsRolled: optionalNumber(formData.get("roundsRolled")),
    hardRounds: optionalNumber(formData.get("hardRounds")),
    notes: String(formData.get("notes") ?? "") || undefined
  });
  await prisma.bjjSession.create({ data: { date, ...payload } });
  revalidatePath("/bjj");
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
}

export async function addStrengthSession(formData: FormData) {
  await requireUser();
  const date = parseInputDate(formData.get("date"));
  const exerciseName = String(formData.get("exerciseName") ?? "").trim();
  await prisma.strengthSession.create({
    data: {
      date,
      workoutName: String(formData.get("workoutName") ?? "") || undefined,
      notes: String(formData.get("notes") ?? "") || undefined,
      exercises: exerciseName
        ? {
            create: {
              exerciseName,
              sets: optionalNumber(formData.get("sets")),
              reps: optionalNumber(formData.get("reps")),
              weight: optionalNumber(formData.get("weight")),
              rpe: optionalNumber(formData.get("rpe")),
              painNotes: String(formData.get("painNotes") ?? "") || undefined
            }
          }
        : undefined
    }
  });
  revalidatePath("/strength");
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
}

export async function addWeeklyWeight(formData: FormData) {
  await requireUser();
  const dateLogged = parseInputDate(formData.get("dateLogged"));
  const weekStartDate = startOfSundayWeek(dateLogged);
  const weight = Number(formData.get("weight"));
  await prisma.weeklyWeight.upsert({
    where: { weekStartDate },
    update: {
      dateLogged,
      weight,
      notes: String(formData.get("notes") ?? "") || undefined
    },
    create: {
      weekStartDate,
      dateLogged,
      weight,
      notes: String(formData.get("notes") ?? "") || undefined
    }
  });
  revalidatePath("/weight");
  revalidatePath("/dashboard");
}

export async function addDailyNote(formData: FormData) {
  await requireUser();
  await prisma.dailyNote.create({
    data: {
      date: parseInputDate(formData.get("date")),
      note: String(formData.get("note") ?? ""),
      tag: String(formData.get("tag") ?? "") || undefined
    }
  });
  revalidatePath("/notes");
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
}

export async function manualGarminSync() {
  await requireUser();
  await runGarminSync("manual-ui");
  revalidatePath("/dashboard");
  revalidatePath("/settings");
  revalidatePath("/runs");
  revalidatePath("/recovery");
}
