// api/user/signup/route.ts
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { email, firstName, lastName, auth_type, password } =
      await req.json();

    if (!email || !firstName || !lastName || !auth_type || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Log the incoming data
    console.log("Received data:", {
      email,
      firstName,
      lastName,
      auth_type,
      password: "******", // Mask the password in logs
    });

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Log the hashed password
    console.log("Hashed password created");

    // Create the user
    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        auth_type,
        password: passwordHash, // Store the hashed password
      },
    });

    // Log the created user data
    console.log("User created:", { ...user, password: "******" });

    return NextResponse.json(
      { message: "User created successfully", user: { ...user, password: undefined } },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { message: "Error creating user", error: error.message },
      { status: 500 }
    );
  }
}