import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createApiKey } from "@/lib/unkey";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createClient(process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const {
    data: { users },
    error,
  } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error(error.message);
    return new Response(error.message, { status: 500 });
  }

  const failedCreations = [];
  const failedDbUpdates = [];

  for (let user of users) {
    // Reset a key usage from the previous month by creating a brand new key.
    // The old key will be automatically expired by Unkey (see `createApiKey` method
    // in `file:///./../../../lib/unkey.ts`) and kept for history.
    const createApiKeyResponse = await createApiKey(user.id);
    if (createApiKeyResponse.error) {
      failedCreations.push(createApiKeyResponse.error);
      continue;
    }

    const updateUserResponse = await supabase.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          unkey_key: createApiKeyResponse.result.key,
          unkey_key_id: createApiKeyResponse.result.keyId,
        },
      }
    );

    if (updateUserResponse.error) {
      failedDbUpdates.push(updateUserResponse.error);
      continue;
    }

    // Now you can charge your customers based on their monthly cost usage if
    // you have collected their payment details beforehand.
    // For more details, visit: https://docs.stripe.com/payments/save-and-reuse

    // If you don't want to keep old keys on the Unkey side, you can remove them here
    // after creating the new one.
    // For reference, see: https://www.unkey.com/docs/api-reference/keys/delete
  }

  // Process failed requests
  for (let error of [...failedCreations, ...failedDbUpdates]) {
    console.error(error);
  }

  const message =
    "All customers have been successfully charged, and their Unkey API keys have been reset.";
  return new NextResponse(message, { status: 200 });
}
