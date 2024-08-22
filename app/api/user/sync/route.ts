import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/index"

export async function POST(req: NextRequest) {
  try {
    const { email, firstName, lastName, auth_type } = await req.json();

    if (!email || !auth_type) {
      return NextResponse.json(
        { success: false, message: "Email and auth_type are required" },
        { status: 400 }
      );
    }
    if (auth_type !== "Google" && auth_type !== "Local") {
      return NextResponse.json(
        { success: false, message: "Invalid auth_type" },
        { status: 400 }
      );
    }
    const user = await prisma.user.upsert({
      where: { email },
      update: { firstName, lastName, auth_type },
      create: { email, firstName, lastName, auth_type },
    });

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error) {
    console.error("Failed to sync user!", error);
    
    // More detailed error response
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { success: false, message: "Failed to sync user", error: errorMessage },
      { status: 500 }
    );
  }
}

process.on('beforeExit', () => {
  prisma.$disconnect();
});