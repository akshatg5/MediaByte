import prisma from "@/prisma/index"
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.nextUrl);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Enter a valid email" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User does not exist" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "User exists" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking user existence:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
