import axios from "axios";

export async function scrapeGitHub(username: string) {
  try {
    // 1. Basic User Info
    const userResponse = await axios.get(`https://api.github.com/users/${username}`, {
      headers: {
        "User-Agent": "Topic-Portfolio-Scraper",
      }
    });

    const userData = userResponse.data;

    // 2. Events/Contributions (Mocking logic for heatmap since real data needs OAuth/Token for private)
    // For public stats, we can fetch repos or just the profile.
    
    return {
      username: userData.login,
      avatar_url: userData.avatar_url,
      name: userData.name,
      bio: userData.bio,
      public_repos: userData.public_repos,
      followers: userData.followers,
      following: userData.following,
      created_at: userData.created_at,
      location: userData.location,
    };
  } catch (error) {
    console.error("GitHub Scrape Error:", error);
    return null;
  }
}
