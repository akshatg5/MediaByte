// app/api/user/google-signin/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const { email, firstName, lastName, authType } = await req.json();

    let user = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      await prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          auth_type: "Google",
        },
      });
    }

    // Respond with the user data
    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error) {
    console.error("Failed to handle Google sign-in:", error);
    return NextResponse.json(
      { success: false, message: "Failed to handle sign-in." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
