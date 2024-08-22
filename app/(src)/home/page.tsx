import React from 'react';
import axios from 'axios';
import VideoCard from '@/components/VideoCard';
import { Video } from '@prisma/client';
import Loading from '../loading';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getVideos() {
  try {
    const videos = await prisma.video.findMany();
    return { videos };
  } catch (error) {
    console.error('Error fetching videos:', error);
    return { error: 'Failed to fetch videos' };
  } finally {
    await prisma.$disconnect();
  }
}

export default async function Home() {
  const { videos, error } = await getVideos();

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!videos) {
    return <Loading />;
  }

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
              onDownload={(url, title) => {
                const link = document.createElement("a");
              link.href = url;
              link.setAttribute("download", `${title}.mp4`);
              link.setAttribute("target", "_blank");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}