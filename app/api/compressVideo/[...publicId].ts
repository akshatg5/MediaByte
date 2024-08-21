import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { publicId } = req.query;

    // Join the publicId array to form the full publicId string
    const publicIdString = Array.isArray(publicId) ? publicId.join('/') : publicId;

    try {
      const compressedResult = await cloudinary.uploader.upload(
        `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/${publicIdString}`,
        {
          resource_type: "video",
          public_id: publicIdString,
          transformation: {
            width: 640,
            height: 360,
            crop: "limit",
          },
        }
      );

      await prisma.video.updateMany({
        where: { publicId: publicIdString },
        data: {
          compressedSize: compressedResult.bytes.toString(),
        },
      });

      return res.status(200).json({ compressedSize: compressedResult.bytes });
    } catch (error) {
      console.error("Error compressing video:", error);
      return res.status(500).json({ error: "Error compressing video." });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    return res.status(404).json({ error: 'Not found' });
  }
}
