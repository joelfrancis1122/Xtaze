
// const TYPES = {

//     UserUseCase: Symbol.for("UserUseCase"),
//     UserRepository: Symbol.for("UserRepository"),

//     ArtistUseCase: Symbol.for("ArtistUseCase"),
//     ArtistRepository: Symbol.for("ArtistRepository"),
    
//     GenreUseCase: Symbol.for("GenreUseCase"),
//     GenreRepository: Symbol.for("GenreRepository"),

//     EmailService: Symbol.for("EmailService"),
//     OtpService: Symbol.for("OtpService"),
//     PasswordService: Symbol.for("PasswordService"),
// };

// export default TYPES;
const TYPES = {
  // repos
  UserRepository: Symbol.for("UserRepository"),
  GenreRepository: Symbol.for("GenreRepository"),
  ArtistRepository: Symbol.for("ArtistRepository"),
  AdminRepository: Symbol.for("AdminRepository"),
  TrackRepository: Symbol.for("TrackRepository"),

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

  // controllers
  UserController: Symbol.for("UserController"),
  GenreController: Symbol.for("GenreController"),
  ArtistController: Symbol.for("ArtistController"),
  AdminController: Symbol.for("AdminController"),
  TrackController: Symbol.for("TrackController")
};



export default TYPES;
