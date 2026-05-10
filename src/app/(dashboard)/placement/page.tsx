import { Metadata } from "next";
import { PlacementClient } from "./_components/placement-client";

export const metadata: Metadata = {
  title: "Placement Tracker",
  description:
    "Track all your placement and internship applications — on-campus, off-campus, referrals, status updates, and analytics in one premium dashboard.",
};

export default function PlacementPage() {
  return <PlacementClient />;
}
