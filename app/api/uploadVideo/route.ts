import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/prisma/index"

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user || !user.primaryEmailAddress?.emailAddress) {
      return NextResponse.json({ error: "User not authorized or email not found" }, { status: 401 });
    }

    const emailId = user.primaryEmailAddress.emailAddress;
    
    const dbUser = await prisma.user.findUnique({
      where: { 
        email: emailId
      },
      select: {
        id: true
      }
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found in database" }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, publicId, duration, bytes, originalSize } = body;

    if (!title || !publicId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const video = await prisma.video.create({
      data: {
        title,
        description: description || "",
        duration: duration || 0,
        uploadedById: dbUser.id,
        compressedSize: String(bytes || 0),
        publicId,
        orignalSize: originalSize || "0",
      },
    });

    return NextResponse.json(video, { status: 200 });
  } catch (error: any) {
    console.error("Upload video failed error:", error);
    return NextResponse.json({ error: "video upload failed", details: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}