"use server";

import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const ADMIN_EMAIL = "gauravkatara53@gmail.com";

async function checkAdmin() {
  const { userId } = await auth();
  const user = await currentUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;

  if (!userId || userEmail !== ADMIN_EMAIL) {
    throw new Error("Unauthorized: Admin access required.");
  }
}

export async function updateDSASheetQuestion(id: string, data: { title: string; url: string; difficulty: string; tags: string }) {
  await checkAdmin();

  const updated = await prisma.dSASheet.update({
    where: { id },
    data: {
      title: data.title,
      url: data.url,
      difficulty: data.difficulty,
      tags: data.tags,
    },
  });

  revalidatePath("/dsa-sheets/[companyId]", "page");
  revalidatePath("/dsa-sheets", "page");

  return updated;
}

export async function updatePopularQuestion(id: string, data: { name: string; problemUrl: string; difficulty: string; topics: string[] }) {
  await checkAdmin();

  const updated = await prisma.popularQuestion.update({
    where: { id },
    data: {
      name: data.name,
      problemUrl: data.problemUrl,
      difficulty: data.difficulty,
      topics: data.topics,
    },
  });

  revalidatePath("/dsa-sheets/popular/[slug]", "page");
  revalidatePath("/dsa-sheets/popular", "page");

  return updated;
}
