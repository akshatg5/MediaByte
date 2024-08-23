"use client";
import React from "react";
import VideoCard from "@/components/VideoCard";
import Loading from "../loading";
import prisma from "@/prisma/index" 

// TypeScript interfaces
import { Video } from "@prisma/client";

interface HomeProps {
  videos: Video[];
}

function Home({ videos }: HomeProps) {
  // No need for useState or useEffect since data is fetched at build time
  const handleDownload = React.useCallback((url: string, title: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${title}.mp4`);
    link.setAttribute("target", "_blank");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  if (!videos || videos.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl text-blue-600 font-bold mb-4">Videos</h1>
        <div className="text-center text-lg text-gray-500">
          No videos available
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl text-blue-600 font-bold mb-4">Videos</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onDownload={handleDownload}
          />
        ))}
      </div>
    </div>
  );
}

export default Home;

// Fetch data at build time
export async function getStaticProps() {
  // Fetch videos from the database using Prisma
  const videos = await prisma.video.findMany();

  return {
    props: {
      videos,
    },
    revalidate: 10, // ISR: re-generate the page every 10 seconds if a request comes in
  };
}
