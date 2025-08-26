import { ITrack } from "../entities/ITrack";

export interface ITrackRepository {
  save(track: ITrack): Promise<ITrack>;
  getAll(): Promise<ITrack[]>;
}

