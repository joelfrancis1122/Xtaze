// src/usecases/UploadTrackUseCase.ts

import { CloudinaryService } from '../../utils/uploadTrack'; // Import the Cloudinary service

export class UploadTrackUseCase {
  private cloudinaryService: CloudinaryService;

  constructor() {
    this.cloudinaryService = new CloudinaryService(); // Instantiate the service
  }

  // Execute method to upload track to Cloudinary
  async execute(file: Express.Multer.File) {
    try {
      const result = await this.cloudinaryService.uploadTrack(file); // Call the service to upload the track
      return result; // Return the Cloudinary result (e.g., file URL)
    } catch (error) {
      throw new Error('Error uploading track to Cloudinary');
    }
  }
}
