"use client";

import { syncSignUpDb } from "@/utils/SyncUserWithDb";
import { useClerk, useSignUp } from "@clerk/nextjs";
import { Fullscreen } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";

type FormData = {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
};

const SignUpForm = () => {
  const { signUp } = useSignUp();
  const clerk = useClerk();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [isVerificationSent, setIsVerificationSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name as keyof FormData]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!signUp) {
      setError("Sign-up process is not available at this time.");
      return;
    }

    try {
      await signUp.create({
        emailAddress: formData.email,
        password: formData.password,
      });
      console.log("Handling submit and sending user data to the db");
      await syncSignUpDb({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        auth_type: "Local",
        password: formData.password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setIsVerificationSent(true);
      setError("Please check your email for a verification code.");
    } catch (err) {
      console.error("Sign-up error:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    }
  };

  const handleVerification = async () => {
    if (!signUp) {
      setError("Sign-up process is not available at this time.");
      return;
    }

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (completeSignUp.status !== "complete") {
        setError("Failed to verify email. Please try again.");
        return;
      }

      await handleSignUpComplete(completeSignUp);
    } catch (err) {
      console.error("Verification error:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    }
  };

  const handleSignUpComplete = async (response: any) => {
    try {
      await clerk.setActive({ session: response.createdSessionId });
      // Redirect after a short delay
      window.location.href = "/home";
    } catch (err) {
      console.error("Error completing sign-up:", err);
      setError("Failed to complete sign-up. Please try again.");
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      if (signUp) {
        await signUp.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl: "/auth-callback",
          redirectUrlComplete: "/auth-callback",
        });
      } else {
        setError("Sign-up process is not available at this time.");
      }
    } catch (err) {
      setError("Failed to sign up with Google. Please try again.");
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
          Sign Up
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            "firstName",
            "lastName",
            "email",
            "password",
            "confirmPassword",
          ].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700">
                {field.charAt(0).toUpperCase() +
                  field.slice(1).replace(/([A-Z])/g, " $1")}
              </label>
              <input
                type={field.includes("password") ? "password" : "text"}
                name={field}
                value={formData[field as keyof FormData]}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          ))}

          {isVerificationSent && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={handleVerification}
                className="mt-2 w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Verify Email
              </button>
            </div>
          )}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isVerificationSent ? "Resend Verification" : "Sign Up"}
          </button>
        </form>

        <hr className="my-4 border-gray-300" />

        <button
          onClick={handleGoogleSignUp}
          className="w-full h-[3rem] text-white bg-black rounded-md flex justify-center items-center p-2"
        >
          <FcGoogle />
          <p className="ml-4">Sign up with Google</p>
        </button>
        <div className="flex mt-4">
          <p className="text-black">Already have an account?</p>
          <Link href="/sign-in">
            <p className="text-blue-600 ml-1">Sign In</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;
