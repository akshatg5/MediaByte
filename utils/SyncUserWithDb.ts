import { PrismaClient } from "@prisma/client";
import axios from "axios";

interface UserData {
  email: string;
  firstName: string | null;
  lastName: string | null;
  auth_type: "Google" | "Local";
  password?: string;
}

const prisma = new PrismaClient()

export const syncUserWithDb = async (user: UserData): Promise<void> => {
  try {
    console.log("Syncing user:", user);
    const response = await axios.post("/api/user/sync", {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      auth_type: user.auth_type,
    });
    console.log("Sync response:", response);
    if (response.status !== 200) {
      throw new Error(`Failed to sync user: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Failed to sync user with Database", error);
    throw error;
  }
};

export const syncSignUpDb = async (user: UserData): Promise<void> => {
    try {
      const response = await axios.post("/api/user/signup", {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        auth_type: "Local",
        password: user.password,
      });
      if (response.status !== 200 && response.status !== 201) {
        throw new Error(`Failed to sync sign-up data: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Failed to sync sign-up data with Database", error);
      throw error;
    }
  };