import SongModel from "../db/models/SongModel"; // Ensure you have a Mongoose model for songs

export class SongRepository {
  async getAllSongs() {
    return await SongModel.find(); // Fetch all songs from MongoDB
  }

  async getSongById(id: string) {
    return await SongModel.findById(id);
  }
}
