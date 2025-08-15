import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { DashboardLayout } from "@/components/core/Layout";
import { IntegrationsPage } from "@/components/core/Integrations";

export default async function IntegrationsPageRoute({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const userProfile = await prisma.profile.findUnique({
    where: {
      id: user.id,
    },
    include: {
      projects: true,
    },
  });

  if (!userProfile || userProfile.projects.length === 0) {
    return redirect("/projects/create");
  }

  const { projects } = userProfile;
  let selectedProject;

  // Await searchParams to fix Next.js async issue
  const params = await searchParams;
  
  if (params.project) {
    selectedProject = projects.find((p) => p.id === params.project);
    // Update default project if different from current default
    if (selectedProject && selectedProject.id !== userProfile.defaultProjectId) {
      await prisma.profile.update({
        where: { id: user.id },
        data: { 
          defaultProjectId: selectedProject.id
        },
      });
    }
  } else if (userProfile.defaultProjectId) {
    selectedProject = projects.find((p) => p.id === userProfile.defaultProjectId);
  } else {
    selectedProject = projects[0];
  }
  
  if(!selectedProject) {
    selectedProject = projects[0];
  }

  return (
    <DashboardLayout
      user={user}
      projects={projects}
      selectedProject={selectedProject}
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Integrations", href: "/dashboard/integrations", isActive: true }
      ]}
    >
      <IntegrationsPage selectedProject={selectedProject} />
    </DashboardLayout>
  );
} 