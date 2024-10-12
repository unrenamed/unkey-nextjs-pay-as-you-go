import { redirect } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { type ClassValue, clsx } from "clsx";
import { type ReactNode } from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Redirects to a specified path with an encoded message as a query parameter.
 * @param {('error' | 'success')} type - The type of message, either 'error' or 'success'.
 * @param {string} path - The path to redirect to.
 * @param {string} message - The message to be encoded and added as a query parameter.
 * @returns {never} This function doesn't return as it triggers a redirect.
 */
export function encodedRedirect(
  type: "error" | "success",
  path: string,
  message: string
) {
  return redirect(`${path}?${type}=${encodeURIComponent(message)}`);
}

export function endOfMonthTimestamp(): number {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const endOfMonth = new Date(nextMonth.getTime() - 1);
  return endOfMonth.getTime();
}

export function pluralize(
  count: number | string,
  singular: string,
  plural?: string
): string {
  const num = typeof count === "string" ? parseFloat(count) : count;
  const pluralForm = plural || singular + "s";
  return `${num} ${num === 1 ? singular : pluralForm}`;
}

export function timeAgo(timestamp: number): string {
  const now = Date.now();
  const diffInMillis = now - timestamp;

  // Define time intervals in milliseconds
  const seconds = Math.floor(diffInMillis / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30); // Approximate a month as 30 days

  if (months > 0) {
    return `${pluralize(months, "mo")} ago`;
  } else if (days > 0) {
    return `${pluralize(days, "day")} ago`;
  } else if (hours > 0) {
    return `${pluralize(hours, "hr")} ago`;
  } else if (minutes > 0) {
    return `${pluralize(minutes, "min")} ago`;
  } else {
    return `${pluralize(seconds, "sec")} ago`;
  }
}

export function pluralizeJSX(
  func: (count: number, noun: string) => ReactNode,
  count: number,
  noun: string,
  suffix = "s"
) {
  return func(count, `${noun}${count !== 1 ? suffix : ""}`);
}
