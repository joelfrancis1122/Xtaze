import { IBanner } from "../../domain/entities/IBanner";
import { BannerDTO } from "../dtos/BannerDTO";

export class BannerMapper {
  static toDTO(banner: IBanner): BannerDTO {
    return {
      id: banner._id.toString(), 
      title: banner.title,
      description: banner.description,
      imageUrl: banner.imageUrl,
      action: banner.action,
      isActive: banner.isActive ?? true,
      createdAt: banner.createdAt,
      updatedAt: banner.updatedAt
    };
  }

  static toDTOs(banners: IBanner[]): BannerDTO[] {
    return banners.map(this.toDTO);
  }
}
