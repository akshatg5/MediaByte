import { NextApiRequest, NextApiResponse } from "next";
import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/index"

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

    // creating a new compressed video instead of compressing the orignal video and doing this from the server side
    const compressedVideo = await cloudinary.uploader.explicit(publicId, {
      type: "upload",
      resource_type: "video",
      eager: transformation,
      eager_async: false,
    });

    // The new compressed video details
    const compressedPublicId = compressedVideo.eager[0].public_id;
    const compressedFormat = compressedVideo.eager[0].format;
    const compressedUrl = compressedVideo.eager[0].secure_url;
    const compressedSize = compressedVideo.eager[0].bytes;

    // Update the video record in the database
    const updatedVideo = await prisma.video.update({
      where: { publicId: publicId },
      data: { 
        compressedSize: compressedSize.toString(),
        compressedUrl: compressedUrl,
        compressedPublicId: compressedPublicId,
      },
    });

    return NextResponse.json({ 
      compressedSize, 
      compressedUrl,
      compressedPublicId,
      updatedVideo
    }, { status: 200 });
  } catch (error) {
    console.error("Error compressing video:", error);
    return NextResponse.json({ error: "Failed to compress video" }, { status: 500 });
  }
}