import Link from "next/link";
import { getUserSession } from "@/lib/auth";

const links = [
  ["Dashboard", "/dashboard"],
  ["Plan", "/plan"],
  ["Calendar", "/calendar"],
  ["Runs", "/runs"],
  ["BJJ", "/bjj"],
  ["Strength", "/strength"],
  ["Weight", "/weight"],
  ["Notes", "/notes"],
  ["Recovery", "/recovery"],
  ["Settings", "/settings"]
];

export async function Nav() {
  const session = await getUserSession();

  return (
    <header className="border-b border-line bg-asphalt/95">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/dashboard" className="text-lg font-semibold tracking-normal text-zinc-50">
            H2 2026 Training Dashboard
          </Link>
          <div className="text-sm text-zinc-400">
            {session?.user?.email ? (
              <a href="/api/auth/signout" className="rounded border border-line px-3 py-2 text-zinc-200 hover:bg-panel">
                Sign out
              </a>
            ) : (
              <a
                href="/api/auth/signin/google?callbackUrl=/dashboard"
                className="rounded border border-track px-3 py-2 text-track hover:bg-track hover:text-asphalt"
              >
                Google login
              </a>
            )}
          </div>
        </div>
        {session?.user?.email ? (
          <nav className="flex gap-2 overflow-x-auto text-sm text-zinc-300">
            {links.map(([label, href]) => (
              <Link key={href} href={href} className="whitespace-nowrap rounded px-3 py-2 hover:bg-panel hover:text-white">
                {label}
              </Link>
            ))}
          </nav>
        ) : null}
      </div>
    </header>
  );
}
