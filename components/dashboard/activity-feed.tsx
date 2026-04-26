import { Activity, Project, User } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ActivityFeed({ activities }: { activities: (Activity & { user: User; project: Project | null })[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>Decisions and updates from the team.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length ? (
          activities.map((activity) => (
            <div key={activity.id} className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={activity.user.image ?? undefined} />
                <AvatarFallback name={activity.user.name} />
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm">{activity.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatDistanceToNow(activity.createdAt, { addSuffix: true })}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">New updates will collect here.</div>
        )}
      </CardContent>
    </Card>
  );
}
