"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUplaoding] = useState(false);
  const [success,setSuccess] = useState(false)
  const router = useRouter();
  // max file size of 70mb

  const MAX_FILE_SIZE = 70 * 1024 * 1024;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return "No file available check again!";
    if (file.size > MAX_FILE_SIZE) {
      // remove alerts from here and add a pop up notifcation system
      alert("File size is too large.");
      return;
    }
    setUplaoding(true);

    try {
      const {data : signatureData} = await axios.post("/api/getSignature",{
        folder : "MediaByte/videos"
      });
      // Prepare form data for Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signatureData.apiKey);
      formData.append("timestamp", signatureData.timestamp.toString());
      formData.append("signature", signatureData.signature);
      formData.append("folder", "MediaByte/videos");
      formData.append("resource_type", "video");

      // Upload to Cloudinary
      const cloudinaryResponse = await axios.post(
        `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/video/upload`,
        formData
      );

       // Send video details to your API
       const response = await axios.post("/api/uploadVideo", {
        title,
        description,
        publicId: cloudinaryResponse.data.public_id,
        duration: cloudinaryResponse.data.duration,
        bytes: cloudinaryResponse.data.bytes,
        originalSize: file.size.toString(),
      });
      if (response.status === 200) {
        setSuccess(true);
        router.push("/home");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setUplaoding(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-blue-600">Upload Video</h1>
      {uploading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 z-10 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid mx-auto"></div>
            <p className="mt-4 text-lg font-semibold text-blue-600">MediaByte</p>
            <p className="mt-2 text-md font-semibold text-blue-600">Uploading Video</p>
          </div>
        </div>
      )} 
      {
        success && (
          <div>Your video has been uploaded!</div>
        )
      }
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">
            <span className="label-text">Title</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input input-bordered w-full"
            required
          />
        </div>
        <div>
          <label className="label">
            <span className="label-text">Description</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="textarea textarea-bordered w-full"
          />
        </div>
        <div>
          <label className="label">
            <span className="label-text">Video File</span>
          </label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="file-input file-input-bordered w-full"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload Video"}
        </button>
      </form>
      
    </div>
  );
}
