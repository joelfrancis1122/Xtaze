import { ITrackRepository } from "../../domain/repositories/ITrackRepository";
import { Track } from "../db/models/TrackModel";
import { ITrack } from "../../domain/entities/ITrack";
import { BaseRepository } from "./BaseRepository";

// export class TrackRepository implements ITrackRepository {
  export class TrackRepository extends BaseRepository<ITrack> implements ITrackRepository {
  constructor() {
    super(Track); 
  }
  async save(track: ITrack): Promise<ITrack> {
    const newTrack = new Track(track);
    return await newTrack.save() as any
  }

  async getAll(): Promise<ITrack[]> {
    return await Track.find().sort({ createdAt: -1 }) as any
  }
}
