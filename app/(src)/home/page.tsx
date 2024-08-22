import { PrismaClient, Video } from "@prisma/client"; // Import Video type
import VideoCard from "@/components/VideoCard";

const prisma = new PrismaClient();

export default async function Home() {
  let videos: Video[] = []; // Explicitly define the type as an array of Video
  let error: string | null = null;

  try {
    videos = await prisma.video.findMany();
  } catch (err) {
    console.error("Error fetching videos:", err);
    error = "Failed to fetch videos";
  } finally {
    await prisma.$disconnect();
  }

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
            onDownload={(url: string, title: string) => {
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
    </div>
  );
}
