import { Request, Response, NextFunction } from "express";
import IArtistUseCase from "../../domain/usecase/IArtistUseCase";
import { uploadTrackUseCase } from "../../framework/dependencies/track.dependencies";


interface Dependencies {
  artistUseCase: IArtistUseCase
}


export default class ArtistController {
  private _artistnUseCase: IArtistUseCase
  constructor(dependencies: Dependencies) {
    this._artistnUseCase = dependencies.artistUseCase
  }
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      console.log("email", req.body)
      const response = await this._artistnUseCase.login(email, password);
      if (!response.success) {
        res.status(400).json(response);  // Send error response with message
        return
      }
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

 
  async listArtists(req: Request, res: Response, next: NextFunction): Promise<void> {
    try{
      console.log("page")
      const listArtists = await this._artistnUseCase.listArtists()
      console.log(listArtists,"othila")
      res.status(200).json({success:true,message:"List Of Artists",data:listArtists})
    }catch(error){
      next(error)
    }
  }
  
  // async toggleblockArtist(req: Request, res: Response, next: NextFunction): Promise<void> {
  //   const { id } = req.params;
  //   console.log("id kitty ",id)
  //   const updatedStatus = await this._artistnUseCase.toggleBlockUnblockArtist(id);
  //   res.status(200).json({ success: true, message: "Genre status updated", data: updatedStatus });
  // }

  async uploadTracks(req: Request, res: Response, next: NextFunction): Promise<void> {
    console.log(req.body, "Received request");
    console.log(req.files, "Uploaded files ");
    try {
    // Validate that files exist
    if (!req.files || !("file" in req.files) || !("image" in req.files)) {
      res.status(400).json({ message: "Both song and image must be uploaded" });
      return;
    }

    // Extract request data
    const { songName, artist, genre, album } = req.body;
    const songFile = (req.files as { [fieldname: string]: Express.Multer.File[] }).file[0];
    const imageFile = (req.files as { [fieldname: string]: Express.Multer.File[] }).image[0];

    console.log(songFile, imageFile, "Extracted files");
    const genreArray = genre ? genre.split(",").map((g: string) => g.trim()) : [];
    const artistArray = artist ? artist.split(",").map((g: string) => g.trim()) : [];

    const track = await this._artistnUseCase.trackUpload(songName, artistArray, genreArray, album, songFile, imageFile);

    res.status(201).json({
      message: "Track uploaded successfully!",
      track,
    });

    } catch (error:any) {
        console.error('Error uploading track:', error);
        console.log(error.message);
        
        res.status(500).json({ message: "Error uploading track", error });
    }
}
}