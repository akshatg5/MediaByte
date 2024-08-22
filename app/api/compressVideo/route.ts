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
    // Generate the compressed video URL
    const compressedUrl = cloudinary.url(publicId, {
      resource_type: "video",
      transformation: [
        { width: 640, height: 360, crop: "limit" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    });

    // Get the details of the compressed video
    const result = await cloudinary.api.resource(publicId, {
      resource_type: "video",
      transformations: [
        { width: 640, height: 360, crop: "limit" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    });

    const compressedSize = result.bytes;

    // Update the video record in the database
    await prisma.video.update({
      where: { publicId: publicId },
      data: { compressedSize: compressedSize.toString() },
    });

    return NextResponse.json({ compressedSize, compressedUrl},{status : 200});
  } catch (error) {
    console.error("Error compressing video:", error);
    return NextResponse.json({ error: "Error compressing video."},{status : 500});
  } finally {
    await prisma.$disconnect();
  }
}
