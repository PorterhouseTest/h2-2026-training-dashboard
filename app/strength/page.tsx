import { addStrengthSession } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { Card, Field, PageHeader, buttonClass, inputClass } from "@/components/ui";

export default async function StrengthPage() {
  await requireUser();
  const sessions = await prisma.strengthSession.findMany({
    orderBy: { date: "desc" },
    include: { exercises: true },
    take: 100
  });

  return (
    <>
      <PageHeader title="Strength" subtitle="Track strength sessions, exercises, loading, RPE, and pain notes." />
      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        <Card>
          <h2 className="text-lg font-semibold text-white">Add Session</h2>
          <form action={addStrengthSession} className="mt-4 grid gap-3">
            <Field label="Date"><input name="date" type="date" required className={inputClass} /></Field>
            <Field label="Workout"><input name="workoutName" className={inputClass} placeholder="Lower, upper, prehab..." /></Field>
            <Field label="Exercise"><input name="exerciseName" className={inputClass} placeholder="Trap bar deadlift" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Sets"><input name="sets" type="number" min="0" className={inputClass} /></Field>
              <Field label="Reps"><input name="reps" type="number" min="0" className={inputClass} /></Field>
              <Field label="Weight"><input name="weight" type="number" min="0" step="0.5" className={inputClass} /></Field>
              <Field label="RPE"><input name="rpe" type="number" min="0" max="10" step="0.5" className={inputClass} /></Field>
            </div>
            <Field label="Pain notes"><input name="painNotes" className={inputClass} /></Field>
            <Field label="Session notes"><textarea name="notes" rows={3} className={inputClass} /></Field>
            <button className={buttonClass}>Save strength</button>
          </form>
        </Card>
        <Card>
          <h2 className="mb-3 text-lg font-semibold text-white">Sessions</h2>
          <div className="overflow-x-auto">
            <table>
              <thead><tr><th>Date</th><th>Workout</th><th>Exercises</th><th>Notes</th></tr></thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id}>
                    <td>{formatDate(session.date)}</td>
                    <td>{session.workoutName ?? "-"}</td>
                    <td>
                      {session.exercises.length
                        ? session.exercises.map((exercise) => `${exercise.exerciseName} ${exercise.sets ?? "-"}x${exercise.reps ?? "-"}`).join(", ")
                        : "-"}
                    </td>
                    <td>{session.notes ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
