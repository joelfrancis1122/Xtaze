

const TYPES = {
  // repos
  UserRepository: Symbol.for("UserRepository"),
  GenreRepository: Symbol.for("GenreRepository"),
  ArtistRepository: Symbol.for("ArtistRepository"),
  AdminRepository: Symbol.for("AdminRepository"),
  TrackRepository: Symbol.for("TrackRepository"),
  DeezerRepository: Symbol.for("DeezerRepository"),

  // services
  EmailService: Symbol.for("EmailService"),
  OtpService: Symbol.for("OtpService"),
  PasswordService: Symbol.for("PasswordService"),

  // usecases
  UserUseCase: Symbol.for("UserUseCase"),
  GenreUseCase: Symbol.for("GenreUseCase"),
  ArtistUseCase: Symbol.for("ArtistUseCase"),
  AdminUseCase: Symbol.for("AdminUseCase"),
  TrackUseCase: Symbol.for("TrackUseCase"),
  DeezerUseCase: Symbol.for("DeezerUseCase"),
  // controllers
  UserController: Symbol.for("UserController"),
  GenreController: Symbol.for("GenreController"),
  ArtistController: Symbol.for("ArtistController"),
  AdminController: Symbol.for("AdminController"),
  TrackController: Symbol.for("TrackController"),
  DeezerController: Symbol.for("DeezerController"),

};



export default TYPES;
