import { NextFunction, Request, Response } from "express";
import IArtistUseCase from "../../domain/usecase/IArtistUseCase";
import AppError from "../../utils/AppError";

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
        throw new AppError(response.message || "Login failed", 400); // Use message from use case
      }
      res.cookie("ArefreshToken", response.ArefreshToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }


    async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log("refresh token triggereed ")
      const { ArefreshToken } = req.body;
    
      console.log(req.body,"ithan enik kitityees")
      if (!ArefreshToken) throw new AppError("Refresh token is required", 400);

      const response = await this._artistnUseCase.refresh(ArefreshToken);

      if (response.success && response.token && response.ArefreshToken) {
        // Only set refreshToken in cookie
        console.log("ithenthaninaa a")
        res.cookie("ArefreshToken", response.ArefreshToken, {
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        res.status(200).json({
          success: true,
          message: response.message,
          token: response.token, 
        });
      } else {
        res.status(401).json(response);
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
      console.log(listArtists, "othila");

      res.status(200).json({ success: true, message: "List Of Artists", data: listArtists });
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

      console.log(tracks, "othila");
      res.status(200).json({ success: true, message: "List Of Artists", tracks });
    } catch (error) {
      next(error);
    }
  }

  async incrementListeners(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log("increment");
      const { trackId } = req.body;
      const track = await this._artistnUseCase.increment(trackId as string);

      console.log(req.body);
      res.status(200).json({ success: true, message: "List Of Artists" });
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
        throw new AppError("Both song and image must be uploaded", 400);
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
      res.status(201).json({
        message: "Track uploaded successfully!",
        track,
      });
    } catch (error) {
      console.error("Error uploading track:", error);
      next(error); // Pass error to middleware
    }
  }
}