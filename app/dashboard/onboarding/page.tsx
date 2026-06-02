import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import OnboardingWithTerms from "./OnboardingWithTerms";

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return <OnboardingWithTerms />;
}