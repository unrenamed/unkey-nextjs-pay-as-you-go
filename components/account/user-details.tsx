import { User } from "@supabase/supabase-js";

export const UserDetails = ({ user }: { user: User }) => (
  <div className="flex flex-col gap-2 items-start">
    <h2 className="font-bold text-2xl mb-4">Your user details</h2>
    <pre className="w-full text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
      {JSON.stringify(user, null, 2)}
    </pre>
  </div>
);
