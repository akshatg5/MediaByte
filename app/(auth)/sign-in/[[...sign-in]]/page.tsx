"use client";

import { useSignIn } from "@clerk/nextjs";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { syncUserWithDb } from "@/utils/SyncUserWithDb";
import { Fullscreen } from "lucide-react";

const SignInForm = () => {
  const { signIn } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await signIn?.create({
        identifier: email,
        password,
      });

      if (result?.status === "complete") {
        await syncUserWithDb({
          email,
          firstName: result.userData?.firstName || "",
          lastName: result.userData?.lastName || "",
          auth_type: "Local",
        });
        router.push("/home");
      } else {
        setError("Failed to sign in. Please check your credentials!");
      }
    } catch (err) {
      setError("Failed to sign in. Please check your credentials.");
    }
  };

  const handleGoogleSignIn = () => {
    try {
      //@ts-ignore
      signIn?.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/auth-callback",
        redirectUrlComplete: "/home",
      });
    } catch (error) {
      router.push("/sign-up");
      console.error("Failed to initiate Google sign-in:", error);
      setError("Failed to sign in with Google. Please try again!");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <div className="flex items-center justify-center py-4 border-b border-gray-200">
          <Fullscreen className="w-10 h-10 text-blue-600" />
          <p className="text-blue-600 font-bold text-2xl">MediaByte</p>
        </div>
        <h2 className="text-2xl font-bold mb-6 text-center text-black">
          Sign In
        </h2>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign In
          </button>
        </form>

        <hr className="mt-4 mb-2 border-gray-300" />
      
        <p className="text-black text-sm my-2">If you don&apos;t have an existing account, please sign up first!</p>
        <button
          onClick={handleGoogleSignIn}
          className="w-full h-[3rem] text-white bg-black rounded-md flex justify-center items-center p-2"
        >
          <FcGoogle />
          <p className="ml-4">Sign in with Google</p>
        </button>
        <div className="flex mt-4">
          <p className="text-black">Don&apos;t have an account?</p>
          <Link href="/sign-up">
            <p className="text-blue-600">Sign up</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignInForm;
