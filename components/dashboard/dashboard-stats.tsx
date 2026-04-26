import { CheckCircle2, Clock3, Flame, ListTodo, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const icons = {
  totalTasks: ListTodo,
  progress: TrendingUp,
  myTasks: CheckCircle2,
  overdue: Flame,
  upcoming: Clock3
};

export function DashboardStats({ stats }: { stats: { totalTasks: number; progress: number; myTasks: number; overdue: number; upcoming: number } }) {
  const cards = [
    { label: "Total tasks", value: stats.totalTasks, key: "totalTasks" },
    { label: "Progress", value: `${stats.progress}%`, key: "progress" },
    { label: "My active tasks", value: stats.myTasks, key: "myTasks" },
    { label: "Overdue", value: stats.overdue, key: "overdue" },
    { label: "Next 7 days", value: stats.upcoming, key: "upcoming" }
  ] as const;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = icons[card.key];
        return (
          <Card key={card.key} className="overflow-hidden">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="mt-2 text-2xl font-semibold">{card.value}</p>
              </div>
              <div className="rounded-md bg-primary/10 p-3 text-primary">
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
