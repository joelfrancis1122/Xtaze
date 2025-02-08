// src/services/cloudinaryService.ts

import cloudinary from '../../src/utils/cloudinaryConfig'; // Cloudinary configuration
import { UploadApiResponse } from 'cloudinary'; // Import Cloudinary response type

export class CloudinaryService {
  async uploadTrack(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(file.path, (error, result) => {
        if (error) {
          reject(error); // Reject if there's an error during upload
        } else {
          resolve(result!); // Resolve with the upload result (URL, etc.)
        }
      });
    });
  }
}
