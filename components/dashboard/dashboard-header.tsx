import { Workspace, WorkspaceMember, User } from "@prisma/client";
import { InviteDialog } from "@/components/dashboard/invite-dialog";
import { ProfileDialog } from "@/components/dashboard/profile-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function DashboardHeader({ workspace, members }: { workspace: Workspace; members: (WorkspaceMember & { user: User })[] }) {
  return (
    <section className="overflow-hidden rounded-lg border bg-card p-6 shadow-panel">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-2">
          <p className="text-sm font-semibold text-primary">Workspace dashboard</p>
          <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">{workspace.name}</h1>
          <p className="text-muted-foreground">{workspace.description ?? "Plan, discuss, and ship your highest-priority work."}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <InviteDialog workspaceId={workspace.id} />
          <ProfileDialog />
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex -space-x-2">
          {members.slice(0, 5).map((member) => (
            <Avatar key={member.id} className="border-2 border-card">
              <AvatarImage src={member.user.image ?? undefined} />
              <AvatarFallback name={member.user.name} />
            </Avatar>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">{members.length} team members collaborating today</p>
      </div>
    </section>
  );
}
