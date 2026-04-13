import { UploadApiResponse } from "cloudinary";

export interface ICloudStorageService {
  uploadSong(file: Express.Multer.File): Promise<UploadApiResponse>;
  uploadImage(file: Express.Multer.File): Promise<UploadApiResponse>;
}
  