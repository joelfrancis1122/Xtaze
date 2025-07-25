export interface Track {
  _id: string
  title: string
  album?: string |null
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
