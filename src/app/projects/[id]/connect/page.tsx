// src/app/projects/[id]/connect/page.tsx
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

export default async function ConnectProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const project = await prisma.project.findFirst({
    where: {
      id: params.id,
      profileId: user.id,
    },
  });

  if (!project) {
    return redirect("/dashboard");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-secondary">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-xl shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Connect Your Project
          </h1>
          <p className="mt-2 text-muted-foreground">
            Connect a source code provider to start analyzing your project:{" "}
            <span className="font-semibold text-foreground">{project.name}</span>
          </p>
        </div>
        
        <div className="space-y-4">
          <Button className="w-full">
            <Github className="w-5 h-5 mr-2" />
            Connect to GitHub
          </Button>
          {/* Add other providers here */}
        </div>
      </div>
    </div>
  );
}
