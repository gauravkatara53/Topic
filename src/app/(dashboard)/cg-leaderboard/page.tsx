import { Metadata } from "next";
import CGLeaderboardClient from "./_components/cg-leaderboard-client";

export const metadata: Metadata = {
    title: "CGPA Leaderboard",
    description: "Check the top academic performers across all batches and branches at NIT Jamshedpur on the CGPA Leaderboard.",
};

export default function CGLeaderboardPage() {
    return <CGLeaderboardClient />;
}
