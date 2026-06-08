import { manualGarminSync } from "@/lib/actions";
import { formatDate, formatShortDate, secondsToTime } from "@/lib/date";
import { getOverviewData, statusClass, workoutStatus } from "@/lib/training";
import { Card, PageHeader, Stat, buttonClass } from "@/components/ui";
import { requireUser } from "@/lib/auth";

export default async function DashboardPage() {
  await requireUser();
  const data = await getOverviewData();

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={`Marathon race day: ${formatDate(new Date("2026-10-17T12:00:00.000Z"))}`}
        action={
          <form action={manualGarminSync}>
            <button className={buttonClass}>Manual Garmin sync</button>
          </form>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Race countdown" value={`${data.daysToRace} days`} detail="October 17, 2026" />
        <Stat
          label="Current week"
          value={formatShortDate(data.currentWeekStart)}
          detail={`${formatShortDate(data.currentWeekStart)} - ${formatShortDate(data.weekEnd)}`}
        />
        <Stat label="This week planned" value={`${data.plannedMiles.toFixed(1)} mi`} detail="Parsed from Level 1" />
        <Stat label="This week actual" value={`${data.actualMiles.toFixed(1)} mi`} detail={`${data.completion}% plan completion`} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-white">Upcoming 7 Days</h2>
          <div className="mt-3 overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Workout</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.weekWorkouts.map((workout) => {
                  const status = workoutStatus(workout, undefined, data.today);
                  return (
                    <tr key={workout.id}>
                      <td className="whitespace-nowrap text-zinc-300">{formatShortDate(workout.date)}</td>
                      <td className="text-zinc-100">{workout.workoutText || "Rest"}</td>
                      <td className={statusClass(status)}>{status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-white">Race Prediction</h2>
          <div className="mt-4 grid gap-2 text-sm">
            <div className="flex justify-between"><span>5K</span><span>{secondsToTime(data.prediction.fiveK)}</span></div>
            <div className="flex justify-between"><span>10K</span><span>{secondsToTime(data.prediction.tenK)}</span></div>
            <div className="flex justify-between"><span>Half</span><span>{secondsToTime(data.prediction.half)}</span></div>
            <div className="flex justify-between"><span>Marathon</span><span>{secondsToTime(data.prediction.marathon)}</span></div>
          </div>
          <p className="mt-4 text-sm text-zinc-400">{data.prediction.explanation}</p>
          <p className="mt-3 text-xs uppercase tracking-wide text-cool">Confidence: {data.prediction.confidence}</p>
        </Card>
      </div>
    </>
  );
}
