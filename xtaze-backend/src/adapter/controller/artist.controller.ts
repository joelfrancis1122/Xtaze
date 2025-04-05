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
        httpOnly: false, // for frontend access
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
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

      console.log(req.body, "ithan enik kitityees")
      if (!ArefreshToken) throw new AppError("Refresh token is required", 400);

      const response = await this._artistnUseCase.refresh(ArefreshToken);

      if (response.success && response.token && response.ArefreshToken) {
        res.cookie("ArefreshToken", response.ArefreshToken, {
          httpOnly: false, // for frontend access
          secure: true,
          sameSite: "none",
          maxAge: 7 * 24 * 60 * 60 * 1000,        
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
  async updateTrackByArtist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { TrackId } = req.query;
      const { title, artists, genre, album } = req.body;
  
      if (!TrackId) {
         res.status(400).json({ success: false, message: "Track ID is required" });
      }
  
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const songFile = files?.['fileUrl']?.[0];
      const imageFile = files?.['img']?.[0];
  
      const genreArray = genre ? genre.split(",").map((g: string) => g.trim()) : [];
      const artistArray = artists ? artists.split(",").map((g: string) => g.trim()) : [];
  
      console.log({ songFile, imageFile }, "Processed Files");
  
      console.log("joel1",TrackId as string,
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
  
      res.status(200).json({ success: true, message: "Track updated successfully", track: updatedTrack });
  
    } catch (error) {
      next(error);
    }
  }
  

  async incrementListeners(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log("increment",req.body);
      const { trackId ,id} = req.body;
      const track = await this._artistnUseCase.increment(trackId as string,id as string);

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
  
  async statsOfArtist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.query
      console.log(req.query, "sasas")
      const data = await this._artistnUseCase.statsOfArtist(userId as string);
      console.log(data, "dassss")
      res.status(200).json({ data: data });
    } catch (error: any) {
      console.error("Error in getSongImprovements controller:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
      next(error);
    }
  }
  async saveCard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { artistId, paymentMethodId } = req.body
      console.log(req.query, req.body, "ssssss")
      const data = await this._artistnUseCase.saveCard(artistId,paymentMethodId);
      console.log(data,"kilivayil")
      res.status(200).json({ success:true});
    } catch (error: any) {
      console.error("Error in getSongImprovements controller:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
      next(error);
    }
  }
  
  async checkcard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.query
      // console.log(req.query,"sasas")
      const data = await this._artistnUseCase.checkcard(userId as string);
      console.log(data,"dassssssss")
      res.status(200).json({ data: data });
    } catch (error: any) {
      console.error("Error in getSongImprovements controller:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
      next(error);
    }
  }
}