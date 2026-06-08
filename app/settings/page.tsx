import { manualGarminSync } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { Card, PageHeader, buttonClass } from "@/components/ui";

const glossary = [
  ["CV", "Critical velocity"],
  ["LTP", "Lactate threshold pace"],
  ["VHI", "Very high intensity"],
  ["MAS", "Max aerobic speed"],
  ["SSP", "Steady state pace"],
  ["5KP", "5K pace"],
  ["10KP", "10K pace"],
  ["HMP", "Half marathon pace"]
];

export default async function SettingsPage() {
  await requireUser();
  const [latestSync, plan] = await Promise.all([
    prisma.syncLog.findFirst({ where: { source: "garmin" }, orderBy: { startedAt: "desc" } }),
    prisma.trainingPlan.findFirst({ orderBy: { createdAt: "desc" }, include: { _count: { select: { workouts: true } } } })
  ]);

  return (
    <>
      <PageHeader title="Settings" subtitle="Sync status, import status, and workout abbreviation glossary." />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <h2 className="text-lg font-semibold text-white">Garmin Sync</h2>
          <p className="mt-3 text-sm text-zinc-300">{latestSync?.status ?? "No sync yet"}</p>
          <p className="mt-1 text-sm text-zinc-500">{latestSync ? formatDate(latestSync.startedAt) : "Waiting for first run"}</p>
          <p className="mt-3 text-sm text-zinc-400">{latestSync?.message ?? "Protected by GARMIN_SYNC_SECRET or CRON_SECRET."}</p>
          <form action={manualGarminSync} className="mt-4"><button className={buttonClass}>Sync now</button></form>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-white">Training Plan</h2>
          <p className="mt-3 text-sm text-zinc-300">{plan?.name ?? "No plan imported"}</p>
          <p className="mt-1 text-sm text-zinc-500">{plan ? `${plan._count.workouts} daily workouts from ${plan.sourceFileName}` : "Run npm run import-plan"}</p>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-white">Pace Glossary</h2>
          <div className="mt-3 grid gap-2 text-sm">
            {glossary.map(([abbr, meaning]) => (
              <div key={abbr} className="flex justify-between gap-4 border-b border-line pb-2 last:border-0">
                <span className="font-semibold text-track">{abbr}</span>
                <span className="text-right text-zinc-300">{meaning}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
