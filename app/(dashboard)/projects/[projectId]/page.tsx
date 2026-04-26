import { notFound } from "next/navigation";
import { ProjectWorkspace } from "@/components/board/project-workspace";
import { getProjectData } from "@/lib/data";
import { requireUser } from "@/lib/current-user";

export default async function ProjectPage({ params }: { params: { projectId: string } }) {
  const user = await requireUser();
  const data = await getProjectData(params.projectId, user.id);
  if (!data) notFound();

  return <ProjectWorkspace project={data.project} members={data.members} />;
}
