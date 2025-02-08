import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: "dixaexyua",
  api_key: "751535114214892",
  api_secret: "gT8rNQUX0GHfmhiGs0pTBDyWvgc",
});

// Function to upload a song
export const uploadSongToCloud = async (file: Express.Multer.File): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { 
        resource_type: "video", 
        folder: `xtaze/music/${file.originalname.split(".")[0]}`, // Store in song-named folder
        public_id: "song"
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result as UploadApiResponse);
      }
    ).end(file.buffer);
  });
};

// Function to upload an image
export const uploadImageToCloud = async (file: Express.Multer.File): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { 
        resource_type: "image", 
        folder: `xtaze/music/${file.originalname.split(".")[0]}`, // Store in the same song folder
        public_id: "cover"
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result as UploadApiResponse);
      }
    ).end(file.buffer);
  });
};
