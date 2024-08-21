"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUplaoding] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  // max file size of 70mb

  const MAX_FILE_SIZE = 70 * 1024 * 1024;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      console.error("No file available");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      console.error("File size is too large");
      alert("File size is too large.");
      return;
    }
    setUplaoding(true);

    try {
      const signatureData = await getSignatureData();
      const cloudinaryResponse = await uploadToCloudinary(signatureData, file);
      const uploadResponse = await uploadVideoToAPI(
        title,
        description,
        cloudinaryResponse.public_id,
        cloudinaryResponse.duration,
        cloudinaryResponse.bytes,
        file.size.toString()
      );

      if (uploadResponse.status === 200) {
        setSuccess(true);
        router.push("/home");
      }
    } catch (error) {
      console.error("Error during upload:", error);
      if (axios.isAxiosError(error)) {
        console.error("Response data:", error.response?.data);
        console.error("Response status:", error.response?.status);
      }
    } finally {
      setUplaoding(false);
    }
  };

  const getSignatureData = async () => {
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = "MediaByte/videos";
    const transformation = "c_limit,w_640,h_360";
    const stringToSign = `folder=${folder}&timestamp=${timestamp}&transformation=${transformation}`;

    const { data: signatureData } = await axios.post("/api/getSignature", {
      stringToSign,
    });

    if (!signatureData || !signatureData.timestamp) {
      throw new Error("Invalid signature data received");
    }

    return {
      ...signatureData,
      folder,
      transformation,
      timestamp,
    };
  };

  const uploadToCloudinary = async (signatureData: any, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signatureData.apiKey || "");
    formData.append("timestamp", signatureData.timestamp.toString());
    formData.append("signature", signatureData.signature || "");
    formData.append("folder", signatureData.folder);
    formData.append("resource_type", "video");
    formData.append("transformation", signatureData.transformation);

    const cloudinaryResponse = await axios.post(
      `https://api.cloudinary.com/v1_1/${signatureData.cloudname}/video/upload`,
      formData
    );

    if (!cloudinaryResponse.data || !cloudinaryResponse.data.public_id) {
      throw new Error("Invalid response from Cloudinary");
    }

    return {
      public_id: cloudinaryResponse.data.public_id,
      duration: cloudinaryResponse.data.duration || 0,
      bytes: cloudinaryResponse.data.bytes || 0,
    };
  };

  const uploadVideoToAPI = async (
    title: string,
    description: string,
    publicId: string,
    duration: number,
    bytes: number,
    originalSize: string
  ) => {
    const response = await axios.post("/api/uploadVideo", {
      title,
      description,
      publicId,
      duration,
      bytes,
      originalSize,
    });

    return response;
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-blue-600">Upload Video</h1>
      {uploading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 z-10 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid mx-auto"></div>
            <p className="mt-4 text-lg font-semibold text-blue-600">
              MediaByte
            </p>
            <p className="mt-2 text-md font-semibold text-blue-600">
              Uploading Video
            </p>
          </div>
        </div>
      )}
      {success && <div>Your video has been uploaded!</div>}
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
