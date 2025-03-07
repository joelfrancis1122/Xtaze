import IUser from "../../domain/entities/IUser";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import UserModel from "../db/models/UserModel"; // Assuming your User model is in this location

export default class UserRepository implements IUserRepository {

  async add(userData: IUser): Promise<IUser> {
    try {
      const user = await UserModel.create(userData)
      console.log("workk avanee repo", user);

      return user as unknown as IUser
    } catch (error) {
      throw error
    }
  }

  async findByEmail(email: string): Promise<IUser | null> {
    try {
      const user = await UserModel.findOne({ email });
      return user as unknown as IUser
    } catch (error) {
      throw error
    }
  }

  async findByPhone(phone: number): Promise<IUser | null> {
    try {
      const user = await UserModel.findOne({ phone });
      return user as unknown as IUser
    } catch (error) {
      throw error
    }
  }

  async getUserUpdated(userId: string): Promise<IUser | null> {
    return await UserModel.findById({ _id: userId });
  }

  async updateProfile(userId: string, pic: string): Promise<IUser | null> {
    try {
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { profilePic: pic },
        { new: true, runValidators: true }
      ).lean();

      return updatedUser as IUser | null; 
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async uploadBanner(userId: string, BannerPicUrl: string): Promise<IUser | null> {
    try {
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { banner: BannerPicUrl },
        { new: true, runValidators: true }
      ).lean();

      return updatedUser as IUser | null; 
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async updateBio(userId: string, bio: string): Promise<IUser | null> {
    try {
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { bio: bio },
        { new: true, runValidators: true }
      ).lean();

      return updatedUser as IUser | null; 
    } catch (error) {
      console.log(error);
      return null;
    }
  }


  async getupdatedArtist(artistId: string): Promise<IUser | null> {
    const updatedArtist = await UserModel.findOne({ _id: artistId }); 
    return updatedArtist as unknown as IUser   
}

async findByUsername(username: string): Promise<IUser | null>{
  return await UserModel.findOne({ username:{$regex:`^${username}$`,$options:"i"} });
  

}

async findById(userId: string): Promise<IUser | null> {
  try {
    return await UserModel.findById(userId);
  } catch (error) {
    console.error("Error finding user by ID:", error);
    return null;
  }
}

async updateUserSubscription(userId: string, isPremium: boolean): Promise<IUser | null> {
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { premium: isPremium },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw new Error("User not found or update failed");
    }

    return updatedUser.toObject<IUser>(); // Convert Mongoose document to plain object
  } catch (error) {
    console.error("Error updating user subscription:", error);
    throw error; // Propagate error to use case
  }
}
async addToLiked(userId: string, trackId: string): Promise<IUser | null> {
  try {
    const user = await UserModel.findById(userId);
    
    if (!user) {
      throw new Error("User not found");
    }

    let updatedUser;
    if (user.likedSongs?.includes(trackId)) {
      updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { $pull: { likedSongs: trackId } }, // Remove from likedSongs
        { new: true }
      );
    } else {
      updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { $addToSet: { likedSongs: trackId } }, // Add to likedSongs
        { new: true }
      );
    }

    if (!updatedUser) {
      throw new Error("User update failed");
    }

    return updatedUser.toObject<IUser>(); // Convert Mongoose document to plain object
  } catch (error) {
    console.error("Error in toggling liked song:", error);
    throw error;
  }
}


}
