import { IAdmin } from "../../domain/entities/IAdmin";
import { AdminDTO } from "../dtos/AdminDTO";

export class AdminMapper {
  static toDTO(admin: IAdmin): AdminDTO {
    return {
      id: admin._id!,
      username: admin.username,
      email: admin.email,
      role: "admin",
      isActive: admin.isActive ?? true,
      profilePic: admin.profilePic ?? null,
      bio: admin.bio ?? null,
      banner: admin.banner ?? null,
      createdAt: admin.createdAt?.toISOString() ?? "",
      updatedAt: admin.updatedAt?.toISOString() ?? "",
    };
  }

  static toDTOs(admins: IAdmin[]): AdminDTO[] {
    return admins.map(this.toDTO);
  }
}
