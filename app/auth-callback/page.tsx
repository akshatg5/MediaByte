"use client";

import { useClerk } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { syncUserWithDb } from "@/utils/SyncUserWithDb";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const { user } = useClerk();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const syncUser = async () => {
      if (user) {
        try {
          await syncUserWithDb({
            email: user.primaryEmailAddress?.emailAddress || "",
            firstName: user.firstName,
            lastName: user.lastName,
            auth_type: "Google",
          });
          router.push("/home");
        } catch (err) {
          console.error("Failed to sync user:", err);
          setError("Failed to sync user. Please try again.");
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    syncUser();
  }, [user, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen flex-col">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
        <p className="mt-4 text-lg font-semibold text-blue-600">MediaByte</p>
        <p className="mt-4 text-md font-semibold text-blue-600">
          Authenticating
        </p>
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  return null;
}
