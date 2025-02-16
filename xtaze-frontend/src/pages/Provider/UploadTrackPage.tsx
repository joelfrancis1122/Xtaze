import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

const UploadMusicPage: React.FC = () => {
  const [songFile, setSongFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [songUrl, setSongUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: "song" | "image") => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      type === "song" ? setSongFile(file) : setImageFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!songFile || !imageFile ) {
      setError("All fields are required!");
      return;
    }

    setUploading(true);
    setError(null);

    try {


      const formData = new FormData();
      formData.append("song", songFile);
      formData.append("image", imageFile);


      const response = await axios.post("http://localhost:3000/provider/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.songUrl && response.data.imageUrl) {
        setSongUrl(response.data.songUrl);
        setImageUrl(response.data.imageUrl);
      } else {
        toast("Upload successfull.");
      }
      setUploading(false);
    } catch (err) {
      setError("Error uploading files. Please try again.");
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-lg p-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-white">Upload Music & Cover Image</h1>
  
      <form onSubmit={handleSubmit} className="bg-black p-6 rounded-xl relative shadow-lg">
        {/* Subtle Red Shadow Effect */}
        <div className="absolute inset-0 blur-xl opacity-20 bg-red-500 rounded-xl pointer-events-none"></div>
  
        {/* Upload Inputs */}
        <div className="mb-6 relative z-10">
          <label className="block text-gray-300 font-medium mb-2">Upload Song</label>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => handleFileChange(e, "song")}
            className="w-full text-white bg-gray-900 border border-gray-700 rounded-lg p-3 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-none file:bg-gray-800 file:text-white hover:file:bg-gray-700 transition"
          />
        </div>
  
        <div className="mb-6 relative z-10">
          <label className="block text-gray-300 font-medium mb-2">Upload Cover Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, "image")}
            className="w-full text-white bg-gray-900 border border-gray-700 rounded-lg p-3 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-none file:bg-gray-800 file:text-white hover:file:bg-gray-700 transition"
          />
        </div>
  
        {/* Error Message */}
        {error && <p className="text-red-400 text-center mb-4">{error}</p>}
  
        {/* Upload Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-black to-gray-900 text-white py-3 rounded-lg font-semibold hover:shadow-[0_0_10px_rgba(255,0,0,0.4)] transition"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>
  
      {/* Success Message */}
      {songUrl && imageUrl && (
        <div className="mt-6 p-4 bg-gray-900 text-white rounded-lg shadow-md border border-gray-700">
          <p className="text-lg font-semibold">Upload successful! ✅</p>
          <p className="text-sm mt-2">Song URL: <a href={songUrl} target="_blank" className="underline">{songUrl}</a></p>
          <p className="text-sm">Image URL: <a href={imageUrl} target="_blank" className="underline">{imageUrl}</a></p>
        </div>
      )}
    </div>
  );
  
};

export default UploadMusicPage;
