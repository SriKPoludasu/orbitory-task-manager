import { createWorkspace } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function OnboardingPanel() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl items-center">
      <Card className="w-full overflow-hidden">
        <CardHeader>
          <CardTitle className="text-2xl">Create your first workspace</CardTitle>
          <CardDescription>Start with a team space, then add projects, tasks, and collaborators.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createWorkspace} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workspace-name">Workspace name</Label>
              <Input id="workspace-name" name="name" placeholder="Orbitory" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workspace-description">Description</Label>
              <Textarea id="workspace-description" name="description" placeholder="What your team is building." />
            </div>
            <Button type="submit">Create workspace</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
