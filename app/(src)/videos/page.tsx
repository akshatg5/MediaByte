// Remove the "use client" directive
import VideoCard from "@/components/VideoCard";
import { Video } from "@prisma/client";
import prisma from '@/prisma/index'; // Adjust the import path as needed

async function getVideos() {
  const videos = await prisma.video.findMany();
  return videos;
}

export default async function Home() {
  const videos = await getVideos();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl text-blue-600 font-bold mb-4">Videos</h1>
      {videos.length === 0 ? (
        <div className="text-center text-lg text-gray-500">
          No videos available
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
            />
          ))}
        </div>
      )}
    </div>
  );
}