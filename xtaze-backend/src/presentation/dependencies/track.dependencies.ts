import { UploadTrackUseCase } from "../../Application/usecases/uploadtrack.usecase";
import { TrackRepository } from "../../infrastructure/repositories/track.repository";

const trackRepository = new TrackRepository();
export const uploadTrackUseCase = new UploadTrackUseCase(trackRepository);
