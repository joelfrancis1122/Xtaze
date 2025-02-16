import { ITrackRepository } from "../domain/repositories/ITrackRepository";
import { ITrack } from "../domain/entities/ITrack";
import { uploadSongToCloud, uploadImageToCloud } from "../framework/service/cloudinary.service";

export class UploadTrackUseCase {
  constructor(private trackRepository: ITrackRepository) {}

  async execute(data: {
    songFile: Express.Multer.File;
    imageFile: Express.Multer.File;
  }): Promise<ITrack> {
    const songUpload = await uploadSongToCloud(data.songFile);
    const imageUpload = await uploadImageToCloud(data.imageFile);
    console.log("2um varunundo",songUpload)
    const newTrack: ITrack = {
      title: songUpload.title,
      genre: songUpload.genre,
      album: songUpload.album,
      fileUrl: songUpload.secure_url,
      img: imageUpload.secure_url,
      listeners: 0,
      artists: songUpload.artist,
    };

    return await this.trackRepository.save(newTrack);
  }
}
