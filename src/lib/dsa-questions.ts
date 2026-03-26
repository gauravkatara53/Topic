import { prisma } from "./prisma";

export interface HydratedQuestion {
  id: string;
  questionId?: number | null;
  title: string;
  url: string;
  difficulty: string | null;
  topics: string[];
  companies?: string | null;
  platform?: string | null;
}

/**
 * Hydrates a list of question IDs by searching in both DSASheet and PopularQuestion models.
 * Handles both numeric strings (for company sheets) and ObjectIDs.
 */
export async function hydrateQuestions(ids: string[]): Promise<Map<string, HydratedQuestion>> {
  if (!ids || ids.length === 0) return new Map();

  const uniqueIds = [...new Set(ids)];
  const numericIds = uniqueIds.filter(id => !isNaN(Number(id))).map(id => Number(id));
  const objectIds = uniqueIds.filter(id => /^[0-9a-fA-F]{24}$/.test(id));
  const otherIds = uniqueIds.filter(id => !/^[0-9a-fA-F]{24}$/.test(id));

  const popQuestionFilters: any[] = [
    ...(objectIds.length > 0 ? [{ id: { in: objectIds } }] : []),
    ...otherIds.map(id => ({ questionId: { equals: id } })),
    ...numericIds.map(id => ({ questionId: { equals: id } }))
  ];

  const [dsaByNum, dsaById, popQuestions] = await Promise.all([
    numericIds.length > 0 ? (prisma as any).dSASheet.findMany({ 
      where: { questionId: { in: numericIds } } 
    }) : Promise.resolve([]),
    objectIds.length > 0 ? (prisma as any).dSASheet.findMany({ 
      where: { id: { in: objectIds } } 
    }) : Promise.resolve([]),
    popQuestionFilters.length > 0 ? (prisma as any).popularQuestion.findMany({ 
      where: { 
        OR: popQuestionFilters
      } 
    }) : Promise.resolve([])
  ]);

  const questionMap = new Map<string, HydratedQuestion>();

  // Map DSASheet questions (Company sheets)
  [...dsaByNum, ...dsaById].forEach((q: any) => {
    const keyNum = q.questionId ? String(q.questionId) : null;
    const keyId = String(q.id);
    
    const normalized: HydratedQuestion = {
      id: keyId,
      questionId: q.questionId,
      title: q.title || "Untitled Question",
      url: q.url || "#",
      difficulty: q.difficulty,
      topics: q.tags?.split(',').map((t: string) => t.trim()) || [],
      companies: q.companies
    };

    if (keyNum) questionMap.set(keyNum, normalized);
    questionMap.set(keyId, normalized);
  });

  // Map PopularQuestion questions
  popQuestions.forEach((q: any) => {
    const keyId = String(q.id);
    const keyNum = q.questionId ? String(q.questionId) : null;

    const normalized: HydratedQuestion = {
      id: keyId,
      title: q.name || "Untitled Question",
      url: q.problemUrl || "#",
      difficulty: q.difficulty,
      topics: q.topics || [],
      platform: q.platform
    };

    if (keyNum) questionMap.set(keyNum, normalized);
    questionMap.set(keyId, normalized);
  });

  return questionMap;
}
