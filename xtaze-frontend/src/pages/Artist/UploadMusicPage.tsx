import React, { useState } from "react";
import axios from "axios";

const UploadMusicPage: React.FC = () => {
  const [songFile, setSongFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [title, setTitle] = useState<string>("");
  const [genreInput, setGenreInput] = useState<string>("");
  const [album, setAlbum] = useState<string>("");
  const [artistsInput, setArtistsInput] = useState<string>("");
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
    if (!songFile || !imageFile || !title || !genreInput || !album || !artistsInput) {
      setError("All fields are required!");
      return;
    }
  
    setUploading(true);
    setError(null);
  
    try {
      
      console.log(genreInput,"genresljhd");
      console.log(artistsInput,"artist inte ");
      const genreArray = genreInput.split(",").map((item) => item.trim());
      const artistsArray = artistsInput.split(",").map((item) => item.trim());
  
      const formData = new FormData();
      formData.append("song", songFile);
      formData.append("image", imageFile);
      formData.append("title", title);
      formData.append("album", album);
  
      // ✅ Store genres as JSON string (same as artists)
      formData.append("genre", JSON.stringify(genreArray)); 
      formData.append("artists", JSON.stringify(artistsArray)); 
         console.log(artistsArray,"jhgghgh");
         
      const response = await axios.post("http://localhost:3000/provider/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      if (response.data.songUrl && response.data.imageUrl) {
        setSongUrl(response.data.songUrl);
        setImageUrl(response.data.imageUrl);
      } else {
        setError("Upload successful, but response is missing file URLs.");
      }
      setUploading(false);
    } catch (err) {
      setError("Error uploading files. Please try again.");
      setUploading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Upload Music & Cover Image</h1>

      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg">
        {/* Title Input */}
        <div className="mb-4">
          <label className="block text-white mb-2" htmlFor="title">
            Track Title:
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="block w-full text-white bg-gray-700 border border-gray-600 rounded p-2"
            placeholder="Enter song title"
          />
        </div>

        {/* Artists Input */}
        <div className="mb-4">
          <label className="block text-white mb-2" htmlFor="artists">
            Artists (Comma-separated):
          </label>
          <input
            type="text"
            id="artists"
            value={artistsInput}
            onChange={(e) => setArtistsInput(e.target.value)}
            className="block w-full text-white bg-gray-700 border border-gray-600 rounded p-2"
            placeholder="Enter artist names, separated by commas"
          />
        </div>

        {/* Genre Input */}
        <div className="mb-4">
          <label className="block text-white mb-2" htmlFor="genre">
            Genres (Comma-separated):
          </label>
          <input
            type="text"
            id="genre"
            value={genreInput}
            onChange={(e) => setGenreInput(e.target.value)}
            className="block w-full text-white bg-gray-700 border border-gray-600 rounded p-2"
            placeholder="Enter multiple genres, separated by commas"
          />
        </div>

        {/* Album Input */}
        <div className="mb-4">
          <label className="block text-white mb-2" htmlFor="album">
            Album:
          </label>
          <input
            type="text"
            id="album"
            value={album}
            onChange={(e) => setAlbum(e.target.value)}
            className="block w-full text-white bg-gray-700 border border-gray-600 rounded p-2"
            placeholder="Enter album name"
          />
        </div>

        {/* Upload Buttons */}
        <div className="mb-4">
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => handleFileChange(e, "song")}
            className="block w-full text-white bg-gray-700 border border-gray-600 rounded p-2 mb-2"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, "image")}
            className="block w-full text-white bg-gray-700 border border-gray-600 rounded p-2"
          />
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {/* Success Message */}
      {songUrl && imageUrl && (
        <div className="mt-4 p-4 bg-green-600 text-white rounded">
          <p>Upload successful!</p>
          <p>Song URL: <a href={songUrl} target="_blank" className="underline">{songUrl}</a></p>
          <p>Image URL: <a href={imageUrl} target="_blank" className="underline">{imageUrl}</a></p>
        </div>
      )}
    </div>
  );
};

export default UploadMusicPage;
