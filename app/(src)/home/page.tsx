import { GetServerSideProps } from "next";
import { PrismaClient, Video } from "@prisma/client";
import VideoCard from "@/components/VideoCard";
import { useCallback } from "react";

const prisma = new PrismaClient();

interface HomePageProps {
  videos: Video[];
  error: string | null;
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const videos = await prisma.video.findMany();
    return {
      props: {
        videos,
        error: null,
      },
    };
  } catch (error) {
    console.error("Error fetching videos:", error);
    return {
      props: {
        videos: [],
        error: "Failed to fetch videos",
      },
    };
  } finally {
    await prisma.$disconnect();
  }
};

const handleDownload = useCallback((url: string, title: string) => {
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${title}.mp4`);
  link.setAttribute("target", "_blank");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}, []);

function Home({ videos, error }: HomePageProps) {
  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="text-center text-lg text-gray-500">
        No videos available
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
