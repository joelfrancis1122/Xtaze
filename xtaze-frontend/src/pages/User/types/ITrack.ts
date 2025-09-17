export interface Track {
  id: string
  title: string
  albumId?: string |null
  artists: string | string[];
  artist?: string | string[];
  genre: string
  fileUrl: string
  img: string
  listeners: string[]
  createdAt?:number
  playHistory:PlayHistory[],
}

interface PlayHistory {
  month: string;
  plays: number;
}
