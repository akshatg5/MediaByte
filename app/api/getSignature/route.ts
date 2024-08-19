import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST (req:NextRequest) {
    try {
        const user = await currentUser();
        
        if (!user) {
            return NextResponse.json({error : "Unauthorized!"},{status:401})
        }

        const {folder} = await req.json()
        const timestamp = Math.round((new Date).getTime() / 1000);

        if (!process.env.CLOUDINARY_API_SECRET) {
            return NextResponse.json({message : "Server side error!"},{status : 500})
        }

        const signature = cloudinary.utils.api_sign_request({
            timestamp : timestamp,
            folder : folder
        },process.env.CLOUDINARY_API_SECRET )

        return NextResponse.json({
            signature,
            timestamp,
            cloudname : process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY
        })
    } catch (error) {
        console.error("Error generating the signature:",error)
        return NextResponse.json({error : "Failed to generate signature!"},{status : 500})
    }
}