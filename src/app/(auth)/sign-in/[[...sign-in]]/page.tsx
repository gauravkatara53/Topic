import { SignIn } from "@clerk/nextjs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Topic account to access your college dashboard, attendance, and notes.",
};

export default function Page() {
    return (
        <div className="flex h-screen items-center justify-center p-4">
            <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
        </div>
    );
}
