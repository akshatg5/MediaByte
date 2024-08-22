import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/index"
import { NextApiRequest, NextApiResponse } from "next";

export async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const videos = await prisma.video.findMany({});
    const response = NextResponse.json(videos);
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");

    return res.status(200).json(videos);
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching the videos." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
