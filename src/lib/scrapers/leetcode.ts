import axios from "axios";

const LEETCODE_API_ENDPOINT = "https://leetcode.com/graphql";

export async function scrapeLeetCode(username: string) {
  const query = `
    query userPublicProfile($username: String!) {
      matchedUser(username: $username) {
        username
        profile {
          ranking
          userAvatar
          realName
          aboutMe
          school
          countryName
          websites
          skillTags
          postViewCount
          reputation
          solutionCount
        }
        submitStats {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
          totalSubmissionNum {
            difficulty
            count
            submissions
          }
        }
        userCalendar {
            activeYears
            streak
            totalActiveDays
        }
        submissionCalendar
      }
      userContestRanking(username: $username) {
        attendedContestsCount
        rating
        globalRanking
        totalParticipants
        topPercentage
        badge {
          name
        }
      }
      userContestRankingHistory(username: $username) {
        attended
        trendDirection
        problemsSolved
        totalProblems
        finishTimeInSeconds
        rating
        ranking
        contest {
          title
          startTime
        }
      }
    }
  `;

  try {
    const response = await axios.post(LEETCODE_API_ENDPOINT, {
      query,
      variables: { username },
    }, {
      headers: {
        "Content-Type": "application/json",
        "Referer": "https://leetcode.com",
      }
    });

    const data = response.data.data;
    if (!data.matchedUser) {
      throw new Error("User not found on LeetCode");
    }

    return {
      username: data.matchedUser.username,
      profile: data.matchedUser.profile,
      stats: data.matchedUser.submitStats.acSubmissionNum,
      calendar: data.matchedUser.userCalendar,
      submissionCalendar: data.matchedUser.submissionCalendar,
      contest: data.userContestRanking,
      history: data.userContestRankingHistory?.filter((h: any) => h.attended).slice(-5) || [],
    };
  } catch (error) {
    console.error("LeetCode Scrape Error:", error);
    return null;
  }
}
