import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";

const prisma = new PrismaClient();

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const RACE_DATE = new Date("2026-10-17T12:00:00.000Z");
const FINAL_WEEK_START = new Date("2026-10-11T12:00:00.000Z");
const PLAN_START = addDays(FINAL_WEEK_START, -17 * 7);
const PLAN_FILE = path.join(process.cwd(), "data", "marathon_training_plans_editable.xlsx");

type ParsedWorkout = {
  date: Date;
  weekStartDate: Date;
  dayOfWeek: string;
  workoutText: string;
  workoutType: string;
  plannedDistanceMiles: number | null;
  plannedDurationMinutes: number | null;
  intensityLabel: string | null;
  isRaceDay: boolean;
};

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function excelSerialToDate(serial: number) {
  const epoch = new Date(Date.UTC(1899, 11, 30, 12));
  return addDays(epoch, Math.floor(serial));
}

function normalizeCell(value: unknown) {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).replace(/\r\n/g, "\n").trim();
}

function inferWorkoutType(text: string, dayOfWeek: string) {
  const lower = text.toLowerCase();
  if (!text || lower.includes("rest")) return "Rest";
  if (lower.includes("marathon") || lower.includes("race")) return "Race";
  if (lower.includes("long") || dayOfWeek === "Saturday") return "Long Run";
  if (lower.includes("easy")) return "Easy Run";
  if (/(cv|ltp|vhi|mas|ssp|5kp|10kp|hmp|tempo|interval|repeat|fartlek|hill)/i.test(text)) return "Workout";
  if (/\b(mile|miles|mi|minute|minutes|min|:)\b/i.test(text)) return "Easy Run";
  return "Other";
}

function inferDistance(text: string) {
  const match = text.match(/(\d+(?:\.\d+)?)\s*(?:miles?|mi)\b/i);
  return match ? Number(match[1]) : null;
}

function inferDuration(text: string) {
  const minuteMatch = text.match(/(\d+)\s*(?:minutes?|mins?)\b/i);
  if (minuteMatch) return Number(minuteMatch[1]);

  const clockMatch = text.match(/\b(\d{1,2}):(\d{2})(?::\d{2})?\b/);
  if (!clockMatch) return null;
  return Math.round(Number(clockMatch[1]) + Number(clockMatch[2]) / 60);
}

function inferIntensity(text: string) {
  const match = text.match(/\b(CV|LTP|VHI|MAS|SSP|5KP|10KP|HMP)\b/i);
  return match ? match[1].toUpperCase() : null;
}

function parsePlanRows(): ParsedWorkout[] {
  const workbook = XLSX.readFile(PLAN_FILE, { cellDates: true });
  const sheet = workbook.Sheets["Level 1"];
  if (!sheet) {
    throw new Error(`Could not find the "Level 1" sheet in ${PLAN_FILE}`);
  }

  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: false
  });

  const headerIndex = rows.findIndex((row) => {
    const cells = row.map((cell) => normalizeCell(cell).toLowerCase());
    return cells.includes("week") && DAYS.every((day) => cells.includes(day.toLowerCase()));
  });

  if (headerIndex < 0) {
    throw new Error("Could not locate the Week/Sunday...Saturday header row.");
  }

  const header = rows[headerIndex].map(normalizeCell);
  const weekColumn = header.findIndex((cell) => cell.toLowerCase() === "week");
  const dayColumns = DAYS.map((day) => header.findIndex((cell) => cell.toLowerCase() === day.toLowerCase()));

  const workouts: ParsedWorkout[] = [];
  let parsedWeeks = 0;
  for (const row of rows.slice(headerIndex + 1)) {
    const rawWeekValue = normalizeCell(row[weekColumn]);
    const numericWeekValue = Number(rawWeekValue.replace(/[^\d.]/g, ""));
    const hasWorkoutText = dayColumns.some((columnIndex) => normalizeCell(row[columnIndex]));
    if (!rawWeekValue || !hasWorkoutText || parsedWeeks >= 18) continue;

    const weekStartDate =
      Number.isFinite(numericWeekValue) && numericWeekValue > 30000
        ? excelSerialToDate(numericWeekValue)
        : Number.isInteger(numericWeekValue) && numericWeekValue >= 1 && numericWeekValue <= 18
          ? addDays(PLAN_START, (numericWeekValue - 1) * 7)
          : addDays(PLAN_START, parsedWeeks * 7);

    parsedWeeks += 1;
    dayColumns.forEach((columnIndex, dayIndex) => {
      const workoutText = normalizeCell(row[columnIndex]);
      const date = addDays(weekStartDate, dayIndex);
      const dayOfWeek = DAYS[dayIndex];
      workouts.push({
        date,
        weekStartDate,
        dayOfWeek,
        workoutText,
        workoutType: inferWorkoutType(workoutText, dayOfWeek),
        plannedDistanceMiles: inferDistance(workoutText),
        plannedDurationMinutes: inferDuration(workoutText),
        intensityLabel: inferIntensity(workoutText),
        isRaceDay: date.toISOString().slice(0, 10) === "2026-10-17" || /marathon race/i.test(workoutText)
      });
    });
  }

  if (workouts.length !== 18 * 7) {
    throw new Error(`Expected 126 planned workouts, found ${workouts.length}.`);
  }

  return workouts;
}

export async function importTrainingPlan() {
  const workouts = parsePlanRows();

  await prisma.$transaction(async (tx) => {
    const existing = await tx.trainingPlan.findFirst({
      where: { name: "H2 2026 Marathon - Level 1" }
    });

    if (existing) {
      await tx.plannedWorkout.deleteMany({ where: { trainingPlanId: existing.id } });
      await tx.trainingPlan.delete({ where: { id: existing.id } });
    }

    const plan = await tx.trainingPlan.create({
      data: {
        name: "H2 2026 Marathon - Level 1",
        raceDate: RACE_DATE,
        sourceFileName: "marathon_training_plans_editable.xlsx"
      }
    });

    await tx.plannedWorkout.createMany({
      data: workouts.map((workout) => ({
        trainingPlanId: plan.id,
        ...workout
      }))
    });
  });

  return workouts.length;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  importTrainingPlan()
    .then((count) => {
      console.log(`Imported ${count} planned workouts from Level 1.`);
    })
    .finally(async () => prisma.$disconnect());
}
