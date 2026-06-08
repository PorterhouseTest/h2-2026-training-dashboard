import { addBjjSession } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { Card, Field, PageHeader, buttonClass, inputClass } from "@/components/ui";

export default async function BjjPage() {
  await requireUser();
  const sessions = await prisma.bjjSession.findMany({ orderBy: { date: "desc" }, take: 100 });
  const weeklyLoad = sessions.reduce((sum, session) => sum + (session.intensity ?? 0) + (session.hardRounds ?? 0), 0);

  return (
    <>
      <PageHeader title="BJJ" subtitle="Log teaching, training, rolling, competition, and weekly grappling load." />
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card>
          <h2 className="text-lg font-semibold text-white">Add Session</h2>
          <form action={addBjjSession} className="mt-4 grid gap-3">
            <Field label="Date"><input name="date" type="date" required className={inputClass} /></Field>
            <Field label="Style">
              <select name="style" className={inputClass}>
                <option>Gi</option><option value="NoGi">No Gi</option><option>MMA</option><option value="OpenMat">Open Mat</option><option>Other</option>
              </select>
            </Field>
            <Field label="Role">
              <select name="role" className={inputClass}>
                <option>Taught</option><option>Trained</option><option>Rolled</option><option>Competed</option><option>Other</option>
              </select>
            </Field>
            <Field label="Intensity"><input name="intensity" type="number" min="1" max="5" className={inputClass} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Rounds"><input name="roundsRolled" type="number" min="0" className={inputClass} /></Field>
              <Field label="Hard rounds"><input name="hardRounds" type="number" min="0" className={inputClass} /></Field>
            </div>
            <Field label="Notes"><textarea name="notes" rows={3} className={inputClass} /></Field>
            <button className={buttonClass}>Save BJJ</button>
          </form>
        </Card>
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Sessions</h2>
            <span className="text-sm text-zinc-400">Load score: {weeklyLoad}</span>
          </div>
          <div className="overflow-x-auto">
            <table>
              <thead><tr><th>Date</th><th>Style</th><th>Role</th><th>Intensity</th><th>Rounds</th><th>Notes</th></tr></thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id}>
                    <td>{formatDate(session.date)}</td>
                    <td>{session.style}</td>
                    <td>{session.role}</td>
                    <td>{session.intensity ?? "-"}</td>
                    <td>{session.roundsRolled ?? "-"} / {session.hardRounds ?? "-"}</td>
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
