import { UploadTrackUseCase } from "../../usecases/track.usecase";
import { TrackRepository } from "../../adapter/repositories/track.repository";

const trackRepository = new TrackRepository();
export const uploadTrackUseCase = new UploadTrackUseCase(trackRepository);
