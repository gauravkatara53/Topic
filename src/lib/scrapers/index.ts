import { scrapeLeetCode } from "./leetcode";
import { scrapeGitHub } from "./github";
import { scrapeCodeForces } from "./codeforces";

export interface PortfolioStats {
  totalSolved: number;
  activeDays: number;
  rating?: number;
  history: any[];
  platformData: Record<string, any>;
}

export async function scrapeAllPlatforms(handles: {
  leetcode?: string;
  github?: string;
  codeforces?: string;
  codechef?: string;
  atcoder?: string;
}) {
  const results: Record<string, any> = {};

  // Parallel execution for speed
  const [leetcode, github, codeforces] = await Promise.all([
    handles.leetcode ? scrapeLeetCode(handles.leetcode) : null,
    handles.github ? scrapeGitHub(handles.github) : null,
    handles.codeforces ? scrapeCodeForces(handles.codeforces) : null,
  ]);

  if (leetcode) results.leetcode = leetcode;
  if (github) results.github = github;
  if (codeforces) results.codeforces = codeforces;

  // Aggregate stats
  let totalSolved = 0;
  if (leetcode) totalSolved += leetcode.stats.find((s: any) => s.difficulty === "All")?.count || 0;
  if (codeforces) totalSolved += codeforces.totalSolved || 0;

  const aggregated: PortfolioStats = {
    totalSolved,
    activeDays: leetcode?.calendar?.totalActiveDays || 0,
    rating: leetcode?.contest?.rating || codeforces?.rating || 0,
    history: [
      ...(leetcode?.history?.map((h: any) => ({ ...h, platform: "LeetCode", rating: h.rating })) || []),
      ...(codeforces?.history?.map((h: any) => ({ ...h, platform: "CodeForces" })) || []),
    ].sort((a, b) => new Date(a.date || a.contest?.startTime).getTime() - new Date(b.date || b.contest?.startTime).getTime()),
    platformData: results,
  };

  return aggregated;
}
