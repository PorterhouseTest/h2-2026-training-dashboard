import { MileageChart, TrendChart } from "@/components/charts";
import { Card, PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { dateKey, formatDate, secondsToPace } from "@/lib/date";
import { prisma } from "@/lib/prisma";

export default async function RunsPage() {
  await requireUser();
  const activities = await prisma.garminActivity.findMany({ orderBy: { activityDate: "desc" }, take: 100 });
  const weekly = new Map<string, number>();
  activities.forEach((activity) => {
    const week = dateKey(activity.activityDate).slice(0, 7);
    weekly.set(week, (weekly.get(week) ?? 0) + (activity.distanceMiles ?? 0));
  });
  const weeklyData = Array.from(weekly.entries()).reverse().map(([week, miles]) => ({ week, miles: Number(miles.toFixed(1)) }));
  const longRunData = activities
    .slice()
    .reverse()
    .map((activity) => ({ date: dateKey(activity.activityDate), miles: activity.distanceMiles ?? 0 }));
  const paceData = activities
    .slice()
    .reverse()
    .map((activity) => ({ date: dateKey(activity.activityDate), pace: activity.averagePaceSecondsPerMile ? activity.averagePaceSecondsPerMile / 60 : null }));

  return (
    <>
      <PageHeader title="Runs" subtitle="Garmin activities, mileage, long-run progression, and pace trends." />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2"><h2 className="mb-3 text-lg font-semibold text-white">Weekly Mileage</h2><MileageChart data={weeklyData} /></Card>
        <Card><h2 className="mb-3 text-lg font-semibold text-white">Long Run Progression</h2><TrendChart data={longRunData} dataKey="miles" label="Miles" /></Card>
        <Card className="lg:col-span-3"><h2 className="mb-3 text-lg font-semibold text-white">Pace Trend</h2><TrendChart data={paceData} dataKey="pace" label="Minutes per mile" /></Card>
      </div>
      <Card className="mt-6">
        <div className="overflow-x-auto">
          <table>
            <thead><tr><th>Date</th><th>Name</th><th>Distance</th><th>Pace</th><th>Duration</th><th>HR</th><th>Elevation</th></tr></thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity.id}>
                  <td>{formatDate(activity.activityDate)}</td>
                  <td>{activity.activityName}</td>
                  <td>{activity.distanceMiles?.toFixed(2) ?? "-"}</td>
                  <td>{secondsToPace(activity.averagePaceSecondsPerMile)}</td>
                  <td>{activity.durationSeconds ? Math.round(activity.durationSeconds / 60) : "-"} min</td>
                  <td>{activity.averageHeartRate ?? "-"}</td>
                  <td>{activity.elevationGainFeet?.toFixed(0) ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
