import IUser from "../../domain/entities/IUser";
import { UserDTO } from "../dtos/UserDTO";

export class UserMapper {
  static toDTO(user: IUser & { _id?: string; createdAt?: Date; updatedAt?: Date }): UserDTO {
    return {
      id: user._id!,
      username: user.username,
      country: user.country,
      gender: user.gender,
      year: user.year,
      phone: user.phone,
      email: user.email,
      role: user.role ?? "user",
      isActive: user.isActive ?? true,
      profilePic: user.profilePic ?? null,
      bio: user.bio ?? null,
      banner: user.banner ?? null,
      premium: user.premium,
      likedSongs: user.likedSongs ?? [],
      paymentStatus: user.paymentStatus,
      stripePaymentMethodId: user.stripePaymentMethodId ?? null,
      createdAt: user.createdAt?.toISOString(),
      updatedAt: user.updatedAt?.toISOString(),
    };
  }

  static toDTOs(users: (IUser & { _id?: string; createdAt?: Date; updatedAt?: Date })[]): UserDTO[] {
    return users.map(this.toDTO);
  }
}
