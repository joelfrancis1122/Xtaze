import IUser from "../entities/IUser";

export interface IDeezerUseCase {
  execute(userId?: string): Promise<{songs: { title: string; artist: string; fileUrl: string | null; img: string }[];user: IUser | null;}>;
}
