import cloudinary from "../../utils/cloudinaryConfig";
import * as mm from "music-metadata";
import { Readable } from "stream";
import { UploadApiResponse } from "cloudinary";
import { v4 as uuidv4 } from "uuid"; // Import UUID for unique IDs

export interface UploadSongResponse {
  secure_url: string;
  title: string;
  artist: string[];
  album: string;
  genre: string[];
}
export const uploadSongToCloud = async (file: Express.Multer.File): Promise<UploadSongResponse> => {
  try {
    // buffer to stream for metadata extraction
    const stream = new Readable();
    stream.push(file.buffer);
    stream.push(null);

    const metadata = await mm.parseStream(stream, { mimeType: file.mimetype });

    // Extract metadata 
    console.log(metadata.common, "as pic undo")
    const songTitle = metadata.common.title || "Unknown_Title";
    const artist = metadata.common.artist ? [metadata.common.artist].flatMap(g => g.split("/")).map(g => g.trim()).filter(g => g.length > 0) : ["Unknown_Artist"];
    const album = metadata.common.album || "Unknown_Album";
    const genre = metadata.common.genre ? metadata.common.genre.flatMap(g => g.split("/")).map(g => g.trim()).filter(g => g.length > 0) : ["Unknown_Genre"];
    console.log("📀 Extracted Metadata:", { songTitle, artist, album, genre });




    console.log("🚀 Uploading song to Cloudinary...");

    const folderName = file.originalname
      .replace(/\.[^/.]+$/, "") // Remove file extension
      .replace(/[^a-zA-Z0-9_-]/g, "_") // Replace special characters with "_"
      .trim();

    //  large chunk size (10MB) for speed
    const uploadedSong = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: "video",
          folder: `xtaze/music/${folderName}`,
          public_id: "song",
          context: { artist: artist.join(", "), album, genre: genre.join(", ") },
          chunk_size: 6000000,
          eager: [],
          invalidate: true,
        },
        (error, result) => (error ? reject(error) : resolve(result as UploadApiResponse))
      ).end(file.buffer);
    });

    return {
      secure_url: uploadedSong.secure_url,
      title: songTitle,
      artist,
      album,
      genre
    };

  } catch (error) {
    console.error("❌ Upload error:", error);
    throw error;
  }
};


export const uploadImageToCloud = async (file: Express.Multer.File): Promise<UploadApiResponse> => {
  const folderName = file.originalname
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .trim();

  console.log("Uploading image to folder:", folderName);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: `xtaze/music/${folderName}`,
        public_id: "cover"
      },
      (error, result) => {
        if (error) {
          console.error("Image upload error:", error);
          reject(error);
        } else {
          console.log("Image uploaded:", result);
          resolve(result as UploadApiResponse);
        }
      }
    ).end(file.buffer);
  });
}; 



export const uploadProfileCloud = async (file: Express.Multer.File): Promise<UploadApiResponse> => {
  const folderName = file.originalname
    .replace(/\.[^/.]+$/, "") // Remove file extension
    .replace(/[^a-zA-Z0-9_-]/g, "_") // Replace special characters with "_"
    .trim();
  const uniqueName = `${file.originalname.replace(/\.[^/.]+$/, "")}_${uuidv4()}`;

  console.log("Uploading profile media to folder:", folderName);

  // ✅ Determine resource type dynamically based on file MIME type
  const resourceType = file.mimetype.startsWith("video") ? "video" : "image";

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType, // Dynamic resource type (image or video)
        folder: "xtaze/profiles",
        public_id: uniqueName,
        unique_filename: true, // Ensure unique filenames
        overwrite: true, // Overwrite if the same name exists
      },
      (error, result) => {
        if (error) {
          console.error("Profile media upload error:", error);
          reject(error);
        } else {
          console.log("Profile media uploaded:", result);
          resolve(result as UploadApiResponse);
        }
      }
    ).end(file.buffer);
  });
};


