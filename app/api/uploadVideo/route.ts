import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { currentUser } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryUploadResult {
  public_id: string;
  bytes: number;
  duration?: number;
  [key: string]: any;
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user || !user.emailAddresses || user.emailAddresses.length === 0) {
      return NextResponse.json({ error: "User not found or no email address" }, { status: 404 });
    }

    const userEmail = user.emailAddresses[0].emailAddress;

    // Fetch the user from the database using the email
    const dbUser = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found in database" }, { status: 404 });
    }

    if (
      !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return NextResponse.json(
        { error: "Server credentials not found!" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const orignalSize = formData.get("orignalSize") as string;

    if (!file) {
      return NextResponse.json({ error: "File not found!" }, { status: 404 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<CloudinaryUploadResult>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "video",
            folder: "MediaByte/videos",
            transformation: [{ quality: "auto", fetch_format: "mp4" }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result as CloudinaryUploadResult);
          }
        );
        uploadStream.end(buffer);
      }
    );

    const video = await prisma.video.create({
      data: {
        title,
        description,
        duration: result.duration || 0,
        uploadedById: dbUser.id,  // Use the ID from the database
        compressedSize: String(result.bytes),
        publicId: result.public_id,
        orignalSize: orignalSize,
      },
    });

    return NextResponse.json(video,{status : 200});
  } catch (error) {
    console.log("Upload video failed error:", error);
    return NextResponse.json({ error: "video upload failed" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}