import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  const { publicId } = await req.json();

  try {
    const transformation = [
      { width: 640, height: 360, crop: "limit" },
      { quality: "auto:low" },
      { fetch_format: "mp4" },
      { codec: "h264" },
      { profile: "baseline" },
      { level: "3.0" },
    ];

    const compressedUrl = cloudinary.url(publicId, {
      resource_type: "video",
      transformation: transformation,
    });

    const result = await cloudinary.api.resource(publicId, {
      resource_type: "video",
      transformations: transformation,
    });

    const compressedSize = result.bytes;

    const updatedVideo = await prisma.video.update({
      where: { publicId: publicId },
      data: { 
        compressedSize: compressedSize.toString(),
        compressedUrl: compressedUrl
      },
    });

    return NextResponse.json({ 
      compressedSize, 
      compressedUrl,
      updatedVideo
    }, { status: 200 });
  } catch (error) {
    console.error("Error compressing video:", error);
    return NextResponse.json({ error: "Failed to compress video" }, { status: 500 });
  }
}