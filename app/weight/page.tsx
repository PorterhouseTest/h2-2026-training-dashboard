import { TrendChart } from "@/components/charts";
import { Card, Field, PageHeader, buttonClass, inputClass } from "@/components/ui";
import { addWeeklyWeight } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { dateKey, formatDate } from "@/lib/date";
import { prisma } from "@/lib/prisma";

export default async function WeightPage() {
  await requireUser();
  const weights = await prisma.weeklyWeight.findMany({ orderBy: { weekStartDate: "asc" } });
  const chartData = weights.map((entry) => ({ date: dateKey(entry.weekStartDate), weight: entry.weight }));

  return (
    <>
      <PageHeader title="Weight" subtitle="Weekly weight only, one entry per week." />
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card>
          <h2 className="text-lg font-semibold text-white">Weekly Entry</h2>
          <form action={addWeeklyWeight} className="mt-4 grid gap-3">
            <Field label="Date logged"><input name="dateLogged" type="date" required className={inputClass} /></Field>
            <Field label="Weight"><input name="weight" type="number" step="0.1" required className={inputClass} /></Field>
            <Field label="Notes"><textarea name="notes" rows={3} className={inputClass} /></Field>
            <button className={buttonClass}>Save weight</button>
          </form>
        </Card>
        <Card>
          <h2 className="mb-3 text-lg font-semibold text-white">Trend</h2>
          <TrendChart data={chartData} dataKey="weight" label="Weight" />
          <div className="mt-4 overflow-x-auto">
            <table>
              <thead><tr><th>Week</th><th>Date logged</th><th>Weight</th><th>Notes</th></tr></thead>
              <tbody>
                {weights.map((entry) => (
                  <tr key={entry.id}>
                    <td>{formatDate(entry.weekStartDate)}</td>
                    <td>{formatDate(entry.dateLogged)}</td>
                    <td>{entry.weight}</td>
                    <td>{entry.notes ?? ""}</td>
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
