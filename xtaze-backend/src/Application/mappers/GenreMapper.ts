import { IGenre } from "../../domain/entities/IGenre";
import { GenreDTO } from "../dtos/GenreDTO";

export class GenreMapper {
  static toDTO(genre: IGenre & { _id?: string; updatedAt?: Date }): GenreDTO {
    return {
      id: genre._id!,
      name: genre.name,
      isBlocked: genre.isBlocked,
      createdAt: genre.createdAt?.toISOString(),
      updatedAt: genre.updatedAt?.toISOString(),
    };
  }

  static toDTOs(genres: (IGenre & { _id?: string; updatedAt?: Date })[]): GenreDTO[] {
    return genres.map(this.toDTO);
  }
}
