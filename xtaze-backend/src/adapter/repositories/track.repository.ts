import { ITrackRepository } from "../../domain/repositories/ITrackRepository";
import { Track } from "../db/models/TrackModel";
import { ITrack } from "../../domain/entities/ITrack";

export class TrackRepository implements ITrackRepository {
  async save(track: ITrack): Promise<ITrack> {
    const newTrack = new Track(track);
    return await newTrack.save();
  }

  async getAll(): Promise<ITrack[]> {
    return await Track.find().sort({ createdAt: -1 });
  }
}
