import { getCldImageUrl, getCldVideoUrl } from "next-cloudinary";
import { Download, Clock, FileDown, FileUp, Clock1 } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { filesize } from "filesize";
import { Video } from "@prisma/client";
import { useCallback, useEffect, useState } from "react";
import { useClerk } from "@clerk/nextjs";
import axios from "axios";

dayjs.extend(relativeTime);

interface VideoCardProps {
  video: Video;
  onDownload: (url: string, title: string) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video:initialVideo, onDownload }) => {
  const { user } = useClerk();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCompressed, setIsCompressed] = useState(false);
  const [video, setVideo] = useState<Video>(initialVideo);

  useEffect(() => {
    setIsAuthenticated(!!user);
  }, [user]);

  const getThumbnailUrl = useCallback((publicId: string) => {
    return getCldImageUrl({
      src: publicId,
      width: 400,
      height: 225,
      crop: "fill",
      gravity: "auto",
      quality: "auto",
      format: "jpg",
      assetType: "video",
    });
  }, []);

  const getFullVideoUrl = useCallback((publicId: string) => {
    return getCldVideoUrl({
      src: publicId,
      width: 1920,
      height: 1080,
    });
  }, []);

  const getPreviewVideoUrl = useCallback((publicId: string) => {
    return getCldVideoUrl({
      src: publicId,
      width: 400,
      height: 225,
      rawTransformations: ["e_preview:duration_10:max_seg_9:min_seg_dur_1"],
    });
  }, []);

  const formatFileSize = useCallback((size: number) => {
    return filesize(size);
  }, []);

  const formatDuration = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }, []);

  const compressionPercentage = Math.round(
    (1 - Number(video.compressedSize) / Number(video.orignalSize)) * 100
  );

  useEffect(() => {
    setPreviewError(false);
  }, [isHovering]);

  const handlePreviewError = () => {
    setPreviewError(true);
  };

  const handleDownload = useCallback(async () => {
    setLoading(true);
    try {
      const videoUrl = getFullVideoUrl(video.publicId);
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${video.title.replace(/\s+/g, "_").toLowerCase()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download the video:", error);
    } finally {
      setLoading(false);
    }
  }, [video]);

  const checkCompression = useCallback(() => {
    if (video.orignalSize && video.compressedSize) {
      setIsCompressed(Number(video.compressedSize) < Number(video.orignalSize));
    } else {
      setIsCompressed(false);
    }
  }, [video.orignalSize, video.compressedSize]);

  // fix this
  useEffect(() => {
    checkCompression();
  }, [video.orignalSize, video.compressedSize, checkCompression]);

  const compressVideo = async () => {
    try {
      const response = await axios.post(`/api/compressVideo/${video.publicId}`,{
        publicId : video.publicId
      });
      if (response.status === 200) {
        const { compressedSize } = response.data;
        setVideo((prevVideo) => ({
          ...prevVideo,
          compressedSize: compressedSize.toString(),
        }));
        setIsCompressed(true);
      }
    } catch (error) {
      console.error("Error compressing video:", error);
    }
  };


  return (
    <div
      className="bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative w-full h-48 rounded-t-lg overflow-hidden">
        {isHovering ? (
          previewError ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <p className="text-red-500">Preview not available</p>
            </div>
          ) : (
            <video
              src={getPreviewVideoUrl(video.publicId)}
              autoPlay
              muted
              loop
              className="w-full h-full object-cover"
              onError={handlePreviewError}
            />
          )
        ) : (
          <img
            src={getThumbnailUrl(video.publicId)}
            alt={video.title}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute bottom-2 right-2 bg-blue-600 bg-opacity-70 px-2 py-1 rounded-lg text-sm flex items-center">
          <Clock size={16} className="mr-1" />
          {formatDuration(video.duration)}
        </div>
      </div>
      <div className="p-4">
        <h2 className="text-lg font-bold mb-2">{video.title}</h2>
        <p className="text-sm text-white mb-4">{video.description}</p>
        <p className="text-sm text-white mb-4">
          Uploaded {dayjs(video.createdAt).fromNow()}
        </p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center">
            <FileUp size={18} className="mr-2 text-primary" />
            <div>
              <div className="font-semibold">Original</div>
              <div>{formatFileSize(Number(video.orignalSize))}</div>
            </div>
          </div>
          {isAuthenticated &&
            (isCompressed ? (
              <div className="flex items-center">
                <FileDown size={18} className="mr-2 text-secondary" />
                <div>
                  <div className="font-semibold">Compressed</div>
                  <div>{formatFileSize(Number(video.compressedSize))}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center">
                <FileDown size={18} className="mr-2 text-secondary" />
                <div>
                  <div className="font-semibold">
                    <button onClick={compressVideo} className="bg-white text-black rounded-xl text-xs p-2">
                      Compress Video
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm font-semibold">
            Compression:{" "}
            <span className="text-accent">{compressionPercentage}%</span>
          </div>
          <button
            className="bg-primary text-black px-4 py-2 rounded-md hover:bg-primary-dark transition-colors duration-300"
            onClick={handleDownload}
          >
            {loading ? <Clock1 size={16} /> : <Download size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
