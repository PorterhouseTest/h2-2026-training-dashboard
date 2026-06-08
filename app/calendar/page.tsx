import { addDailyNote } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { addDays, dateKey, formatShortDate, startOfSundayWeek } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { Card, Field, PageHeader, buttonClass, inputClass } from "@/components/ui";

export default async function CalendarPage() {
  await requireUser();
  const today = new Date();
  const start = startOfSundayWeek(today);
  const end = addDays(start, 41);
  const [workouts, activities, bjj, strength, weights, notes] = await Promise.all([
    prisma.plannedWorkout.findMany({ where: { date: { gte: start, lte: end } }, orderBy: { date: "asc" } }),
    prisma.garminActivity.findMany({ where: { activityDate: { gte: start, lte: end } }, orderBy: { activityDate: "asc" } }),
    prisma.bjjSession.findMany({ where: { date: { gte: start, lte: end } }, orderBy: { date: "asc" } }),
    prisma.strengthSession.findMany({ where: { date: { gte: start, lte: end } }, orderBy: { date: "asc" } }),
    prisma.weeklyWeight.findMany({ where: { dateLogged: { gte: start, lte: end } }, orderBy: { dateLogged: "asc" } }),
    prisma.dailyNote.findMany({ where: { date: { gte: start, lte: end } }, orderBy: { date: "asc" } })
  ]);

  const cells = Array.from({ length: 42 }, (_, index) => addDays(start, index));

  return (
    <>
      <PageHeader title="Calendar" subtitle="Six-week rolling view of planned runs, actuals, BJJ, strength, weekly weight, and notes." />
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {cells.map((date) => {
            const key = dateKey(date);
            const dayWorkouts = workouts.filter((item) => dateKey(item.date) === key);
            const dayActivities = activities.filter((item) => dateKey(item.activityDate) === key);
            const dayBjj = bjj.filter((item) => dateKey(item.date) === key);
            const dayStrength = strength.filter((item) => dateKey(item.date) === key);
            const dayWeights = weights.filter((item) => dateKey(item.dateLogged) === key);
            const dayNotes = notes.filter((item) => dateKey(item.date) === key);
            return (
              <Card key={key} className="min-h-44">
                <div className="text-sm font-semibold text-white">{formatShortDate(date)}</div>
                <div className="mt-2 space-y-2 text-xs text-zinc-300">
                  {dayWorkouts.map((item) => <p key={item.id} className="text-cool">{item.workoutText || "Rest"}</p>)}
                  {dayActivities.map((item) => <p key={item.id} className="text-track">Run {item.distanceMiles?.toFixed(1) ?? "-"} mi</p>)}
                  {dayBjj.map((item) => <p key={item.id}>BJJ {item.style} / {item.role}</p>)}
                  {dayStrength.map((item) => <p key={item.id}>Strength {item.workoutName ?? ""}</p>)}
                  {dayWeights.map((item) => <p key={item.id}>Weight {item.weight}</p>)}
                  {dayNotes.map((item) => <p key={item.id} className="text-caution">{item.tag ? `${item.tag}: ` : ""}{item.note}</p>)}
                </div>
              </Card>
            );
          })}
        </div>
        <Card>
          <h2 className="text-lg font-semibold text-white">Add Note</h2>
          <form action={addDailyNote} className="mt-4 grid gap-3">
            <Field label="Date"><input name="date" type="date" required className={inputClass} /></Field>
            <Field label="Tag">
              <select name="tag" className={inputClass}>
                <option value="">None</option>
                <option>injury</option>
                <option>sleep</option>
                <option>travel</option>
                <option>soreness</option>
                <option>schedule</option>
                <option>other</option>
              </select>
            </Field>
            <Field label="Note"><textarea name="note" required rows={4} className={inputClass} /></Field>
            <button className={buttonClass}>Save note</button>
          </form>
        </Card>
      </div>
    </>
  );
}
