import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const videos = await prisma.video.findMany({});
    const response = NextResponse.json(videos);
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    response.headers.set("Surrogate-Control", "no-store");

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching the videos." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
