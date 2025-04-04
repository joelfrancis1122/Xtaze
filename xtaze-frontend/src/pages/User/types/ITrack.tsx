export interface Track {
  _id: string
  title: string
  album: string
  artists: string
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
