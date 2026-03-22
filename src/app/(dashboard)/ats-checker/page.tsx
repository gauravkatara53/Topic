import { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { ATSCheckerClient } from "./_components/ats-checker-client";
import { ATSPromoPage } from "./_components/ats-promo-page";

export const metadata: Metadata = {
  title: "ATS Checker",
  description: "Analyze your resume against any job description and get an instant ATS compatibility score powered by AI.",
};

export default async function ATSCheckerPage() {
  const { userId } = await auth();

  // Show promotional page to guests, full tool to logged-in users
  if (!userId) {
    return <ATSPromoPage />;
  }

  return <ATSCheckerClient userId={userId} />;
}
