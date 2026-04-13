import { VerificationDTO } from "../dtos/VerificationDTO";

export class VerificationMapper {
  static toDTO(entity: any): VerificationDTO {
    return {
      id: entity._id?.toString() ?? "",
      userId: entity.artistId ?? entity.userId,
      username: entity.username ?? null,
      documentUrl: entity.idProof ?? entity.documentUrl,
      status: entity.status,
      createdAt: entity.submittedAt ? new Date(entity.submittedAt).toISOString() : "",
      updatedAt: entity.reviewedAt ? new Date(entity.reviewedAt).toISOString() : "",
    };
  }

  static toDTOs(entities: any[]): VerificationDTO[] {
    return entities.map((e) => VerificationMapper.toDTO(e));
  }
}
