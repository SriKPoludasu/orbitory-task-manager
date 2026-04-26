"use client";

import { Bell, LayoutDashboard, LogOut, Palette, Plus, Settings } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type UserWithMemberships = {
  name: string | null;
  email: string;
  image: string | null;
  memberships: { workspace: { name: string } }[];
};

export function AppShell({ children, user }: { children: React.ReactNode; user: UserWithMemberships }) {
  const { theme, setTheme } = useTheme();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const workspaceName = user.memberships[0]?.workspace.name ?? "Cloud Task";
  const mood = theme ?? "volt";
  const moods = [
    { id: "volt", label: "Volt Bloom", detail: "charged lime glass with high-contrast cards" },
    { id: "frost", label: "Frosted Ink", detail: "warm paper glass with amber highlights" },
    { id: "ember", label: "Solar Ember", detail: "amber graphite with a lava-glow edge" }
  ];
  const activeMood = moods.find((item) => item.id === mood) ?? moods[0];

  function cycleMood() {
    const index = moods.findIndex((item) => item.id === mood);
    setTheme(moods[(index + 1) % moods.length].id);
  }

  const notifications = [
    { title: "Signal Sprint is active", body: "Your main project has fresh task movement and comments.", tone: "Live" },
    { title: "Deadline pulse", body: "Three active tasks are due this week across the workspace.", tone: "Due soon" },
    { title: "Demo mode active", body: "The app is using portfolio demo data until Postgres is connected.", tone: "System" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-72 border-r bg-card/80 p-4 backdrop-blur-xl lg:block">
        <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">CT</div>
          <div>
            <p className="text-sm font-semibold">{workspaceName}</p>
            <p className="text-xs text-muted-foreground">Collaborative workspace</p>
          </div>
        </Link>
        <nav className="mt-8 space-y-1">
          <Link className="flex items-center gap-3 rounded-md bg-primary/10 px-3 py-2 text-sm font-semibold text-primary" href="/dashboard">
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
          <button
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
            onClick={() => setNotificationsOpen(true)}
          >
            <Bell className="h-4 w-4" /> Notifications
          </button>
          <button
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="h-4 w-4" /> Settings
          </button>
        </nav>
        <div className="absolute bottom-4 left-4 right-4 rounded-lg border bg-background p-3">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user.image ?? undefined} />
              <AvatarFallback name={user.name} />
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={cycleMood}>
              <Palette className="mr-2 h-3.5 w-3.5" />
              {activeMood.label.split(" ")[0]}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/sign-in" })}>
              <LogOut className="mr-2 h-3.5 w-3.5" /> Exit
            </Button>
          </div>
        </div>
      </aside>
      <header className="sticky top-0 z-20 border-b bg-background/85 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="font-semibold">{workspaceName}</Link>
          <Button size="sm" variant="outline" onClick={cycleMood}>Mood</Button>
        </div>
      </header>
      <main className="lg:pl-72">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
      <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
            <DialogDescription>Workspace signals that need your attention.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {notifications.map((item) => (
              <div key={item.title} className="rounded-lg border bg-background p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.body}</p>
                  </div>
                  <Badge>{item.tone}</Badge>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>Personalize your workspace view.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border bg-background p-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.image ?? undefined} />
                <AvatarFallback name={user.name} />
              </Avatar>
              <div className="min-w-0">
                <p className="font-semibold">{user.name}</p>
                <p className="truncate text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="rounded-lg border bg-background p-4">
              <p className="font-semibold">Mood</p>
              <p className="mt-1 text-sm text-muted-foreground">Pick a custom workspace atmosphere. Each mood changes the actual color system.</p>
              <div className="mt-4 grid gap-2">
                {moods.map((item) => (
                  <button
                    key={item.id}
                    className={`rounded-lg border p-3 text-left transition hover:bg-muted ${mood === item.id ? "border-primary bg-primary/10" : "bg-background"}`}
                    onClick={() => setTheme(item.id)}
                  >
                    <span className="block text-sm font-semibold">{item.label}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{item.detail}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-lg border bg-background p-4">
              <p className="font-semibold">Workspace</p>
              <p className="mt-1 text-sm text-muted-foreground">{workspaceName} is configured for portfolio demo collaboration.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Link
        href="/dashboard"
        className="fixed bottom-5 right-5 flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-soft lg:hidden"
        aria-label="Create"
      >
        <Plus className="h-5 w-5" />
      </Link>
    </div>
  );
}
