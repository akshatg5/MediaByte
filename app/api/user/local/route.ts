// api/user/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { userId, firstName, lastName, email, password} =
      await req.json();
    const hashedPassword = await bcrypt.hash(password, 8);
    const user = await prisma.user.create({
      data: {
        id: userId,
        firstName,
        lastName,
        email,
        password: hashedPassword,
        auth_type: "Local",
      },
    });
    return NextResponse.json({success:true,userDetails : user.email},{status : 200})
  } catch (error) {
    console.error("Failed to create a user",error)
    return NextResponse.json({success:false,message : "Failed to create user."},{status:500})
  } finally {
    prisma.$disconnect()
  }
}
