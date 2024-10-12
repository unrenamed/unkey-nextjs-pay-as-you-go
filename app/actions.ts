"use server";
import { encodedRedirect } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  createApiKey,
  getApiKeyDetails,
  getApiKeyVerifications,
  moveApiKeyToNextTier,
  trackApiKeyUsage,
} from "@/lib/unkey";
import { calculateCostForUsage } from "@/lib/pricing-tier";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = createClient();
  const origin = headers().get("origin");

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link."
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/account");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = createClient();
  const origin = headers().get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/account/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password"
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password."
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/account/reset-password",
      "Password and confirm password are required"
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/account/reset-password",
      "Passwords do not match"
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/account/reset-password",
      "Password update failed"
    );
  }

  encodedRedirect("success", "/account/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

// You can call your API, perform any task, or add custom logic here to track API calls.
// This is the place to make network requests, or perform other side effects.
export const callApi = async () => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Example: Your API call logic
  // fetch('https://your-api-url.com/endpoint', { method: 'POST', body: JSON.stringify(data) })

  // Below is the API usage tracking
  const key: string = user?.user_metadata["unkey_key"]!;
  const keyId: string = user?.user_metadata["unkey_key_id"]!;

  const trackApiKeyUsageResponse = await trackApiKeyUsage(key);
  if (trackApiKeyUsageResponse.error) {
    encodedRedirect(
      "error",
      "/account/call-api",
      `API key verification failed: ${trackApiKeyUsageResponse.error.message}`
    );
    return;
  }

  const remaining = trackApiKeyUsageResponse.result?.remaining;
  if (remaining && remaining > 0) {
    let message = isFinite(remaining)
      ? `You have ${remaining} left before moving to the next pricing tier.`
      : "Enjoy the freedom of unlimited credits!";
    encodedRedirect("success", "/account/call-api", message);
  }

  const moveApiKeyToNextTierResponse = await moveApiKeyToNextTier(keyId);
  if (moveApiKeyToNextTierResponse.error) {
    encodedRedirect(
      "error",
      "/account/call-api",
      `API key tier update failed: ${moveApiKeyToNextTierResponse.error.message}`
    );
    return;
  }

  const { price, remaining: credits } = moveApiKeyToNextTierResponse.result;
  let message = `The rate increased to ${price}$ per credit. `;
  message += `Your credits have been reset to ${credits === Infinity ? "a maximum limit" : credits}! `;
  message += "Keep an eye on your usage!";
  encodedRedirect("success", "/account/call-api", message);
};

export const createUnkeyApiKey = async (userId: string) => {
  const { result, error } = await createApiKey(userId);

  if (error) {
    return encodedRedirect(
      "error",
      "/sign-up",
      `We were unable to create an Unkey API key: ${error.message}`
    );
  }

  const supabase = createClient();
  const { error: updateError } = await supabase.auth.updateUser({
    // It's recommended to hash Unkey key details before storing them in the database to enhance security.
    data: { unkey_key: result.key, unkey_key_id: result.keyId },
  });

  if (updateError) {
    encodedRedirect(
      "error",
      "/sign-up",
      `We were unable to save a new Unkey API key to the DB: ${updateError.message}`
    );
  }
};

export async function getUnkeyApiKeyDetails(keyId: string) {
  return getApiKeyDetails(keyId);
}

export async function getUnkeyApiKeyVerifications(
  keyId: string,
  start?: number
) {
  return getApiKeyVerifications(keyId, start);
}

export async function calculateUsageCostForUnkeyApiKey(keyId: string) {
  const { result, error } = await getApiKeyVerifications(keyId);
  if (error) return { result: null, error };

  const totalSuccessVerifications = result.verifications.reduce(
    (sum, v) => sum + v.success,
    0
  );

  return { result: calculateCostForUsage(totalSuccessVerifications), error };
}
