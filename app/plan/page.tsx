import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { getActivitiesByDate, statusClass, workoutStatus } from "@/lib/training";
import { Card, PageHeader, inputClass } from "@/components/ui";

export default async function PlanPage({
  searchParams
}: {
  searchParams: Promise<{ week?: string; type?: string }>;
}) {
  await requireUser();
  const params = await searchParams;
  const plan = await prisma.trainingPlan.findFirst({
    orderBy: { raceDate: "desc" },
    include: { workouts: { orderBy: { date: "asc" } } }
  });

  if (!plan) {
    return <PageHeader title="Plan" subtitle="Run `npm run import-plan` to load the Excel training plan." />;
  }

  const activities = await getActivitiesByDate(plan.workouts[0].date, plan.workouts.at(-1)?.date ?? plan.raceDate);
  const types = Array.from(new Set(plan.workouts.map((workout) => workout.workoutType))).sort();
  const filtered = plan.workouts.filter((workout) => {
    const weekNumber = Math.floor((workout.date.getTime() - plan.workouts[0].date.getTime()) / 604800000) + 1;
    return (!params.week || weekNumber === Number(params.week)) && (!params.type || workout.workoutType === params.type);
  });

  return (
    <>
      <PageHeader title="Plan" subtitle={`${plan.name}. ${plan.workouts.length} daily workouts imported from ${plan.sourceFileName}.`} />
      <Card className="mb-4">
        <form className="grid gap-3 sm:grid-cols-3">
          <select name="week" defaultValue={params.week ?? ""} className={inputClass}>
            <option value="">All weeks</option>
            {Array.from({ length: 18 }, (_, index) => (
              <option key={index + 1} value={index + 1}>Week {index + 1}</option>
            ))}
          </select>
          <select name="type" defaultValue={params.type ?? ""} className={inputClass}>
            <option value="">All workout types</option>
            {types.map((type) => <option key={type}>{type}</option>)}
          </select>
          <button className="rounded border border-line px-4 py-2 text-sm text-zinc-100 hover:bg-asphalt">Filter</button>
        </form>
      </Card>
      <Card>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Week</th>
                <th>Type</th>
                <th>Planned</th>
                <th>Actual</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((workout) => {
                const activity = activities.get(workout.date.toISOString().slice(0, 10));
                const status = workoutStatus(workout, activity);
                const weekNumber = Math.floor((workout.date.getTime() - plan.workouts[0].date.getTime()) / 604800000) + 1;
                return (
                  <tr key={workout.id}>
                    <td className="whitespace-nowrap text-zinc-300">{formatDate(workout.date)}</td>
                    <td>{weekNumber}</td>
                    <td>{workout.workoutType}</td>
                    <td className="min-w-72 text-zinc-100">{workout.workoutText || "Rest"}</td>
                    <td>{activity ? `${activity.distanceMiles?.toFixed(1) ?? "-"} mi` : "-"}</td>
                    <td className={statusClass(status)}>{status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
