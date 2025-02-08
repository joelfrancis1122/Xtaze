export class Track {
    constructor(
      public id: string,
      public title: string,
      public artistId: string,
      public artistName: string,
      public genre: string,
      public duration: number,
      public fileUrl: string,
      public coverUrl: string,
      public uploadedAt: Date
    ) {}
  }
  