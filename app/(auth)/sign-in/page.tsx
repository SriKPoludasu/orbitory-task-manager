import { Suspense } from "react";
import { SignInForm } from "@/components/sign-in-form";

export default function SignInPage() {
  return (
    <main className="volt neon-stage relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="neon-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 neon-line" />
      <div className="mx-auto grid min-h-screen w-full max-w-7xl items-center gap-10 px-4 py-10 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative z-10 space-y-8">
          <div className="inline-flex rounded-md neon-chip px-3 py-1 text-sm font-semibold text-lime-100">
            Cloud Task Manager / live command center
          </div>
          <div className="max-w-3xl space-y-5">
            <h1 className="neon-text text-5xl font-semibold tracking-normal sm:text-7xl">
              Move faster in a workspace that feels electric.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-lime-50/70">
              Plan launches, drag work across live boards, catch blockers early, and keep every decision glowing in context.
            </p>
          </div>
          <div className="grid max-w-3xl gap-4 sm:grid-cols-3">
            {[
              ["Live board", "Realtime task flow with drag and drop."],
              ["Team access", "Roles, invites, owners, and assignees."],
              ["Launch data", "Charts, deadlines, activity, and focus."]
            ].map(([item, copy]) => (
              <div key={item} className="rounded-lg neon-chip p-4 text-lime-50">
                <p className="text-sm font-semibold">{item}</p>
                <p className="mt-2 text-xs leading-5 text-lime-50/60">{copy}</p>
              </div>
            ))}
          </div>
        </section>
        <Suspense>
          <SignInForm />
        </Suspense>
      </div>
    </main>
  );
}
