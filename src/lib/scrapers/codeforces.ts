import axios from "axios";

export async function scrapeCodeForces(handle: string) {
  try {
    // 1. User Info (Rating, Rank, etc.)
    const userResponse = await axios.get(`https://codeforces.com/api/user.info?handles=${handle}`);
    if (userResponse.data.status !== "OK") {
      throw new Error(`CodeForces API error: ${userResponse.data.comment}`);
    }

    const userData = userResponse.data.result[0];

    // 2. User Rating (History)
    const ratingResponse = await axios.get(`https://codeforces.com/api/user.rating?handle=${handle}`);
    const ratingData = ratingResponse.data.result;

    // 3. User Status (Total Solved)
    const statusResponse = await axios.get(`https://codeforces.com/api/user.status?handle=${handle}`);
    const submissions = statusResponse.data.result || [];
    const solvedProblems = new Set(
      submissions
        .filter((s: any) => s.verdict === "OK")
        .map((s: any) => `${s.problem.contestId}-${s.problem.index}`)
    );

    return {
      handle: userData.handle,
      rating: userData.rating,
      maxRating: userData.maxRating,
      rank: userData.rank,
      maxRank: userData.maxRank,
      contribution: userData.contribution,
      avatar: userData.titlePhoto,
      totalSolved: solvedProblems.size,
      history: ratingData.slice(-5).map((r: any) => ({
        contest: r.contestName,
        rating: r.newRating,
        date: new Date(r.ratingUpdateTimeSeconds * 1000).toLocaleDateString(),
      })),
    };
  } catch (error) {
    console.error("CodeForces Scrape Error:", error);
    return null;
  }
}
