import { addDailyNote } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { Card, Field, PageHeader, buttonClass, inputClass } from "@/components/ui";

export default async function NotesPage() {
  await requireUser();
  const notes = await prisma.dailyNote.findMany({ orderBy: { date: "desc" }, take: 200 });

  return (
    <>
      <PageHeader title="Notes" subtitle="Date-specific notes for injury, sleep, travel, soreness, schedule, and other context." />
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card>
          <h2 className="text-lg font-semibold text-white">Add Note</h2>
          <form action={addDailyNote} className="mt-4 grid gap-3">
            <Field label="Date"><input name="date" type="date" required className={inputClass} /></Field>
            <Field label="Tag">
              <select name="tag" className={inputClass}>
                <option value="">None</option><option>injury</option><option>sleep</option><option>travel</option><option>soreness</option><option>schedule</option><option>other</option>
              </select>
            </Field>
            <Field label="Note"><textarea name="note" required rows={5} className={inputClass} /></Field>
            <button className={buttonClass}>Save note</button>
          </form>
        </Card>
        <Card>
          <h2 className="mb-3 text-lg font-semibold text-white">All Notes</h2>
          <div className="grid gap-3">
            {notes.map((note) => (
              <div key={note.id} className="rounded border border-line bg-asphalt p-3">
                <div className="text-sm text-zinc-500">{formatDate(note.date)} {note.tag ? `/${note.tag}` : ""}</div>
                <p className="mt-1 text-zinc-100">{note.note}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
