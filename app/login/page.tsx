import { redirect } from "next/navigation";
import { Card, PageHeader } from "@/components/ui";
import { getUserSession } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getUserSession();
  if (session?.user?.email) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Private Training Dashboard" subtitle="Sign in with Google to access the H2 2026 marathon cockpit." />
      <Card>
        <a
          href="/api/auth/signin/google?callbackUrl=/dashboard"
          className="block rounded bg-track px-4 py-3 text-center font-semibold text-asphalt hover:bg-green-200"
        >
          Continue with Google
        </a>
        <p className="mt-4 text-sm text-zinc-400">
          Configure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_SECRET`, and `NEXTAUTH_URL` before logging in locally.
        </p>
      </Card>
    </div>
  );
}
