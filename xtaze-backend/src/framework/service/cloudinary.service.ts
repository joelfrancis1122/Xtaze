import cloudinary from "../../utils/cloudinaryConfig";
import { UploadApiResponse } from "cloudinary";
import { v4 as uuidv4 } from "uuid";
// Replace import with require
const musicMetadata = require("music-metadata");

export interface UploadSongResponse {
  secure_url: string;
  title: string;
  artist: string[];
  album: string;
  genre: string[];
}

export const uploadSongToCloud = async (file: Express.Multer.File): Promise<UploadSongResponse> => {
  try {
    if (!file || !file.buffer) throw new Error("No file provided");

    let metadata;
    try {
      // Use the required module
      metadata = await musicMetadata.parseBuffer(file.buffer, file.mimetype || "audio/mpeg");
    } catch (metadataError) {
      console.error("❌ Metadata parsing error:", metadataError);
      // Fallback metadata
      metadata = {
        common: {
          title: file.originalname.replace(/\.[^/.]+$/, "") || "Unknown_Title",
          artist: "Unknown_Artist",
          album: "Unknown_Album",
          genre: ["Unknown_Genre"]
        }
      };
    }

    const songTitle = metadata.common.title || "Unknown_Title";
    const artist = metadata.common.artist
      ? [metadata.common.artist].flatMap(a => a.split("/")).map(a => a.trim()).filter(Boolean)
      : ["Unknown_Artist"];
    const album = metadata.common.album || "Unknown_Album";
    const genre = metadata.common.genre
      ? metadata.common.genre.flatMap((g: string) => g.split("/")).map((g: string) => g.trim()).filter(Boolean)
      : ["Unknown_Genre"];

    const folderName = file.originalname
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .trim();

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
      genre,
    };

  } catch (error: any) {
    console.error("❌ Song upload error:", error.message || error);
    throw new Error("Song upload failed");
  }
};

// The rest of your code remains unchanged
export const uploadImageToCloud = async (file: Express.Multer.File): Promise<UploadApiResponse> => {
  try {
    if (!file || !file.buffer) throw new Error("No file provided");

    const folderName = file.originalname
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .trim();

    return await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: `xtaze/music/${folderName}`,
          public_id: "cover",
        },
        (error, result) => {
          if (error) {
            console.error("❌ Image upload error:", error);
            reject(error);
          } else {
            resolve(result as UploadApiResponse);
          }
        }
      ).end(file.buffer);
    });
  } catch (error: any) {
    console.error("❌ Image upload error:", error.message || error);
    throw new Error("Image upload failed");
  }
};

export const uploadProfileCloud = async (file: Express.Multer.File): Promise<UploadApiResponse> => {
  try {
    if (!file || !file.buffer) throw new Error("No file provided");

    const originalNameWithoutExt = file.originalname.replace(/\.[^/.]+$/, "");
    const uniqueName = `${originalNameWithoutExt}_${uuidv4()}`;

    const resourceType = file.mimetype.startsWith("video") ? "video" : "image";

    return await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: "xtaze/profiles",
          public_id: uniqueName,
          unique_filename: true,
          overwrite: true,
        },
        (error, result) => {
          if (error) {
            console.error("❌ Profile upload error:", error);
            reject(error);
          } else {
            resolve(result as UploadApiResponse);
          }
        }
      ).end(file.buffer);
    });
  } catch (error: any) {
    console.error("❌ Profile upload error:", error.message || error);
    throw new Error("Profile upload failed");
  }
};
export const uploadIdproofCloud = async (file: Express.Multer.File): Promise<UploadApiResponse> => {
  try {
    if (!file || !file.buffer) throw new Error("No file provided");

    const originalNameWithoutExt = file.originalname.replace(/\.[^/.]+$/, "");
    const uniqueName = `${originalNameWithoutExt}_${uuidv4()}`;

    const resourceType = file.mimetype.startsWith("video") ? "video" : "image";

    return await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: "xtaze/idProof",
          public_id: uniqueName,
          unique_filename: true,
          overwrite: true,
        },
        (error, result) => {
          if (error) {
            console.error("❌ Idproof upload error:", error);
            reject(error);
          } else {
            resolve(result as UploadApiResponse);
          }
        }
      ).end(file.buffer);
    });
  } catch (error: any) {
    console.error("❌ Idproof upload error:", error.message || error);
    throw new Error("Idproof upload failed");
  }
};