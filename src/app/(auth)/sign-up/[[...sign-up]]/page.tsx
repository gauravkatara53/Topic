import { SignUp } from "@clerk/nextjs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a new Topic account to join your college community, track attendance, and more.",
};

export default function Page() {
    return (
        <div className="flex h-screen items-center justify-center p-4">
            <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
        </div>
    );
}
