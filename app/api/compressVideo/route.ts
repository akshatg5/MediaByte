import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  const { publicId } = req.body;

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

    return res.status(200).json({ compressedSize, compressedUrl });
  } catch (error) {
    console.error("Error compressing video:", error);
    return res.status(500).json({ error: "Error compressing video." });
  } finally {
    await prisma.$disconnect();
  }
}
