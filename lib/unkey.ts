/**
 * This module manages API key creation, validation, and tier management using the Unkey API.
 *
 * We leverage the Unkey API's key `meta` field to store the current pricing tier associated with
 * the user’s API key. This allows for efficient access to tier information during tier management
 * operations, enabling seamless upgrades or changes without additional lookups.
 *
 * Additionally, we use the `remaining` field to track the number of successful API key verifications,
 * which corresponds to the usage of various endpoints. This field acts as a usage counter, decrementing
 * with each validation to enforce limits based on the user's tier, alert users as they approach their
 * quotas, and facilitate tier upgrades when necessary.
 *
 * @usage
 * - Call `createApiKey(ownerId)` to generate a new API key for a specified owner.
 * - Use `getApiKeyDetails(keyId)` to retrieve details about a specific API key.
 * - Call `trackApiKeyUsage(key)` to verify the validity of an API key and check its remaining usage.
 * - Use `moveApiKeyToNextTier(keyId)` to upgrade an API key to the next pricing tier.
 */

import { Unkey, verifyKey } from "@unkey/api";
import { PRICING_TIERS, TierType } from "./pricing-tier";
import { endOfMonthTimestamp } from "./utils";

export const unkey = new Unkey({
  rootKey: process.env.UNKEY_ROOT_KEY,
});

export const createApiKey = async (ownerId: string) => {
  const tierType = "trial";
  const tier = PRICING_TIERS[tierType];

  return unkey.keys.create({
    ownerId,
    prefix: "api-usage-quota",
    apiId: process.env.UNKEY_API_ID,
    meta: { currentTier: tierType },
    expires: endOfMonthTimestamp(),
    remaining: tier.limit,
  });
};

export const getApiKeyDetails = async (keyId: string) => {
  const { result, error } = await unkey.keys.get({ keyId });
  if (error) return { result: null, error };
  return {
    error: null,
    result: {
      remaining: result.remaining ?? Infinity,
      currentTier: (result.meta?.["currentTier"] ?? "trial") as TierType,
      updatedAt: result.updatedAt,
    },
  };
};

export const getApiKeyVerifications = async (keyId: string, start?: number) => {
  return unkey.keys.getVerifications({
    keyId,
    start,
  });
};

export const moveApiKeyToNextTier = async (keyId: string) => {
  const getTierResponse = await getTierType(keyId);
  if (getTierResponse.error)
    return { result: null, error: getTierResponse.error };

  const currentTierType = getTierResponse.result.tierType;
  const currentTier = PRICING_TIERS[currentTierType];

  if (!currentTier.next) {
    return {
      result: { remaining: Infinity, price: currentTier.price },
      error: null,
    };
  }

  const nextTierType = currentTier.next;
  const updateRemainingResponse = await handleTierUpdate(keyId, nextTierType);

  if (updateRemainingResponse.error)
    return { result: null, error: updateRemainingResponse.error };

  const nextTier = PRICING_TIERS[nextTierType];

  return {
    result: { remaining: nextTier.limit, price: nextTier.price },
    error: null,
  };
};

export const trackApiKeyUsage = async (key: string) => {
  const { result, error } = await verifyKey(key);
  if (error) return { result: null, error };
  if (!result.valid)
    return {
      result: null,
      error: new Error(`"${key}" is not a valid API key`),
    };

  return { result: { remaining: result.remaining ?? Infinity }, error }; // undefined means unlimited requests
};

// Retrieve tier type from the API key
const getTierType = async (keyId: string) => {
  const { result, error } = await unkey.keys.get({ keyId });
  if (error) return { result: null, error };

  return {
    result: { tierType: (result.meta?.currentTier as TierType) ?? "trial" },
    error,
  };
};

// Helper function to handle tier updates
const handleTierUpdate = async (keyId: string, nextTierType: TierType) => {
  const updateTierResponse = await updateTierType(keyId, nextTierType);
  if (updateTierResponse.error) return updateTierResponse;
  return updateRemaining(keyId, PRICING_TIERS[nextTierType].limit);
};

// Update tier type for the API key
const updateTierType = async (keyId: string, newTier: TierType) => {
  return unkey.keys.update({
    keyId,
    meta: { currentTier: newTier },
  });
};

// Update remaining usage for the API key
const updateRemaining = async (keyId: string, value: number) => {
  return unkey.keys.updateRemaining({
    keyId,
    value: value === Infinity ? null : value, // null means unlimited
    op: "set",
  });
};
