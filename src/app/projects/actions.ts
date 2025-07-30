'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'

export async function createProject(formData: FormData) {
  const name = formData.get('name') as string;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  // Upsert a profile for the user
  await prisma.profile.upsert({
    where: { id: user.id },
    update: {},
    create: {
      id: user.id,
      email: user.email!,
    },
  });

  const project = await prisma.project.create({
    data: {
      name,
      profileId: user.id,
      status: 'ONBOARDING',
    },
  });

  // Check if this is the user's first project
  const projectCount = await prisma.project.count({
    where: { profileId: user.id },
  });

  // If this is the first project, set it as default
  if (projectCount === 1) {
    await prisma.profile.update({
      where: { id: user.id },
      data: { defaultProjectId: project.id },
    });
  }

  return redirect(`/projects/${project.id}/connect`);
}

export async function selectProject(projectId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  // Verify the project belongs to the user before setting it as default
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      profileId: user.id,
    },
  });

  if (!project) {
    return redirect('/dashboard');
  }

  await prisma.profile.update({
    where: { id: user.id },
    data: { defaultProjectId: projectId } as any,
  });

  return redirect(`/dashboard?project=${projectId}`);
} 