import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  action
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">{title}</h1>
        {subtitle ? <p className="mt-2 max-w-3xl text-sm text-zinc-400">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-lg border border-line bg-panel p-4 shadow-sm ${className}`}>{children}</section>;
}

export function Stat({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <Card>
      <div className="text-xs uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
      {detail ? <div className="mt-1 text-sm text-zinc-400">{detail}</div> : null}
    </Card>
  );
}

export function Field({
  label,
  children,
  className = ""
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`grid gap-1 text-sm text-zinc-300 ${className}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded border border-line bg-asphalt px-3 py-2 text-sm text-zinc-100 outline-none focus:border-track";

export const buttonClass =
  "rounded bg-track px-4 py-2 text-sm font-semibold text-asphalt hover:bg-green-200 disabled:cursor-not-allowed disabled:opacity-50";
