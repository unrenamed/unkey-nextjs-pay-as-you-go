"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function WelcomeToast() {
  useEffect(() => {
    if (!document.cookie.includes("email-toast=1")) {
      toast("📩 Welcome to Next.js Unkey Starter Kit!", {
        duration: Infinity,
        onDismiss: () =>
          (document.cookie = "email-toast=1; max-age=31536000; path=/"),
        description: (
          <p>
            This is a demo of a pay-as-you-go SaaS with a Supabase database and
            Unkey key management.{" "}
            <a
              href="https://www.unkey.com/templates"
              className="text-blue-600 hover:underline"
              target="_blank"
            >
              See other templates
            </a>
            .
          </p>
        ),
      });
    }
  }, []);

  return null;
}
