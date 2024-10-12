import Hero from "@/components/hero";
import ConnectSupabaseAndUnkeySteps from "@/components/tutorial/connect-supabase-and-unkey-steps";
import SignUpUserSteps from "@/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/lib/check-env-vars";

export default async function Index() {
  return (
    <>
      <Hero />
      <main className="flex-1 flex flex-col gap-6 px-4">
        <h2 className="font-medium text-xl mb-4">Next steps</h2>
        {hasEnvVars ? <SignUpUserSteps /> : <ConnectSupabaseAndUnkeySteps />}
      </main>
    </>
  );
}
