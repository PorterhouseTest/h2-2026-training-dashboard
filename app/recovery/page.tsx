import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { Card, PageHeader } from "@/components/ui";

export default async function RecoveryPage() {
  await requireUser();
  const [metrics, bjj, strength, notes] = await Promise.all([
    prisma.dailyHealthMetric.findMany({ orderBy: { date: "desc" }, take: 30 }),
    prisma.bjjSession.findMany({ orderBy: { date: "desc" }, take: 10 }),
    prisma.strengthSession.findMany({ orderBy: { date: "desc" }, take: 10 }),
    prisma.dailyNote.findMany({ orderBy: { date: "desc" }, take: 10 })
  ]);

  return (
    <>
      <PageHeader title="Recovery" subtitle="Garmin health metrics with recent BJJ, strength, and note context." />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-3 text-lg font-semibold text-white">Health Metrics</h2>
          <div className="overflow-x-auto">
            <table>
              <thead><tr><th>Date</th><th>HRV</th><th>Resting HR</th><th>Sleep</th><th>Stress</th><th>Body Battery</th><th>Readiness</th></tr></thead>
              <tbody>
                {metrics.map((metric) => (
                  <tr key={metric.id}>
                    <td>{formatDate(metric.date)}</td>
                    <td>{metric.hrv ?? "-"}</td>
                    <td>{metric.restingHeartRate ?? "-"}</td>
                    <td>{metric.sleepScore ?? "-"}</td>
                    <td>{metric.stressScore ?? "-"}</td>
                    <td>{metric.bodyBattery ?? "-"}</td>
                    <td>{metric.trainingReadiness ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-white">Load Context</h2>
          <div className="mt-3 space-y-4 text-sm">
            <div>
              <h3 className="font-semibold text-zinc-200">BJJ</h3>
              {bjj.map((item) => <p key={item.id} className="text-zinc-400">{formatDate(item.date)} {item.role} intensity {item.intensity ?? "-"}</p>)}
            </div>
            <div>
              <h3 className="font-semibold text-zinc-200">Strength</h3>
              {strength.map((item) => <p key={item.id} className="text-zinc-400">{formatDate(item.date)} {item.workoutName ?? "Session"}</p>)}
            </div>
            <div>
              <h3 className="font-semibold text-zinc-200">Notes</h3>
              {notes.map((item) => <p key={item.id} className="text-zinc-400">{formatDate(item.date)} {item.tag ? `${item.tag}: ` : ""}{item.note}</p>)}
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
