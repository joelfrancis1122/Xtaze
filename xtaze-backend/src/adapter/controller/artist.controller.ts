import { NextFunction, Request, Response } from "express";
import IArtistUseCase from "../../domain/usecase/IArtistUseCase";
import AppError from "../../utils/AppError";
import { HttpStatus } from "../../domain/constants/httpStatus";

interface Dependencies {
  artistUseCase: IArtistUseCase;
}


export default class ArtistController {
  private _artistnUseCase: IArtistUseCase;

  constructor(dependencies: Dependencies) {
    this._artistnUseCase = dependencies.artistUseCase;
  }



  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      console.log("email", req.body);
      const response = await this._artistnUseCase.login(email, password);

      if (!response.success) {
        throw new AppError(response.message || "Login failed", HttpStatus.BAD_REQUEST); // Use message from use case
      }
      res.cookie("ArefreshToken", response.ArefreshToken, {
        httpOnly: true, // Prevent JavaScript access
        secure: true,   // Required for HTTPS
        sameSite: "none", // For cross-origin
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/",
      });
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }


  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log("refresh token triggereed ")
      const ArefreshToken = req.cookies.ArefreshToken

      console.log(req.body, req.cookies, "ithan enik kitityees")
      if (!ArefreshToken) throw new AppError("Refresh token is required", HttpStatus.UNAUTHORIZED);
      console.log("1")
      const response = await this._artistnUseCase.refresh(ArefreshToken);
      console.log("12")

      if (response.success && response.token && response.ArefreshToken) {
        res.cookie("ArefreshToken", response.ArefreshToken, {
          httpOnly: true, // Prevent JavaScript access
          secure: true,   // Required for HTTPS
          sameSite: "none", // For cross-origin
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          path: "/",
        });
        console.log("123")
        res.status(HttpStatus.OK).json({
          success: true,
          message: response.message,
          token: response.token,
        });
      } else {
        res.status(HttpStatus.UNAUTHORIZED).json(response);
      }
    } catch (error) {
      console.error("Refresh Token Error:", error);
      next(error);
    }
  }

  async listArtists(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log("page");
      const listArtists = await this._artistnUseCase.listArtists();

      res.status(HttpStatus.OK).json({ success: true, message: "List Of Artists", data: listArtists });
    } catch (error) {
      next(error);
    }
  }


  async getAllTracksArtist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log("artist release ");
      const { userId } = req.query;
      console.log(req.query);

      let tracks = null;
      if (userId) {
        tracks = await this._artistnUseCase.listArtistReleases(userId as string);
      }
      console.log("odi", tracks)
      res.status(HttpStatus.OK).json({ success: true, message: "List Of Artists", tracks });
    } catch (error) {
      next(error);
    }
  }
  async updateTrackByArtist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { TrackId } = req.query;
      const { title, artists, genre, album } = req.body;

      if (!TrackId) {
        res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Track ID is required" });
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const songFile = files?.['fileUrl']?.[0];
      const imageFile = files?.['img']?.[0];

      const genreArray = genre ? genre.split(",").map((g: string) => g.trim()) : [];
      const artistArray = artists ? artists.split(",").map((g: string) => g.trim()) : [];

      console.log({ songFile, imageFile }, "Processed Files");

      console.log("joel1", TrackId as string,
        title,
        artistArray,
        genreArray,
        album,
        songFile,
        imageFile)
      const updatedTrack = await this._artistnUseCase.updateTrackByArtist(
        TrackId as string,
        title,
        artistArray,
        genreArray,
        album,
        songFile,
        imageFile
      );

      res.status(HttpStatus.OK).json({ success: true, message: "Track updated successfully", track: updatedTrack });

    } catch (error) {
      next(error);
    }
  }


  async incrementListeners(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log("increment", req.body);
      const { trackId, id } = req.body;
      const track = await this._artistnUseCase.increment(trackId as string, id as string);

      console.log(req.body);
      res.status(HttpStatus.OK).json({ success: true, message: "List Of Artists" });
    } catch (error) {
      next(error);
    }
  }

  async uploadTracks(req: Request, res: Response, next: NextFunction): Promise<void> {
    console.log(req.body, "Received request");
    console.log(req.files, "Uploaded files ");
    try {
      // Validate that files exist
      if (!req.files || !("file" in req.files) || !("image" in req.files)) {
        throw new AppError("Both song and image must be uploaded", HttpStatus.BAD_REQUEST);
      }

      // Extract request data
      const { songName, artist, genre, album } = req.body;
      const songFile = (req.files as { [fieldname: string]: Express.Multer.File[] }).file[0];
      const imageFile = (req.files as { [fieldname: string]: Express.Multer.File[] }).image[0];

      console.log(songFile, imageFile, "Extracted files");
      const genreArray = genre ? genre.split(",").map((g: string) => g.trim()) : [];
      const artistArray = artist ? artist.split(",").map((g: string) => g.trim()) : [];

      const track = await this._artistnUseCase.trackUpload(songName, artistArray, genreArray, album, songFile, imageFile);
      console.log("set ayo")
      res.status(HttpStatus.CREATED).json({
        message: "Track uploaded successfully!",
        track,
      });
    } catch (error) {
      console.error("Error uploading track:", error);
      next(error); // Pass error to middleware
    }
  }

  async statsOfArtist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.query
      console.log(req.query, "sasas")
      const data = await this._artistnUseCase.statsOfArtist(userId as string);
      console.log(data, "dassss")
      res.status(HttpStatus.OK).json({ data: data });
    } catch (error: unknown) {
      console.error("Error in getSongImprovements controller:", error);
      res.status(HttpStatus.NOT_FOUND).json({ message: (error as Error).message || "Internal server error" });
      next(error);
    }
  }
  async saveCard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { artistId, paymentMethodId } = req.body
      console.log(req.query, req.body, "ssssss")
      const data = await this._artistnUseCase.saveCard(artistId, paymentMethodId);
      console.log(data, "kilivayil")
      res.status(HttpStatus.OK).json({ success: true });
    } catch (error: unknown) {
      console.error("Error in getSongImprovements controller:", error);
      res.status(HttpStatus.NOT_FOUND).json({ message: (error as Error).message || "Internal server error" });
      next(error);
    }
  }

  async checkcard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.query
      // console.log(req.query,"sasas")
      const data = await this._artistnUseCase.checkcard(userId as string);
      console.log(data, "dassssssss")
      res.status(HttpStatus.OK).json({ data: data });
    } catch (error: unknown) {
      console.error("Error in getSongImprovements controller:", error);
      res.status(HttpStatus.NOT_FOUND).json({ message: (error as Error).message || "Internal server error" });
      next(error);
    }
  }

  async usernameUpdate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.query.id
      const username = req.body.username
      console.log(userId, req.body, "joes")

      const data = await this._artistnUseCase.usernameUpdate(userId as string, username);
      console.log("remene", data)
      res.status(HttpStatus.OK).json({ data: data });
    } catch (error: unknown) {
      console.error("Error in getUsers controller:", error);
      next(error);
    }
  }

  async getVerificationStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { artistId } = req.query;
    try {
      const verificationStatus = await this._artistnUseCase.getVerificationStatus(artistId as string);
      console.log(verificationStatus, "verification statuss")
      res.status(HttpStatus.OK).json({ success: true, data: verificationStatus });
    } catch (error: unknown) {
      console.error("Error in getVerificationStatusController:", error);
      res.status(HttpStatus.NOT_FOUND).json({ message: (error as Error).message || "failed to fetch verification status" });
    }
  }
  async requestVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { artistId } = req.body;

    let imageFile: Express.Multer.File | undefined;

    if (req.files && !Array.isArray(req.files)) {
      const imageFiles = req.files['idProof'];
      imageFile = imageFiles?.[0];
    }
    console.log(imageFile, artistId, "joel")
    try {
      if (!artistId || !imageFile) {
        throw new Error("Artist ID or image file is missing.");
      }

      console.log("Artist ID:", artistId);
      console.log("Image File:", imageFile);

      const verificationStatus = await this._artistnUseCase.requestVerification(artistId, imageFile);

      res.status(HttpStatus.OK).json({ success: true, message: "Verification request processed." });
    } catch (error: unknown) {
      console.error("Error in requestVerification:", error);
      res.status(HttpStatus.NOT_FOUND).json({ success: false, message: (error as Error).message || "Failed to process verification request." });
    }
  }

}